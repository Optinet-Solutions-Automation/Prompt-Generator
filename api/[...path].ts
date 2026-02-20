import type { VercelRequest, VercelResponse } from '@vercel/node';

// Maps URL path → n8n webhook env var.
// All of these are simple pass-through proxies with no custom logic.
// Routes with custom logic (generate-prompt, show-prompt-data, generate-image, edit-image)
// stay as their own individual files and take priority over this catch-all.
const WEBHOOK_MAP: Record<string, string | undefined> = {
  'list-prompts':          process.env.N8N_WEBHOOK_LIST_PROMPTS,
  'get-prompt-by-id':      process.env.N8N_WEBHOOK_GET_PROMPT_BY_ID,
  'save-prompt':           process.env.N8N_WEBHOOK_SAVE_PROMPT,
  'save-as-reference':     process.env.N8N_WEBHOOK_SAVE_AS_REFERENCE,
  'remove-reference':      process.env.N8N_WEBHOOK_REMOVE_REFERENCE,
  'rename-reference':      process.env.N8N_WEBHOOK_RENAME_PROMPT,
  'regenerate-reference':  process.env.N8N_WEBHOOK_REGENERATE_REFERENCE,
  'create-blended-prompt': process.env.N8N_WEBHOOK_CREATE_BLENDED_PROMPT,
  'convert-to-html':       process.env.N8N_WEBHOOK_CONVERT_HTML,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract the last segment of the path (e.g. "list-prompts" from /api/list-prompts)
  const pathParts = Array.isArray(req.query.path) ? req.query.path : [req.query.path ?? ''];
  const action = pathParts[pathParts.length - 1];

  const webhookUrl = WEBHOOK_MAP[action];

  if (!webhookUrl) {
    console.error(`Unknown or unconfigured API route: ${action}`);
    return res.status(404).json({ error: `Unknown API route: ${action}` });
  }

  try {
    const isGet = req.method === 'GET';

    const response = await fetch(webhookUrl, {
      method: isGet ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Don't send a body for GET requests
      body: isGet ? undefined : JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`n8n webhook error for ${action}:`, response.status, errorText);
      return res.status(500).json({
        error: `Webhook failed for ${action}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error(`Error in API route ${action}:`, error);
    return res.status(500).json({
      error: `Failed to call ${action}`,
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
