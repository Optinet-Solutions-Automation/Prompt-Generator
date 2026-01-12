import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SavePromptData {
  brand: string;
  spec_id: string;
  theme: string;
  description: string;
  no_text: boolean;
  generated_prompt: string;
  timestamp: string;
}

// Transform frontend field names to match Airtable expected format
function transformSaveData(data: SavePromptData) {
  return {
    Brand: data.brand,
    'Spec ID': data.spec_id,
    Theme: data.theme,
    Description: data.description,
    'No Text': data.no_text,
    'Generated Prompt': data.generated_prompt,
    'Date Generated': data.timestamp,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_SAVE_PROMPT;
    
    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_SAVE_PROMPT environment variable not set');
      throw new Error('Webhook URL not configured');
    }

    console.log('Sending save request to n8n webhook:', n8nWebhookUrl);
    
    // Transform the data to match Airtable's expected format
    const transformedData = transformSaveData(req.body);
    console.log('Transformed save data:', transformedData);

    // Call n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n save webhook error:', response.status, errorText);
      throw new Error(`n8n webhook failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Received save response from n8n:', data);
    
    // Return success response
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in save-prompt API:', error);
    return res.status(500).json({ 
      error: 'Failed to save prompt',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}