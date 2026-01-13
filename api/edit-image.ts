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

  const webhookUrl = process.env.N8N_WEBHOOK_EDIT_IMAGE;

  if (!webhookUrl) {
    console.error('N8N_WEBHOOK_EDIT_IMAGE is not configured');
    return res.status(500).json({ error: 'Image edit webhook URL is not configured' });
  }

  try {
    const { imageUrl, editInstructions, provider } = req.body;

    if (!imageUrl || !editInstructions) {
      return res.status(400).json({ error: 'Image URL and edit instructions are required' });
    }

    console.log('Sending image edit request to n8n:', { imageUrl, editInstructions, provider });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        editInstructions,
        provider,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Failed to edit image',
        details: errorText,
      });
    }

    const data = await response.json();
    console.log('n8n image edit response:', data);

    // 🔹 Normalize webViewLink
    const webViewLink =
      data.webViewLink ||
      data.viewUrl ||
      (data.fileId ? `https://drive.google.com/file/d/${data.fileId}/view?usp=drivesdk` : null);

    if (!webViewLink) {
      console.warn('No webViewLink or fileId found in n8n response');
    }

    return res.status(200).json({
      ...data,
      webViewLink,
    });
  } catch (error) {
    console.error('Image edit error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
