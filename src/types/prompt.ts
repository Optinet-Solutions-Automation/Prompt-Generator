export type AppState = 'FORM' | 'PROCESSING' | 'RESULT' | 'SAVING' | 'SAVED';

export interface FormData {
  brand: string;
  reference: string;
  theme: string;
  description: string;
}

export interface ReferenceOption {
  id: string;
  label: string;
  description: string;
  category: string;
}

export const BRAND_REFERENCES: Record<string, ReferenceOption[]> = {
  'FortunePlay': [
    { id: 'nightlife_lion', label: 'Nightlife Lion', description: 'A right-side, half-body lion in a sharp suit wearing sunglasses', category: 'Promotions' },
    { id: 'explorer_lion', label: 'Explorer Lion', description: 'A center-position, half-body lion in adventure gear holding a treasure map', category: 'Promotions' },
    { id: 'smoking_lion', label: 'Smoking Lion', description: 'A right-side, half-body lion in ornate attire holding a cigar', category: 'Promotions' },
    { id: 'driver_lion', label: 'Driver Lion', description: 'A right-side, half-body lion in red clothes driving a car', category: 'Promotions' },
    { id: 'boss_lion', label: 'Boss Lion', description: 'A right-side, half-body lion in a suit holding cash', category: 'Promotions' },
    { id: 'neon_lion', label: 'Neon Lion', description: 'A right-side, half-body lion wearing vibrant sunglasses', category: 'Promotions' },
  ],
};

export interface PromptMetadata {
  brand: string;
  reference: string;
  theme: string;
  relevance_score: number;
  style_confidence: string;
  reference_count: number;
  similar_prompts_used: number;
  recommended_ai: string;
}

export interface GeneratePromptResponse {
  success: boolean;
  message: string;
  prompt: string;
  metadata: PromptMetadata;
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
  'Roosterbet ',
] as const;

export const SPEC_IDS = [
  // Email Banners
  { id: 'EMAIL_BANNER_1024x512', label: 'Email Banner', dimensions: '1024x512', category: 'Email' },
  { id: 'EMAIL_BANNER_640x299', label: 'Email Banner Small', dimensions: '640x299', category: 'Email' },
  { id: 'EMAIL_BANNER_512x292', label: 'Email Banner Mini', dimensions: '512x292', category: 'Email' },
  { id: 'EMAIL_BANNER_800x375', label: 'Email Banner Medium', dimensions: '800x375', category: 'Email' },
  { id: 'EMAIL_BANNER_1408x704', label: 'Email Banner Large', dimensions: '1408x704', category: 'Email' },
  { id: 'EMAIL_BANNER_1456x728', label: 'Email Banner XL', dimensions: '1456x728', category: 'Email' },
  { id: 'EMAIL_BANNER_1182x591', label: 'Email Banner Alt', dimensions: '1182x591', category: 'Email' },
  { id: 'EMAIL_BANNER_1190x595', label: 'Email Banner Wide', dimensions: '1190x595', category: 'Email' },
  { id: 'EMAIL_BANNER_1198x596', label: 'Email Banner Extended', dimensions: '1198x596', category: 'Email' },
  { id: 'EMAIL_BANNER_1344x672', label: 'Email Banner Pro', dimensions: '1344x672', category: 'Email' },
  
  // Home Page - Hero Banners
  { id: 'H1_RBC', label: 'Hero Desktop', dimensions: '1656x500', category: 'Home Page' },
  { id: 'H2_RBC', label: 'Hero Mobile', dimensions: '960x640 (x2)', category: 'Home Page' },
  
  // Welcome Page
  { id: 'W1_RBC', label: 'Welcome Desktop', dimensions: '1656x500', category: 'Welcome Page' },
  { id: 'W2_RBC', label: 'Welcome Tablet', dimensions: '912x360', category: 'Welcome Page' },
  { id: 'W3_RBC', label: 'Welcome Mobile', dimensions: '1440x640 (x2)', category: 'Welcome Page' },
  { id: 'W5_RBC', label: 'Cashback Desktop', dimensions: '1616x380', category: 'Welcome Page' },
  { id: 'W6_RBC', label: 'Cashback Tablet', dimensions: '1200x380', category: 'Welcome Page' },
  { id: 'W7_RBC', label: 'Cashback Mobile', dimensions: '1536x760 (x2)', category: 'Welcome Page' },
  
  // Promotions Page
  { id: 'P1_RBC', label: 'Promo Card', dimensions: '1328x784 (x2)', category: 'Promotions' },
  { id: 'P2_RBC', label: 'Promo Banner Desktop', dimensions: '1072x440', category: 'Promotions' },
  { id: 'P3_RBC', label: 'Promo Banner Mobile', dimensions: '960x640 (x2)', category: 'Promotions' },
  
  // Lottery Template
  { id: 'L1_RBC', label: 'Lottery Desktop', dimensions: '1344x500', category: 'Lottery' },
  { id: 'L2_RBC', label: 'Lottery Tablet', dimensions: '912x500', category: 'Lottery' },
  { id: 'L3_RBC', label: 'Lottery Mobile', dimensions: '1440x760 (x2)', category: 'Lottery' },
  
  // Error Pages
  { id: 'E1_RBC', label: 'Error Banner (404/403)', dimensions: '1440x820', category: 'Error' },
  { id: 'E2_N1C', label: 'Error Banner N1C', dimensions: '1486x700', category: 'Error' },
  
  // Referral Program
  { id: 'RP1_RBC', label: 'Referral Desktop', dimensions: '1344x500', category: 'Referral' },
  { id: 'RP2_RBC', label: 'Referral Tablet', dimensions: '912x500', category: 'Referral' },
  { id: 'RP3_RBC', label: 'Referral Mobile', dimensions: '1440x1000 (x2)', category: 'Referral' },
  { id: 'RP4_RBC', label: 'Referral Slider Desktop', dimensions: '1616x500', category: 'Referral' },
  { id: 'RP5_RBC', label: 'Referral Slider Mobile', dimensions: '960x640 (x2)', category: 'Referral' },
  { id: 'RP6_RBC', label: 'Referral Promo Banner', dimensions: '664x312 (x2)', category: 'Referral' },
  
  // Hall of Fame
  { id: 'HF1_RBC', label: 'Hall of Fame Desktop', dimensions: '1440x480 (x2)', category: 'Hall of Fame' },
  { id: 'HF2_RBC', label: 'Hall of Fame Mobile', dimensions: '960x528 (x2)', category: 'Hall of Fame' },
  { id: 'HF3_RBC', label: 'Achievement Icons', dimensions: '240x240 (x2)', category: 'Hall of Fame' },
  { id: 'HF4_RBC', label: 'Avatar Pics', dimensions: '200x200 (x2)', category: 'Hall of Fame' },
  
  // VIP Page
  { id: 'V1_RBC', label: 'VIP Desktop', dimensions: '1680x600', category: 'VIP' },
  { id: 'V2_RBC', label: 'VIP Tablet', dimensions: '1200x480', category: 'VIP' },
  { id: 'V3_RBC', label: 'VIP Mobile', dimensions: '1536x800 (x2)', category: 'VIP' },
  { id: 'V4_RBC', label: 'VIP Section Image', dimensions: '700x530', category: 'VIP' },
  
  // Advent Calendar
  { id: 'AC1_RBC', label: 'Advent Calendar Desktop', dimensions: '1680x700', category: 'Advent Calendar' },
  { id: 'AC2_RBC', label: 'Advent Calendar Tablet', dimensions: '1200x500', category: 'Advent Calendar' },
  { id: 'AC3_RBC', label: 'Advent Calendar Mobile', dimensions: '1536x500 (x2)', category: 'Advent Calendar' },
  { id: 'AC4_RBC', label: 'Progress/Prize Icon', dimensions: '96x96 (x2)', category: 'Advent Calendar' },
  { id: 'AC5_RBC', label: 'Advent Bonus Card', dimensions: '1328x784 (x2)', category: 'Advent Calendar' },
  { id: 'AC7_RBC', label: 'Empty State Images', dimensions: '320x300', category: 'Advent Calendar' },
  { id: 'AC8_RBC', label: 'Onboarding Images', dimensions: '300x300', category: 'Advent Calendar' },
  { id: 'AC9_RBC', label: 'Modal Background', dimensions: '960x500 (x2)', category: 'Advent Calendar' },
  
  // Modals Guide
  { id: 'MG_RBC', label: 'Modal Background', dimensions: '480x336', category: 'Modals' },
  
  // Help Center
  { id: 'HC_RBC', label: 'Help Center Banner', dimensions: '992x312', category: 'Help Center' },
  
  // Journey Map
  { id: 'JM1_RBC', label: 'Journey Map Desktop', dimensions: '1680x800', category: 'Journey Map' },
  { id: 'JM2_RBC', label: 'Journey Map Tablet', dimensions: '960x580', category: 'Journey Map' },
  { id: 'JM3_RBC', label: 'Journey Map Mobile', dimensions: '960x1080 (x2)', category: 'Journey Map' },
  
  // Missions
  { id: 'M1_RBC', label: 'Missions Desktop', dimensions: '1680x600', category: 'Missions' },
  { id: 'M2_RBC', label: 'Missions Tablet', dimensions: '1200x600', category: 'Missions' },
  { id: 'M3_RBC', label: 'Missions Mobile', dimensions: '768x600', category: 'Missions' },
  { id: 'M4_RBC', label: 'Missions Character', dimensions: '620x500', category: 'Missions' },
  
  // Lucky Spin
  { id: 'LS1_RBC', label: 'Lucky Spin Desktop', dimensions: '1680x880 (x2)', category: 'Lucky Spin' },
  { id: 'LS2_RBC', label: 'Lucky Spin Tablet', dimensions: '1200x770', category: 'Lucky Spin' },
  { id: 'LS3_RBC', label: 'Lucky Spin Mobile', dimensions: '768x360 (x2)', category: 'Lucky Spin' },
  
  // Lucky Box
  { id: 'LB1_RBC', label: 'Lucky Box Desktop', dimensions: '1680x880 (x2)', category: 'Lucky Box' },
  { id: 'LB2_RBC', label: 'Lucky Box Tablet', dimensions: '1200x770', category: 'Lucky Box' },
  { id: 'LB3_RBC', label: 'Lucky Box Mobile', dimensions: '768x360 (x2)', category: 'Lucky Box' },
  
  // Benefits & Other
  { id: 'BENEFITS_CARD', label: 'Benefits Card', dimensions: '520x520', category: 'Benefits' },
  { id: 'HERO_DESKTOP_1920x600', label: 'Hero Desktop Wide', dimensions: '1920x600', category: 'Hero' },
  { id: 'HERO_DESKTOP_1792x512', label: 'Hero Desktop Alt', dimensions: '1792x512', category: 'Hero' },
  { id: 'HERO_DESKTOP_2144x640', label: 'Hero Desktop XL', dimensions: '2144x640', category: 'Hero' },
  { id: 'HERO_DESKTOP_3584x1024', label: 'Hero Desktop XXL', dimensions: '3584x1024', category: 'Hero' },
  { id: 'HERO_MOBILE_656x390', label: 'Hero Mobile Small', dimensions: '656x390', category: 'Hero' },
] as const;

export const INITIAL_FORM_DATA: FormData = {
  brand: '',
  reference: '',
  theme: '',
  description: '',
};