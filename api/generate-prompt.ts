import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FormData {
  brand: string;
  reference: string;
  subjectPosition: string;
  aspectRatio: string;
  theme: string;
  description: string;
  format_layout?: string;
  primary_object?: string;
  subject?: string;
  lighting?: string;
  mood?: string;
  background?: string;
  positive_prompt?: string;
  negative_prompt?: string;
}

// Transform frontend field names to match n8n expected format
function transformFormData(formData: FormData) {
  return {
    brand: formData.brand,
    reference: formData.reference,
    subjectPosition: formData.subjectPosition,
    aspectRatio: formData.aspectRatio,
    theme: formData.theme,
    description: formData.description,
    format_layout: formData.format_layout || '',
    primary_object: formData.primary_object || '',
    subject: formData.subject || '',
    lighting: formData.lighting || '',
    mood: formData.mood || '',
    background: formData.background || '',
    positive_prompt: formData.positive_prompt || '',
    negative_prompt: formData.negative_prompt || '',
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
    
    // Extract prompt from n8n response - new format has prompt inside data object
    const prompt = result.data?.prompt || result.prompt || result.text || "No prompt generated";
    
    // Transform response into expected format with form data from API response
    const transformedResult = {
      success: result.success || true,
      message: result.message || "AI prompt generated successfully",
      prompt: prompt,
      metadata: {
        brand: result.data?.brand || req.body.brand,
        reference: result.data?.reference || req.body.reference,
        subjectPosition: result.data?.subjectPosition || req.body.subjectPosition,
        aspectRatio: result.data?.aspectRatio || req.body.aspectRatio,
        theme: result.data?.theme || req.body.theme,
        description: result.data?.description || req.body.description,
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