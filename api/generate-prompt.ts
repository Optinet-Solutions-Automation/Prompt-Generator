import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FormData {
  brand: string;
  image_type: string;
  theme: string;
  description: string;
  llm_tool: string;
  additional_instructions: string;
}

// Transform frontend field names to match n8n expected format
function transformFormData(formData: FormData) {
  return {
    Brand: formData.brand,
    'Image Type': formData.image_type,
    Theme: formData.theme,
    Description: formData.description,
    'LLM Tool': formData.llm_tool,
    'Additional Instructions': formData.additional_instructions,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_GENERATE_PROMPT;
    
    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_GENERATE_PROMPT environment variable not set');
      throw new Error('Webhook URL not configured');
    }

    console.log('Sending request to n8n webhook:', n8nWebhookUrl);
    
    // Transform the data to match n8n's expected format
    const transformedData = transformFormData(req.body);
    console.log('Transformed data:', transformedData);

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
      console.error('n8n webhook error:', response.status, errorText);
      throw new Error(`n8n webhook failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from n8n:', data);
    
    // Return the response from n8n
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in generate-prompt API:', error);
    return res.status(500).json({ 
      error: 'Failed to generate prompt',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}