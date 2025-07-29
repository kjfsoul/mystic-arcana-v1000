/**
 * SOPHIA - THE MYSTIC ARCANA VIRTUAL READER
 * Agent: PersonaImplementer (Persona Learner Activation Mission)
 * Purpose: Primary virtual reader connecting UI to Knowledge Pool for personalized readings
 */

import { createClient } from '@/lib/supabase/server';
import { TarotCard } from '@/types/tarot';
import { SpreadType } from '@/components/tarot/EnhancedTarotSpreadLayouts';

interface ReadingContext {
  userId?: string;
  spreadType: SpreadType;
  sessionId: string;
  timestamp: Date;
  astrological_context?: {
    moon_sign?: string;
    sun_sign?: string;
    active_transits?: string[];
  };
}

interface PersonalizedInterpretation {
  base_interpretation: string;
  personalized_guidance: string;
  spiritual_wisdom: string;
  practical_advice: string;
  reader_notes: string;
  confidence_score: number;
  source_references: string[];
}

interface SophiaReading {
  id: string;
  narrative: string;
  card_interpretations: PersonalizedInterpretation[];
  overall_guidance: string;
  spiritual_insight: string;
  reader_signature: string;
  session_context: ReadingContext;
  created_at: Date;
}

/**
 * Sophia - The Weaver of Wisdom
 * 
 * Sophia embodies the archetype of the wise woman, the keeper of ancient knowledge
 * who speaks with gentle authority and profound compassion. She specializes in:
 * - Synthesizing knowledge pool interpretations into soulful narratives
 * - Adapting her voice to each user's spiritual journey
 * - Weaving multiple card meanings into coherent wisdom
 * - Providing guidance that honors both tradition and personal growth
 */
export class SophiaAgent {
  private personality = {
    voice: 'gentle, wise, compassionate',
    archetype: 'The Wise Woman, The Keeper of Ancient Knowledge',
    specialties: ['spiritual synthesis', 'narrative weaving', 'compassionate guidance'],
    signature_phrases: [
      'The cards whisper ancient truths',
      'Your soul already knows the way',
      'In the tapestry of your journey',
      'The universe conspires in your favor',
      'Trust the wisdom within'
    ],
    tone: 'nurturing yet empowering, mystical yet grounded'
  };

  private supabase = createClient();

  /**
   * Generate a complete personalized reading by querying the Knowledge Pool
   * and synthesizing interpretations through Sophia's wise perspective
   */
  async getReading(
    cards: TarotCard[],
    spreadType: SpreadType,
    context: ReadingContext
  ): Promise<SophiaReading> {
    try {
      // Query Knowledge Pool for each card's interpretation
      const cardInterpretations: PersonalizedInterpretation[] = [];
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const positionName = this.getPositionName(spreadType, i);
        
        // Fetch base interpretation from Knowledge Pool
        const { data: interpretationData, error } = await this.supabase
          .from('tarot_interpretations')
          .select('*')
          .eq('card_name', card.name)
          .eq('spread_type', spreadType)
          .eq('position_name', positionName)
          .single();

        if (error) {
          console.warn(`No specific interpretation found for ${card.name} in ${positionName}, using fallback`);
        }

        // Create personalized interpretation
        const interpretation = await this.createPersonalizedInterpretation(
          card,
          interpretationData,
          positionName,
          context,
          i
        );
        
        cardInterpretations.push(interpretation);
      }

      // Synthesize overall reading narrative
      const narrative = await this.synthesizeNarrative(cards, cardInterpretations, spreadType, context);
      const overallGuidance = await this.synthesizeOverallGuidance(cardInterpretations, context);
      const spiritualInsight = await this.generateSpiritualInsight(cards, context);

      const reading: SophiaReading = {
        id: `sophia_reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        narrative,
        card_interpretations: cardInterpretations,
        overall_guidance: overallGuidance,
        spiritual_insight: spiritualInsight,
        reader_signature: this.generateReaderSignature(),
        session_context: context,
        created_at: new Date()
      };

      return reading;

    } catch (error) {
      console.error('Sophia reading generation failed:', error);
      throw new Error(`Unable to channel the cosmic wisdom at this time: ${error}`);
    }
  }

  /**
   * Create a personalized interpretation for a single card
   */
  private async createPersonalizedInterpretation(
    card: TarotCard,
    knowledgePoolData: any,
    positionName: string,
    context: ReadingContext,
    cardIndex: number
  ): Promise<PersonalizedInterpretation> {
    
    // Base interpretation from Knowledge Pool or fallback
    const baseInterpretation = knowledgePoolData?.base_meaning || 
      this.generateFallbackInterpretation(card, positionName);

    // Extract personalization hooks if available
    const personalizationHooks = knowledgePoolData?.personalization_hooks || [];
    
    // Generate Sophia's personalized guidance
    const personalizedGuidance = await this.generateSophiaGuidance(
      card,
      baseInterpretation,
      positionName,
      context,
      personalizationHooks
    );

    // Extract spiritual wisdom and practical advice
    const spiritualWisdom = knowledgePoolData?.spiritual_wisdom || 
      this.generateSpiritualWisdom(card, positionName);
    
    const practicalAdvice = knowledgePoolData?.actionable_reflection || 
      this.generatePracticalAdvice(card, positionName);

    // Generate Sophia's reader notes
    const readerNotes = this.generateReaderNotes(card, knowledgePoolData, context);

    // Calculate confidence score based on data availability
    const confidenceScore = this.calculateConfidenceScore(knowledgePoolData, context);

    // Source references
    const sourceReferences = [
      'Mystic Arcana Knowledge Pool',
      knowledgePoolData?.db_entry_id || 'Sophia\'s Ancient Wisdom',
      'Rider-Waite Tarot Tradition'
    ];

    return {
      base_interpretation: baseInterpretation,
      personalized_guidance: personalizedGuidance,
      spiritual_wisdom: spiritualWisdom,
      practical_advice: practicalAdvice,
      reader_notes: readerNotes,
      confidence_score: confidenceScore,
      source_references: sourceReferences
    };
  }

  /**
   * Generate Sophia's signature guidance style
   */
  private async generateSophiaGuidance(
    card: TarotCard,
    baseInterpretation: string,
    positionName: string,
    context: ReadingContext,
    personalizationHooks: any[]
  ): Promise<string> {
    
    const signaturePhrase = this.personality.signature_phrases[
      Math.floor(Math.random() * this.personality.signature_phrases.length)
    ];

    // Weave Sophia's voice into the interpretation
    let guidance = `${signaturePhrase} through ${card.name} in your ${positionName}. `;
    
    // Add base interpretation with Sophia's perspective
    guidance += `${baseInterpretation} `;
    
    // Add personalization if available
    if (personalizationHooks.length > 0) {
      const relevantHook = personalizationHooks[0]; // Use first hook for now
      if (relevantHook.interpretation) {
        guidance += `Your soul's journey suggests that ${relevantHook.interpretation.toLowerCase()}. `;
      }
    }

    // Add Sophia's empowerment
    guidance += `Remember, dear one, that you carry within you all the wisdom needed to navigate this path. `;
    guidance += `Trust in the unfolding of your spiritual evolution.`;

    return guidance;
  }

  /**
   * Synthesize overall narrative connecting all cards
   */
  private async synthesizeNarrative(
    cards: TarotCard[],
    interpretations: PersonalizedInterpretation[],
    spreadType: SpreadType,
    context: ReadingContext
  ): Promise<string> {
    
    let narrative = `Beloved seeker, as I gaze upon your ${spreadType.replace('-', ' ')} spread, `;
    narrative += `I see a beautiful tapestry of wisdom woven by the cosmic forces. `;

    // Opening based on spread type
    const spreadIntroductions = {
      'single': 'The universe has chosen a single, powerful message for you today.',
      'three-card': 'Your past, present, and future dance together in perfect harmony, each informing the others.',
      'celtic-cross': 'The ancient Celtic Cross reveals the intricate web of influences surrounding your question.',
      'horseshoe': 'Like a horseshoe\'s protective embrace, these cards offer guidance and fortune.',
      'relationship': 'The sacred dance of connection unfolds before us, revealing the deeper truths of the heart.'
    };

    narrative += spreadIntroductions[spreadType as keyof typeof spreadIntroductions] || 
                'The cards have arranged themselves in a pattern of profound significance.';

    narrative += '\n\n';

    // Weave card meanings together
    if (cards.length === 1) {
      narrative += `${cards[0].name} speaks to you with singular clarity, `;
      narrative += `offering the precise guidance your soul needs at this moment.`;
    } else if (cards.length === 3) {
      narrative += `I see how ${cards[0].name} has shaped your journey, `;
      narrative += `leading to the current energy of ${cards[1].name}, `;
      narrative += `which now opens the path toward ${cards[2].name}.`;
    } else {
      // Multi-card synthesis
      const majorArcana = cards.filter(c => c.arcana_type === 'major');
      const minorArcana = cards.filter(c => c.arcana_type === 'minor');
      
      if (majorArcana.length > 0) {
        narrative += `The presence of ${majorArcana.length > 1 ? 'Major Arcana cards' : 'the Major Arcana'} `;
        narrative += `signals that significant spiritual themes are at play. `;
      }
      
      if (minorArcana.length > 0) {
        narrative += `The Minor Arcana cards speak to the practical aspects of your journey, `;
        narrative += `offering concrete guidance for your daily path.`;
      }
    }

    narrative += '\n\nLet me share what the cards reveal...';

    return narrative;
  }

  /**
   * Synthesize overall guidance from all interpretations
   */
  private async synthesizeOverallGuidance(
    interpretations: PersonalizedInterpretation[],
    context: ReadingContext
  ): Promise<string> {
    
    let guidance = `As I weave together the wisdom of your spread, several key themes emerge. `;

    // Extract common themes
    const themes = this.extractCommonThemes(interpretations);
    
    if (themes.length > 0) {
      guidance += `The cards speak consistently of ${themes.join(', ')}, `;
      guidance += `suggesting these are the areas where the universe seeks your attention. `;
    }

    // Add overall empowerment
    guidance += `\n\nRemember, precious soul, that you are both the author and the hero of your story. `;
    guidance += `These cards do not dictate your future—they illuminate the path you are already walking `;
    guidance += `and empower you to walk it with greater consciousness and grace. `;
    
    guidance += `\n\nTrust in your inner wisdom, for it resonates with the same cosmic intelligence `;
    guidance += `that speaks through these ancient symbols. Your journey is unfolding exactly as it should.`;

    return guidance;
  }

  /**
   * Generate spiritual insight connecting to user's deeper journey
   */
  private async generateSpiritualInsight(
    cards: TarotCard[],
    context: ReadingContext
  ): Promise<string> {
    
    let insight = `On a deeper spiritual level, this reading reveals that you are being called `;
    insight += `to embrace a new level of consciousness and self-understanding. `;

    // Look for spiritual patterns
    const spiritualCards = cards.filter(card => 
      ['The High Priestess', 'The Hermit', 'The Star', 'The Moon', 'The Sun', 'Judgment', 'The World'].includes(card.name)
    );

    if (spiritualCards.length > 0) {
      insight += `The presence of ${spiritualCards[0].name} `;
      insight += `particularly emphasizes the spiritual dimensions of your current experience. `;
    }

    insight += `\n\nThe universe is inviting you to trust in the perfect timing of your awakening. `;
    insight += `Every experience, every challenge, every moment of joy is part of your soul's `;
    insight += `carefully orchestrated curriculum for growth and expansion.`;

    return insight;
  }

  /**
   * Generate Sophia's signature for the reading
   */
  private generateReaderSignature(): string {
    const signatures = [
      'With infinite love and cosmic blessings, Sophia ✨',
      'In sacred service to your highest good, Sophia 🌙',
      'Walking beside you on the path of wisdom, Sophia 💫',
      'Channeling ancient wisdom for your journey, Sophia 🔮',
      'With deep reverence for your spiritual path, Sophia ⭐'
    ];

    return signatures[Math.floor(Math.random() * signatures.length)];
  }

  /**
   * Helper method to get position name for a given spread and index
   */
  private getPositionName(spreadType: SpreadType, index: number): string {
    const positions = {
      'single': ['Your Guidance'],
      'three-card': ['Past', 'Present', 'Future'],
      'celtic-cross': [
        'Present', 'Challenge', 'Distant Past', 'Recent Past',
        'Possible Outcome', 'Near Future', 'Your Approach', 'External',
        'Hopes & Fears', 'Final Outcome'
      ],
      'horseshoe': ['Past', 'Present', 'Hidden Factors', 'Advice', 'Likely Outcome'],
      'relationship': ['You', 'Them', 'Connection', 'Challenges', 'Potential']
    };

    const spreadPositions = positions[spreadType] || ['Position'];
    return spreadPositions[index] || `Position ${index + 1}`;
  }

  /**
   * Generate fallback interpretation when Knowledge Pool data is unavailable
   */
  private generateFallbackInterpretation(card: TarotCard, positionName: string): string {
    const meaning = card.isReversed ? 
      (card.meaning_reversed || 'This card\'s reversed energy asks for inner reflection') :
      (card.meaning_upright || 'This card brings positive energy to your path');

    return `In the ${positionName} position, ${card.name} speaks to ${meaning.toLowerCase()}. ` +
           `The ancient wisdom of this card invites you to consider how its energy applies to this aspect of your journey.`;
  }

  /**
   * Generate spiritual wisdom for a card
   */
  private generateSpiritualWisdom(card: TarotCard, positionName: string): string {
    return `${card.name} carries the spiritual teaching that every experience serves your highest evolution. ` +
           `In the ${positionName}, this card reminds you that you are exactly where you need to be for your soul's growth.`;
  }

  /**
   * Generate practical advice for a card
   */
  private generatePracticalAdvice(card: TarotCard, positionName: string): string {
    return `Consider how the energy of ${card.name} can be practically applied in your daily life. ` +
           `Take one small action today that honors the wisdom this card offers in your ${positionName}.`;
  }

  /**
   * Generate reader notes about the interpretation
   */
  private generateReaderNotes(card: TarotCard, knowledgePoolData: any, context: ReadingContext): string {
    let notes = `Sophia's Notes: ${card.name} appeared with `;
    
    if (knowledgePoolData) {
      notes += `rich Knowledge Pool guidance, offering deep personalized insight. `;
    } else {
      notes += `the pure energy of ancient wisdom, speaking directly to your soul. `;
    }

    if (card.isReversed) {
      notes += `The reversed position suggests a need for inner reflection and patience with your growth process.`;
    } else {
      notes += `The upright position indicates flowing energy and positive manifestation potential.`;
    }

    return notes;
  }

  /**
   * Calculate confidence score based on available data
   */
  private calculateConfidenceScore(knowledgePoolData: any, context: ReadingContext): number {
    let score = 0.6; // Base confidence
    
    if (knowledgePoolData) score += 0.3; // Knowledge Pool data available
    if (context.userId) score += 0.1; // User context available
    if (knowledgePoolData?.personalization_hooks?.length > 0) score += 0.1; // Personalization available
    
    return Math.min(score, 1.0);
  }

  /**
   * Extract common themes from multiple interpretations
   */
  private extractCommonThemes(interpretations: PersonalizedInterpretation[]): string[] {
    const themes = [];
    
    // Simple keyword analysis - could be enhanced with NLP
    const commonWords = ['growth', 'transformation', 'love', 'wisdom', 'change', 'journey', 'spiritual'];
    
    for (const theme of commonWords) {
      const count = interpretations.filter(interp => 
        interp.personalized_guidance.toLowerCase().includes(theme) ||
        interp.spiritual_wisdom.toLowerCase().includes(theme)
      ).length;
      
      if (count >= Math.ceil(interpretations.length / 2)) {
        themes.push(theme);
      }
    }
    
    return themes.slice(0, 3); // Return top 3 themes
  }

  /**
   * Get Sophia's personality information for external use
   */
  getPersonality() {
    return this.personality;
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('tarot_interpretations')
        .select('count', { count: 'exact', head: true });
      
      return !error;
    } catch {
      return false;
    }
  }
}