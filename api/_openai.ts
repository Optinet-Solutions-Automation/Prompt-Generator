/**
 * Shared OpenAI Chat Completions helper.
 * Calls the REST API directly via fetch — no npm package needed.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface ChatCompletionOpts {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  model?: string;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  /** If provided, sends the image URL as a vision input (requires gpt-4o or similar) */
  imageUrl?: string;
}

export async function chatCompletion(opts: ChatCompletionOpts): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const messages: ChatMessage[] = [
    { role: 'system', content: opts.systemPrompt },
  ];

  // If imageUrl is provided, send as a vision message with both text and image
  if (opts.imageUrl) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: opts.userPrompt },
        { type: 'image_url', image_url: { url: opts.imageUrl } },
      ],
    });
  } else {
    messages.push({ role: 'user', content: opts.userPrompt });
  }

  const body: Record<string, unknown> = {
    model: opts.model || 'gpt-4o-mini',
    messages,
    temperature: opts.temperature ?? 1.0,
  };

  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.responseFormat === 'json') {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
