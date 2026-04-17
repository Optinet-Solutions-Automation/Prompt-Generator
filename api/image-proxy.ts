import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Image proxy — fetches an external image server-side to bypass CORS.
 *
 * Used by HtmlConversionModal to convert Google Drive / OpenAI images
 * into base64 data URIs for self-contained HTML banners.
 *
 * GET /api/image-proxy?url=https://lh3.googleusercontent.com/d/...
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  // Only allow image URLs from trusted hosts
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const ALLOWED_HOSTS = [
    'lh3.googleusercontent.com',
    'drive.google.com',
    'oaidalleapiprodscus.blob.core.windows.net', // OpenAI DALL-E
    'dalleprodsec.blob.core.windows.net',         // OpenAI DALL-E alt
  ];

  if (!ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith('.' + h))) {
    return res.status(403).json({ error: 'Host not allowed' });
  }

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'PromptGenerator/1.0' },
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream returned ${upstream.status}` });
    }

    const contentType = upstream.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(buffer);
  } catch (err) {
    console.error('[image-proxy] fetch failed:', err);
    res.status(502).json({ error: 'Failed to fetch image' });
  }
}
