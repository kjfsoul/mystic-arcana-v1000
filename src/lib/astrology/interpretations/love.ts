import { BirthData, PlanetPosition, HousePosition } from "@/types/astrology";

export interface LoveInterpretation {
  relationshipStyle: string;
  loveLanguage: string;
  emotionalNeeds: string[];
  shadowWork: string;
  compatibility: {
    bestMatches: string[];
    growthAreas: string[];
  };
  guidance: string;
  timing: string;
  confidence: number;
}

export class LoveInterpreter {
  static analyzeLoveProfile(
    birthData: BirthData,
    planets: PlanetPosition[],
    houses: HousePosition[],
  ): LoveInterpretation {
    const venus = planets.find((p) => p.planet === "venus");
    const moon = planets.find((p) => p.planet === "moon");
    const seventhHouse = houses.find((h) => h.house === 7);

    const relationshipStyle = this.getRelationshipStyle(venus, seventhHouse);
    const loveLanguage = this.getLoveLanguage(venus);
    const emotionalNeeds = this.getEmotionalNeeds(moon);
    const shadowWork = this.getShadowWork(venus, moon);
    const compatibility = this.getCompatibility(venus, moon);

    return {
      relationshipStyle,
      loveLanguage,
      emotionalNeeds,
      shadowWork,
      compatibility,
      guidance:
        "Embrace your unique love signature and trust the wisdom of your heart.",
      timing:
        "Cosmic tides are currently favorable for heart-centered connections.",
      confidence: 0.8,
    };
  }

  private static getRelationshipStyle(
    venus?: PlanetPosition,
    seventhHouse?: HousePosition,
  ): string {
    if (!venus || !seventhHouse)
      return "A seeker of deep and meaningful connections";
    return `With Venus in ${venus.sign} and a ${seventhHouse.sign} descendant, you approach relationships with a blend of ${this.getVenusSignStyle(venus.sign)} and a desire for a partner who embodies ${this.getDescendantSignStyle(seventhHouse.sign)}.`;
  }

  private static getLoveLanguage(venus?: PlanetPosition): string {
    if (!venus) return "Acts of Service";
    const sign = venus.sign.toLowerCase();
    if (["taurus", "virgo", "capricorn"].includes(sign))
      return "Acts of Service";
    if (["gemini", "libra", "aquarius"].includes(sign))
      return "Words of Affirmation";
    if (["cancer", "scorpio", "pisces"].includes(sign)) return "Quality Time";
    return "Receiving Gifts";
  }

  private static getEmotionalNeeds(moon?: PlanetPosition): string[] {
    if (!moon) return ["Security and a sense of belonging"];
    return [
      `To feel emotionally secure through ${this.getMoonSignNeeds(moon.sign)}`,
      `A need for nurturing and to be nurtured in return`,
    ];
  }

  private static getShadowWork(
    venus?: PlanetPosition,
    moon?: PlanetPosition,
  ): string {
    if (!venus || !moon)
      return "Learning to love and accept all parts of yourself";
    return `Healing the tension between your desire for ${this.getVenusSignStyle(venus.sign)} and your emotional need for ${this.getMoonSignNeeds(moon.sign)}.`;
  }

  private static getCompatibility(
    venus?: PlanetPosition,
    moon?: PlanetPosition,
  ): { bestMatches: string[]; growthAreas: string[] } {
    if (!venus || !moon)
      return {
        bestMatches: ["earth"],
        growthAreas: ["Expressing emotional needs clearly"],
      };
    return {
      bestMatches: [this.getCompatibleElement(venus.sign)],
      growthAreas: ["Balancing emotional needs with the desires of a partner"],
    };
  }

  private static getVenusSignStyle(sign: string): string {
    const styles: Record<string, string> = {
      Aries: "passionate intensity",
      Taurus: "sensual stability",
      Gemini: "witty banter",
      Cancer: "tender nurturing",
      Leo: "grand romantic gestures",
      Virgo: "devoted service",
      Libra: "harmonious partnership",
      Scorpio: "soul-deep connection",
      Sagittarius: "adventurous freedom",
      Capricorn: "enduring commitment",
      Aquarius: "unconventional friendship",
      Pisces: "spiritual union",
    };
    return styles[sign] || "a unique and beautiful way";
  }

  private static getDescendantSignStyle(sign: string): string {
    const styles: Record<string, string> = {
      Aries: "an assertive and independent partner",
      Taurus: "a stable and reliable partner",
      Gemini: "a communicative and curious partner",
      Cancer: "a nurturing and emotionally available partner",
      Leo: "a confident and expressive partner",
      Virgo: "a practical and devoted partner",
      Libra: "a charming and cooperative partner",
      Scorpio: "a passionate and transformative partner",
      Sagittarius: "an adventurous and philosophical partner",
      Capricorn: "a committed and ambitious partner",
      Aquarius: "an independent and unconventional partner",
      Pisces: "a compassionate and spiritually connected partner",
    };
    return styles[sign] || "a partner who complements you";
  }

  private static getMoonSignNeeds(sign: string): string {
    const needs: Record<string, string> = {
      Aries: "action and independence",
      Taurus: "comfort and security",
      Gemini: "communication and mental stimulation",
      Cancer: "safety and emotional connection",
      Leo: "recognition and creative expression",
      Virgo: "order and purpose",
      Libra: "harmony and partnership",
      Scorpio: "privacy and deep intimacy",
      Sagittarius: "freedom and exploration",
      Capricorn: "respect and achievement",
      Aquarius: "friendship and intellectual connection",
      Pisces: "spiritual connection and emotional safety",
    };
    return needs[sign] || "a sense of peace";
  }

  private static getCompatibleElement(sign: string): string {
    const elementMap: Record<string, string> = {
      Aries: "Fire",
      Taurus: "Earth",
      Gemini: "Air",
      Cancer: "Water",
      Leo: "Fire",
      Virgo: "Earth",
      Libra: "Air",
      Scorpio: "Water",
      Sagittarius: "Fire",
      Capricorn: "Earth",
      Aquarius: "Air",
      Pisces: "Water",
    };
    const element = elementMap[sign];
    if (element === "Fire" || element === "Air") return "Fire and Air signs";
    return "Earth and Water signs";
  }
}
