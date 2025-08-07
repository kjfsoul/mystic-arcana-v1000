/**
 * Love & Relationship Astrology Calculation Engine
 */

import type {
  BirthData,
  PlanetPosition,
} from "../../../../lib/astrology/AstronomicalCalculator";

export interface LoveCompatibilityResult {
  overallScore: number;
  venusCompatibility: number;
  marsCompatibility: number;
  moonCompatibility: number;
  sunCompatibility: number;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

export interface LoveProfileResult {
  loveStyle: string;
  idealPartner: string;
  romanticNeeds: string[];
  communicationStyle: string;
  venus: {
    sign: string;
    house: number;
    description: string;
  };
  mars: {
    sign: string;
    house: number;
    description: string;
  };
}

export class LoveEngine {
  /**
   * Calculate love compatibility between two birth charts
   */
  static async calculateCompatibility(
    person1: BirthData,
    person2: BirthData,
  ): Promise<LoveCompatibilityResult> {
    console.warn("LoveEngine using basic compatibility calculation");

    // In a real implementation, this would:
    // 1. Generate full birth charts for both people
    // 2. Compare Venus, Mars, Moon, Sun positions
    // 3. Calculate aspects between charts (synastry)
    // 4. Analyze composite chart

    // Basic fallback calculation
    const overallScore = this.calculateBasicCompatibility(person1, person2);

    return {
      overallScore,
      venusCompatibility: Math.floor(Math.random() * 40) + 60, // 60-100
      marsCompatibility: Math.floor(Math.random() * 40) + 60,
      moonCompatibility: Math.floor(Math.random() * 40) + 60,
      sunCompatibility: Math.floor(Math.random() * 40) + 60,
      strengths: this.generateStrengths(overallScore),
      challenges: this.generateChallenges(overallScore),
      recommendations: this.generateRecommendations(overallScore),
    };
  }

  /**
   * Generate individual love profile
   */
  static async calculateLoveProfile(
    birthData: BirthData,
  ): Promise<LoveProfileResult> {
    console.warn("LoveEngine using basic profile calculation");

    // In a real implementation, this would analyze Venus and Mars positions
    const monthSign = this.getSignFromDate(birthData.birthDate);

    return {
      loveStyle: this.determineLoveStyle(monthSign),
      idealPartner: this.determineIdealPartner(monthSign),
      romanticNeeds: this.determineRomanticNeeds(monthSign),
      communicationStyle: this.determineCommunicationStyle(monthSign),
      venus: {
        sign: monthSign,
        house: 5, // Default to 5th house (romance)
        description: this.getVenusDescription(monthSign),
      },
      mars: {
        sign: monthSign,
        house: 1, // Default to 1st house
        description: this.getMarsDescription(monthSign),
      },
    };
  }

  /**
   * Basic compatibility calculation based on birth dates
   */
  private static calculateBasicCompatibility(
    person1: BirthData,
    person2: BirthData,
  ): number {
    const sign1 = this.getSignFromDate(person1.birthDate);
    const sign2 = this.getSignFromDate(person2.birthDate);

    // Basic element compatibility
    const elementCompatibility = this.getElementCompatibility(sign1, sign2);

    // Add some randomness for variation
    const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10

    return Math.max(30, Math.min(100, elementCompatibility + variation));
  }

  private static getSignFromDate(date: Date | undefined): string {
    if (!date || !(date instanceof Date)) {
      throw new Error("Invalid or undefined date provided to getSignFromDate.");
    }
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
      return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
      return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
      return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
      return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
      return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
      return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
      return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
      return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
      return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
      return "Aquarius";
    return "Pisces";
  }

  private static getElementCompatibility(sign1: string, sign2: string): number {
    const elements = {
      Fire: ["Aries", "Leo", "Sagittarius"],
      Earth: ["Taurus", "Virgo", "Capricorn"],
      Air: ["Gemini", "Libra", "Aquarius"],
      Water: ["Cancer", "Scorpio", "Pisces"],
    };

    const getElement = (sign: string) => {
      for (const [element, signs] of Object.entries(elements)) {
        if (signs.includes(sign)) return element;
      }
      return "Unknown";
    };

    const element1 = getElement(sign1);
    const element2 = getElement(sign2);

    // Same element: good compatibility
    if (element1 === element2) return 85;

    // Complementary elements
    if (
      (element1 === "Fire" && element2 === "Air") ||
      (element1 === "Air" && element2 === "Fire") ||
      (element1 === "Earth" && element2 === "Water") ||
      (element1 === "Water" && element2 === "Earth")
    ) {
      return 75;
    }

    // Challenging combinations
    return 60;
  }

  private static determineLoveStyle(sign: string): string {
    const styles = {
      Aries: "Passionate and direct",
      Taurus: "Sensual and devoted",
      Gemini: "Playful and communicative",
      Cancer: "Nurturing and emotional",
      Leo: "Dramatic and generous",
      Virgo: "Thoughtful and practical",
      Libra: "Romantic and harmonious",
      Scorpio: "Intense and transformative",
      Sagittarius: "Adventurous and free-spirited",
      Capricorn: "Committed and traditional",
      Aquarius: "Unique and intellectual",
      Pisces: "Dreamy and compassionate",
    };

    return styles[sign as keyof typeof styles] || "Balanced and adaptable";
  }

  private static determineIdealPartner(sign: string): string {
    const partners = {
      Aries: "Someone who matches your energy and independence",
      Taurus: "A stable partner who appreciates the finer things",
      Gemini: "An intellectually stimulating conversationalist",
      Cancer: "A caring person who values family and home",
      Leo: "Someone who appreciates your creativity and warmth",
      Virgo: "A practical partner who shares your values",
      Libra: "A harmonious person who brings balance",
      Scorpio: "Someone who can handle your intensity",
      Sagittarius: "An adventurous spirit who loves freedom",
      Capricorn: "A responsible partner with long-term goals",
      Aquarius: "An independent thinker who respects your uniqueness",
      Pisces: "A compassionate soul who understands your dreams",
    };

    return (
      partners[sign as keyof typeof partners] ||
      "Someone who complements your nature"
    );
  }

  private static determineRomanticNeeds(sign: string): string[] {
    const needs = {
      Aries: ["Excitement", "Independence", "Direct communication"],
      Taurus: ["Stability", "Physical affection", "Quality time"],
      Gemini: ["Mental stimulation", "Variety", "Good conversation"],
      Cancer: ["Emotional security", "Nurturing", "Home comfort"],
      Leo: ["Appreciation", "Romance", "Attention"],
      Virgo: ["Reliability", "Acts of service", "Practical support"],
      Libra: ["Harmony", "Beauty", "Partnership"],
      Scorpio: ["Depth", "Loyalty", "Emotional intimacy"],
      Sagittarius: ["Freedom", "Adventure", "Growth"],
      Capricorn: ["Commitment", "Respect", "Shared goals"],
      Aquarius: ["Friendship", "Intellectual connection", "Space"],
      Pisces: ["Compassion", "Spiritual connection", "Understanding"],
    };

    return (
      needs[sign as keyof typeof needs] || ["Love", "Understanding", "Support"]
    );
  }

  private static determineCommunicationStyle(sign: string): string {
    const styles = {
      Aries: "Direct and honest",
      Taurus: "Steady and practical",
      Gemini: "Chatty and curious",
      Cancer: "Emotional and intuitive",
      Leo: "Warm and expressive",
      Virgo: "Detailed and helpful",
      Libra: "Diplomatic and fair",
      Scorpio: "Deep and intense",
      Sagittarius: "Philosophical and open",
      Capricorn: "Serious and goal-oriented",
      Aquarius: "Unique and detached",
      Pisces: "Gentle and empathetic",
    };

    return styles[sign as keyof typeof styles] || "Balanced and adaptable";
  }

  private static getVenusDescription(sign: string): string {
    return `Venus in ${sign} brings a ${this.determineLoveStyle(sign).toLowerCase()} approach to love and relationships.`;
  }

  private static getMarsDescription(sign: string): string {
    return `Mars in ${sign} influences how you pursue and express passion.`;
  }

  private static generateStrengths(score: number): string[] {
    const allStrengths = [
      "Strong emotional connection",
      "Complementary communication styles",
      "Shared values and goals",
      "Natural chemistry and attraction",
      "Mutual support and understanding",
      "Similar life philosophies",
      "Good conflict resolution skills",
    ];

    const count = score > 80 ? 4 : score > 60 ? 3 : 2;
    return allStrengths.slice(0, count);
  }

  private static generateChallenges(score: number): string[] {
    const allChallenges = [
      "Different communication needs",
      "Varying emotional expressions",
      "Conflicting lifestyle preferences",
      "Different relationship pacing",
      "Varying social needs",
      "Different approaches to commitment",
    ];

    const count = score < 60 ? 3 : score < 80 ? 2 : 1;
    return allChallenges.slice(0, count);
  }

  private static generateRecommendations(score: number): string[] {
    if (score > 80) {
      return [
        "Continue nurturing your strong connection",
        "Maintain open communication",
        "Celebrate your differences as strengths",
      ];
    } else if (score > 60) {
      return [
        "Work on understanding each other's needs",
        "Practice patience and compromise",
        "Focus on your shared values",
      ];
    } else {
      return [
        "Invest time in getting to know each other better",
        "Seek to understand rather than to be understood",
        "Consider relationship counseling if needed",
      ];
    }
  }
}
