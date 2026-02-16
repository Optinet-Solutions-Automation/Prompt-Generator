export interface SavePromptPayload {
  brand: string;
  title: string;
  reference: string;
  saved_prompt: string;
}

export async function savePrompt(data: SavePromptPayload) {
  // Checks for the variable with VITE_ prefix (standard) or without (custom config)
  // Also includes your fallback URL directly just in case
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_SAVE_PROMPT || 
                     import.meta.env.N8N_WEBHOOK_SAVE_PROMPT ||
                     "https://automateoptinet.app.n8n.cloud/webhook/save-prompt";

  if (!webhookUrl) {
    throw new Error('Save Prompt Webhook URL is not configured. Please set VITE_N8N_WEBHOOK_SAVE_PROMPT in your environment variables.');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save prompt: ${errorText}`);
  }

  return response.json();
}
