import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_CREATE_BLENDED_PROMPT;

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_CREATE_BLENDED_PROMPT environment variable not set');
      throw new Error('Webhook URL not configured');
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n create-blended-prompt webhook error:', response.status, errorText);
      throw new Error(`n8n webhook failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error in create-blended-prompt API:', error);
    return res.status(500).json({
      error: 'Failed to create blended prompt',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
