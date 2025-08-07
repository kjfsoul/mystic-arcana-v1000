import { supabase } from "@/lib/supabase/client";
import { TarotDeckService } from "./TarotDeckService";
import { TarotCard as BaseTarotCard, SpreadType } from "@/types/tarot";
export type { SpreadType };
export interface TarotCard extends BaseTarotCard {
  isReversed?: boolean;
}
export interface SpreadPosition {
  position: number;
  label: string;
  card: TarotCard;
  interpretation?: string;
}
export interface TarotReading {
  id: string;
  userId?: string;
  spreadType: SpreadType;
  positions: SpreadPosition[];
  question?: string;
  overallInterpretation?: string;
  cosmicInfluences?: {
    moonPhase?: string;
    planetaryPositions?: string[];
    astrologyNotes?: string;
  };
  createdAt: Date;
}
export class TarotReadingEngine {
  private deck: TarotCard[] = [];
  private deckService: TarotDeckService;
  private isInitialized = false;

  constructor() {
    this.deckService = TarotDeckService.getInstance();
  }
  private async initializeDeck() {
    if (this.isInitialized) return;

    try {
      const deckData = await this.deckService.getDefaultDeck();
      this.deck = deckData.cards.map((card) => ({
        ...card,
        isReversed: false,
      }));
      this.isInitialized = true;
      console.log(`🎴 Initialized deck with ${this.deck.length} cards`);
    } catch (error) {
      console.error("❌ Failed to initialize deck:", error);
      throw error;
    }
  }
  private getRankName(number: number): string {
    const rankMap: { [key: number]: string } = {
      1: "ace",
      11: "page",
      12: "knight",
      13: "queen",
      14: "king",
    };

    if (rankMap[number]) {
      return rankMap[number];
    }

    const numberWords = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
    ];
    return numberWords[number] || number.toString();
  }
  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  private shuffleDeck(): TarotCard[] {
    const shuffled = [...this.deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Randomly reverse some cards (50% chance)
    return shuffled.map((card) => ({
      ...card,
      isReversed: Math.random() < 0.5,
    }));
  }
  /**
   * Draw cards for a specific spread
   */
  public async drawCards(
    spreadType: SpreadType,
    question?: string,
  ): Promise<TarotReading> {
    // Ensure deck is initialized
    await this.initializeDeck();

    const shuffledDeck = this.shuffleDeck();
    const cardCount = this.getCardCount(spreadType);
    const drawnCards = shuffledDeck.slice(0, cardCount);

    const positions = drawnCards.map((card, index) => ({
      position: index,
      label: this.getPositionLabel(spreadType, index),
      card: card,
    }));
    const reading: TarotReading = {
      id: crypto.randomUUID(),
      spreadType,
      positions,
      question,
      createdAt: new Date(),
    };
    // Get cosmic influences
    reading.cosmicInfluences = await this.getCosmicInfluences();
    return reading;
  }
  /**
   * Generate AI-powered interpretation using the Mystic Arcana agent
   */
  public async generateInterpretation(
    reading: TarotReading,
  ): Promise<TarotReading> {
    // This would connect to the Mystic Arcana agent via API
    // For now, we'll use placeholder interpretations

    const interpretedPositions = reading.positions.map((pos) => ({
      ...pos,
      interpretation: this.generatePositionInterpretation(pos),
    }));
    const overallInterpretation = this.generateOverallInterpretation(
      reading.spreadType,
      interpretedPositions,
      reading.question,
    );
    return {
      ...reading,
      positions: interpretedPositions,
      overallInterpretation,
    };
  }
  /**
   * Save reading to database
   */
  public async saveReading(
    reading: TarotReading,
    userId?: string,
  ): Promise<void> {
    if (!userId) return;
    const { error } = await supabase.from("tarot_readings").insert({
      user_id: userId,
      spread_type: reading.spreadType,
      cards_drawn: reading.positions.map((p) => ({
        position: p.position,
        card_id: p.card.id,
        is_reversed: p.card.isReversed,
      })),
      question: reading.question,
      interpretation: reading.overallInterpretation,
      cosmic_influences: reading.cosmicInfluences,
      created_at: reading.createdAt,
    });
    if (error) {
      console.error("Error saving reading:", error);
    }
  }
  /**
   * Get user's reading history
   */
  public async getUserReadings(
    userId: string,
    limit: number = 10,
  ): Promise<TarotReading[]> {
    const { data, error } = await supabase
      .from("tarot_readings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) {
      console.error("Error fetching readings:", error);
      return [];
    }
    // Transform database records back to TarotReading objects
    return data.map((record) => this.transformDatabaseReading(record));
  }
  private getCardCount(spreadType: SpreadType): number {
    const counts = {
      single: 1,
      "three-card": 3,
      "celtic-cross": 10,
    };
    return counts[spreadType];
  }
  private getPositionLabel(spreadType: SpreadType, index: number): string {
    const labels = {
      single: ["Your Card"],
      "three-card": ["Past", "Present", "Future"],
      "celtic-cross": [
        "Present Situation",
        "Challenge/Cross",
        "Distant Past",
        "Recent Past",
        "Possible Outcome",
        "Immediate Future",
        "Your Approach",
        "External Influences",
        "Hopes & Fears",
        "Final Outcome",
      ],
    };
    return labels[spreadType][index] || `Position ${index + 1}`;
  }
  private async getCosmicInfluences() {
    // This would connect to astronomical calculation services
    // For now, return placeholder data
    return {
      moonPhase: "Waxing Crescent",
      planetaryPositions: ["Mercury in Aquarius", "Venus in Pisces"],
      astrologyNotes: "Favorable time for new beginnings and creative pursuits",
    };
  }
  private generatePositionInterpretation(position: SpreadPosition): string {
    // Placeholder interpretation logic
    // In production, this would use the Mystic Arcana agent
    const card = position.card;
    const meaning = card.isReversed
      ? card.meaning.reversed
      : card.meaning.upright;

    return `In the position of ${position.label}, ${card.name} ${
      card.isReversed ? "(Reversed)" : ""
    } suggests: ${meaning}`;
  }
  private generateOverallInterpretation(
    spreadType: SpreadType,
    positions: SpreadPosition[],
    question?: string,
  ): string {
    // Placeholder overall interpretation
    // In production, this would use the Mystic Arcana agent
    const cardNames = positions.map((p) => p.card.name).join(", ");

    return `Your ${spreadType} reading reveals a journey through ${cardNames}. ${
      question
        ? `Regarding your question "${question}", the cards suggest...`
        : "The cards reveal important insights about your current path..."
    }`;
  }
  private transformDatabaseReading(record: {
    id: string;
    user_id: string;
    spread_type: SpreadType;
    question: string;
    interpretation: string;
    created_at: string;
    cosmic_influences: unknown;
  }): TarotReading {
    // Transform database record back to TarotReading object
    // Implementation depends on exact database schema
    return {
      id: record.id,
      userId: record.user_id,
      spreadType: record.spread_type,
      positions: [], // Would need to reconstruct from stored data
      question: record.question,
      overallInterpretation: record.interpretation,
      cosmicInfluences: record.cosmic_influences as {
        moonPhase?: string;
        planetaryPositions?: string[];
        astrologyNotes?: string;
      },
      createdAt: new Date(record.created_at),
    };
  }
}
