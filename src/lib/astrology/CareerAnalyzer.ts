import { BirthData } from './AstronomicalCalculator';
import { SwissEphemerisShim } from './SwissEphemerisShim';
export interface CareerStrength {
  title: string;
  description: string;
  rating: number; // 1-5 scale
}
export interface CareerChallenge {
  title: string;
  description: string;
  advice: string;
}
export interface CareerPath {
  title: string;
  description: string;
  industries: string[];
  compatibility: number; // 1-5 scale
}
export interface CareerAnalysis {
  overview: string;
  strengths: CareerStrength[];
  challenges: CareerChallenge[];
  recommendedPaths: CareerPath[];
  keyPlacements: {
    midheaven: string;
    saturn: string;
    mars: string;
    secondHouse: string;
    sixthHouse: string;
    tenthHouse: string;
  };
}
// Real planetary positions using Swiss Ephemeris calculations
export async function getRealCareerPlacements(birthData: BirthData): Promise<Record<string, number>> {
  const chart = await SwissEphemerisShim.calculateFullChart(birthData);
  
  const placements: Record<string, number> = {
    midheaven: chart.midheaven,
    sun: 0,
    moon: 0,
    mercury: 0,
    venus: 0,
    mars: 0,
    jupiter: 0,
    saturn: 0,
  };
  
  // Extract real planetary positions from the calculated chart
  chart.planets.forEach(planet => {
    const planetName = planet.name.toLowerCase();
    if (placements.hasOwnProperty(planetName)) {
      placements[planetName] = planet.longitude;
    }
  });
  
  return placements;
}
function getZodiacSign(degrees: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[Math.floor(degrees / 30)];
}
// House position calculation using real chart data
async function getHousePositions(birthData: BirthData): Promise<Record<string, string>> {
  const chart = await SwissEphemerisShim.calculateFullChart(birthData);
  
  return {
    secondHouse: `House ${chart.houses[1]?.number || 2}: ${chart.houses[1]?.sign || 'Unknown'} - Your relationship with money and values`,
    sixthHouse: `House ${chart.houses[5]?.number || 6}: ${chart.houses[5]?.sign || 'Unknown'} - Your daily work and health approach`,
    tenthHouse: `House ${chart.houses[9]?.number || 10}: ${chart.houses[9]?.sign || 'Unknown'} - Your public reputation and achievement`
  };
}
function analyzeStrengths(placements: Record<string, number>): CareerStrength[] {
  const strengths: CareerStrength[] = [];
  
  const midheavenSign = getZodiacSign(placements.midheaven);
  const marsSign = getZodiacSign(placements.mars);
  
  // Midheaven-based strengths
  const midheavenStrengths: Record<string, CareerStrength> = {
    'Aries': {
      title: 'Natural Leadership',
      description: 'You have an innate ability to lead, pioneer new initiatives, and thrive in competitive environments.',
      rating: 5
    },
    'Taurus': {
      title: 'Practical Excellence',
      description: 'Your methodical approach and attention to quality make you exceptional at building lasting value.',
      rating: 4
    },
    'Gemini': {
      title: 'Communication Mastery',
      description: 'Your versatility and communication skills open doors in media, teaching, and networking roles.',
      rating: 5
    },
    'Cancer': {
      title: 'Intuitive Understanding',
      description: 'Your emotional intelligence and nurturing nature excel in people-focused professions.',
      rating: 4
    },
    'Leo': {
      title: 'Creative Authority',
      description: 'Your natural charisma and creative vision make you a powerful force in entertainment and leadership.',
      rating: 5
    },
    'Virgo': {
      title: 'Analytical Precision',
      description: 'Your attention to detail and systematic approach excel in research, analysis, and optimization.',
      rating: 4
    },
    'Libra': {
      title: 'Diplomatic Balance',
      description: 'Your ability to see all sides and create harmony makes you valuable in law, arts, and mediation.',
      rating: 4
    },
    'Scorpio': {
      title: 'Transformative Power',
      description: 'Your depth and investigative nature excel in psychology, research, and transformational work.',
      rating: 5
    },
    'Sagittarius': {
      title: 'Visionary Expansion',
      description: 'Your philosophical mind and global perspective thrive in education, travel, and cultural exchange.',
      rating: 4
    },
    'Capricorn': {
      title: 'Executive Mastery',
      description: 'Your natural authority and long-term planning excel in management and institutional leadership.',
      rating: 5
    },
    'Aquarius': {
      title: 'Innovative Thinking',
      description: 'Your unique perspective and humanitarian focus excel in technology, social causes, and innovation.',
      rating: 5
    },
    'Pisces': {
      title: 'Compassionate Creativity',
      description: 'Your artistic sensitivity and healing nature thrive in creative arts, healing, and spiritual work.',
      rating: 4
    }
  };
  
  strengths.push(midheavenStrengths[midheavenSign]);
  
  // Mars-based strengths
  const marsStrengths: Record<string, CareerStrength> = {
    'Aries': { title: 'Decisive Action', description: 'Quick decision-making and fearless execution of plans.', rating: 5 },
    'Taurus': { title: 'Persistent Drive', description: 'Steady determination that sees projects through to completion.', rating: 4 },
    'Gemini': { title: 'Adaptable Energy', description: 'Versatile approach that handles multiple projects simultaneously.', rating: 4 },
    'Cancer': { title: 'Protective Motivation', description: 'Strong drive to protect and nurture important causes and people.', rating: 3 },
    'Leo': { title: 'Confident Performance', description: 'Dynamic presence that inspires others and commands attention.', rating: 5 },
    'Virgo': { title: 'Methodical Excellence', description: 'Precise execution and improvement-focused work ethic.', rating: 4 },
    'Libra': { title: 'Collaborative Power', description: 'Ability to motivate teams and build consensus for action.', rating: 3 },
    'Scorpio': { title: 'Intense Focus', description: 'Laser-focused determination that transforms obstacles into opportunities.', rating: 5 },
    'Sagittarius': { title: 'Adventurous Drive', description: 'Enthusiasm for exploration and expanding horizons.', rating: 4 },
    'Capricorn': { title: 'Strategic Ambition', description: 'Disciplined approach to achieving long-term career goals.', rating: 5 },
    'Aquarius': { title: 'Revolutionary Spirit', description: 'Drive to innovate and challenge conventional approaches.', rating: 4 },
    'Pisces': { title: 'Intuitive Action', description: 'Ability to act on subtle insights and emotional understanding.', rating: 3 }
  };
  
  strengths.push(marsStrengths[marsSign]);
  
  return strengths.slice(0, 3); // Return top 3 strengths
}
function analyzeChallenges(placements: Record<string, number>): CareerChallenge[] {
  const challenges: CareerChallenge[] = [];
  
  const saturnSign = getZodiacSign(placements.saturn);
  const marsSign = getZodiacSign(placements.mars);
  
  // Saturn-based challenges (karmic lessons)
  const saturnChallenges: Record<string, CareerChallenge> = {
    'Aries': {
      title: 'Patience Development',
      description: 'Learning to slow down and consider all angles before taking action.',
      advice: 'Practice collaborative decision-making and strategic planning before rushing forward.'
    },
    'Taurus': {
      title: 'Adaptability Growth',
      description: 'Overcoming resistance to change and embracing new methods.',
      advice: 'Gradually introduce changes and focus on how innovations can enhance stability.'
    },
    'Gemini': {
      title: 'Focus Refinement',
      description: 'Developing depth and follow-through in chosen areas of expertise.',
      advice: 'Choose 2-3 core competencies and commit to mastering them deeply.'
    },
    'Cancer': {
      title: 'Professional Boundaries',
      description: 'Learning to separate personal emotions from professional decisions.',
      advice: 'Develop emotional intelligence skills and practice objective decision-making.'
    },
    'Leo': {
      title: 'Collaborative Leadership',
      description: 'Balancing personal recognition with team success and shared credit.',
      advice: 'Focus on empowering others and celebrating team achievements alongside personal wins.'
    },
    'Virgo': {
      title: 'Perfectionism Balance',
      description: 'Learning when "good enough" is sufficient to meet deadlines and goals.',
      advice: 'Set clear standards and practice progressive refinement rather than initial perfection.'
    },
    'Libra': {
      title: 'Decision Confidence',
      description: 'Overcoming indecision and taking stands on important issues.',
      advice: 'Develop decision-making frameworks and practice making smaller choices confidently.'
    },
    'Scorpio': {
      title: 'Trust Building',
      description: 'Learning to delegate and work transparently with colleagues.',
      advice: 'Practice open communication and gradually increase trust through small collaborative wins.'
    },
    'Sagittarius': {
      title: 'Detail Attention',
      description: 'Balancing big-picture vision with necessary practical details.',
      advice: 'Partner with detail-oriented colleagues and create systems for tracking progress.'
    },
    'Capricorn': {
      title: 'Work-Life Balance',
      description: 'Avoiding burnout while maintaining high professional standards.',
      advice: 'Schedule personal time as seriously as professional commitments and honor both.'
    },
    'Aquarius': {
      title: 'Conventional Integration',
      description: 'Working within existing systems while implementing innovative changes.',
      advice: 'Present new ideas in familiar frameworks and build alliances before major changes.'
    },
    'Pisces': {
      title: 'Structure Development',
      description: 'Creating practical systems to support creative and intuitive insights.',
      advice: 'Use project management tools and partner with organized colleagues for implementation.'
    }
  };
  
  challenges.push(saturnChallenges[saturnSign]);
  
  // Add one more challenge based on Mars placement
  if (marsSign === 'Libra' || marsSign === 'Cancer') {
    challenges.push({
      title: 'Assertiveness Development',
      description: 'Building confidence to advocate for your ideas and needs.',
      advice: 'Practice presenting your ideas clearly and asking for what you need professionally.'
    });
  } else if (marsSign === 'Aries' || marsSign === 'Scorpio') {
    challenges.push({
      title: 'Patience Cultivation',
      description: 'Learning to consider team input and build consensus.',
      advice: 'Take time to gather input from others before making major decisions or changes.'
    });
  }
  
  return challenges.slice(0, 2); // Return top 2 challenges
}
function analyzeCareerPaths(placements: Record<string, number>): CareerPath[] {
  const paths: CareerPath[] = [];
  
  const midheavenSign = getZodiacSign(placements.midheaven);
  const sunSign = getZodiacSign(placements.sun);
  
  // Primary path based on Midheaven
  const midheavenPaths: Record<string, CareerPath> = {
    'Aries': {
      title: 'Leadership & Innovation',
      description: 'Pioneering roles where you can lead teams, start new initiatives, and drive competitive advantage.',
      industries: ['Technology Startups', 'Sports Management', 'Military/Security', 'Entrepreneurship'],
      compatibility: 5
    },
    'Taurus': {
      title: 'Quality & Value Creation',
      description: 'Roles focused on building lasting value, managing resources, and creating tangible results.',
      industries: ['Real Estate', 'Banking/Finance', 'Agriculture', 'Luxury Goods', 'Construction'],
      compatibility: 4
    },
    'Gemini': {
      title: 'Communication & Information',
      description: 'Positions involving information sharing, networking, and versatile problem-solving.',
      industries: ['Media/Journalism', 'Education', 'Sales', 'Public Relations', 'Technology'],
      compatibility: 5
    },
    'Cancer': {
      title: 'Nurturing & Protection',
      description: 'Caring professions focused on helping others grow, heal, and feel secure.',
      industries: ['Healthcare', 'Education', 'Social Work', 'Hospitality', 'Childcare'],
      compatibility: 4
    },
    'Leo': {
      title: 'Creative Authority',
      description: 'Leadership roles in creative industries where your vision and charisma can shine.',
      industries: ['Entertainment', 'Arts/Design', 'Marketing', 'Executive Leadership', 'Fashion'],
      compatibility: 5
    },
    'Virgo': {
      title: 'Analysis & Optimization',
      description: 'Detail-oriented roles focused on improving systems, analyzing data, and solving problems.',
      industries: ['Healthcare', 'Research', 'Quality Assurance', 'Consulting', 'Data Analysis'],
      compatibility: 4
    },
    'Libra': {
      title: 'Balance & Aesthetics',
      description: 'Roles involving mediation, aesthetic judgment, and creating harmony between different parties.',
      industries: ['Law/Mediation', 'Arts/Design', 'Human Resources', 'Diplomacy', 'Beauty Industry'],
      compatibility: 4
    },
    'Scorpio': {
      title: 'Transformation & Investigation',
      description: 'Deep-dive roles involving research, transformation, and uncovering hidden truths.',
      industries: ['Psychology/Therapy', 'Investigation', 'Finance/Investments', 'Research', 'Surgery'],
      compatibility: 5
    },
    'Sagittarius': {
      title: 'Expansion & Wisdom',
      description: 'Roles involving teaching, traveling, publishing, and expanding horizons for yourself and others.',
      industries: ['Higher Education', 'Publishing', 'Travel/Tourism', 'Philosophy/Religion', 'International Business'],
      compatibility: 4
    },
    'Capricorn': {
      title: 'Structure & Authority',
      description: 'Executive and institutional roles where you can build lasting organizational structures.',
      industries: ['Government', 'Corporate Leadership', 'Banking', 'Engineering', 'Project Management'],
      compatibility: 5
    },
    'Aquarius': {
      title: 'Innovation & Humanitarian Impact',
      description: 'Forward-thinking roles focused on technological advancement and social progress.',
      industries: ['Technology', 'Non-Profit', 'Scientific Research', 'Social Innovation', 'Renewable Energy'],
      compatibility: 5
    },
    'Pisces': {
      title: 'Healing & Artistic Expression',
      description: 'Intuitive and creative roles focused on healing, inspiration, and spiritual growth.',
      industries: ['Arts/Music', 'Healing/Therapy', 'Spirituality', 'Photography/Film', 'Marine Biology'],
      compatibility: 4
    }
  };
  
  paths.push(midheavenPaths[midheavenSign]);
  
  // Secondary path based on Sun sign
  if (sunSign !== midheavenSign) {
    const sunPaths: Record<string, CareerPath> = {
      'Aries': { title: 'Competitive Excellence', description: 'High-energy roles in competitive environments.', industries: ['Sports', 'Sales', 'Emergency Services'], compatibility: 3 },
      'Taurus': { title: 'Steady Growth', description: 'Long-term value building in stable industries.', industries: ['Agriculture', 'Banking', 'Real Estate'], compatibility: 3 },
      'Gemini': { title: 'Information Hub', description: 'Versatile roles connecting people and ideas.', industries: ['Media', 'Technology', 'Education'], compatibility: 3 },
      'Cancer': { title: 'Community Building', description: 'Roles focused on creating safe, nurturing environments.', industries: ['Social Work', 'Healthcare', 'Hospitality'], compatibility: 3 },
      'Leo': { title: 'Creative Leadership', description: 'Inspiring others through creative vision and enthusiasm.', industries: ['Entertainment', 'Marketing', 'Education'], compatibility: 3 },
      'Virgo': { title: 'Service Excellence', description: 'Perfecting systems and processes to serve others better.', industries: ['Healthcare', 'Administration', 'Quality Control'], compatibility: 3 },
      'Libra': { title: 'Relationship Building', description: 'Creating harmony and beauty in professional settings.', industries: ['Law', 'Arts', 'Human Resources'], compatibility: 3 },
      'Scorpio': { title: 'Deep Impact', description: 'Transformational work that creates lasting change.', industries: ['Psychology', 'Research', 'Finance'], compatibility: 3 },
      'Sagittarius': { title: 'Knowledge Expansion', description: 'Sharing wisdom and exploring new frontiers.', industries: ['Education', 'Travel', 'Publishing'], compatibility: 3 },
      'Capricorn': { title: 'Institutional Building', description: 'Creating lasting structures and achieving recognition.', industries: ['Government', 'Corporate', 'Engineering'], compatibility: 3 },
      'Aquarius': { title: 'Social Innovation', description: 'Using technology and innovation for humanitarian progress.', industries: ['Technology', 'Non-Profit', 'Research'], compatibility: 3 },
      'Pisces': { title: 'Compassionate Service', description: 'Intuitive helping and creative expression.', industries: ['Arts', 'Healing', 'Spirituality'], compatibility: 3 }
    };
    
    paths.push(sunPaths[sunSign]);
  }
  
  return paths;
}
export async function analyzeCareer(birthData: BirthData): Promise<CareerAnalysis> {
  const placements = await getRealCareerPlacements(birthData);
  
  const midheavenSign = getZodiacSign(placements.midheaven);
  const saturnSign = getZodiacSign(placements.saturn);
  const marsSign = getZodiacSign(placements.mars);
  
  return {
    overview: generateOverview(midheavenSign, saturnSign, marsSign),
    strengths: analyzeStrengths(placements),
    challenges: analyzeChallenges(placements),
    recommendedPaths: analyzeCareerPaths(placements),
    keyPlacements: {
      midheaven: `${midheavenSign} - Your public image and career direction`,
      saturn: `${saturnSign} - Your discipline, structure, and karmic lessons`,
      mars: `${marsSign} - Your drive, energy, and action style`,
      secondHouse: 'Financial values and earning style',
      sixthHouse: 'Daily work and service to others',
      tenthHouse: 'Career, reputation, and public image',
      ...(await getHousePositions(birthData))
    }
  };
}
function generateOverview(midheaven: string, saturn: string, mars: string): string {
  return `Your cosmic career blueprint reveals a unique combination of ${midheaven} leadership style, ${saturn} work ethic, and ${mars} drive. This creates a professional personality that excels in roles requiring both vision and practical execution. Your path to success involves leveraging your natural ${midheaven} qualities while developing the discipline and structure indicated by your ${saturn} placement. The ${mars} energy provides the motivation and action-oriented approach needed to manifest your career aspirations into reality.`;
}
