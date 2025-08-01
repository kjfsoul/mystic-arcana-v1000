// Note: RIDER_WAITE_DECK import removed - now using API-driven data
// import { RIDER_WAITE_DECK } from './RiderWaiteDeck';

export interface TarotCardData {

  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number?: number;
  frontImage: string;
  backImage: string;
  meaning: {
    upright: string;
    reversed: string;
    keywords: string[];
    position?: string;
};
  description: string;
}

export interface TarotReading {
  id: string;
  spreadType: 'single' | 'three-card' | 'celtic-cross';
  cards: TarotCardData[];
  positions: string[];
  interpretation: string;
  cosmicInfluence?: unknown;
  timestamp: Date;
  isGuest: boolean;
}

export interface TarotEngineOptions {
  isGuest: boolean;
  cosmicInfluence?: unknown;
  deckId?: string; // Allow custom deck selection
}

// Mock interpretations for different spreads
const MOCK_INTERPRETATIONS = {
  single: [
    "This card reveals the energy surrounding you at this moment. Trust in the guidance it offers as you navigate your current path.",
    "The universe has drawn this card to illuminate an important aspect of your journey. Reflect on its message deeply.",
    "This card appears as a beacon of insight, offering clarity on the situation that weighs most heavily on your mind."
  ],
  'three-card': [
    "The past has shaped your foundation, the present offers opportunities for growth, and the future holds promise if you embrace the lessons learned.",
    "Your journey shows a progression from challenge to understanding to manifestation. Trust in the process unfolding before you.",
    "The cards reveal a story of transformation, where past experiences prepare you for present choices that will shape your destiny."
  ],
  'celtic-cross': [
    "This ancient spread reveals the complex web of influences affecting your situation. Each position offers deep insight into the forces at play in your life.",
    "The Celtic Cross illuminates the path ahead, showing both the challenges you face and the strengths you possess to overcome them."
  ]
};

export class TarotEngine {
  private deck: TarotCardData[];
  private options: TarotEngineOptions;
  private deckLoaded: boolean = false;

  constructor(options: TarotEngineOptions = { isGuest: false }) {
    this.deck = [];
    this.options = options;
    // Deck will be loaded asynchronously via loadDeck()
  }

  /**
   * Load deck data from API
   */
  async loadDeck(): Promise<void> {
    if (this.deckLoaded && this.deck.length > 0) {
      return; // Already loaded
    }

    try {
      const deckId = this.options.deckId || '00000000-0000-0000-0000-000000000001';
      const response = await fetch(`/api/tarot/deck/${deckId}`);

      if (!response.ok) {
        throw new Error(`Failed to load deck: ${response.status}`);
      }

      const data = await response.json();
      this.deck = data.cards || [];
      this.deckLoaded = true;

      console.log(`✅ TarotEngine loaded ${this.deck.length} cards`);
    } catch (error) {
      console.error('❌ Failed to load tarot deck:', error);
      // Fallback to empty deck - components should handle this gracefully
      this.deck = [];
      this.deckLoaded = false;
      throw error;
    }
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  private shuffleDeck(): TarotCardData[] {
    const shuffled = [...this.deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Draw cards for a specific spread type
   */
  async drawCards(spreadType: 'single' | 'three-card' | 'celtic-cross'): Promise<TarotCardData[]> {
    await this.loadDeck(); // Ensure deck is loaded

    if (this.deck.length === 0) {
      throw new Error('No cards available - deck failed to load');
    }

    const shuffled = this.shuffleDeck();

    switch (spreadType) {
      case 'single':
        return [shuffled[0]];
      case 'three-card':
        return shuffled.slice(0, 3);
      case 'celtic-cross':
        return shuffled.slice(0, 10);
      default:
        return [shuffled[0]];
    }
  }

  /**
   * Get positions for a spread type
   */
  getSpreadPositions(spreadType: 'single' | 'three-card' | 'celtic-cross'): string[] {
    switch (spreadType) {
      case 'single':
        return ['Present Situation'];
      case 'three-card':
        return ['Past', 'Present', 'Future'];
      case 'celtic-cross':
        return [
          'Present Situation',
          'Challenge/Cross',
          'Distant Past/Foundation',
          'Recent Past',
          'Possible Outcome',
          'Immediate Future',
          'Your Approach',
          'External Influences',
          'Hopes and Fears',
          'Final Outcome'
        ];
      default:
        return ['Present Situation'];
    }
  }

  /**
   * Generate interpretation for a reading
   */
  private generateInterpretation(
    cards: TarotCardData[],
    spreadType: 'single' | 'three-card' | 'celtic-cross',
    positions: string[]
  ): string {
    const baseInterpretations = MOCK_INTERPRETATIONS[spreadType];
    if (!baseInterpretations || baseInterpretations.length === 0) {
      console.error("No interpretations found for spread type:", spreadType);
      return "The cards speak of transformation and new beginnings. Trust in the journey ahead.";
    }
    const baseInterpretation = baseInterpretations[Math.floor(Math.random() * baseInterpretations.length)];
    
    // Add specific card insights
    const cardInsights = cards.map((card, index) => {
      const position = positions[index];
      return `In the position of ${position}, ${card.name} suggests: ${card.meaning.upright}`;
    }).join(' ');

    // Add cosmic influence if available
    let cosmicNote = '';
    if (this.options.cosmicInfluence && typeof this.options.cosmicInfluence === 'object' && this.options.cosmicInfluence !== null && 'currentPhase' in this.options.cosmicInfluence) {
      cosmicNote = ` The cosmic energies of ${(this.options.cosmicInfluence as { currentPhase: string }).currentPhase} amplify this reading's significance.`;
    }

    return `${baseInterpretation} ${cardInsights}${cosmicNote}`;
  }

  /**
   * Perform a complete tarot reading
   */
  async performReading(spreadType: 'single' | 'three-card' | 'celtic-cross'): Promise<TarotReading> {
    // Simulate shuffling delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    const cards = await this.drawCards(spreadType); // Now async
    const positions = this.getSpreadPositions(spreadType);
    const interpretation = this.generateInterpretation(cards, spreadType, positions);

    const reading: TarotReading = {
      id: `reading_${Date.now()}`,
      spreadType,
      cards,
      positions,
      interpretation,
      cosmicInfluence: this.options.cosmicInfluence,
      timestamp: new Date(),
      isGuest: this.options.isGuest
    };

    return reading;
  }

  /**
   * Get available spread types
   */
  getAvailableSpreadTypes(): Array<{ id: string; name: string; cardCount: number; description: string }> {
    return [
      {
        id: 'single',
        name: 'Daily Card',
        cardCount: 1,
        description: 'A single card to guide your day'
      },
      {
        id: 'three-card',
        name: 'Past, Present, Future',
        cardCount: 3,
        description: 'Insights into your timeline'
      },
      {
        id: 'celtic-cross',
        name: 'Celtic Cross',
        cardCount: 10,
        description: 'Comprehensive life reading'
      }
    ];
  }

  /**
   * Get a specific card by ID
   */
  async getCard(cardId: string): Promise<TarotCardData | undefined> {
    await this.loadDeck(); // Ensure deck is loaded
    return this.deck.find(card => card.id === cardId);
  }

  /**
   * Get all cards in the deck
   */
  async getAllCards(): Promise<TarotCardData[]> {
    await this.loadDeck(); // Ensure deck is loaded
    return [...this.deck];
  }

  /**
   * Check if user can access a spread type
   */
  canAccessSpread(spreadType: 'single' | 'three-card' | 'celtic-cross'): boolean {
    if (this.options.isGuest) {
      return spreadType === 'single'; // Guests can only access Daily Card
    }
    return true; // Registered users can access all spreads
  }
}
