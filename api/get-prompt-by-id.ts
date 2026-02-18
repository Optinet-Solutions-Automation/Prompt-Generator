import type { VercelRequest, VercelResponse } from '@vercel/node';

// This Vercel function receives a POST request with { recordId }
// and forwards it to n8n, which fetches that specific Airtable record
// and returns all its reference data fields.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_GET_PROMPT_BY_ID;

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_GET_PROMPT_BY_ID environment variable not set');
      return res.status(500).json({ error: 'Get prompt webhook URL not configured' });
    }

    const { recordId } = req.body;

    if (!recordId) {
      return res.status(400).json({ error: 'recordId is required' });
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n get-prompt-by-id error:', response.status, errorText);
      return res.status(500).json({ error: 'Failed to fetch prompt data', details: errorText });
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return res.status(500).json({ error: 'Failed to parse response from n8n' });
    }

    // n8n sometimes returns an array — grab the first item if so
    const result = Array.isArray(data) ? data[0] : data;

    // Flatten the fields into the shape the frontend expects
    const promptData = {
      format_layout: result.format_layout || '',
      primary_object: result.primary_object || '',
      subject: result.subject || '',
      lighting: result.lighting || '',
      mood: result.mood || '',
      // "Background" is capitalised in Airtable — check both spellings
      background: result.Background || result.background || '',
      positive_prompt: result.positive_prompt || '',
      negative_prompt: result.negative_prompt || '',
    };

    return res.status(200).json(promptData);

  } catch (error) {
    console.error('Error in get-prompt-by-id API:', error);
    return res.status(500).json({
      error: 'Failed to fetch prompt data',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
