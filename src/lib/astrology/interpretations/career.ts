 
import { BirthData, PlanetPosition, HousePosition, AspectData } from '@/types/astrology';

export interface CareerInterpretation {
  primaryPath: string;
  strengths: string[];
  challenges: string[];
  timing: string;
  guidance: string;
  keywords: string[];
  confidence: number;
}

export interface CareerHouse {
  number: number;
  name: string;
  careerSignificance: string;
  keywords: string[];
}

export const CAREER_HOUSES: CareerHouse[] = [
  {
    number: 2,
    name: "House of Resources",
    careerSignificance: "Values, earning potential, material security",
    keywords: ["income", "assets", "worth", "stability"]
  },
  {
    number: 6,
    name: "House of Work",
    careerSignificance: "Daily work, service, health, routine",
    keywords: ["service", "health", "detail", "routine"]
  },
  {
    number: 10,
    name: "House of Career",
    careerSignificance: "Public image, reputation, authority, achievement",
    keywords: ["reputation", "authority", "achievement", "status"]
  }
];

export const CAREER_PLANETS = {
  sun: {
    significance: "Core identity and life purpose",
    keywords: ["leadership", "authority", "recognition", "creativity"]
  },
  moon: {
    significance: "Emotional needs and public connection",
    keywords: ["nurturing", "public", "intuition", "security"]
  },
  mercury: {
    significance: "Communication and intellectual work",
    keywords: ["communication", "analysis", "writing", "teaching"]
  },
  venus: {
    significance: "Artistic talents and harmonious work",
    keywords: ["beauty", "harmony", "arts", "relationships"]
  },
  mars: {
    significance: "Drive, initiative, and competitive fields",
    keywords: ["action", "competition", "energy", "pioneer"]
  },
  jupiter: {
    significance: "Growth, wisdom, and expansive careers",
    keywords: ["expansion", "wisdom", "publishing", "travel"]
  },
  saturn: {
    significance: "Structure, discipline, and long-term building",
    keywords: ["structure", "discipline", "authority", "mastery"]
  }
} as const;

export const MIDHEAVEN_SIGNS = {
  aries: "Leadership roles, entrepreneurship, pioneering fields",
  taurus: "Banking, agriculture, beauty, luxury goods, stability-focused careers",
  gemini: "Communication, media, writing, teaching, versatile careers",
  cancer: "Nurturing professions, food service, real estate, family-oriented work",
  leo: "Entertainment, creative arts, leadership, performance-based careers",
  virgo: "Health services, analysis, editing, detail-oriented professions",
  libra: "Law, diplomacy, beauty industry, partnership-focused careers",
  scorpio: "Investigation, psychology, research, transformation-focused work",
  sagittarius: "Education, publishing, travel, philosophy, international work",
  capricorn: "Business, government, traditional institutions, authoritative roles",
  aquarius: "Technology, humanitarian work, innovation, group-oriented careers",
  pisces: "Healing arts, spirituality, creativity, service-oriented professions"
} as const;

export class CareerInterpreter {
  static analyzeCareerPath(birthData: BirthData, planets: PlanetPosition[], houses: HousePosition[]): CareerInterpretation {
    const midheaven = this.findMidheaven(houses);
    const tenthHouse = this.analyzeHouse(10, planets, houses);
    const sixthHouse = this.analyzeHouse(6, planets, houses);
    const secondHouse = this.analyzeHouse(2, planets, houses);

    const sunPosition = planets.find(p => p.planet === 'sun');
    const saturnPosition = planets.find(p => p.planet === 'saturn');
    const jupiterPosition = planets.find(p => p.planet === 'jupiter');

    const interpretation: CareerInterpretation = {
      primaryPath: this.determinePrimaryPath(midheaven, tenthHouse, sunPosition),
      strengths: this.identifyStrengths(planets, houses),
      challenges: this.identifyChallenges(planets, houses),
      timing: this.analyzeCareerTiming(saturnPosition, jupiterPosition),
      guidance: this.generateCareerGuidance(planets, houses),
      keywords: this.extractCareerKeywords(planets, houses),
      confidence: 0.85
    };

    return interpretation;
  }

  static findMidheaven(houses: HousePosition[]): { sign: string; degree: number } {
    const tenthHouse = houses.find(h => h.house === 10);
    return {
      sign: tenthHouse?.sign || 'capricorn',
      degree: tenthHouse?.degree || 0
    };
  }

  static analyzeHouse(houseNumber: number, planets: PlanetPosition[], houses: HousePosition[]): {
    sign: string;
    planets: PlanetPosition[];
    ruler?: PlanetPosition;
  } {
    const house = houses.find(h => h.house === houseNumber);
    const housePlanets = planets.filter(p => p.house === houseNumber);
    
    return {
      sign: house?.sign || 'aries',
      planets: housePlanets,
      ruler: this.findHouseRuler(house?.sign, planets)
    };
  }

  static findHouseRuler(sign: string | undefined, planets: PlanetPosition[]): PlanetPosition | undefined {
    if (!sign) return undefined;

    const rulers = {
      aries: 'mars', taurus: 'venus', gemini: 'mercury', cancer: 'moon',
      leo: 'sun', virgo: 'mercury', libra: 'venus', scorpio: 'mars',
      sagittarius: 'jupiter', capricorn: 'saturn', aquarius: 'saturn', pisces: 'jupiter'
    } as const;

    const rulerPlanet = rulers[sign as keyof typeof rulers];
    return planets.find(p => p.planet === rulerPlanet);
  }

  static determinePrimaryPath(
    midheaven: { sign: string; degree: number },
    tenthHouse: any,
    sunPosition?: PlanetPosition
  ): string {
    const mcSign = midheaven.sign.toLowerCase();
    const mcInterpretation = MIDHEAVEN_SIGNS[mcSign as keyof typeof MIDHEAVEN_SIGNS] || 
      "Leadership and achievement-oriented career";

    if (tenthHouse.planets.length > 0) {
      const dominantPlanet = tenthHouse.planets[0];
      const planetKeywords = CAREER_PLANETS[dominantPlanet.planet as keyof typeof CAREER_PLANETS]?.keywords || [];
      return `${mcInterpretation} with emphasis on ${planetKeywords.join(', ')}`;
    }

    return mcInterpretation;
  }

  static identifyStrengths(planets: PlanetPosition[], houses: HousePosition[]): string[] {
    const strengths: string[] = [];

    // Sun strengths
    const sun = planets.find(p => p.planet === 'sun');
    if (sun) {
      const sunKeywords = CAREER_PLANETS.sun.keywords;
      strengths.push(`Natural ${sunKeywords[0]} abilities`);
    }

    // 10th house planets
    const tenthHousePlanets = planets.filter(p => p.house === 10);
    tenthHousePlanets.forEach(planet => {
      const planetData = CAREER_PLANETS[planet.planet as keyof typeof CAREER_PLANETS];
      if (planetData) {
        strengths.push(`Strong ${planetData.keywords[0]} orientation`);
      }
    });

    // Jupiter aspects (expansion and luck)
    const jupiter = planets.find(p => p.planet === 'jupiter');
    if (jupiter) {
      strengths.push("Natural ability to expand and grow opportunities");
    }

    return strengths.slice(0, 4); // Limit to top 4 strengths
  }

  static identifyChallenges(planets: PlanetPosition[], houses: HousePosition[]): string[] {
    const challenges: string[] = [];

    // Saturn challenges
    const saturn = planets.find(p => p.planet === 'saturn');
    if (saturn) {
      if (saturn.house === 10) {
        challenges.push("May face delays or obstacles in achieving recognition");
      }
      if (saturn.house === 6) {
        challenges.push("Need to develop discipline in daily work routines");
      }
    }

    // Empty career houses
    const careerHousePlanets = planets.filter(p => [2, 6, 10].includes(p.house));
    if (careerHousePlanets.length < 2) {
      challenges.push("May need to actively develop career focus and direction");
    }

    return challenges.slice(0, 3); // Limit to top 3 challenges
  }

  static analyzeCareerTiming(saturn?: PlanetPosition, jupiter?: PlanetPosition): string {
    const currentYear = new Date().getFullYear();
    
    // Saturn return timing (approximately every 29 years)
    const saturnReturnAges = [29, 58];
    const approximateAge = currentYear - 1990; // Rough estimate
    
    const nearSaturnReturn = saturnReturnAges.some(age => 
      Math.abs(approximateAge - age) <= 2
    );

    if (nearSaturnReturn) {
      return "This is a pivotal time for career restructuring and long-term planning. Major professional shifts are likely within the next 1-2 years.";
    }

    if (jupiter) {
      return "Jupiter's current influence suggests a period of career expansion and new opportunities. The next 6-12 months are favorable for professional growth.";
    }

    return "Focus on steady professional development and building expertise. Career momentum is building gradually.";
  }

  static generateCareerGuidance(planets: PlanetPosition[], houses: HousePosition[]): string {
    const tenthHouse = planets.filter(p => p.house === 10);
    const sun = planets.find(p => p.planet === 'sun');
    
    let guidance = "Focus on aligning your career with your authentic self. ";

    if (tenthHouse.length > 0) {
      guidance += "Your public reputation and professional image are especially important. ";
    }

    if (sun?.house === 6) {
      guidance += "Find meaning in service and attention to detail in your work. ";
    } else if (sun?.house === 10) {
      guidance += "Leadership and recognition are key themes in your career path. ";
    }

    guidance += "Trust your instincts and take measured risks toward your professional goals.";
    
    return guidance;
  }

  static extractCareerKeywords(planets: PlanetPosition[], houses: HousePosition[]): string[] {
    const keywords = new Set<string>();

    // Add keywords from career-significant planets
    planets.forEach(planet => {
      const planetData = CAREER_PLANETS[planet.planet as keyof typeof CAREER_PLANETS];
      if (planetData && [2, 6, 10].includes(planet.house)) {
        planetData.keywords.forEach(keyword => keywords.add(keyword));
      }
    });

    // Add house-specific keywords
    [2, 6, 10].forEach(houseNum => {
      const house = CAREER_HOUSES.find(h => h.number === houseNum);
      if (house) {
        house.keywords.forEach(keyword => keywords.add(keyword));
      }
    });

    return Array.from(keywords).slice(0, 8);
  }
}