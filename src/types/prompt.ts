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
    // --- Casino - Promotions ---
    { id: 'nightlife_lion', label: 'Nightlife Lion', description: 'A right-side, half-body lion in a sharp suit wearing sunglasses', category: 'Casino - Promotions' },
    { id: 'explorer_lion', label: 'Explorer Lion', description: 'A center-position, half-body lion in adventure gear holding a treasure map', category: 'Casino - Promotions' },
    { id: 'smoking_lion', label: 'Smoking Lion', description: 'A right-side, half-body lion in ornate attire holding a cigar', category: 'Casino - Promotions' },
    { id: 'driver_lion', label: 'Driver Lion', description: 'A right-side, half-body lion in red clothes driving a car', category: 'Casino - Promotions' },
    { id: 'boss_lion', label: 'Boss Lion', description: 'A right-side, half-body lion in a suit holding cash', category: 'Casino - Promotions' },
    { id: 'neon_lion', label: 'Neon Lion', description: 'A right-side, half-body lion wearing vibrant sunglasses', category: 'Casino - Promotions' },

    // --- Sports - Promotions ---
    { id: 'golden_cup_clash', label: 'Golden Cup Clash', description: 'A right-weighted soccer promo banner with a mid-air player, a central gold trophy, and a large 0 - 0 score', category: 'Sports - Promotions' },
    { id: 'golden_striker', label: 'Golden Striker', description: 'A right-side soccer player mid-kick with a gold particle burst and floating casino chips over a dark banner layout', category: 'Sports - Promotions' },
    { id: 'golden_dribbler', label: 'Golden Dribbler', description: 'A right-side basketball player sprinting with a ball through a burst of glowing gold particles and floating coins', category: 'Sports - Promotions' },
    { id: 'golden_dribble', label: 'Golden Dribble', description: 'A right-aligned soccer player in a gray kit controlling a ball amid explosive gold dust on a dark banner', category: 'Sports - Promotions' },
    { id: 'victory_trophy_esports', label: 'Victory Trophy', description: 'A group of esports players on the right lift a gold cup amid golden confetti with a dark negative-space banner on the left', category: 'Sports - Promotions' },
    { id: 'elite_athletes', label: 'Elite Athletes', description: 'A right-aligned lineup of five multi-sport players in matching dark uniforms with gold accents and dramatic particle lighting', category: 'Sports - Promotions' },
  ],

  'PlayMojo': [
    { id: 'casino_rabbit_1', label: 'Casino Rabbit', description: 'A half-body white rabbit in leather and sunglasses smoking a cigar beside a glowing prize wheel', category: 'Casino - Promotions' },
    { id: 'casino_rabbit_2', label: 'Casino Rabbit', description: 'A cool white rabbit in a leather jacket and sunglasses holding a cigar beside a colorful prize wheel', category: 'Casino - Promotions' },
    { id: 'gangster_rabbit', label: 'Gangster Rabbit', description: 'A right-aligned anthropomorphic rabbit in sunglasses smoking in a leather armchair with a whiskey glass and heavy blue haze', category: 'Casino - Promotions' },
    { id: 'cigar_lounge_1', label: 'Cigar Lounge', description: 'Two whiskey glasses on a reflective table with cigars and ornate case in moody blue-amber lighting', category: 'Casino - Promotions' },
    { id: 'midnight_wager', label: 'Midnight Wager', description: 'A moody bar tabletop with a whiskey glass, scattered cash, and stacked cards in blue-and-amber cinematic lighting', category: 'Casino - Promotions' },
    { id: 'streetwise_rabbit', label: 'Streetwise Rabbit', description: 'A close-up rabbit in sunglasses and a red jacket posed on the right against a dark neon-lit city alley', category: 'Casino - Promotions' },
    { id: 'noir_rabbit_1', label: 'Noir Rabbit', description: 'A right-aligned, half-body rabbit in a red suit wearing sunglasses and gold chains with drifting smoke in a dark studio', category: 'Casino - Promotions' },
    { id: 'midnight_lounge', label: 'Midnight Lounge', description: 'A right-weighted still life of a whiskey bottle and coupe glass on a tray beside a tufted leather sofa', category: 'Casino - Promotions' },
    { id: 'cigar_lounge_2', label: 'Cigar Lounge', description: 'A cinematic close-up of cigars and amber spirits on a marble coffee table in a dark luxury living room', category: 'Casino - Promotions' },
    { id: 'noir_rabbit_2', label: 'Noir Rabbit', description: 'A right-side close-up rabbit in a dark suit wearing reflective sunglasses against a smoky teal studio backdrop', category: 'Casino - Promotions' },
  ],

  'SpinJo': [
    { id: 'neon_portal', label: 'Neon Portal', description: 'A lone astronaut stands in a dark spacecraft bay beside a massive glowing wheel-like machine', category: 'Casino - Promotions' },
    { id: 'cosmic_spin', label: 'Cosmic Spin', description: 'A helmeted astronaut on the right presents a glowing lucky prize wheel floating in a dark space casino scene', category: 'Casino - Promotions' },
    { id: 'nebula_cruiser', label: 'Nebula Cruiser', description: 'A sleek starship angled upward on the right, backlit by a violet nebula with deep negative space on the left', category: 'Casino - Promotions' },
    { id: 'nebula_interceptor', label: 'Nebula Interceptor', description: 'A sleek starship seen head-on, drifting through a violet nebula with bright engine glows and vast dark space', category: 'Casino - Promotions' },
    { id: 'stormcraft_arrival', label: 'Stormcraft Arrival', description: 'A massive alien ship hovers low over a rain-slick roadway under storm clouds with magenta glow and blue haze', category: 'Casino - Promotions' },
    { id: 'neon_astronaut', label: 'Neon Astronaut', description: 'A right-side astronaut sprinting across a rocky alien surface with a glowing purple planet backdrop and dramatic rim light', category: 'Casino - Promotions' },
    { id: 'starlit_astronaut_1', label: 'Starlit Astronaut', description: 'A right-aligned, close-up astronaut portrait in a reflective helmet with blue eyes and purple cosmic glow', category: 'Casino - Promotions' },
    { id: 'neon_citadel', label: 'Neon Citadel', description: 'A right-weighted futuristic skyline of glowing spires beneath a looming planet in violet atmospheric haze', category: 'Casino - Promotions' },
    { id: 'nebula_runner', label: 'Nebula Runner', description: 'A sleek black starship on the right rockets through violet space, leaving a long magenta engine trail into dark negative space', category: 'Casino - Promotions' },
    { id: 'starlit_astronaut_2', label: 'Starlit Astronaut', description: 'A right-side close-up portrait of a young astronaut gazing upward, helmet visor reflecting a purple-blue galaxy', category: 'Casino - Promotions' },
  ],

  'Roosterbet': [
    { id: 'victory_trophy', label: 'Victory Trophy', description: 'A glowing golden cup trophy on the right, framed by sparks and flames with dramatic backlight rays', category: 'Casino - Promotions' },
    { id: 'golden_egg', label: 'Golden Egg', description: 'A glossy golden egg with a rooster emblem surrounded by coins, bars, and a red gemstone in dramatic warm lighting', category: 'Casino - Promotions' },
    { id: 'golden_rooster', label: 'Golden Rooster', description: 'A right-side close-up rooster in oversized glasses and a yellow suit posed against a warm, luxurious interior', category: 'Casino - Promotions' },
    { id: 'neon_rooster_1', label: 'Neon Rooster', description: 'A close-up, right-framed rooster in sunglasses and a leather jacket with a red muscle car glowing behind', category: 'Casino - Promotions' },
    { id: 'neon_rooster_2', label: 'Neon Rooster', description: 'A close-up rooster portrait on the right wearing glowing neon sunglasses against a dark futuristic light-streak background', category: 'Casino - Promotions' },
    { id: 'rockstar_rooster', label: 'Rockstar Rooster', description: 'A right-side close-up rooster in sunglasses holding a vintage microphone on a warm-lit concert stage', category: 'Casino - Promotions' },
    { id: 'neon_roosters', label: 'Neon Roosters', description: 'A wide neon-noir promo scene with a close-up rooster in purple sunglasses and a suited rooster beside a red muscle car', category: 'Casino - Promotions' },
    { id: 'casino_rooster', label: 'Casino Rooster', description: 'A stylish rooster in sunglasses and a suit presenting a glowing prize wheel that reads FREE PLAY', category: 'Casino - Promotions' },
  ],

  'SpinsUp': [
    { id: 'mystic_croupier', label: 'Mystic Croupier', description: 'A stylish showman in a purple coat spins a glowing casino prize wheel surrounded by swirling neon energy', category: 'Casino - Promotions' },
    { id: 'lucky_wheel', label: 'Lucky Wheel', description: 'A glamorous female casino host poses beside a glowing prize wheel labeled “LUCKY SPIN” in a neon purple night scene', category: 'Casino - Promotions' },
    { id: 'arcane_magician', label: 'Arcane Magician', description: 'A right-side, half-body stage magician presenting a glowing neon vortex in his hands under circus tent lights', category: 'Casino - Promotions' },
    { id: 'fire_ringmaster', label: 'Fire Ringmaster', description: 'A muscular showman in an ornate red jacket stands beside a lion with a burning circus tent behind', category: 'Casino - Promotions' },
    { id: 'astral_monk', label: 'Astral Monk', description: 'A levitating monk in red robes meditates on a circular stage as golden energy spirals behind him in a night circus', category: 'Casino - Promotions' },
    { id: 'arcane_seer', label: 'Arcane Seer', description: 'A right-aligned crimson-robed sorceress holding a glowing spiral crystal orb in a dark, mystical study', category: 'Casino - Promotions' },
    { id: 'mystic_magician', label: 'Mystic Magician', description: 'A right-side close-up of gloved hands presenting a top hat with glowing playing cards bursting into purple sparkles', category: 'Casino - Promotions' },
    { id: 'carnival_enchantress', label: 'Carnival Enchantress', description: 'A smiling woman in a red corset on the right, wrapped in glowing golden light trails at a night fair', category: 'Casino - Promotions' },
    { id: 'arcane_cardsharp', label: 'Arcane Cardsharp', description: 'A right-framed, half-body magician in ornate formalwear conjuring flying playing cards amid sparks and smoky glow', category: 'Casino - Promotions' },
    { id: 'mystic_casino', label: 'Mystic Casino', description: 'A neon-lit top hat on poker chips with a hovering bird and two aces, framed as a wide banner', category: 'Casino - Promotions' },
  ],
};


export interface PromptMetadata {
  brand: string;
  reference: string;
  theme: string;
  description: string;
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
  'Roosterbet',
] as const;


export const INITIAL_FORM_DATA: FormData = {
  brand: '',
  reference: '',
  theme: '',
  description: '',
};