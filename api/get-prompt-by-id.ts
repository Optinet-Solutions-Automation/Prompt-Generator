import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_GET_PROMPT_BY_ID;

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_GET_PROMPT_BY_ID environment variable not set');
      throw new Error('Webhook URL not configured');
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n get-prompt-by-id error:', response.status, errorText);
      throw new Error(`n8n webhook failed with status ${response.status}`);
    }

    const raw = await response.json();

    // n8n may return an array — extract the first item
    const result = Array.isArray(raw) && raw.length > 0 ? raw[0] : raw;

    // Airtable stores the field as "Background" (capital B).
    // Normalize it to "background" (lowercase) so the frontend can read it consistently.
    const data = {
      format_layout:   result.format_layout   || result.data?.format_layout   || '',
      primary_object:  result.primary_object  || result.data?.primary_object  || '',
      subject:         result.subject         || result.data?.subject         || '',
      lighting:        result.lighting        || result.data?.lighting        || '',
      mood:            result.mood            || result.data?.mood            || '',
      background:      result.Background      || result.background
                       || result.data?.Background || result.data?.background  || '',
      positive_prompt: result.positive_prompt || result.data?.positive_prompt || '',
      negative_prompt: result.negative_prompt || result.data?.negative_prompt || '',
    };

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error in get-prompt-by-id API:', error);
    return res.status(500).json({
      error: 'Failed to fetch prompt data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
