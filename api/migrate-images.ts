/**
 * migrate-images.ts
 *
 * One-time migration endpoint. Accepts the localStorage image array from the
 * old Vercel site and for each image:
 *
 *   1. Drive URL (lh3.googleusercontent.com/d/{fileId})
 *      → updates the file's appProperties in Drive with the correct provider label
 *
 *   2. base64 data URI or any other URL
 *      → fetches/decodes the image bytes and uploads to Drive with correct metadata
 *
 * Self-contained — no local imports (Vercel API routes must be self-contained).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Google Auth ───────────────────────────────────────────────────────────────

async function getGoogleAccessToken(): Promise<string> {
  const refreshToken = process.env.CLOUD_RUN_REFRESH_TOKEN;
  const clientId     = process.env.CLOUD_RUN_CLIENT_ID;
  const clientSecret = process.env.CLOUD_RUN_CLIENT_SECRET;
  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing CLOUD_RUN_REFRESH_TOKEN / CLIENT_ID / CLIENT_SECRET');
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token', refresh_token: refreshToken,
      client_id: clientId, client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  const data = await res.json() as { access_token?: string };
  if (data.access_token) return data.access_token;
  throw new Error('No access_token returned');
}

// ── Drive helpers ─────────────────────────────────────────────────────────────

/** Extract Drive file ID from lh3.googleusercontent.com/d/{fileId} URLs */
function extractDriveFileId(url: string): string | null {
  const match = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

/** Update appProperties on an existing Drive file */
async function updateDriveFileMetadata(
  fileId: string,
  provider: string,
  aspectRatio: string,
  resolution: string,
  accessToken: string
): Promise<boolean> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appProperties: { provider, aspectRatio, resolution } }),
    }
  );
  return res.ok;
}

/** Make a Drive file readable by anyone with the link. */
async function makeFilePublic(fileId: string, accessToken: string): Promise<void> {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });
}

/** Upload image bytes to Drive folder with metadata */
async function uploadToDrive(params: {
  imageBuffer: Buffer; mimeType: string; filename: string;
  folderId: string; provider: string; aspectRatio: string;
  resolution: string; accessToken: string;
}): Promise<string | null> {
  const { imageBuffer, mimeType, filename, folderId, provider, aspectRatio, resolution, accessToken } = params;
  const metadata  = { name: filename, parents: [folderId], appProperties: { provider, aspectRatio, resolution } };
  const boundary  = 'migrate_boundary_xyz';
  const metaJson  = JSON.stringify(metadata);
  const partHeaders =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metaJson}\r\n` +
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const closing = `\r\n--${boundary}--`;
  const body    = Buffer.concat([Buffer.from(partHeaders, 'utf-8'), imageBuffer, Buffer.from(closing, 'utf-8')]);
  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary="${boundary}"` }, body }
  );
  if (!res.ok) { console.error('Upload failed:', await res.text()); return null; }
  const file = await res.json() as { id: string };
  return file.id;
}

// ── Handler ───────────────────────────────────────────────────────────────────

interface ImageRecord {
  id:           string;
  public_url:   string;
  provider:     string;
  aspect_ratio: string;
  resolution:   string;
  filename:     string;
  created_at:   string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) return res.status(500).json({ error: 'GOOGLE_DRIVE_FOLDER_ID not configured' });

  const { images } = req.body as { images: ImageRecord[] };
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'images array is required' });
  }

  let accessToken: string;
  try {
    accessToken = await getGoogleAccessToken();
  } catch (err) {
    return res.status(500).json({ error: `Auth failed: ${err instanceof Error ? err.message : err}` });
  }

  const results = { updated: 0, uploaded: 0, skipped: 0, failed: 0 };

  for (const img of images) {
    const url      = img.public_url;
    const provider = img.provider || 'chatgpt';
    const ratio    = img.aspect_ratio || '16:9';
    const res_     = img.resolution || '1K';
    const filename = img.filename || `${provider}-migrated-${Date.now()}.png`;

    // ── Case 1: Already a Drive file → just update its label ──────────────
    const driveFileId = extractDriveFileId(url);
    if (driveFileId) {
      const ok = await updateDriveFileMetadata(driveFileId, provider, ratio, res_, accessToken);
      if (ok) { results.updated++; } else { results.failed++; }
      continue;
    }

    // ── Case 2: Skip empty / data:image that's too large to process ───────
    if (!url || url.length > 10_000_000) { results.skipped++; continue; }

    // ── Case 3: base64 data URI → decode and upload ────────────────────────
    if (url.startsWith('data:')) {
      try {
        const [header, b64] = url.split(',');
        const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
        const buf      = Buffer.from(b64, 'base64');
        const fileId   = await uploadToDrive({ imageBuffer: buf, mimeType, filename, folderId, provider, aspectRatio: ratio, resolution: res_, accessToken });
        if (fileId) { await makeFilePublic(fileId, accessToken); results.uploaded++; } else { results.failed++; }
      } catch { results.failed++; }
      continue;
    }

    // ── Case 4: External URL → fetch and re-upload to Drive ────────────────
    try {
      const imgRes = await fetch(url);
      if (!imgRes.ok) { results.skipped++; continue; }
      const mimeType = imgRes.headers.get('content-type')?.split(';')[0] || 'image/png';
      const buf      = Buffer.from(await imgRes.arrayBuffer());
      const fileId   = await uploadToDrive({ imageBuffer: buf, mimeType, filename, folderId, provider, aspectRatio: ratio, resolution: res_, accessToken });
      if (fileId) { await makeFilePublic(fileId, accessToken); results.uploaded++; } else { results.failed++; }
    } catch { results.skipped++; }
  }

  return res.status(200).json({
    message: 'Migration complete',
    total:   images.length,
    ...results,
  });
}
