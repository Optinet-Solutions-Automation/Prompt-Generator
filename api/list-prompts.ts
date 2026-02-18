import type { VercelRequest, VercelResponse } from '@vercel/node';

// This Vercel function receives a GET request from the frontend
// and forwards it to the n8n webhook that lists all prompts from Airtable.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_LIST_PROMPTS;

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_LIST_PROMPTS environment variable not set');
      return res.status(500).json({ error: 'List prompts webhook URL not configured' });
    }

    const response = await fetch(n8nWebhookUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n list-prompts error:', response.status, errorText);
      return res.status(500).json({ error: 'Failed to fetch prompts list', details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error in list-prompts API:', error);
    return res.status(500).json({
      error: 'Failed to fetch prompts list',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
