type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function getString(obj: UnknownRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim().length > 0) return v;
  }
  return null;
}

export function extractDriveFileIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);

    const id = u.searchParams.get('id');
    if (id && id !== 'undefined' && id !== 'null') return id;

    const fileD = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileD?.[1]) return fileD[1];

    const driveD = u.pathname.match(/\/d\/([^/]+)/);
    if (driveD?.[1]) return driveD[1];
  } catch {
    // Ignore URL parse errors and try regex fallback below.
  }

  const fallback = url.match(/(?:id=|\/file\/d\/|\/d\/)([a-zA-Z0-9_-]{10,})/);
  return fallback?.[1] ?? null;
}

function isBrokenDriveThumbnailUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.hostname !== 'drive.google.com') return false;
    if (u.pathname !== '/thumbnail') return false;
    const id = u.searchParams.get('id');
    return !id || id === 'undefined' || id === 'null';
  } catch {
    return url.includes('thumbnail?id=undefined') || url.includes('thumbnail?id=null');
  }
}

export function normalizeN8nImageResponse(payload: unknown): {
  displayUrl: string | null;
  editUrl: string | null;
  thumbnailUrl: string | null;
  fileId: string | null;
} {
  // n8n usually returns an array with a single object, but be defensive.
  let item: unknown = payload;
  if (Array.isArray(payload)) item = payload[0];
  else if (isRecord(payload) && Array.isArray(payload.data)) item = payload.data[0];
  else if (isRecord(payload) && Array.isArray(payload.result)) item = payload.result[0];

  if (!isRecord(item)) {
    return { displayUrl: null, editUrl: null, thumbnailUrl: null, fileId: null };
  }

  // Get fileId first - this is the most reliable
  const fileIdRaw = getString(item, 'fileId', 'file_id');
  
  const imageUrl = getString(item, 'imageUrl', 'image_url', 'image', 'url');
  const thumbnailUrlRaw = getString(
    item,
    'thumbnailUrl',
    'thumbnail_url',
    'thumbUrl',
    'thumb_url',
    'thumbnailLink',
    'thumbnail_link'
  );
  const downloadUrl = getString(item, 'downloadUrl', 'download_url', 'downloadLink', 'download_link');
  const viewUrl = getString(item, 'viewUrl', 'view_url', 'webViewLink', 'web_view_link', 'webViewUrl', 'web_view_url');

  // Extract fileId from URLs as fallback
  const fileId =
    fileIdRaw ||
    (imageUrl ? extractDriveFileIdFromUrl(imageUrl) : null) ||
    (thumbnailUrlRaw ? extractDriveFileIdFromUrl(thumbnailUrlRaw) : null) ||
    (viewUrl ? extractDriveFileIdFromUrl(viewUrl) : null) ||
    (downloadUrl ? extractDriveFileIdFromUrl(downloadUrl) : null);

  // If we have fileId, always construct clean URLs
  const thumbnailUrl = fileId
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
    : (thumbnailUrlRaw && !isBrokenDriveThumbnailUrl(thumbnailUrlRaw) ? thumbnailUrlRaw : null);

  const displayUrl = fileId 
    ? `https://lh3.googleusercontent.com/d/${fileId}`
    : (imageUrl || downloadUrl || thumbnailUrl);

  const editUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`
    : (viewUrl || imageUrl || downloadUrl || displayUrl);

  return { displayUrl, editUrl, thumbnailUrl, fileId };
}