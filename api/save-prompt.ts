export interface SavePromptPayload {
  brand: string;
  title: string;
  reference: string;
  saved_prompt: string;
}

export async function savePrompt(data: SavePromptPayload) {
  // Use the webhook URL provided
  const webhookUrl = import.meta.env.VITE_SAVE_PROMPT_WEBHOOK || "https://automateoptinet.app.n8n.cloud/webhook/save-prompt";

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
