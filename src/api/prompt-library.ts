// src/api/prompt-library.ts

const AIRTABLE_CONFIG = {
  pat: import.meta.env.VITE_AIRTABLE_PAT,
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
  tableName: 'Prompt Library', // Must match your Airtable table name exactly
};

export interface LibraryPrompt {
  id: string; // Airtable Record ID
  brand: string;
  label: string;
  description: string;
  subjectPosition?: string;
  aspectRatio?: string;
  theme?: string;
  format_layout?: string;
  primary_object?: string;
  subject?: string;
  lighting?: string;
  mood?: string;
  background?: string;
  positive_prompt?: string;
  negative_prompt?: string;
}

// Helper to check config
const checkConfig = () => {
  if (!AIRTABLE_CONFIG.pat || !AIRTABLE_CONFIG.baseId) {
    throw new Error('Missing Airtable Configuration');
  }
};

// --- READ ---
export async function fetchLibraryPrompts(): Promise<LibraryPrompt[]> {
  checkConfig();
  const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(AIRTABLE_CONFIG.tableName)}`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_CONFIG.pat}` }
  });

  if (!response.ok) throw new Error('Failed to fetch prompts');

  const data = await response.json();
  
  return data.records.map((r: any) => ({
    id: r.id,
    brand: r.fields.brand,
    label: r.fields.label,
    description: r.fields.description,
    subjectPosition: r.fields.subjectPosition,
    aspectRatio: r.fields.aspectRatio,
    theme: r.fields.theme,
    format_layout: r.fields.format_layout,
    primary_object: r.fields.primary_object,
    subject: r.fields.subject,
    lighting: r.fields.lighting,
    mood: r.fields.mood,
    background: r.fields.background,
    positive_prompt: r.fields.positive_prompt,
    negative_prompt: r.fields.negative_prompt,
  }));
}

// --- CREATE ---
export async function createLibraryPrompt(prompt: Omit<LibraryPrompt, 'id'>) {
  checkConfig();
  const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(AIRTABLE_CONFIG.tableName)}`;
  
  const payload = {
    fields: {
      brand: prompt.brand,
      label: prompt.label,
      description: prompt.description,
      subjectPosition: prompt.subjectPosition,
      aspectRatio: prompt.aspectRatio,
      theme: prompt.theme,
      format_layout: prompt.format_layout,
      primary_object: prompt.primary_object,
      subject: prompt.subject,
      lighting: prompt.lighting,
      mood: prompt.mood,
      background: prompt.background,
      positive_prompt: prompt.positive_prompt,
      negative_prompt: prompt.negative_prompt,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_CONFIG.pat}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('Failed to create prompt');
  return response.json();
}

// --- UPDATE ---
export async function updateLibraryPrompt(id: string, updates: Partial<Omit<LibraryPrompt, 'id'>>) {
  checkConfig();
  const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(AIRTABLE_CONFIG.tableName)}/${id}`;
  
  const payload = { fields: updates };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_CONFIG.pat}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('Failed to update prompt');
  return response.json();
}

// --- DELETE ---
export async function deleteLibraryPrompt(id: string) {
  checkConfig();
  const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(AIRTABLE_CONFIG.tableName)}/${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${AIRTABLE_CONFIG.pat}` }
  });

  if (!response.ok) throw new Error('Failed to delete prompt');
  return response.json();
}