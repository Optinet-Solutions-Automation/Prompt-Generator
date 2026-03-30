import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Generate Image Variations via OpenAI gpt-image-1 ──────────────────────────
// Uses OpenAI's image edit API directly — no GCP/Cloud Run auth needed.
// Fetches the source image from the URL, sends it to OpenAI with a variation
// prompt, and returns 2 variation images as base64 data URLs.

export const config = {
  maxDuration: 300,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });
  }

  try {
    const { imageUrl, mode = 'subtle', guidance = '', count = 2 } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    // ------------------------------------------------------------------
    // 1. Fetch the source image and detect its content type
    // ------------------------------------------------------------------
    let imgArrayBuffer: ArrayBuffer;
    let contentType = 'image/png';

    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
      // Handle data URLs (e.g. "data:image/png;base64,...")
      const [header, b64] = imageUrl.split(',');
      const mime = header.match(/data:([^;]+)/)?.[1] || 'image/png';
      contentType = mime;
      const binaryStr = atob(b64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      imgArrayBuffer = bytes.buffer;
    } else {
      const imgRes = await fetch(imageUrl as string);
      if (!imgRes.ok) {
        return res.status(400).json({ error: `Failed to fetch source image (${imgRes.status})` });
      }
      contentType = imgRes.headers.get('content-type') || 'image/png';
      imgArrayBuffer = await imgRes.arrayBuffer();
    }

    // Determine file extension from content type
    const extMap: Record<string, string> = {
      'image/png':  'png',
      'image/jpeg': 'jpg',
      'image/jpg':  'jpg',
      'image/webp': 'webp',
      'image/gif':  'gif',
    };
    const baseMime = contentType.split(';')[0].trim();
    const ext = extMap[baseMime] || 'png';

    // ------------------------------------------------------------------
    // 2. Build the variation prompt based on mode
    // ------------------------------------------------------------------
    const basePrompt = mode === 'subtle'
      ? 'Create a subtle variation of this image. Preserve the exact composition, subject, pose, outfit, and overall structure. Change only lighting warmth, color temperature, and minor atmospheric mood details. Stay very close to the original.'
      : 'Create a creative variation of this image. Keep the same main subject and outfit but dramatically reimagine the background environment, lighting colors, overall palette, and mood. Make it feel distinctly different while preserving the core subject identity.';

    const prompt = guidance ? `${basePrompt} Additional guidance: ${guidance}` : basePrompt;

    // ------------------------------------------------------------------
    // 3. Fire 2 variation requests in parallel via OpenAI image edit
    // ------------------------------------------------------------------
    const numVariations = Math.min(Number(count) || 2, 2);

    const makeRequest = () => {
      const form = new FormData();
      form.append('model', 'gpt-image-1');
      form.append('image', new File([imgArrayBuffer], `source.${ext}`, { type: baseMime }));
      form.append('prompt', prompt);
      form.append('n', '1');
      form.append('quality', 'medium'); // 'low' | 'medium' | 'high' — medium balances speed/quality

      return fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: form,
      });
    };

    const requests = Array.from({ length: numVariations }, makeRequest);
    const results = await Promise.allSettled(requests);

    const variations: { imageUrl: string }[] = [];

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Variation fetch error:', result.reason);
        continue;
      }
      const resp = result.value;
      if (!resp.ok) {
        const errText = await resp.text();
        console.error(`OpenAI image edit failed (${resp.status}):`, errText);
        continue;
      }
      const data = await resp.json() as { data?: Array<{ b64_json?: string; url?: string }> };
      const item = data.data?.[0];
      if (item?.url) {
        variations.push({ imageUrl: item.url });
      } else if (item?.b64_json) {
        // Return as data URL — browsers display these directly
        variations.push({ imageUrl: `data:image/png;base64,${item.b64_json}` });
      }
    }

    if (variations.length === 0) {
      return res.status(500).json({ error: 'Failed to generate any variations. Please try again.' });
    }

    return res.status(200).json({ variations });

  } catch (error) {
    console.error('Variations error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
