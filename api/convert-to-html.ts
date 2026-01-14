import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const webhookUrl = process.env.N8N_WEBHOOK_CONVERT_HTML;
  if (!webhookUrl) return res.status(500).json({ error: 'Webhook URL not configured' });

  try {
    const {
      imageUrl,
      welcomeBonus,
      amountToUnlock,
      bonusCode,
      extraSpins,
      bonusPercentage,
      maximumBonus,
    } = req.body;

    if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      const err = await response.text();
      return res.status(response.status).json({ error: 'n8n error', details: err });
    }

<<<<<<< HEAD
    const html = await response.text();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);

=======
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
>>>>>>> 5a09252cd537e2f451a458b3e9717b45dc5d5c87
  } catch (error) {
    console.error('HTML conversion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
