import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_SHOW_PROMPT_DATA;
    
    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_SHOW_PROMPT_DATA environment variable not set');
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    console.log('=== Fetching prompt data for reference ===');
    console.log('Reference:', reference);

    // Call n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference }),
    });

    console.log('Response received:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error response:', errorText);
      return res.status(500).json({ 
        error: `n8n webhook failed with status ${response.status}`,
        details: errorText,
      });
    }

    const responseText = await response.text();
    console.log('Raw response:', responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({
        error: 'Failed to parse n8n response',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error',
      });
    }
    
    // Handle array response from n8n
    const result = Array.isArray(data) && data.length > 0 ? data[0] : data;
    
    // Extract prompt data fields
    const promptData = {
      format_layout: result.format_layout || result.data?.format_layout || '',
      primary_object: result.primary_object || result.data?.primary_object || '',
      subject: result.subject || result.data?.subject || '',
      lighting: result.lighting || result.data?.lighting || '',
      mood: result.mood || result.data?.mood || '',
      background: result.Background || result.background || result.data?.Background || result.data?.background || '',
      positive_prompt: result.positive_prompt || result.data?.positive_prompt || '',
      negative_prompt: result.negative_prompt || result.data?.negative_prompt || '',
    };
    
    console.log('Returning prompt data:', promptData);
    return res.status(200).json(promptData);
    
  } catch (error) {
    console.error('Error fetching prompt data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch prompt data',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
