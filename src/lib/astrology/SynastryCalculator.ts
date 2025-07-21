import { BirthData, PlanetPosition } from './AstronomicalCalculator';
import { SwissEphemerisShim } from './SwissEphemerisShim';

interface CompatibilityAPIResponse {
  success: boolean;
  data?: {
    love: CompatibilityRating;
    friendship: CompatibilityRating;
    teamwork: CompatibilityRating;
    overall: {
      summary: string;
      keyAspects: string[];
    };
    rawSynastryData?: unknown;
    isUnavailable?: boolean;
  };
  error?: string;
}

export interface CompatibilityRating {
  rating: number; // 1-5 scale
  description: string;
}

export interface CompatibilityResult {
  love: CompatibilityRating;
  friendship: CompatibilityRating;
  teamwork: CompatibilityRating;
  overall: {
    summary: string;
    keyAspects: string[];
  };
}

// Calculate compatibility using Swiss Ephemeris Shim
async function calculateRealCompatibility(person1Data: BirthData, person2Data: BirthData): Promise<CompatibilityAPIResponse> {
  try {
    // Initialize Swiss Ephemeris
    await SwissEphemerisShim.initialize();
    
    // Calculate charts for both people
    const chart1 = await SwissEphemerisShim.calculateFullChart(person1Data);
    const chart2 = await SwissEphemerisShim.calculateFullChart(person2Data);
    
    // Analyze synastry aspects
    const synastryAnalysis = analyzeSynastryAspects(chart1, chart2);
    
    return {
      success: true,
      data: synastryAnalysis
    };
  } catch (error) {
    console.error('Failed to calculate compatibility:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fallback function for when API is unavailable
function getFallbackCompatibility(): CompatibilityResult {
  return {
    love: {
      rating: 0,
      description: "Compatibility data temporarily unavailable. Our astrological calculation service is currently offline. Please try again later."
    },
    friendship: {
      rating: 0,
      description: "Compatibility data temporarily unavailable. Our astrological calculation service is currently offline. Please try again later."
    },
    teamwork: {
      rating: 0,
      description: "Compatibility data temporarily unavailable. Our astrological calculation service is currently offline. Please try again later."
    },
    overall: {
      summary: "We're currently unable to access our astronomical calculation service. This feature requires real-time planetary position calculations using Swiss Ephemeris data. Please try again in a few moments.",
      keyAspects: [
        "Service temporarily unavailable - please try again later",
        "We use authentic astronomical calculations, not random data",
        "Your compatibility analysis will be based on real planetary positions when service is restored"
      ]
    }
  };
}

// Analyze synastry aspects between two charts
function analyzeSynastryAspects(chart1: any, chart2: any): {
  love: CompatibilityRating;
  friendship: CompatibilityRating;
  teamwork: CompatibilityRating;
  overall: { summary: string; keyAspects: string[]; };
} {
  const aspects = calculateAspects(chart1.planets, chart2.planets);
  
  // Analyze different compatibility dimensions
  const loveScore = calculateLoveCompatibility(aspects, chart1.planets, chart2.planets);
  const friendshipScore = calculateFriendshipCompatibility(aspects, chart1.planets, chart2.planets);
  const teamworkScore = calculateTeamworkCompatibility(aspects, chart1.planets, chart2.planets);
  
  const keyAspects = generateKeyAspects(aspects, chart1.planets, chart2.planets);
  const overallSummary = generateOverallSummary(loveScore, friendshipScore, teamworkScore, keyAspects);
  
  return {
    love: {
      rating: loveScore,
      description: getLoveDescription(loveScore, aspects)
    },
    friendship: {
      rating: friendshipScore,
      description: getFriendshipDescription(friendshipScore, aspects)
    },
    teamwork: {
      rating: teamworkScore,
      description: getTeamworkDescription(teamworkScore, aspects)
    },
    overall: {
      summary: overallSummary,
      keyAspects: keyAspects
    }
  };
}

// Calculate aspects between planets in two charts
function calculateAspects(planets1: PlanetPosition[], planets2: PlanetPosition[]): Array<{
  planet1: string;
  planet2: string;
  aspectType: string;
  orb: number;
  strength: number;
}> {
  const aspects = [];
  const majorAspects = [
    { name: 'conjunction', degrees: 0, orb: 8 },
    { name: 'opposition', degrees: 180, orb: 8 },
    { name: 'trine', degrees: 120, orb: 8 },
    { name: 'square', degrees: 90, orb: 8 },
    { name: 'sextile', degrees: 60, orb: 6 }
  ];
  
  for (const p1 of planets1) {
    for (const p2 of planets2) {
      const angleDiff = Math.abs(p1.longitude - p2.longitude);
      const adjustedAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff;
      
      for (const aspect of majorAspects) {
        const deviation = Math.abs(adjustedAngle - aspect.degrees);
        if (deviation <= aspect.orb) {
          const strength = 1 - (deviation / aspect.orb); // 0-1 strength
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            aspectType: aspect.name,
            orb: deviation,
            strength: strength
          });
        }
      }
    }
  }
  
  return aspects;
}

// Calculate love compatibility score (1-5)
function calculateLoveCompatibility(aspects: any[], planets1: PlanetPosition[], planets2: PlanetPosition[]): number {
  let score = 0;
  let maxScore = 0;
  
  // Venus-Mars aspects (passion, attraction)
  const venusAspects = aspects.filter(a => 
    (a.planet1 === 'Venus' && a.planet2 === 'Mars') || 
    (a.planet1 === 'Mars' && a.planet2 === 'Venus')
  );
  
  for (const aspect of venusAspects) {
    maxScore += 2;
    if (aspect.aspectType === 'conjunction' || aspect.aspectType === 'trine') {
      score += 2 * aspect.strength;
    } else if (aspect.aspectType === 'sextile') {
      score += 1.5 * aspect.strength;
    } else if (aspect.aspectType === 'square') {
      score += 1 * aspect.strength; // Tension but still attraction
    }
  }
  
  // Sun-Moon aspects (emotional connection)
  const sunMoonAspects = aspects.filter(a =>
    (a.planet1 === 'Sun' && a.planet2 === 'Moon') ||
    (a.planet1 === 'Moon' && a.planet2 === 'Sun')
  );
  
  for (const aspect of sunMoonAspects) {
    maxScore += 1.5;
    if (aspect.aspectType === 'conjunction' || aspect.aspectType === 'trine' || aspect.aspectType === 'sextile') {
      score += 1.5 * aspect.strength;
    }
  }
  
  // Venus-Venus aspects (shared values)
  const venusVenusAspects = aspects.filter(a => a.planet1 === 'Venus' && a.planet2 === 'Venus');
  for (const aspect of venusVenusAspects) {
    maxScore += 1;
    if (aspect.aspectType === 'conjunction' || aspect.aspectType === 'trine' || aspect.aspectType === 'sextile') {
      score += 1 * aspect.strength;
    }
  }
  
  // Normalize to 1-5 scale
  if (maxScore === 0) return 3; // Neutral if no major aspects
  const normalizedScore = (score / maxScore) * 4 + 1; // 1-5 scale
  return Math.min(5, Math.max(1, Math.round(normalizedScore)));
}

// Calculate friendship compatibility score (1-5)
function calculateFriendshipCompatibility(aspects: any[], planets1: PlanetPosition[], planets2: PlanetPosition[]): number {
  let score = 0;
  let maxScore = 0;
  
  // Sun-Sun aspects (core compatibility)
  const sunSunAspects = aspects.filter(a => a.planet1 === 'Sun' && a.planet2 === 'Sun');
  for (const aspect of sunSunAspects) {
    maxScore += 2;
    if (aspect.aspectType === 'conjunction' || aspect.aspectType === 'trine' || aspect.aspectType === 'sextile') {
      score += 2 * aspect.strength;
    }
  }
  
  // Mercury aspects (communication)
  const mercuryAspects = aspects.filter(a =>
    a.planet1 === 'Mercury' || a.planet2 === 'Mercury'
  );
  
  for (const aspect of mercuryAspects) {
    maxScore += 1;
    if (aspect.aspectType === 'conjunction' || aspect.aspectType === 'trine' || aspect.aspectType === 'sextile') {
      score += 1 * aspect.strength;
    }
  }
  
  // Jupiter aspects (expansion, optimism)
  const jupiterAspects = aspects.filter(a =>
    a.planet1 === 'Jupiter' || a.planet2 === 'Jupiter'
  );
  
  for (const aspect of jupiterAspects) {
    maxScore += 1;
    if (aspect.aspectType === 'conjunction' || aspect.aspectType === 'trine' || aspect.aspectType === 'sextile') {
      score += 1 * aspect.strength;
    }
  }
  
  if (maxScore === 0) return 3;
  const normalizedScore = (score / maxScore) * 4 + 1;
  return Math.min(5, Math.max(1, Math.round(normalizedScore)));
}

// Calculate teamwork compatibility score (1-5)
function calculateTeamworkCompatibility(aspects: any[], planets1: PlanetPosition[], planets2: PlanetPosition[]): number {
  let score = 0;
  let maxScore = 0;
  
  // Mars aspects (action, initiative)
  const marsAspects = aspects.filter(a =>
    a.planet1 === 'Mars' || a.planet2 === 'Mars'
  );
  
  for (const aspect of marsAspects) {
    maxScore += 1;
    if (aspect.aspectType === 'conjunction' || aspect.aspectType === 'trine' || aspect.aspectType === 'sextile') {
      score += 1 * aspect.strength;
    }
  }
  
  // Saturn aspects (structure, responsibility)
  const saturnAspects = aspects.filter(a =>
    a.planet1 === 'Saturn' || a.planet2 === 'Saturn'
  );
  
  for (const aspect of saturnAspects) {
    maxScore += 1.5;
    if (aspect.aspectType === 'conjunction' || aspect.aspectType === 'trine' || aspect.aspectType === 'sextile') {
      score += 1.5 * aspect.strength;
    }
  }
  
  if (maxScore === 0) return 3;
  const normalizedScore = (score / maxScore) * 4 + 1;
  return Math.min(5, Math.max(1, Math.round(normalizedScore)));
}

// Generate descriptive text for love compatibility
function getLoveDescription(score: number, aspects: any[]): string {
  const descriptions = {
    5: "Exceptional romantic chemistry! Your planetary alignments suggest a deep, passionate connection with natural harmony and magnetic attraction.",
    4: "Strong romantic potential with good emotional and physical compatibility. Your charts show promising aspects for lasting love.",
    3: "Moderate romantic compatibility. With effort and understanding, this relationship has good potential for growth and connection.",
    2: "Some romantic challenges indicated. Different approaches to love and affection may require patience and compromise.",
    1: "Significant romantic obstacles suggested by planetary tensions. This connection may require substantial work to flourish."
  };
  return descriptions[score as keyof typeof descriptions] || descriptions[3];
}

// Generate descriptive text for friendship compatibility
function getFriendshipDescription(score: number, aspects: any[]): string {
  const descriptions = {
    5: "Outstanding friendship potential! Your charts indicate natural understanding, shared interests, and effortless communication.",
    4: "Excellent friendship compatibility with strong mutual respect and enjoyable interactions.",
    3: "Good friendship potential. You likely share some common ground and can build a solid friendship with mutual effort.",
    2: "Friendship may face some challenges due to different communication styles or values, but respect can overcome differences.",
    1: "Friendship compatibility shows significant obstacles. Very different approaches to life may make connection difficult."
  };
  return descriptions[score as keyof typeof descriptions] || descriptions[3];
}

// Generate descriptive text for teamwork compatibility
function getTeamworkDescription(score: number, aspects: any[]): string {
  const descriptions = {
    5: "Exceptional teamwork synergy! Your planetary patterns suggest you work together seamlessly with complementary strengths.",
    4: "Very good teamwork compatibility with effective collaboration and mutual support in achieving goals.",
    3: "Decent teamwork potential. With clear communication and defined roles, you can work well together.",
    2: "Some teamwork challenges indicated. Different work styles may require patience and structured approaches.",
    1: "Significant teamwork obstacles suggested. Very different approaches to tasks and responsibility may create friction."
  };
  return descriptions[score as keyof typeof descriptions] || descriptions[3];
}

// Generate key aspects summary
function generateKeyAspects(aspects: any[], planets1: PlanetPosition[], planets2: PlanetPosition[]): string[] {
  const keyAspects = [];
  
  // Find the strongest aspects
  const strongAspects = aspects
    .filter(a => a.strength > 0.7)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5);
  
  for (const aspect of strongAspects) {
    const description = getAspectDescription(aspect);
    if (description) keyAspects.push(description);
  }
  
  // Add element analysis
  const elements1 = getElementDistribution(planets1);
  const elements2 = getElementDistribution(planets2);
  const elementCompatibility = analyzeElementCompatibility(elements1, elements2);
  keyAspects.push(elementCompatibility);
  
  return keyAspects.slice(0, 4); // Limit to 4 key aspects
}

// Get description for a specific aspect
function getAspectDescription(aspect: any): string {
  const descriptions: Record<string, Record<string, string>> = {
    'Sun': {
      'Moon': `${aspect.planet1}-${aspect.planet2} ${aspect.aspectType}: Core personality harmonizes with emotional nature`,
      'Venus': `${aspect.planet1}-${aspect.planet2} ${aspect.aspectType}: Identity and values align beautifully`,
      'Mars': `${aspect.planet1}-${aspect.planet2} ${aspect.aspectType}: Will and action work in sync`
    },
    'Moon': {
      'Venus': `${aspect.planet1}-${aspect.planet2} ${aspect.aspectType}: Emotional needs and affection flow naturally`,
      'Mars': `${aspect.planet1}-${aspect.planet2} ${aspect.aspectType}: Feelings and passion connect dynamically`
    },
    'Venus': {
      'Mars': `${aspect.planet1}-${aspect.planet2} ${aspect.aspectType}: Love and desire create powerful attraction`
    }
  };
  
  return descriptions[aspect.planet1]?.[aspect.planet2] || 
         descriptions[aspect.planet2]?.[aspect.planet1] || 
         `${aspect.planet1}-${aspect.planet2} ${aspect.aspectType}: Significant planetary interaction`;
}

// Analyze element distribution in chart
function getElementDistribution(planets: PlanetPosition[]): Record<string, number> {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  const signElements: Record<string, string> = {
    'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
    'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
    'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
    'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
  };
  
  for (const planet of planets) {
    const element = signElements[planet.sign];
    if (element) elements[element as keyof typeof elements]++;
  }
  
  return elements;
}

// Analyze element compatibility
function analyzeElementCompatibility(elements1: Record<string, number>, elements2: Record<string, number>): string {
  const person1Dominant = Object.entries(elements1).reduce((a, b) => elements1[a[0]] > elements1[b[0]] ? a : b)[0];
  const person2Dominant = Object.entries(elements2).reduce((a, b) => elements2[a[0]] > elements2[b[0]] ? a : b)[0];
  
  const compatibility: Record<string, Record<string, string>> = {
    fire: {
      fire: "Both partners share fiery, enthusiastic energy",
      air: "Fire and air create dynamic, inspiring energy together",
      earth: "Fire brings passion while earth provides stability",
      water: "Fire and water create steam - intense but potentially turbulent"
    },
    earth: {
      earth: "Both partners value stability and practical approaches",
      air: "Earth provides grounding while air brings fresh perspectives",
      water: "Earth and water create nurturing, growth-oriented energy",
      fire: "Earth provides stability while fire brings excitement"
    },
    air: {
      air: "Both partners communicate freely and share intellectual interests",
      water: "Air brings lightness while water adds emotional depth",
      fire: "Air and fire create dynamic, inspiring energy together",
      earth: "Air brings fresh ideas while earth provides practical grounding"
    },
    water: {
      water: "Both partners share deep emotional understanding and intuition",
      fire: "Water and fire create steam - intense emotional connection",
      earth: "Water and earth create nurturing, stable growth",
      air: "Water adds emotional depth while air provides mental stimulation"
    }
  };
  
  return compatibility[person1Dominant]?.[person2Dominant] || "Unique elemental blend creates interesting dynamics";
}

// Generate overall summary
function generateOverallSummary(loveScore: number, friendshipScore: number, teamworkScore: number, keyAspects: string[]): string {
  const avgScore = (loveScore + friendshipScore + teamworkScore) / 3;
  
  if (avgScore >= 4.5) {
    return "Your charts reveal exceptional cosmic compatibility across all dimensions. This is a rare and powerful connection with strong potential for a fulfilling, long-lasting relationship built on mutual understanding and complementary energies.";
  } else if (avgScore >= 3.5) {
    return "Your astrological compatibility shows strong positive potential. While every relationship requires effort, your planetary alignments suggest natural harmony and the ability to support each other's growth and happiness.";
  } else if (avgScore >= 2.5) {
    return "Your charts indicate moderate compatibility with both harmonious and challenging aspects. This relationship has good potential with conscious effort, patience, and appreciation for your differences as opportunities for growth.";
  } else {
    return "Your astrological compatibility reveals significant differences in your cosmic blueprints. While challenging, these differences can lead to profound growth if approached with understanding, patience, and mutual respect.";
  }
}


export async function calculateCompatibility(
  person1Data: BirthData, 
  person2Data: BirthData
): Promise<CompatibilityResult> {
  try {
    // Use Swiss Ephemeris Shim for real astrological calculations
    const apiResponse = await calculateRealCompatibility(person1Data, person2Data);
    
    if (!apiResponse.success || !apiResponse.data) {
      console.warn('Compatibility calculation failed, using fallback:', apiResponse.error);
      return getFallbackCompatibility();
    }

    // Return the real compatibility data
    return {
      love: apiResponse.data.love,
      friendship: apiResponse.data.friendship,
      teamwork: apiResponse.data.teamwork,
      overall: apiResponse.data.overall
    };
  } catch (error) {
    console.error('Error in calculateCompatibility:', error);
    return getFallbackCompatibility();
  }
}

// Legacy compatibility calculation functions removed
// All calculations now handled by Python backend with real astronomical data