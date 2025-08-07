/**
 * ORION - THE ASTROLOGY CAREER GUIDE
 * Virtual Reader specializing in astrological career and purpose readings
 * Focus: Career houses (2nd, 6th, 10th), MC, Saturn, Jupiter transits
 * Tone: Mentor, guide, tactically honest, calm and insightful
 */

import {
  ReaderPersona,
  ReadingRequest,
  ReadingResponse,
} from "@/types/ReaderPersona";
import { BirthData, HousePosition } from "@/types/astrology";
import {
  CareerInterpreter,
  CareerInterpretation,
} from "@/lib/astrology/interpretations/career";
import { SwissEphemerisCalculator } from "@/lib/astrology/SwissEphemerisShim";
import {
  ReaderSpecialization,
  SummaryType as SummaryTypeEnum,
  ReadingRequestType,
} from "@/constants/EventTypes";
import { Planet, AspectType } from "@/constants/AstrologyConstants";

export const ORION_PERSONA: ReaderPersona = {
  id: "orion",
  name: "Orion",
  title: "The Astrology Career Guide",
  specialization: "astrology",
  avatar: "/images/readers/orion-avatar.png",
  description:
    "Master of celestial timing and career guidance. Orion illuminates your professional path through the wisdom of birth charts, transits, and cosmic cycles.",
  tone: {
    primary: "mentor",
    secondary: "honest",
    voice: "calm and insightful",
    communication: "tactically honest with gentle authority",
  },
  introMessages: [
    "The stars have aligned to bring you clarity about your professional path. Let me illuminate the cosmic influences shaping your career journey.",
    "Your birth chart holds the blueprint of your professional destiny. Together, we'll uncover the timing and direction the cosmos has set for your career.",
    "The celestial bodies speak of your purpose and potential. I'm here to translate their guidance into practical steps for your professional evolution.",
  ],
  summaryTypes: [
    {
      type: "career",
      template:
        "Based on your {MC_SIGN} Midheaven and {TENTH_HOUSE} influences, your career path emphasizes {PRIMARY_THEMES}. The current {MAJOR_TRANSIT} transit suggests {TIMING_GUIDANCE}. Focus on {ACTION_STEPS} over the next {TIME_FRAME}.",
      focusAreas: [
        "professional identity",
        "timing",
        "reputation",
        "achievement",
      ],
    },
    {
      type: "personal_growth",
      template:
        "Your {SUN_HOUSE} Sun placement reveals your core purpose lies in {PURPOSE_THEME}. {SATURN_INFLUENCE} indicates the discipline needed for mastery. Embrace {GROWTH_AREAS} to align with your authentic professional self.",
      focusAreas: ["purpose", "discipline", "mastery", "authentic expression"],
    },
    {
      type: "spiritual",
      template:
        "The cosmos calls you to integrate {SPIRITUAL_THEMES} into your professional life. Your {JUPITER_INFLUENCE} shows opportunities for meaningful expansion. Trust the timing of {COSMIC_CYCLES} as you evolve professionally.",
      focusAreas: ["higher purpose", "expansion", "trust", "evolution"],
    },
  ],
  expertise: {
    primaryFocus: [
      "career guidance",
      "professional timing",
      "life purpose",
      "cosmic cycles",
    ],
    techniques: [
      "birth chart analysis",
      "transit timing",
      "progressed charts",
      "solar returns",
    ],
    strengths: [
      "career transitions",
      "professional development",
      "leadership potential",
      "business timing",
    ],
    astrology: {
      houses: [2, 6, 10], // Career-focused houses
      planets: [Planet.SUN, Planet.SATURN, Planet.JUPITER, Planet.MARS, "mc"], // Key career planets
      aspects: [
        AspectType.CONJUNCTION,
        AspectType.SQUARE,
        AspectType.TRINE,
        AspectType.OPPOSITION,
      ], // Corrected to use AspectType enum
      transitTypes: [
        "saturn returns",
        "jupiter cycles",
        "solar arcs",
        "progressions",
      ],
      specializations: [
        "career",
        "purpose",
        "timing",
        "leadership",
        "business cycles",
      ],
    },
  },
  conversationalStyles: [
    {
      trigger: "career_uncertainty",
      phrases: [
        "The cosmos rarely reveals the entire path at once. Let's focus on the next clear step.",
        "Your chart shows this uncertainty is purposeful - it's guiding you toward authentic alignment.",
        "Sometimes the universe creates pause to redirect us toward our true calling.",
      ],
      tone: "reassuring wisdom",
    },
    {
      trigger: "career_transition",
      phrases: [
        "Transitions are sacred thresholds. Your chart indicates this is cosmically supported timing.",
        "The planetary influences suggest this shift aligns with your soul's professional evolution.",
        "Trust this transition - Saturn's discipline combined with Jupiter's expansion is opening new doors.",
      ],
      tone: "supportive authority",
    },
    {
      trigger: "timing_questions",
      phrases: [
        "The celestial timing suggests optimal action periods are {TRANSIT_TIMING}.",
        "Your progressed chart indicates readiness for this step around {TIMING_WINDOW}.",
        "The cosmic cycles favor gradual building now, with acceleration coming during {FUTURE_PERIOD}.",
      ],
      tone: "precise guidance",
    },
  ],
};

export class OrionReader {
  private persona: ReaderPersona;
  private ephemeris: SwissEphemerisCalculator;

  constructor() {
    this.persona = ORION_PERSONA;
    this.ephemeris = new SwissEphemerisCalculator();
  }

  async generateReading(request: ReadingRequest): Promise<ReadingResponse> {
    if (!request.birthData) {
      throw new Error("Birth data required for Orion readings");
    }

    // Calculate birth chart
    const birthChart = await this.ephemeris.calculateFullChart(
      request.birthData,
    );
    const currentTransits = await this.ephemeris.calculateTransits(new Date());

    // Generate career interpretation
    const careerAnalysis = CareerInterpreter.analyzeCareerPath(
      request.birthData,
      birthChart.planets,
      birthChart.houses,
    );

    // Select appropriate intro message
    const introMessage = this.selectIntroMessage(request.focus);

    // Generate personalized interpretation
    const interpretation = this.generateCareerInterpretation(
      careerAnalysis,
      birthChart,
      currentTransits,
      request.focus,
    );

    return {
      readerId: this.persona.id,
      sessionId: `orion_${Date.now()}`,
      interpretation: {
        primary: `${introMessage}\n\n${interpretation.primary}`,
        secondary: interpretation.secondary,
        insights: careerAnalysis.strengths,
        guidance: [
          careerAnalysis.guidance,
          ...this.generateTimingGuidance(careerAnalysis.timing),
        ],
        timing: careerAnalysis.timing,
      },
      confidence: careerAnalysis.confidence,
      followUpQuestions: this.generateFollowUpQuestions(careerAnalysis),
      nextSteps: this.generateActionSteps(careerAnalysis),
    };
  }

  private selectIntroMessage(focus?: string[]): string {
    if (focus?.includes("timing")) {
      return this.persona.introMessages[1];
    } else if (focus?.includes("purpose")) {
      return this.persona.introMessages[2];
    }
    return this.persona.introMessages[0];
  }

  private generateCareerInterpretation(
    careerAnalysis: CareerInterpretation,
    birthChart: any,
    transits: any,
    focus?: string[],
  ): { primary: string; secondary: string } {
    void transits; // Indicate intentional unused variable
    void focus; // Indicate intentional unused variable
    const mcSign = this.findMidheavenSign(birthChart.houses);
    const tenthHousePlanets = birthChart.planets.filter(
      (p: any) => p.house === 10,
    );

    let primary = `Your ${mcSign} Midheaven reveals a professional calling toward ${careerAnalysis.primaryPath}. `;

    if (tenthHousePlanets.length > 0) {
      const dominantPlanet = tenthHousePlanets[0].planet;
      primary += `With ${dominantPlanet} in your 10th house, your career success comes through channeling ${this.getPlanetaryCareerTheme(dominantPlanet)}. `;
    }

    primary += careerAnalysis.guidance;

    const secondary =
      `Your core strengths in the professional realm include: ${careerAnalysis.strengths.join(", ")}. ` +
      `The cosmic timing indicates: ${careerAnalysis.timing}`;

    return { primary, secondary };
  }

  private findMidheavenSign(houses: HousePosition[]): string {
    const tenthHouse = houses.find((h) => h.house === 10);
    return tenthHouse?.sign || "Capricorn";
  }

  private getPlanetaryCareerTheme(planet: string): string {
    const themes = {
      sun: "authentic leadership and creative expression",
      moon: "nurturing others and responding to public needs",
      mercury: "communication, analysis, and intellectual pursuits",
      venus: "harmony, beauty, and collaborative relationships",
      mars: "initiative, competition, and pioneering action",
      jupiter: "expansion, wisdom, and philosophical guidance",
      saturn: "structure, discipline, and long-term mastery",
    } as const;

    return (
      themes[planet as keyof typeof themes] ||
      "focused dedication and skill development"
    );
  }

  private generateTimingGuidance(timing: string): string[] {
    void timing; // Indicate intentional unused variable
    return [
      "Consider this cosmic timing as you plan your next professional moves.",
      "The universe supports patient but purposeful action during this period.",
      "Trust the natural rhythm of your career evolution - forcing rarely works with Saturn's lessons.",
    ];
  }

  private generateFollowUpQuestions(
    careerAnalysis: CareerInterpretation,
  ): string[] {
    const questions = [
      "What aspects of your current professional role feel most aligned with your authentic self?",
      "How do you envision integrating more of your natural strengths into your career?",
      "What fears or doubts about your professional path would you like cosmic clarity on?",
    ];

    if (careerAnalysis.challenges.length > 0) {
      questions.push(
        "Which of these professional challenges feels most pressing for you right now?",
      );
    }

    return questions.slice(0, 3);
  }

  private generateActionSteps(careerAnalysis: CareerInterpretation): string[] {
    const baseSteps = [
      "Reflect on how your current role aligns with your Midheaven calling",
      "Identify one strength from your chart to develop more intentionally",
      "Notice patterns in when you feel most professionally energized",
    ];

    // Add timing-specific steps
    if (careerAnalysis.timing.includes("pivotal")) {
      baseSteps.push(
        "Prepare for significant career restructuring over the next 1-2 years",
      );
    } else if (careerAnalysis.timing.includes("expansion")) {
      baseSteps.push(
        "Actively pursue growth opportunities over the next 6-12 months",
      );
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
      "career guidance",
      "professional timing",
      "life purpose",
      "cosmic cycles",
      "birth chart",
      "midheaven",
      "career houses",
      "saturn return",
      "jupiter cycle",
    ];
  }
}

export default OrionReader;
