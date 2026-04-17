/**
 * list-drive-images.ts
 *
 * Lists all generated images from the Google Drive folder.
 * Called by the Image Library on load to populate the gallery.
 * Self-contained — no local imports (Vercel API routes must be self-contained).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface DriveFile {
  id:            string;
  name:          string;
  createdTime:   string;
  mimeType:      string;
  appProperties?: {
    provider?:    string;
    aspectRatio?: string;
    resolution?:  string;
  };
}

async function getGoogleAccessToken(): Promise<string> {
  const refreshToken  = process.env.CLOUD_RUN_REFRESH_TOKEN;
  const clientId      = process.env.CLOUD_RUN_CLIENT_ID;
  const clientSecret  = process.env.CLOUD_RUN_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing env vars: CLOUD_RUN_REFRESH_TOKEN, CLOUD_RUN_CLIENT_ID, CLOUD_RUN_CLIENT_SECRET');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh Google token: ${error}`);
  }

  const data = await response.json() as { access_token?: string };
  if (data.access_token) return data.access_token;
  throw new Error('No access_token returned from Google token endpoint');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) return res.status(500).json({ error: 'GOOGLE_DRIVE_FOLDER_ID not configured' });

  try {
    const accessToken = await getGoogleAccessToken();

    const query  = `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`;
    const fields  = 'files(id,name,createdTime,mimeType,appProperties)';
    const url     = `https://www.googleapis.com/drive/v3/files` +
                    `?q=${encodeURIComponent(query)}` +
                    `&fields=${encodeURIComponent(fields)}` +
                    `&orderBy=createdTime+desc` +
                    `&pageSize=500`;

    const driveRes = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!driveRes.ok) {
      const err = await driveRes.text();
      return res.status(500).json({ error: `Drive API failed (${driveRes.status}): ${err}` });
    }

    const data = await driveRes.json() as { files: DriveFile[] };
    const files = (data.files || []).map(f => ({
      id:           f.id,
      filename:     f.name,
      created_at:   f.createdTime,
      provider:     f.appProperties?.provider    || 'chatgpt',
      aspect_ratio: f.appProperties?.aspectRatio || '16:9',
      resolution:   f.appProperties?.resolution  || '1K',
      public_url:   `https://lh3.googleusercontent.com/d/${f.id}`,
    }));

    return res.status(200).json({ files });

  } catch (error) {
    console.error('[list-drive-images] error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
