import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_SAVE_PROMPT;

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_SAVE_PROMPT environment variable not set');
      throw new Error('Webhook URL not configured');
    }

    // Forward the complete body to n8n as-is.
    // This way adding new fields in the frontend never requires updating this file.
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n save webhook error:', response.status, errorText);
      throw new Error(`n8n webhook failed with status ${response.status}`);
    }

    // 5. Handle response (Text or JSON) safely
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { success: true, message: text };
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error in save-prompt API:', error);
    return res.status(500).json({ 
      error: 'Failed to save prompt',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
