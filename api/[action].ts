import type { VercelRequest, VercelResponse } from '@vercel/node';

// Maps the URL segment (e.g. "list-prompts") → the n8n webhook URL env var.
// Specific API files with custom logic (generate-prompt, show-prompt-data,
// generate-image, edit-image) take priority over this dynamic route automatically.
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
  // req.query.action is the URL segment, e.g. "list-prompts"
  const action = req.query.action as string;

  const webhookUrl = WEBHOOK_MAP[action];

  if (!webhookUrl) {
    console.error(`Unknown or unconfigured API route: "${action}"`);
    return res.status(404).json({ error: `Unknown API route: ${action}` });
  }

  try {
    const isGet = req.method === 'GET';

    const response = await fetch(webhookUrl, {
      method: isGet ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: isGet ? undefined : JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`n8n webhook error for "${action}":`, response.status, errorText);
      return res.status(500).json({
        error: `Webhook failed for ${action}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error(`Error in API route "${action}":`, error);
    return res.status(500).json({
      error: `Failed to call ${action}`,
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
