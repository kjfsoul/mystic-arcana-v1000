import { TarotCard } from "@/types/tarot";
const RIDER_WAITE_DECK_ID = "00000000-0000-0000-0000-000000000001";
export interface DeckResponse {
  deck: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
  cards: TarotCard[];
  stats: {
    totalCards: number;
    majorArcana: number;
    minorArcana: number;
    suits: {
      cups: number;
      pentacles: number;
      swords: number;
      wands: number;
    };
  };
}
export class TarotDeckService {
  private static instance: TarotDeckService;
  private deckCache: Map<string, DeckResponse> = new Map();
  private constructor() {}
  static getInstance(): TarotDeckService {
    if (!TarotDeckService.instance) {
      TarotDeckService.instance = new TarotDeckService();
    }
    return TarotDeckService.instance;
  }
  async getDeck(deckId: string = RIDER_WAITE_DECK_ID): Promise<DeckResponse> {
    // Check cache first
    if (this.deckCache.has(deckId)) {
      console.log("🎴 Returning cached deck");
      return this.deckCache.get(deckId)!;
    }
    try {
      console.log("🎴 Fetching deck from API:", deckId);
      const response = await fetch(`/api/tarot/deck/${deckId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch deck: ${response.statusText}`);
      }
      const data: DeckResponse = await response.json();

      // Cache the deck data
      this.deckCache.set(deckId, data);

      console.log(`🎴 Loaded ${data.cards.length} cards`);
      return data;
    } catch (error) {
      console.error("❌ Error fetching deck:", error);
      throw error;
    }
  }
  async getDefaultDeck(): Promise<DeckResponse> {
    return this.getDeck(RIDER_WAITE_DECK_ID);
  }
  shuffleDeck(cards: TarotCard[]): TarotCard[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  drawCards(cards: TarotCard[], count: number): TarotCard[] {
    const shuffled = this.shuffleDeck(cards);
    return shuffled.slice(0, count);
  }
  drawSingleCard(cards: TarotCard[]): TarotCard {
    const shuffled = this.shuffleDeck(cards);
    return shuffled[0];
  }
  drawThreeCardSpread(cards: TarotCard[]): {
    past: TarotCard;
    present: TarotCard;
    future: TarotCard;
  } {
    const drawn = this.drawCards(cards, 3);
    return {
      past: drawn[0],
      present: drawn[1],
      future: drawn[2],
    };
  }
  drawCelticCross(cards: TarotCard[]): {
    significator: TarotCard;
    cross: TarotCard;
    crowns: TarotCard;
    foundation: TarotCard;
    past: TarotCard;
    future: TarotCard;
    approach: TarotCard;
    influences: TarotCard;
    hopes: TarotCard;
    outcome: TarotCard;
  } {
    const drawn = this.drawCards(cards, 10);
    return {
      significator: drawn[0],
      cross: drawn[1],
      crowns: drawn[2],
      foundation: drawn[3],
      past: drawn[4],
      future: drawn[5],
      approach: drawn[6],
      influences: drawn[7],
      hopes: drawn[8],
      outcome: drawn[9],
    };
  }
}
