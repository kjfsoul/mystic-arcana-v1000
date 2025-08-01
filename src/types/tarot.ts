export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  arcana_type?: 'major' | 'minor'; // Compatibility alias
  suit?: 'cups' | 'pentacles' | 'swords' | 'wands';
  number?: number;
  card_number?: number; // Compatibility alias
  frontImage: string;
  backImage: string;
  image_url?: string; // Compatibility alias
  position?: string; // For positioned readings
  keywords?: string[]; // Direct keywords property
  meaning: {
    upright: string;
    reversed: string;
    keywords: string[];
  };
  // Compatibility properties for legacy code
  meaning_upright?: string;
  meaning_reversed?: string;
  description: string;
  isReversed?: boolean;
}

export type SpreadType = 'single' | 'three-card' | 'celtic-cross';

export interface TarotDeck {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  is_active: boolean;
  cards?: TarotCard[];
}

export interface TarotDeckFilter {
  id?: string;
  type?: 'core' | 'seasonal';
  is_active?: boolean;
}

export interface TarotReading {
  id: string;
  userId?: string;
  spreadType: SpreadType;
  cards: TarotCard[];
  timestamp: Date;
  cosmicInfluence?: string;
  interpretation?: string;
  question?: string; // User's question for the reading
  positions?: string[]; // Position names in spread
}
