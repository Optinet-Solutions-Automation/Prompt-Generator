import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FormData {
  brand: string;
  spec_id: string;
  theme: string;
  description: string;
  no_text: boolean;
}

// Transform frontend field names to match n8n expected format
function transformFormData(formData: FormData) {
  return {
    brand: formData.brand,
    'spec_id': formData.spec_id,
    theme: formData.theme,
    description: formData.description,
    'no_text': formData.no_text,
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
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    console.log('=== Starting request to n8n ===');
    console.log('Webhook URL:', n8nWebhookUrl);
    
    // Transform the data to match n8n's expected format
    const transformedData = transformFormData(req.body);
    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));

    // Call n8n webhook
    console.log('Sending fetch request...');
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    console.log('Response received:', response.status, response.statusText);
    console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error response:', errorText);
      return res.status(500).json({ 
        error: `n8n webhook failed with status ${response.status}`,
        details: errorText,
        statusText: response.statusText
      });
    }

    // Log the raw response text first
    const responseText = await response.text();
    console.log('Raw response text length:', responseText.length);
    console.log('Raw response preview:', responseText.substring(0, 500));

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Successfully parsed JSON');
      console.log('Data type:', Array.isArray(data) ? 'array' : typeof data);
      console.log('Data keys:', Object.keys(Array.isArray(data) ? data[0] || {} : data));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse response:', responseText);
      return res.status(500).json({
        error: 'Failed to parse n8n response',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        responsePreview: responseText.substring(0, 1000)
      });
    }
    
    // Handle array response from n8n
    const result = Array.isArray(data) && data.length > 0 ? data[0] : data;
    console.log('Final result:', JSON.stringify(result, null, 2));
    
    // Transform simple text response into expected format
    const transformedResult = {
      success: true,
      message: "AI prompt generated successfully",
      prompt: result.text || result.prompt || "No prompt generated",
      metadata: {
        brand: req.body.brand,
        spec_id: req.body.spec_id,
        theme: req.body.theme,
        relevance_score: 80,
        style_confidence: "high",
        reference_count: 0,
        similar_prompts_used: 0,
        recommended_ai: "Midjourney v6, DALL-E 3, Stable Diffusion XL"
      }
    };
    
    // Return the response from n8n
    console.log('=== Sending response to client ===');
    return res.status(200).json(transformedResult);
    
  } catch (error) {
    console.error('=== CAUGHT ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return res.status(500).json({ 
      error: 'Failed to generate prompt',
      details: error instanceof Error ? error.message : String(error),
      errorType: error?.constructor?.name || 'Unknown'
    });
  }
}