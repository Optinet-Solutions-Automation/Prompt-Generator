import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_CONVERT_HTML;

  if (!webhookUrl) {
    console.error('N8N_WEBHOOK_CONVERT_HTML is not configured');
    return res.status(500).json({ error: 'HTML conversion webhook URL is not configured' });
  }

  try {
    const { 
      imageUrl, 
      welcomeBonus, 
      amountToUnlock, 
      bonusCode, 
      extraSpins, 
      bonusPercentage, 
      maximumBonus 
    } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    console.log('Sending HTML conversion request to n8n:', { 
      imageUrl, 
      welcomeBonus, 
      amountToUnlock, 
      bonusCode, 
      extraSpins, 
      bonusPercentage, 
      maximumBonus 
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        welcomeBonus,
        amountToUnlock,
        bonusCode,
        extraSpins,
        bonusPercentage,
        maximumBonus,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to convert to HTML',
        details: errorText 
      });
    }

    // Response is an array with html property: [{ "html": "..." }]
    const data = await response.json();
    console.log('n8n HTML conversion response:', data);

    // Extract HTML from the array response
    const htmlContent = Array.isArray(data) && data.length > 0 ? data[0].html : null;
    
    if (!htmlContent) {
      console.error('Invalid response format - no html found:', data);
      return res.status(500).json({ error: 'Invalid response format from webhook' });
    }

    return res.status(200).json({ html: htmlContent });
  } catch (error) {
    console.error('HTML conversion error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
