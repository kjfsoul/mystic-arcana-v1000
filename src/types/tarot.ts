export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'cups' | 'pentacles' | 'swords' | 'wands';
  number?: number;
  frontImage: string;
  backImage: string;
  meaning: {
    upright: string;
    reversed: string;
    keywords: string[];
  };
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
}
