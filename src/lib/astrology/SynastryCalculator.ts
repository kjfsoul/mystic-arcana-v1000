import { BirthData } from './AstronomicalCalculator';

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

// Mock planetary positions for demo purposes
// In a real implementation, this would use astronomical calculations
function getMockPlanetaryPositions(birthData: BirthData): Record<string, number> {
  // Generate consistent but pseudo-random positions based on birth date
  const seed = birthData.date.getTime();
  const random = (multiplier: number) => ((seed * multiplier) % 360);
  
  return {
    sun: random(1.1) % 360,
    moon: random(2.3) % 360,
    mercury: random(3.7) % 360,
    venus: random(4.1) % 360,
    mars: random(5.9) % 360,
    jupiter: random(6.7) % 360,
    saturn: random(7.3) % 360,
    uranus: random(8.1) % 360,
    neptune: random(9.2) % 360,
    pluto: random(10.5) % 360,
  };
}

function calculateAspectScore(angle1: number, angle2: number): number {
  const diff = Math.abs(angle1 - angle2);
  const aspectAngle = Math.min(diff, 360 - diff);
  
  // Major aspects and their harmony scores
  const aspects = [
    { angle: 0, orb: 8, score: 5 },     // Conjunction - very strong
    { angle: 60, orb: 6, score: 4 },   // Sextile - harmonious
    { angle: 90, orb: 8, score: 2 },   // Square - challenging but dynamic
    { angle: 120, orb: 8, score: 5 },  // Trine - very harmonious
    { angle: 180, orb: 8, score: 3 },  // Opposition - tension but attraction
  ];
  
  for (const aspect of aspects) {
    if (Math.abs(aspectAngle - aspect.angle) <= aspect.orb) {
      return aspect.score;
    }
  }
  
  return 0; // No significant aspect
}

function analyzeElementCompatibility(position1: number, position2: number): number {
  // Simplified element analysis (Fire, Earth, Air, Water)
  const getElement = (degrees: number) => Math.floor(degrees / 90) % 4;
  const element1 = getElement(position1);
  const element2 = getElement(position2);
  
  // Element compatibility matrix
  const compatibility = [
    [5, 2, 4, 2], // Fire: Fire, Earth, Air, Water
    [2, 5, 2, 4], // Earth: Fire, Earth, Air, Water
    [4, 2, 5, 2], // Air: Fire, Earth, Air, Water
    [2, 4, 2, 5], // Water: Fire, Earth, Air, Water
  ];
  
  return compatibility[element1][element2];
}

export async function calculateCompatibility(
  person1Data: BirthData, 
  person2Data: BirthData
): Promise<CompatibilityResult> {
  // In a real implementation, you would use actual astronomical calculations
  const person1Planets = getMockPlanetaryPositions(person1Data);
  const person2Planets = getMockPlanetaryPositions(person2Data);
  
  // Calculate compatibility scores for different areas
  const loveScore = calculateLoveCompatibility(person1Planets, person2Planets);
  const friendshipScore = calculateFriendshipCompatibility(person1Planets, person2Planets);
  const teamworkScore = calculateTeamworkCompatibility(person1Planets, person2Planets);
  
  return {
    love: {
      rating: Math.ceil(loveScore),
      description: getLoveDescription(loveScore)
    },
    friendship: {
      rating: Math.ceil(friendshipScore),
      description: getFriendshipDescription(friendshipScore)
    },
    teamwork: {
      rating: Math.ceil(teamworkScore),
      description: getTeamworkDescription(teamworkScore)
    },
    overall: {
      summary: getOverallSummary(loveScore, friendshipScore, teamworkScore),
      keyAspects: getKeyAspects(person1Planets, person2Planets)
    }
  };
}

function calculateLoveCompatibility(p1: Record<string, number>, p2: Record<string, number>): number {
  // Focus on Venus-Mars, Sun-Moon, Venus-Venus aspects for romantic compatibility
  const venusScore = (calculateAspectScore(p1.venus, p2.mars) + calculateAspectScore(p1.mars, p2.venus)) / 2;
  const sunMoonScore = (calculateAspectScore(p1.sun, p2.moon) + calculateAspectScore(p1.moon, p2.sun)) / 2;
  const venusVenusScore = calculateAspectScore(p1.venus, p2.venus);
  const elementScore = analyzeElementCompatibility(p1.venus, p2.venus);
  
  return Math.min(5, (venusScore * 0.4 + sunMoonScore * 0.3 + venusVenusScore * 0.2 + elementScore * 0.1));
}

function calculateFriendshipCompatibility(p1: Record<string, number>, p2: Record<string, number>): number {
  // Focus on Sun-Sun, Mercury-Mercury, Jupiter aspects for friendship
  const sunScore = calculateAspectScore(p1.sun, p2.sun);
  const mercuryScore = calculateAspectScore(p1.mercury, p2.mercury);
  const jupiterScore = (calculateAspectScore(p1.jupiter, p2.sun) + calculateAspectScore(p1.sun, p2.jupiter)) / 2;
  const elementScore = analyzeElementCompatibility(p1.sun, p2.sun);
  
  return Math.min(5, (sunScore * 0.3 + mercuryScore * 0.3 + jupiterScore * 0.3 + elementScore * 0.1));
}

function calculateTeamworkCompatibility(p1: Record<string, number>, p2: Record<string, number>): number {
  // Focus on Mars-Mars, Saturn-Saturn, Mercury aspects for teamwork
  const marsScore = calculateAspectScore(p1.mars, p2.mars);
  const saturnScore = calculateAspectScore(p1.saturn, p2.saturn);
  const mercuryScore = (calculateAspectScore(p1.mercury, p2.mars) + calculateAspectScore(p1.mars, p2.mercury)) / 2;
  const elementScore = analyzeElementCompatibility(p1.mars, p2.mars);
  
  return Math.min(5, (marsScore * 0.3 + saturnScore * 0.3 + mercuryScore * 0.3 + elementScore * 0.1));
}

function getLoveDescription(score: number): string {
  if (score >= 4.5) return "Incredible romantic chemistry! Your hearts beat in cosmic harmony, creating a passionate and deeply fulfilling connection.";
  if (score >= 3.5) return "Strong romantic potential with natural attraction and emotional understanding. Your love story has beautiful cosmic support.";
  if (score >= 2.5) return "Good romantic compatibility with some areas of growth. Communication and patience will strengthen your bond over time.";
  if (score >= 1.5) return "Moderate romantic connection that requires effort and understanding. Different approaches to love can create both challenges and growth.";
  return "Romantic compatibility may require significant work and compromise. Focus on building friendship and understanding first.";
}

function getFriendshipDescription(score: number): string {
  if (score >= 4.5) return "Exceptional friendship potential! You understand each other intuitively and bring out the best in one another.";
  if (score >= 3.5) return "Strong friendship compatibility with shared values and mutual respect. You'll create lasting memories together.";
  if (score >= 2.5) return "Good friendship foundation with complementary qualities. Your differences can create interesting and enriching exchanges.";
  if (score >= 1.5) return "Moderate friendship compatibility. Building trust and finding common ground will strengthen your connection over time.";
  return "Friendship may require patience and understanding. Focus on respecting differences and finding shared interests.";
}

function getTeamworkDescription(score: number): string {
  if (score >= 4.5) return "Outstanding teamwork potential! You complement each other's strengths and work toward goals with unified energy.";
  if (score >= 3.5) return "Strong collaborative compatibility with shared work ethics and complementary skills. Projects together will flourish.";
  if (score >= 2.5) return "Good teamwork potential with some areas to navigate. Clear communication about roles and expectations will help.";
  if (score >= 1.5) return "Moderate teamwork compatibility. Success will come through patience, compromise, and leveraging individual strengths.";
  return "Teamwork may face challenges. Focus on clear communication, defined roles, and respecting different working styles.";
}

function getOverallSummary(love: number, friendship: number, teamwork: number): string {
  const average = (love + friendship + teamwork) / 3;
  
  if (average >= 4.5) {
    return "Your cosmic connection is truly exceptional! The stars have aligned to create a harmonious and supportive relationship across all areas of life. This is a rare and precious bond that can weather any storm and celebrate every joy together.";
  }
  if (average >= 3.5) {
    return "You share a wonderful cosmic connection with strong potential for lasting happiness. While every relationship has its seasons, your charts suggest natural harmony and mutual support that will help you grow together.";
  }
  if (average >= 2.5) {
    return "Your relationship has solid cosmic foundations with room for growth and discovery. The challenges you face together will strengthen your bond and help you both evolve as individuals and as a partnership.";
  }
  if (average >= 1.5) {
    return "Your cosmic connection offers opportunities for learning and growth. While it may require more effort and understanding, the rewards of working through differences can lead to a deeply meaningful relationship.";
  }
  return "Your relationship will require patience, communication, and mutual respect to flourish. The cosmos encourages you to approach this connection with open hearts and realistic expectations, focusing on building understanding over time.";
}

function getKeyAspects(p1: Record<string, number>, p2: Record<string, number>): string[] {
  const aspects = [];
  
  // Check for significant aspects between key planets
  if (calculateAspectScore(p1.sun, p2.moon) >= 4 || calculateAspectScore(p1.moon, p2.sun) >= 4) {
    aspects.push("Strong Sun-Moon connection indicating emotional understanding and mutual support");
  }
  
  if (calculateAspectScore(p1.venus, p2.mars) >= 4 || calculateAspectScore(p1.mars, p2.venus) >= 4) {
    aspects.push("Powerful Venus-Mars aspect creating magnetic attraction and passionate energy");
  }
  
  if (calculateAspectScore(p1.mercury, p2.mercury) >= 4) {
    aspects.push("Mercury harmony suggesting excellent communication and mental compatibility");
  }
  
  if (calculateAspectScore(p1.jupiter, p2.sun) >= 4 || calculateAspectScore(p1.sun, p2.jupiter) >= 4) {
    aspects.push("Jupiter influence bringing optimism, growth, and shared adventures");
  }
  
  if (calculateAspectScore(p1.saturn, p2.saturn) >= 4) {
    aspects.push("Saturn alignment indicating potential for long-term commitment and stability");
  }
  
  // Add element-based insights
  const sunElement1 = Math.floor(p1.sun / 90) % 4;
  const sunElement2 = Math.floor(p2.sun / 90) % 4;
  const elements = ['Fire', 'Earth', 'Air', 'Water'];
  
  if (sunElement1 === sunElement2) {
    aspects.push(`Shared ${elements[sunElement1]} energy creating natural understanding and similar life approaches`);
  } else if ((sunElement1 + sunElement2) % 2 === 0) {
    aspects.push(`Complementary ${elements[sunElement1]}-${elements[sunElement2]} balance bringing both stability and excitement`);
  }
  
  // Ensure we always return at least 3 aspects
  if (aspects.length < 3) {
    aspects.push("Unique cosmic patterns creating opportunities for mutual growth and discovery");
    aspects.push("Planetary positions suggesting the importance of patience and open communication");
    aspects.push("Astrological indicators pointing toward building trust through shared experiences");
  }
  
  return aspects.slice(0, 5); // Return max 5 aspects
}