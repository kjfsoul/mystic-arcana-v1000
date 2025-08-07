import { ReaderPersona, ReadingRequest, ReadingResponse } from '@/types/ReaderPersona';
import { BirthData } from '@/types/astrology';
import { LoveInterpreter, LoveInterpretation } from '@/lib/astrology/interpretations/love';
import { CompatibilityEngine, SynastryAnalysis } from '@/lib/astrology/compatibilityEngine';
import { SwissEphemerisCalculator } from '@/lib/astrology/SwissEphemerisShim';
import { memoryLogger } from '@/lib/mem/memoryLogger';
import { EmotionalAnalyzer } from '@/lib/sentiment/emotional-analyzer';
import { ReaderSpecialization, SummaryType as SummaryTypeEnum, ReadingRequestType } from '@/constants/EventTypes';
import { Planet, AspectType } from '@/constants/AstrologyConstants';

export const LUNA_PERSONA: ReaderPersona = {
  id: 'luna',
  name: 'Luna',
  title: 'The Love & Emotional Wellness Guide',
  specialization: 'astrology',
  avatar: '/images/readers/luna-avatar.png',
  description: 'Guardian of the heart\'s mysteries. Luna illuminates the sacred patterns of love, emotional healing, and soul connections through the gentle wisdom of Venus, Moon, and synastry.',
  tone: {
    primary: 'intuitive',
    secondary: 'compassionate',
    voice: 'soft and emotionally wise',
    communication: 'metaphorical but clear, nurturing yet truthful'
  },
  introMessages: [
    "Your heart carries ancient wisdom, dear one. Let me help you translate the language your soul already knows - the poetry written in your Venus and Moon.",
    "Love is both mirror and mystery. Through your birth chart, we can discover the sacred patterns that shape how you give and receive love, and where healing awaits.",
    "The Moon whispers secrets of your deepest emotional needs, while Venus reveals how your heart chooses to dance. Together, let's explore the constellation of your relationships."
  ],
  summaryTypes: [
    {
      type: 'relationship',
      template: `Your {VENUS_SIGN} Venus seeks {LOVE_STYLE} while your {MOON_SIGN} Moon needs {EMOTIONAL_NEEDS}. In relationships, you are learning to balance {GROWTH_THEME}. The current cosmic climate suggests {TIMING_GUIDANCE}.`,
      focusAreas: ['love style', 'emotional needs', 'compatibility', 'healing']
    },
    {
      type: 'personal_growth',
      template: `Your heart's journey involves healing {SHADOW_PATTERN} and embracing {STRENGTH_PATTERN}. Through {MOON_HOUSE} house emotional expression and {VENUS_HOUSE} house love values, you are learning {GROWTH_LESSON}.`,
      focusAreas: ['shadow work', 'emotional growth', 'self-love', 'healing patterns']
    },
    {
      type: 'spiritual',
      template: 'Your soul chose this heart to learn about {SPIRITUAL_LESSON}. The sacred wound of {VENUS_CHALLENGE} is also your greatest gift. Trust the {MOON_WISDOM} guidance that flows through your emotional intuition.',
      focusAreas: ['soul lessons', 'sacred wounds', 'spiritual love', 'intuitive wisdom']
    }
  ],
  expertise: {
    primaryFocus: ['love compatibility', 'emotional wellness', 'relationship patterns', 'heart healing'],
    techniques: ['synastry analysis', 'venus/moon interpretation', 'emotional astrology', 'relationship timing'],
    strengths: ['compatibility reading', 'emotional guidance', 'shadow work', 'healing patterns'],
    astrology: {
      houses: [4, 5, 7, 8], // Emotional and relationship houses
      planets: [Planet.MOON, Planet.VENUS, Planet.MARS, Planet.SUN, Planet.NEPTUNE], // Love and emotion planets
      aspects: [AspectType.CONJUNCTION, AspectType.TRINE, AspectType.SQUARE, AspectType.OPPOSITION, AspectType.SEXTILE], // Corrected to use AspectType enum
      transitTypes: ['venus returns', 'new moons', 'full moons', 'venus transits'],
      specializations: ['love', 'compatibility', 'emotional wellness', 'relationship timing', 'shadow work']
    }
  },
  conversationalStyles: [
    {
      trigger: 'heartbreak_healing',
      phrases: [
        "Heartbreak is the heart breaking open to hold more love. This tender season is sacred, not broken.",
        "Your heart is not damaged, beloved. It's learning a deeper language of love through this experience.",
        "What feels like ending is often a cocoon moment - trust the transformation happening in your heart's depths."
      ],
      tone: 'gentle healing wisdom'
    },
    {
      trigger: 'relationship_confusion',
      phrases: [
        "The heart's wisdom moves like moon phases - sometimes hidden, always true. Let's listen to what yours is whispering.",
        "Relationships are soul mirrors wrapped in mystery. What you see reflected holds both shadow and light.",
        "Your inner compass knows true north, even when the emotional weather feels stormy."
      ],
      tone: 'intuitive clarity'
    },
    {
      trigger: 'self_love_journey',
      phrases: [
        "The relationship with yourself is the template for all others. How you hold your own heart matters deeply.",
        "Self-love isn't selfish - it's the fountain from which all healthy love flows.",
        "Your inner child and inner lover both deserve the tenderness you so freely give others."
      ],
      tone: 'nurturing empowerment'
    },
    {
      trigger: 'compatibility_questions',
      phrases: [
        "Compatibility is less about perfection and more about conscious growth together.",
        "Some souls come to heal each other, others to challenge growth. Both are sacred contracts.",
        "True compatibility includes space for each person's authentic expression and evolution."
      ],
      tone: 'wise perspective'
    }
  ]
};

export class LunaReader {
  private persona: ReaderPersona;
  private ephemeris: SwissEphemerisCalculator;

  constructor() {
    this.persona = LUNA_PERSONA;
    this.ephemeris = new SwissEphemerisCalculator();
  }

  async generateReading(request: ReadingRequest): Promise<ReadingResponse> {
    if (!request.birthData) {
      throw new Error('Birth data required for Luna readings');
    }

    // Calculate birth chart
    const birthChart = await this.ephemeris.calculateFullChart(request.birthData);

    // Get user's emotional patterns from a-mem if available
    let journalInsights: string[] = [];
    if (request.userId) {
      const userInsights = await memoryLogger.getUserInsights(request.userId, 20);
      const emotionalInsights = userInsights.map(insight => EmotionalAnalyzer.analyzeText(insight.context || insight.trait).themes).flat();
      journalInsights = [...new Set(emotionalInsights)];
    }

    // Generate love interpretation
    const loveAnalysis = LoveInterpreter.analyzeLoveProfile(
      request.birthData,
      birthChart.planets,
      birthChart.houses
    );

    // Handle compatibility reading if partner data provided
    let compatibilityAnalysis: SynastryAnalysis | undefined;
    if (request.type === ReadingRequestType.SYNASTRY && request.partnerBirthData) {
      const partnerChart = await this.ephemeris.calculateFullChart(request.partnerBirthData);
      compatibilityAnalysis = CompatibilityEngine.analyzeSynastry(
        { birthData: request.birthData, planets: birthChart.planets },
        { birthData: request.partnerBirthData, planets: partnerChart.planets }
      );
    }

    // Select appropriate intro message
    const introMessage = this.selectIntroMessage(request.focus, compatibilityAnalysis);

    // Generate personalized interpretation
    const interpretation = this.generateLoveInterpretation(
      loveAnalysis,
      compatibilityAnalysis,
      birthChart,
      journalInsights,
      request.focus
    );

    return {
      readerId: this.persona.id,
      sessionId: `luna_${Date.now()}`,
      interpretation: {
        primary: `${introMessage}\n\n${interpretation.primary}`,
        secondary: interpretation.secondary,
        insights: loveAnalysis.emotionalNeeds,
        guidance: [
          loveAnalysis.guidance,
          ...this.generateEmotionalGuidance(loveAnalysis, journalInsights)
        ],
        timing: loveAnalysis.timing
      },
      confidence: loveAnalysis.confidence,
      followUpQuestions: this.generateFollowUpQuestions(loveAnalysis, compatibilityAnalysis),
      nextSteps: this.generateActionSteps(loveAnalysis, compatibilityAnalysis)
    };
  }

  private selectIntroMessage(
    focus?: string[], 
    compatibilityAnalysis?: SynastryAnalysis
  ): string {
    if (compatibilityAnalysis) {
      return this.persona.introMessages[2]; // Connection-focused intro
    } else if (focus?.includes('healing') || focus?.includes('shadow')) {
      return this.persona.introMessages[1]; // Healing-focused intro
    }
    return this.persona.introMessages[0]; // General love intro
  }

  private generateLoveInterpretation(
    loveAnalysis: LoveInterpretation,
    compatibilityAnalysis?: SynastryAnalysis,
    birthChart?: any,
    journalInsights?: string[],
    focus?: string[]
  ): { primary: string; secondary: string } {
    let primary = '';
    let secondary = '';

    if (compatibilityAnalysis) {
      // Compatibility-focused reading
      primary = this.generateCompatibilityNarrative(compatibilityAnalysis, loveAnalysis);
      secondary = `Your individual love style: ${loveAnalysis.relationshipStyle}. ` +
        `Together, you are learning: ${compatibilityAnalysis.advice[0]}`;
    } else {
      // Individual love reading
      primary = this.generatePersonalLoveNarrative(loveAnalysis, journalInsights);
      secondary = `Your emotional needs whisper: ${loveAnalysis.emotionalNeeds[0]}. ` +
        `Your love language speaks: ${loveAnalysis.loveLanguage}.`;
    }

    // Add shadow work if relevant
    if (focus?.includes('shadow') || focus?.includes('healing')) {
      secondary += ` In the shadows of love, you are invited to explore: ${loveAnalysis.shadowWork}`;
    }

    return { primary, secondary };
  }

  private generateCompatibilityNarrative(
    compatibility: SynastryAnalysis,
    loveAnalysis: LoveInterpretation
  ): string {
    void loveAnalysis; // Indicate intentional unused variable
    const connectionPoetry = {
      soulmate: 'Your souls dance in recognition across time and space',
      complementary: 'You are two notes that create harmony when played together',
      growth: 'This connection is a sacred mirror, showing each of you what is ready to evolve',
      karmic: 'Your hearts carry ancient memories of love and learning together',
      challenging: 'This relationship is a tender teacher, asking for patience and conscious love'
    };

    const poetry = connectionPoetry[compatibility.connectionType];
    
    return `${poetry}. With ${compatibility.overallCompatibility}% overall harmony, your connection reveals ` +
      `both gifts and growth edges. ${compatibility.strengths[0]}. The invitation here is to ${compatibility.advice[0].toLowerCase()}.`;
  }

  private generatePersonalLoveNarrative(
    loveAnalysis: LoveInterpretation,
    journalInsights?: string[]
  ): string {
    let narrative = `${loveAnalysis.relationshipStyle}. `;
    
    // Incorporate journal insights if available
    if (journalInsights && journalInsights.length > 0) {
      narrative += `Your heart's recent reflections suggest themes of ${journalInsights[0].toLowerCase()}. `;
    }

    narrative += `In the garden of your heart, ${loveAnalysis.guidance} `;
    narrative += `Your compatibility flows most naturally with ${loveAnalysis.compatibility.bestMatches[0]?.toLowerCase()}.`;

    return narrative;
  }

  private generateEmotionalGuidance(
    loveAnalysis: LoveInterpretation,
    journalInsights?: string[]
  ): string[] {
    const guidance = [
      "Trust the wisdom of your emotional tides - they carry messages from your soul",
      "Every feeling is a messenger; listen with curiosity rather than judgment",
      "Your sensitivity is not fragility - it's your superpower for deep connection"
    ];

    // Add personalized guidance based on insights
    if (journalInsights && journalInsights.length > 0) {
      guidance.push("Your recent emotional patterns suggest readiness for deeper self-compassion");
    }

    // Add compatibility guidance
    if (loveAnalysis.compatibility.growthAreas.length > 0) {
      guidance.push(`Growth invitation: ${loveAnalysis.compatibility.growthAreas[0]}`);
    }

    return guidance.slice(0, 3);
  }

  private generateFollowUpQuestions(
    loveAnalysis: LoveInterpretation,
    compatibilityAnalysis?: SynastryAnalysis
  ): string[] {
    const questions = [];

    if (compatibilityAnalysis) {
      questions.push(
        "What patterns from this relationship do you see reflected in your heart's history?",
        "How does this connection invite you to grow in ways that feel both challenging and sacred?",
        "What would it look like to love this person (and yourself) even more consciously?"
      );
    } else {
      questions.push(
        "What does your heart most need to feel safe enough to love fully?",
        "Where in your life are you ready to receive love more openly?",
        "What old stories about love are you ready to release or rewrite?"
      );
    }

    // Add shadow work question
    questions.push("What aspect of love feels most tender or protected in your heart right now?");

    return questions.slice(0, 3);
  }

  private generateActionSteps(
    loveAnalysis: LoveInterpretation,
    compatibilityAnalysis?: SynastryAnalysis
  ): string[] {
    const baseSteps = [
      "Create a daily practice of emotional check-ins with yourself",
      "Notice what makes your heart feel most held and safe",
      "Practice speaking your emotional needs with gentle clarity"
    ];

    if (compatibilityAnalysis) {
      baseSteps.push(
        "Have a curious conversation about each other's love languages",
        `Focus on appreciating: ${compatibilityAnalysis.strengths[0]?.toLowerCase()}`
      );
    } else {
      baseSteps.push("Explore what self-love looks like in daily practice");
    }

    return baseSteps.slice(0, 4);
  }

  getPersona(): ReaderPersona {
    return this.persona;
  }

  async validateBirthData(birthData: BirthData): Promise<boolean> {
    return !!(birthData.date && birthData.time && birthData.location);
  }

  getSpecializationKeywords(): string[] {
    return [
      'love compatibility', 'emotional wellness', 'relationship patterns', 'heart healing',
      'venus moon', 'synastry', 'compatibility', 'emotional astrology', 'shadow work'
    ];
  }
}

export default LunaReader;