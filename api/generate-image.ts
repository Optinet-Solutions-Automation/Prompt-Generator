import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_GENERATE_IMAGE;

  if (!webhookUrl) {
    console.error('N8N_WEBHOOK_GENERATE_IMAGE is not configured');
    return res.status(500).json({ error: 'Image generation webhook URL is not configured' });
  }

  try {
    const { prompt, provider, aspectRatio } = req.body;

    if (!prompt || !provider) {
      return res.status(400).json({ error: 'Prompt and provider are required' });
    }

    console.log('Sending image generation request to n8n:', { prompt, provider, aspectRatio });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        provider, // 'chatgpt' or 'gemini'
        aspectRatio: aspectRatio || '1:1',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to generate image',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('n8n image generation response:', data);

    // n8n returns an array, extract the first item
    const result = Array.isArray(data) ? data[0] : data;

    // Ensure we have the required fields
    if (!result.imageUrl && !result.thumbnailUrl && !result.fileId) {
      console.error('Invalid response structure:', result);
      return res.status(500).json({ 
        error: 'Invalid response from image generation service',
        details: 'Missing image URLs'
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}