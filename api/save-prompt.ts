import type { VercelRequest, VercelResponse } from '@vercel/node';

// 1. Update interface to match what the frontend sends now
interface SavePromptData {
  brand: string;
  title: string;        // New
  reference: string;    // New
  saved_prompt: string; // New
}

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

    console.log('Sending save request to n8n webhook:', n8nWebhookUrl);
    
    // 2. Extract the new data structure directly
    const { brand, title, reference, saved_prompt } = req.body as SavePromptData;

    // 3. Create the exact payload you asked for
    const payload = {
      brand,
      title,
      reference,
      saved_prompt
    };

    console.log('Sending payload:', payload);

    // 4. Send to n8n
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
