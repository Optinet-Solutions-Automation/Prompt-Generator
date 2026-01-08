export type AppState = 'FORM' | 'PROCESSING' | 'RESULT' | 'SAVING' | 'SAVED';

export interface FormData {
  brand: string;
  image_type: string;
  theme: string;
  description: string;
  llm_tool: string;
  additional_instructions: string;
}

export interface GeneratePromptResponse {
  prompt: string;
  processing_time: number;
  timestamp: string;
}

export interface SavePromptResponse {
  success: boolean;
  message: string;
}

export const BRANDS = [
  'PlayMojo',
  'SpinJo',
  'SpinsUp',
  'FortunePlay',
  'Roosterbet',
] as const;

export const IMAGE_TYPES = [
  'Email Visuals',
  'Banners',
  'Website Images',
  'Promotional',
] as const;

export const LLM_TOOLS = [
  'Dall E / OpenArt',
  'MidJourney',
  'Gemini / Nano Banana',
  'Open AI / Chat GPT',
] as const;

export const INITIAL_FORM_DATA: FormData = {
  brand: '',
  image_type: '',
  theme: '',
  description: '',
  llm_tool: '',
  additional_instructions: '',
};
