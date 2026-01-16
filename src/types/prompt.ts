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
    // --- Casino - Promotions ---
    { id: 'victory_trophy', label: 'Victory Trophy', description: 'A glowing golden cup trophy on the right, framed by sparks and flames with dramatic backlight rays', category: 'Casino - Promotions' },
    { id: 'golden_egg', label: 'Golden Egg', description: 'A glossy golden egg with a rooster emblem surrounded by coins, bars, and a red gemstone in dramatic warm lighting', category: 'Casino - Promotions' },
    { id: 'golden_rooster', label: 'Golden Rooster', description: 'A right-side close-up rooster in oversized glasses and a yellow suit posed against a warm, luxurious interior', category: 'Casino - Promotions' },
    { id: 'neon_rooster_1', label: 'Neon Rooster', description: 'A close-up, right-framed rooster in sunglasses and a leather jacket with a red muscle car glowing behind', category: 'Casino - Promotions' },
    { id: 'neon_rooster_2', label: 'Neon Rooster', description: 'A close-up rooster portrait on the right wearing glowing neon sunglasses against a dark futuristic light-streak background', category: 'Casino - Promotions' },
    { id: 'rockstar_rooster', label: 'Rockstar Rooster', description: 'A right-side close-up rooster in sunglasses holding a vintage microphone on a warm-lit concert stage', category: 'Casino - Promotions' },
    { id: 'neon_roosters', label: 'Neon Roosters', description: 'A wide neon-noir promo scene with a close-up rooster in purple sunglasses and a suited rooster beside a red muscle car', category: 'Casino - Promotions' },
    { id: 'casino_rooster', label: 'Casino Rooster', description: 'A stylish rooster in sunglasses and a suit presenting a glowing prize wheel that reads FREE PLAY', category: 'Casino - Promotions' },

    // --- Sports - Promotions ---
    { id: 'inferno_athletes', label: 'Inferno Athletes', description: 'A right-side sports collage of four action players bursting through fiery smoke with a large dark negative-space panel on the left', category: 'Sports - Promotions' },
    { id: 'victory_trophy_roosterbet', label: 'Victory Trophy', description: 'A golden championship cup on the right with sports balls and fiery embers under a dramatic light burst', category: 'Sports - Promotions' },
    { id: 'stadium_striker', label: 'Stadium Striker', description: 'A right-aligned footballer in a red kit striking a ball in a glowing stadium with dramatic sparks and haze', category: 'Sports - Promotions' },
    { id: 'inferno_skater', label: 'Inferno Skater', description: 'A right-aligned ice hockey player in red gear lunging forward with a stick amid flames and smoky darkness', category: 'Sports - Promotions' },
    { id: 'crimson_tennis', label: 'Crimson Tennis', description: 'A right-aligned tennis player in red mid-swing with a racket, surrounded by fiery smoke on a dark wide banner', category: 'Sports - Promotions' },
    { id: 'fire_striker', label: 'Fire Striker', description: 'A right-side action footballer in a red kit holding a matching ball, exploding through flames with dark negative space', category: 'Sports - Promotions' },
    { id: 'final_trophy', label: 'Final Trophy', description: 'A right-side footballer in a red kit clutching a golden cup amid red smoke, sparks, and a glowing 0-0 scoreboard', category: 'Sports - Promotions' },

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

  'LuckyVibe': [
    // --- Casino - Promotions ---
    { id: 'sunset_dj', label: 'Sunset DJ', description: 'A smiling beach DJ in a floral shirt mixing on decks at golden hour with warm backlight and soft crowd bokeh', category: 'Casino - Promotions' },
    { id: 'sunset_sippers', label: 'Sunset Sippers', description: 'Three colorful iced cocktails on a wooden beach table with umbrellas softly blurred behind in golden-hour light', category: 'Casino - Promotions' },
    { id: 'sunset_dj_headphones', label: 'Sunset DJ Headphones', description: 'Close-up over-ear headphones resting on a mixing console with a beach crowd blurred in warm golden-hour light', category: 'Casino - Promotions' },
    { id: 'golden_festival', label: 'Golden Festival', description: 'A laughing woman in mirrored sunglasses framed on the right with dark negative space and a sunlit crowd behind', category: 'Casino - Promotions' },
    { id: 'golden_smile', label: 'Golden Smile', description: 'A right-aligned close-up portrait of a joyful woman at sunset with windswept hair and large dark negative space on the left', category: 'Casino - Promotions' },
    { id: 'sunset_dj_deck', label: 'Sunset DJ Deck', description: 'A close-up DJ controller in the foreground with glowing pads, facing a calm ocean sunset and palm silhouettes', category: 'Casino - Promotions' },
    { id: 'sunset_cheers', label: 'Sunset Cheers', description: 'Two iced cocktails clink in close-up against a glowing tropical beach sunset with palm silhouettes and soft party bokeh', category: 'Casino - Promotions' },
    { id: 'sunset_dj_blonde', label: 'Sunset DJ', description: 'A smiling blonde woman in headphones mixes music at a beach party with warm golden-hour backlight and heavy left-side negative space', category: 'Casino - Promotions' },
    { id: 'jackpot_burst', label: 'Jackpot Burst', description: 'A glossy slot machine on the right erupting with flying gold coins against dark negative space', category: 'Casino - Promotions' },

    // --- Sports - Promotions ---
    { id: 'desert_final', label: 'Desert Final', description: 'Two footballers on a sandy pitch flank a glowing golden trophy beneath a 0 - 0 scoreboard in warm cinematic haze', category: 'Sports - Promotions' },
    { id: 'sunset_kick', label: 'Sunset Kick', description: 'A barefoot player about to kick a soccer ball on a tropical beach at sunset with an oversized casino-style chip in the foreground', category: 'Sports - Promotions' },
    { id: 'sunset_showdown', label: 'Sunset Showdown', description: 'Two barefoot footballers contesting a ball on sandy beach at golden hour with dark left-side negative space', category: 'Sports - Promotions' },
    { id: 'victory_trophy_sports', label: 'Victory Trophy', description: 'Two athletes on the right side lift a giant cup in a stadium at sunset with dramatic backlight', category: 'Sports - Promotions' },
    { id: 'beach_champions_esports', label: 'Beach Champions', description: 'A jubilant esports-style team in headsets celebrating with a trophy on a sunset shoreline with large left-side negative space', category: 'Sports - Promotions' },
    { id: 'beach_champions_athletes', label: 'Beach Champions', description: 'Five athletes pose on a sandy court at sunset in matching uniforms with sports gear and dramatic negative space', category: 'Sports - Promotions' },
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