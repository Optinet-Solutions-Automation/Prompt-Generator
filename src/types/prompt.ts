export type AppState = 'FORM' | 'PROCESSING' | 'RESULT' | 'SAVING' | 'SAVED';

export interface FormData {
  brand: string;
  spec_id: string;
  theme: string;
  description: string;
  no_text: boolean;
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

export const SPEC_IDS = [
  { id: 'H1_RBC', label: 'Hero Desktop', dimensions: '1656x500' },
  { id: 'H2_RBC', label: 'Hero Mobile', dimensions: '960x640' },
  { id: 'W2_RBC', label: 'Hero Tablet', dimensions: '912x360' },
  { id: 'W5_RBC', label: 'Cashback Desktop', dimensions: '1616x380' },
  { id: 'L3_RBC', label: 'Cashback Mobile', dimensions: '1440x760' },
  { id: 'P1_RBC', label: 'Promo Card', dimensions: '1328x624' },
  { id: 'RP6_RBC', label: 'Promo Banner Small', dimensions: '664x312' },
  { id: 'V4_RBC', label: 'Square Card', dimensions: '700x530' },
  { id: 'JM1_RBC', label: 'Journey Map Desktop', dimensions: '1680x800' },
  { id: 'AC1_RBC', label: 'Advent Calendar Desktop', dimensions: '1680x700' },
  { id: 'AC4_RBC', label: 'Small Icon', dimensions: '96x96' },
  { id: 'AC7_RBC', label: 'Medium Icon', dimensions: '320x300' },
  { id: 'LS1_RBC', label: 'Lucky Spin Desktop', dimensions: '1680x880' },
  { id: 'E1_RBC', label: 'Error Banner', dimensions: '1440x820' },
  { id: 'HC_RBC', label: 'Help Center', dimensions: '992x312' },
  { id: 'MG_RBC', label: 'Modals Guide', dimensions: '480x336' },
  { id: 'BENEFITS_CARD', label: 'Benefits Card', dimensions: '520x520' },
] as const;

export const INITIAL_FORM_DATA: FormData = {
  brand: '',
  spec_id: '',
  theme: '',
  description: '',
  no_text: false,
};
