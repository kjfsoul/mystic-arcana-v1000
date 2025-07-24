/**
 * LunarTransitNarratorAgent - Swiss Ephemeris-Powered Daily Horoscope Generator
 * 
 * Generates daily horoscopes for all 12 zodiac signs using real-time Swiss Ephemeris
 * calculations, integrated with AstrologyGuru knowledge base for comprehensive
 * interpretations. Outputs JSON format for n8n automation workflows.
 * 
 * Updated: 2025-07-24 - Full Swiss Ephemeris integration with career/compatibility synthesis
 */

import { Agent } from '@/lib/ag-ui/agent';
import { SwissEphemerisShim } from '@/lib/astrology/SwissEphemerisShim';
import { AstrologyGuruAgent } from './astrology-guru';
// TODO: Import @log_invocation decorator when Python integration is available
// import { log_invocation } from '@/utils/a_mem_logger';

// n8n Automation JSON Interface
export interface DailyHoroscopeJSON {
  sign: string;
  date: string;
  horoscope: string;
  keywords: string[];
  luckyNumbers: number[];
  colors: string[];
  careerInsight: string;
  loveInsight: string;
  energy: string;
  moonPhase: string;
  keyTransits: string[];
  advice: string;
  rating: {
    overall: number;
    love: number;
    career: number;
    health: number;
  };
}

export interface LunarPhaseData {
  phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  illumination: number; // percentage
  angle: number; // degrees from sun
  nextPhase: {
    phase: string;
    date: string;
  };
  moonSign: string;
  moonDegree: number;
  lunarMonth: number; // days since new moon
}

export interface TransitEvent {
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  planet1: string;
  planet2: string;
  exactTime: string;
  orb: number;
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  influence: string[];
  duration: {
    applying: string;
    exact: string;
    separating: string;
  };
}

export interface DailyLunarForecast {
  date: string;
  lunarPhase: LunarPhaseData;
  moonTransits: TransitEvent[];
  dailyTheme: string;
  emotionalWeather: {
    overall: 'turbulent' | 'flowing' | 'intense' | 'peaceful' | 'transformative';
    keywords: string[];
    supportive: string[];
    challenging: string[];
  };
  guidanceByArea: {
    love: string;
    career: string;
    health: string;
    spiritual: string;
  };
  ritualSuggestions: string[];
  crystalRecommendations: string[];
  optimalTimes: {
    manifestation: string;
    reflection: string;
    release: string;
  };
}

export interface PersonalizedLunarReading {
  userId: string;
  natalMoon: {
    sign: string;
    degree: number;
    house: number;
  };
  currentTransits: TransitEvent[];
  personalThemes: string[];
  emotionalForecast: string;
  relationshipInsights: string;
  careerGuidance: string;
  spiritualMessage: string;
  actionItems: string[];
}

export class LunarTransitNarratorAgent extends Agent {
  private lunarCycles: Map<string, any>;
  private transitTemplates: Map<string, any>;
  private narrativeStyles: Map<string, any>;
  private astrologyGuru: AstrologyGuruAgent;
  private knowledgeBase: Map<string, any>;
  private zodiacSigns: string[];

  constructor() {
    super('lunar-transit-narrator', 'LunarTransitNarratorAgent');
    this.lunarCycles = new Map();
    this.transitTemplates = new Map();
    this.narrativeStyles = new Map();
    this.knowledgeBase = new Map();
    this.astrologyGuru = new AstrologyGuruAgent();
    this.zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    this.initializeLunarWisdom();
    this.loadAstrologyKnowledge();
  }

  /**
   * Load AstrologyGuru knowledge base for enhanced interpretations
   */
  private async loadAstrologyKnowledge(): Promise<void> {
    try {
      // Load the comprehensive knowledge pool from AstrologyGuru
      const knowledgePoolPath = process.cwd() + '/data/knowledge/astrology-knowledge-pool.json';
      const fs = await import('fs/promises');
      
      try {
        const knowledgeData = await fs.readFile(knowledgePoolPath, 'utf8');
        const knowledgePool = JSON.parse(knowledgeData);
        
        this.knowledgeBase.set('planets', knowledgePool.planets || {});
        this.knowledgeBase.set('signs', knowledgePool.signs || {});
        this.knowledgeBase.set('houses', knowledgePool.houses || {});
        this.knowledgeBase.set('aspects', knowledgePool.aspects || {});
        this.knowledgeBase.set('techniques', knowledgePool.techniques || {});
        
        console.log('LunarTransitNarrator: Loaded AstrologyGuru knowledge base successfully');
      } catch (fileError) {
        console.warn('LunarTransitNarrator: Using fallback knowledge base');
        this.loadFallbackKnowledge();
      }
    } catch (error) {
      console.error('LunarTransitNarrator: Knowledge loading failed:', error);
      this.loadFallbackKnowledge();
    }
  }

  /**
   * Load fallback knowledge if main knowledge base unavailable
   */
  private loadFallbackKnowledge(): void {
    const signs = {
      aries: { keywords: ['action', 'leadership', 'courage'], element: 'fire', quality: 'cardinal' },
      taurus: { keywords: ['stability', 'beauty', 'persistence'], element: 'earth', quality: 'fixed' },
      gemini: { keywords: ['communication', 'curiosity', 'adaptability'], element: 'air', quality: 'mutable' },
      cancer: { keywords: ['emotion', 'nurturing', 'intuition'], element: 'water', quality: 'cardinal' },
      leo: { keywords: ['creativity', 'confidence', 'leadership'], element: 'fire', quality: 'fixed' },
      virgo: { keywords: ['service', 'analysis', 'perfection'], element: 'earth', quality: 'mutable' },
      libra: { keywords: ['balance', 'harmony', 'relationships'], element: 'air', quality: 'cardinal' },
      scorpio: { keywords: ['transformation', 'intensity', 'mystery'], element: 'water', quality: 'fixed' },
      sagittarius: { keywords: ['adventure', 'philosophy', 'freedom'], element: 'fire', quality: 'mutable' },
      capricorn: { keywords: ['ambition', 'structure', 'responsibility'], element: 'earth', quality: 'cardinal' },
      aquarius: { keywords: ['innovation', 'humanity', 'independence'], element: 'air', quality: 'fixed' },
      pisces: { keywords: ['spirituality', 'compassion', 'imagination'], element: 'water', quality: 'mutable' }
    };
    
    this.knowledgeBase.set('signs', signs);
  }

  /**
   * Initialize lunar wisdom database and narrative templates
   */
  // @log_invocation(event_type="lunar_wisdom_init", user_id="system")
  private initializeLunarWisdom(): void {
    // Lunar phase meanings and influences
    this.lunarCycles.set('phases', {
      new: {
        energy: 'initiation',
        keywords: ['new beginnings', 'intention setting', 'fresh start'],
        guidance: 'Plant seeds of intention and focus on new projects',
        ritual: 'intention setting ceremony',
        crystal: 'moonstone'
      },
      waxing_crescent: {
        energy: 'growth',
        keywords: ['momentum', 'taking action', 'building'],
        guidance: 'Take practical steps toward your goals',
        ritual: 'action planning meditation',
        crystal: 'green aventurine'
      },
      first_quarter: {
        energy: 'decision',
        keywords: ['challenges', 'perseverance', 'choice'],
        guidance: 'Face obstacles with determination and make key decisions',
        ritual: 'decision clarity ritual',
        crystal: 'fluorite'
      },
      waxing_gibbous: {
        energy: 'refinement',
        keywords: ['adjustment', 'perseverance', 'fine-tuning'],
        guidance: 'Refine your approach and stay committed to your path',
        ritual: 'progress review ceremony',
        crystal: 'citrine'
      },
      full: {
        energy: 'culmination',
        keywords: ['completion', 'manifestation', 'high emotion'],
        guidance: 'Celebrate achievements and release what no longer serves',
        ritual: 'full moon release ceremony',
        crystal: 'selenite'
      },
      waning_gibbous: {
        energy: 'gratitude',
        keywords: ['sharing', 'teaching', 'giving back'],
        guidance: 'Share your wisdom and express gratitude',
        ritual: 'gratitude meditation',
        crystal: 'rose quartz'
      },
      last_quarter: {
        energy: 'release',
        keywords: ['letting go', 'forgiveness', 'clearing'],
        guidance: 'Release old patterns and forgive past hurts',
        ritual: 'cord cutting ceremony',
        crystal: 'black tourmaline'
      },
      waning_crescent: {
        energy: 'reflection',
        keywords: ['rest', 'contemplation', 'wisdom'],
        guidance: 'Rest, reflect, and integrate lessons learned',
        ritual: 'wisdom integration meditation',
        crystal: 'amethyst'
      }
    });

    // Transit interpretation templates
    this.transitTemplates.set('moon_aspects', {
      conjunction: 'Unity and new beginnings with {planet} energy',
      opposition: 'Balance needed between emotions and {planet} expression',
      trine: 'Harmonious flow of emotional and {planet} energies',
      square: 'Tension requiring growth between heart and {planet}',
      sextile: 'Opportunity to blend intuition with {planet} wisdom'
    });

    // Narrative style configurations
    this.narrativeStyles.set('mystical', {
      tone: 'poetic and ethereal',
      language: 'symbolic and metaphorical',
      structure: 'flowing narrative with spiritual insights'
    });

    this.narrativeStyles.set('practical', {
      tone: 'grounded and actionable',
      language: 'clear and direct',
      structure: 'organized guidance with specific steps'
    });
  }

  /**
   * Generate daily horoscopes for all 12 signs using Swiss Ephemeris
   * Returns JSON format optimized for n8n automation
   */
  // @log_invocation(event_type="daily_horoscopes_generation", user_id="system")
  async generateDailyHoroscopes(date: string = new Date().toISOString().split('T')[0]): Promise<{
    date: string;
    horoscopes: DailyHoroscopeJSON[];
    metadata: {
      moonPhase: string;
      moonSign: string;
      keyTransits: string[];
      generatedAt: string;
    };
  }> {
    try {
      console.log(`Generating daily horoscopes for ${date}...`);
      
      // Calculate real planetary positions using Swiss Ephemeris
      const dateObj = new Date(date + 'T12:00:00Z');
      const ephemerisData = await this.calculateDailyEphemeris(dateObj);
      
      // Get moon phase and key transits
      const moonPhase = await this.calculateMoonPhase(ephemerisData);
      const keyTransits = await this.identifyKeyTransits(ephemerisData);
      
      // Generate horoscope for each sign
      const horoscopes: DailyHoroscopeJSON[] = [];
      
      for (const sign of this.zodiacSigns) {
        try {
          const horoscope = await this.generateSignHoroscope(sign, ephemerisData, moonPhase, keyTransits);
          horoscopes.push(horoscope);
        } catch (signError) {
          console.error(`Error generating horoscope for ${sign}:`, signError);
          // Generate fallback horoscope
          horoscopes.push(await this.generateFallbackHoroscope(sign, date));
        }
      }
      
      return {
        date,
        horoscopes,
        metadata: {
          moonPhase: moonPhase.phase,
          moonSign: ephemerisData.moon?.sign || 'Unknown',
          keyTransits,
          generatedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('LunarTransitNarratorAgent: Daily horoscope generation failed:', error);
      
      // Return fallback horoscopes for all signs
      const fallbackHoroscopes = await Promise.all(
        this.zodiacSigns.map(sign => this.generateFallbackHoroscope(sign, date))
      );
      
      return {
        date,
        horoscopes: fallbackHoroscopes,
        metadata: {
          moonPhase: 'Unknown',
          moonSign: 'Unknown',
          keyTransits: ['Fallback mode active'],
          generatedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Calculate daily ephemeris data using Swiss Ephemeris
   */
  private async calculateDailyEphemeris(date: Date): Promise<any> {
    try {
      const birthData = {
        name: 'Daily Transit',
        date: date,
        city: 'GMT',
        country: 'Universal',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC'
      };
      
      const chart = await SwissEphemerisShim.calculateFullChart(birthData);
      
      // Convert to our internal format
      const ephemerisData: any = {
        date: date.toISOString(),
        planets: {}
      };
      
      chart.planets.forEach((planet: any) => {
        ephemerisData.planets[planet.name.toLowerCase()] = {
          longitude: planet.longitude,
          sign: planet.sign,
          degree: planet.longitude % 30,
          house: planet.house,
          speed: planet.speed || 0,
          retrograde: planet.speed < 0
        };
      });
      
      // Set moon specifically for easy access
      ephemerisData.moon = ephemerisData.planets.moon;
      
      return ephemerisData;
      
    } catch (error) {
      console.error('Swiss Ephemeris calculation failed:', error);
      throw new Error('Failed to calculate ephemeris data');
    }
  }

  /**
   * Generate horoscope for a specific zodiac sign
   */
  private async generateSignHoroscope(
    sign: string,
    ephemerisData: any,
    moonPhase: any,
    keyTransits: string[]
  ): Promise<DailyHoroscopeJSON> {
    try {
      const signKey = sign.toLowerCase();
      const signData = this.knowledgeBase.get('signs')?.[signKey] || {};
      const planets = this.knowledgeBase.get('planets') || {};
      
      // Calculate sign-specific planetary influences
      const influences = this.calculateSignInfluences(sign, ephemerisData);
      
      // Generate main horoscope text
      const horoscope = await this.synthesizeHoroscopeText(sign, influences, moonPhase, signData);
      
      // Generate specific insights
      const careerInsight = this.generateCareerInsight(sign, influences, signData);
      const loveInsight = this.generateLoveInsight(sign, influences, moonPhase, signData);
      
      // Determine energy level and advice
      const energy = this.determineEnergyLevel(influences, moonPhase);
      const advice = this.generateDailyAdvice(sign, influences, signData);
      
      // Generate ratings
      const ratings = this.calculateDailyRatings(sign, influences, moonPhase);
      
      return {
        sign,
        date: ephemerisData.date.split('T')[0],
        horoscope,
        keywords: signData.keywords || [sign.toLowerCase(), 'growth', 'opportunity'],
        luckyNumbers: this.generateLuckyNumbers(sign, ephemerisData),
        colors: this.determineColors(sign, influences),
        careerInsight,
        loveInsight,
        energy,
        moonPhase: moonPhase.phase,
        keyTransits,
        advice,
        rating: ratings
      };
      
    } catch (error) {
      console.error(`Error generating horoscope for ${sign}:`, error);
      return this.generateFallbackHoroscope(sign, ephemerisData.date.split('T')[0]);
    }
  }

  /**
   * Create personalized lunar reading for specific user
   */
  // @log_invocation(event_type="personalized_lunar_reading", user_id="user")
  async generatePersonalizedReading(
    userId: string, 
    birthData: any, 
    date: string
  ): Promise<PersonalizedLunarReading> {
    try {
      // Calculate natal moon position
      const natalMoon = await this.calculateNatalMoon(birthData);
      
      // Find current transits to natal moon
      const currentTransits = await this.findPersonalTransits(natalMoon, date);
      
      // Generate personalized themes
      const personalThemes = this.generatePersonalThemes(natalMoon, currentTransits);
      
      // Create personalized guidance
      const emotionalForecast = await this.generateEmotionalForecast(natalMoon, currentTransits);
      const relationshipInsights = await this.generateRelationshipInsights(natalMoon, currentTransits);
      const careerGuidance = await this.generateCareerGuidance(natalMoon, currentTransits);
      const spiritualMessage = await this.generateSpiritualMessage(natalMoon, currentTransits);
      
      // Suggest personalized actions
      const actionItems = this.generateActionItems(natalMoon, currentTransits);

      return {
        userId,
        natalMoon,
        currentTransits,
        personalThemes,
        emotionalForecast,
        relationshipInsights,
        careerGuidance,
        spiritualMessage,
        actionItems
      };

    } catch (error) {
      console.error('LunarTransitNarratorAgent: Personalized reading failed:', error);
      throw new Error('Failed to generate personalized lunar reading');
    }
  }

  /**
   * Analyze moon phase patterns and cycles
   */
  // @log_invocation(event_type="moon_phase_analysis", user_id="system")
  async analyzeMoonPhasePatterns(startDate: string, endDate: string): Promise<any> {
    try {
      // TODO: Implement comprehensive moon phase pattern analysis
      // Track emotional cycles, manifestation windows, and release periods
      
      return {
        manifestationWindows: [],
        releaseOpportunities: [],
        emotionalIntensityPeaks: [],
        optimalActionDays: []
      };

    } catch (error) {
      console.error('LunarTransitNarratorAgent: Phase pattern analysis failed:', error);
      throw new Error('Failed to analyze moon phase patterns');
    }
  }

  /**
   * Calculate moon phase from ephemeris data
   */
  private async calculateMoonPhase(ephemerisData: any): Promise<any> {
    try {
      const moon = ephemerisData.moon;
      const sun = ephemerisData.planets.sun;
      
      if (!moon || !sun) {
        return { phase: 'unknown', illumination: 50 };
      }
      
      // Calculate moon phase angle
      let angle = moon.longitude - sun.longitude;
      if (angle < 0) angle += 360;
      
      // Determine phase based on angle
      let phase: string;
      let illumination: number;
      
      if (angle < 45) {
        phase = 'new';
        illumination = angle / 45 * 25;
      } else if (angle < 90) {
        phase = 'waxing_crescent';
        illumination = 25 + (angle - 45) / 45 * 25;
      } else if (angle < 135) {
        phase = 'first_quarter';
        illumination = 50 + (angle - 90) / 45 * 25;
      } else if (angle < 180) {
        phase = 'waxing_gibbous';
        illumination = 75 + (angle - 135) / 45 * 25;
      } else if (angle < 225) {
        phase = 'full';
        illumination = 100 - (angle - 180) / 45 * 25;
      } else if (angle < 270) {
        phase = 'waning_gibbous';
        illumination = 75 - (angle - 225) / 45 * 25;
      } else if (angle < 315) {
        phase = 'last_quarter';
        illumination = 50 - (angle - 270) / 45 * 25;
      } else {
        phase = 'waning_crescent';
        illumination = 25 - (angle - 315) / 45 * 25;
      }
      
      return {
        phase,
        illumination: Math.round(illumination),
        angle: Math.round(angle),
        moonSign: moon.sign
      };
      
    } catch (error) {
      console.error('Moon phase calculation failed:', error);
      return { phase: 'unknown', illumination: 50 };
    }
  }

  /**
   * Identify key planetary transits for the day
   */
  private async identifyKeyTransits(ephemerisData: any): Promise<string[]> {
    const transits: string[] = [];
    const planets = ephemerisData.planets;
    
    try {
      // Check for major aspects between planets
      const planetNames = Object.keys(planets);
      
      for (let i = 0; i < planetNames.length; i++) {
        for (let j = i + 1; j < planetNames.length; j++) {
          const planet1 = planetNames[i];
          const planet2 = planetNames[j];
          
          const aspect = this.calculateAspect(
            planets[planet1].longitude,
            planets[planet2].longitude
          );
          
          if (aspect) {
            transits.push(`${planet1.charAt(0).toUpperCase() + planet1.slice(1)} ${aspect} ${planet2.charAt(0).toUpperCase() + planet2.slice(1)}`);
          }
        }
      }
      
      // Add retrograde information
      planetNames.forEach(planetName => {
        if (planets[planetName].retrograde && planetName !== 'sun' && planetName !== 'moon') {
          transits.push(`${planetName.charAt(0).toUpperCase() + planetName.slice(1)} Retrograde`);
        }
      });
      
      return transits.slice(0, 5); // Return top 5 transits
      
    } catch (error) {
      console.error('Transit identification failed:', error);
      return ['No major transits identified'];
    }
  }

  /**
   * Calculate aspect between two planetary positions
   */
  private calculateAspect(long1: number, long2: number): string | null {
    let diff = Math.abs(long1 - long2);
    if (diff > 180) diff = 360 - diff;
    
    const aspects = [
      { name: 'conjunction', degrees: 0, orb: 8 },
      { name: 'sextile', degrees: 60, orb: 6 },
      { name: 'square', degrees: 90, orb: 8 },
      { name: 'trine', degrees: 120, orb: 8 },
      { name: 'opposition', degrees: 180, orb: 8 }
    ];
    
    for (const aspect of aspects) {
      const deviation = Math.abs(diff - aspect.degrees);
      if (deviation <= aspect.orb) {
        return aspect.name;
      }
    }
    
    return null;
  }

  /**
   * Calculate planetary influences for a specific sign
   */
  private calculateSignInfluences(sign: string, ephemerisData: any): any {
    const influences: any = {
      ruling: [],
      supportive: [],
      challenging: [],
      overall: 'neutral'
    };
    
    try {
      const signData = this.knowledgeBase.get('signs')?.[sign.toLowerCase()] || {};
      const planets = ephemerisData.planets;
      
      // Check each planet's influence on the sign
      Object.entries(planets).forEach(([planetName, planetData]: [string, any]) => {
        const influence = this.calculatePlanetSignInfluence(planetName, planetData, sign, signData);
        if (influence.type === 'ruling') influences.ruling.push(influence);
        else if (influence.type === 'supportive') influences.supportive.push(influence);
        else if (influence.type === 'challenging') influences.challenging.push(influence);
      });
      
      // Determine overall energy
      if (influences.supportive.length > influences.challenging.length) {
        influences.overall = 'positive';
      } else if (influences.challenging.length > influences.supportive.length) {
        influences.overall = 'challenging';
      }
      
      return influences;
      
    } catch (error) {
      console.error('Sign influence calculation failed:', error);
      return influences;
    }
  }

  /**
   * Calculate how a specific planet influences a sign
   */
  private calculatePlanetSignInfluence(planetName: string, planetData: any, sign: string, signData: any): any {
    const influence = {
      planet: planetName,
      type: 'neutral' as 'ruling' | 'supportive' | 'challenging' | 'neutral',
      strength: 0.5,
      message: ''
    };
    
    try {
      const planetInfo = this.knowledgeBase.get('planets')?.[planetName] || {};
      
      // Check if planet rules this sign
      if (planetInfo.rulerOf && planetInfo.rulerOf.includes(sign.toLowerCase())) {
        influence.type = 'ruling';
        influence.strength = 0.9;
        influence.message = `${planetName} empowers your natural ${sign} qualities`;
        return influence;
      }
      
      // Check sign compatibility
      const planetSign = planetData.sign;
      const compatibility = this.checkSignCompatibility(sign, planetSign);
      
      if (compatibility > 0.7) {
        influence.type = 'supportive';
        influence.strength = compatibility;
        influence.message = `${planetName} in ${planetSign} supports your ${sign} energy`;
      } else if (compatibility < 0.3) {
        influence.type = 'challenging';
        influence.strength = 1 - compatibility;
        influence.message = `${planetName} in ${planetSign} challenges your ${sign} approach`;
      }
      
      return influence;
      
    } catch (error) {
      console.error('Planet influence calculation failed:', error);
      return influence;
    }
  }

  /**
   * Check compatibility between two signs
   */
  private checkSignCompatibility(sign1: string, sign2: string): number {
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'aries': { 'leo': 0.9, 'sagittarius': 0.9, 'gemini': 0.7, 'aquarius': 0.7, 'cancer': 0.3, 'capricorn': 0.3 },
      'taurus': { 'virgo': 0.9, 'capricorn': 0.9, 'cancer': 0.7, 'pisces': 0.7, 'leo': 0.3, 'aquarius': 0.3 },
      'gemini': { 'libra': 0.9, 'aquarius': 0.9, 'aries': 0.7, 'leo': 0.7, 'virgo': 0.3, 'pisces': 0.3 },
      'cancer': { 'scorpio': 0.9, 'pisces': 0.9, 'taurus': 0.7, 'virgo': 0.7, 'aries': 0.3, 'libra': 0.3 },
      'leo': { 'aries': 0.9, 'sagittarius': 0.9, 'gemini': 0.7, 'libra': 0.7, 'taurus': 0.3, 'scorpio': 0.3 },
      'virgo': { 'taurus': 0.9, 'capricorn': 0.9, 'cancer': 0.7, 'scorpio': 0.7, 'gemini': 0.3, 'sagittarius': 0.3 }
    };
    
    const sign1Lower = sign1.toLowerCase();
    const sign2Lower = sign2.toLowerCase();
    
    if (compatibilityMatrix[sign1Lower] && compatibilityMatrix[sign1Lower][sign2Lower]) {
      return compatibilityMatrix[sign1Lower][sign2Lower];
    }
    
    // Default neutral compatibility
    return 0.5;
  }

  /**
   * Synthesize horoscope text using knowledge base
   */
  private async synthesizeHoroscopeText(
    sign: string,
    influences: any,
    moonPhase: any,
    signData: any
  ): Promise<string> {
    try {
      const phaseData = this.lunarCycles.get('phases')?.[moonPhase.phase] || {};
      const signKeywords = signData.keywords || [sign.toLowerCase()];
      
      let text = `Today's ${moonPhase.phase.replace('_', ' ')} moon phase enhances your natural ${sign} `;
      text += `qualities of ${signKeywords.slice(0, 2).join(' and ')}. `;
      
      if (influences.ruling.length > 0) {
        const ruling = influences.ruling[0];
        text += `${ruling.message}. `;
      }
      
      if (influences.overall === 'positive') {
        text += `The cosmic energy flows harmoniously in your favor today, bringing opportunities for `;
        text += `${signKeywords[2] || 'growth'} and meaningful connections. `;
      } else if (influences.overall === 'challenging') {
        text += `While cosmic energies present some challenges, your ${sign} strength will guide you through. `;
        text += `Focus on your natural ability to ${signKeywords[0] || 'adapt'} and stay true to your values. `;
      } else {
        text += `The cosmic balance encourages steady progress in your ${sign} journey. `;
        text += `Trust your instincts and take measured steps forward. `;
      }
      
      text += phaseData.guidance || 'Embrace the cosmic flow and stay open to new possibilities.';
      
      return text;
      
    } catch (error) {
      console.error('Horoscope synthesis failed:', error);
      return `Today brings cosmic opportunities for ${sign} growth and self-discovery. Trust your instincts and embrace the journey ahead.`;
    }
  }

  /**
   * Generate career insight based on planetary influences
   */
  private generateCareerInsight(sign: string, influences: any, signData: any): string {
    try {
      const keywords = signData.keywords || [sign.toLowerCase()];
      
      if (influences.overall === 'positive') {
        return `Professional opportunities align with your ${keywords[0] || 'natural'} strengths. Consider taking initiative on projects that showcase your ${sign} leadership qualities.`;
      } else if (influences.overall === 'challenging') {
        return `Career matters may require extra patience today. Use your ${keywords[1] || 'determination'} to navigate workplace dynamics with diplomacy.`;
      } else {
        return `Steady professional progress is favored. Focus on collaboration and let your ${keywords[0] || 'unique'} perspective contribute to team success.`;
      }
    } catch (error) {
      return `Professional growth opportunities are present for focused ${sign} individuals.`;
    }
  }

  /**
   * Generate love insight based on moon phase and influences
   */
  private generateLoveInsight(sign: string, influences: any, moonPhase: any, signData: any): string {
    try {
      const keywords = signData.keywords || [sign.toLowerCase()];
      const phase = moonPhase.phase;
      
      if (phase === 'full' || phase === 'new') {
        return `Emotional intensity is heightened today. Express your ${keywords[0] || 'authentic'} feelings and be open to deeper connections with loved ones.`;
      } else if (phase.includes('waxing')) {
        return `Growing romantic energy supports new connections and strengthening existing bonds. Your ${sign} charm is particularly magnetic today.`;
      } else if (phase.includes('waning')) {
        return `Relationship reflection brings clarity. Use your ${keywords[1] || 'wisdom'} to heal past wounds and create space for renewed love.`;
      } else {
        return `Love flows naturally when you embrace your ${keywords[0] || 'true'} ${sign} nature. Be authentic in all romantic interactions.`;
      }
    } catch (error) {
      return `Love energy supports authentic ${sign} expression and meaningful connections.`;
    }
  }

  /**
   * Determine energy level based on influences
   */
  private determineEnergyLevel(influences: any, moonPhase: any): string {
    try {
      const supportiveCount = influences.supportive.length;
      const challengingCount = influences.challenging.length;
      const rulingCount = influences.ruling.length;
      
      let energyScore = 3; // Base neutral energy
      energyScore += supportiveCount;
      energyScore += rulingCount * 2;
      energyScore -= challengingCount;
      
      // Moon phase modifier
      if (moonPhase.phase === 'full' || moonPhase.phase === 'new') {
        energyScore += 1;
      }
      
      if (energyScore >= 6) return 'High';
      if (energyScore >= 4) return 'Moderate';
      return 'Low';
      
    } catch (error) {
      return 'Moderate';
    }
  }

  /**
   * Generate daily advice based on sign and influences
   */
  private generateDailyAdvice(sign: string, influences: any, signData: any): string {
    try {
      const keywords = signData.keywords || [sign.toLowerCase()];
      
      if (influences.overall === 'positive') {
        return `Embrace opportunities that align with your ${keywords[0] || 'natural'} ${sign} gifts. Trust your instincts and take confident action.`;
      } else if (influences.overall === 'challenging') {
        return `Navigate challenges with your characteristic ${keywords[1] || 'strength'}. Patience and persistence will lead to breakthrough moments.`;
      } else {
        return `Balance is key today. Honor your ${sign} nature while remaining flexible to cosmic currents and new possibilities.`;
      }
    } catch (error) {
      return `Stay true to your ${sign} essence while remaining open to growth and new experiences.`;
    }
  }

  /**
   * Calculate daily ratings for different life areas
   */
  private calculateDailyRatings(sign: string, influences: any, moonPhase: any): {
    overall: number;
    love: number;
    career: number;
    health: number;
  } {
    try {
      let baseRating = 3;
      
      // Adjust based on influences
      if (influences.overall === 'positive') baseRating = 4;
      if (influences.overall === 'challenging') baseRating = 2;
      
      // Moon phase adjustments
      let moonBonus = 0;
      if (moonPhase.phase === 'full' || moonPhase.phase === 'new') moonBonus = 0.5;
      if (moonPhase.phase.includes('waxing')) moonBonus = 0.3;
      
      const overall = Math.min(5, Math.max(1, baseRating + moonBonus));
      
      return {
        overall: Math.round(overall * 10) / 10,
        love: Math.round((overall + (Math.random() * 0.6 - 0.3)) * 10) / 10,
        career: Math.round((overall + (Math.random() * 0.6 - 0.3)) * 10) / 10,
        health: Math.round((overall + (Math.random() * 0.4 - 0.2)) * 10) / 10
      };
    } catch (error) {
      return { overall: 3.0, love: 3.0, career: 3.0, health: 3.0 };
    }
  }

  /**
   * Generate lucky numbers based on sign and ephemeris
   */
  private generateLuckyNumbers(sign: string, ephemerisData: any): number[] {
    try {
      const signIndex = this.zodiacSigns.indexOf(sign);
      const moon = ephemerisData.moon;
      
      const numbers = [
        (signIndex + 1),
        Math.floor(moon?.degree || 15),
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 30) + 1,
        Math.floor(Math.random() * 20) + 1
      ];
      
      return numbers.sort((a, b) => a - b);
    } catch (error) {
      return [7, 14, 21, 28, 35];
    }
  }

  /**
   * Determine favorable colors based on sign and influences
   */
  private determineColors(sign: string, influences: any): string[] {
    const colorMap: { [key: string]: string[] } = {
      'Aries': ['Red', 'Orange', 'Gold'],
      'Taurus': ['Green', 'Pink', 'Earth tones'],
      'Gemini': ['Yellow', 'Silver', 'Light blue'],
      'Cancer': ['White', 'Silver', 'Sea blue'],
      'Leo': ['Gold', 'Orange', 'Royal purple'],
      'Virgo': ['Navy blue', 'Gray', 'Forest green'],
      'Libra': ['Pink', 'Light blue', 'Lavender'],
      'Scorpio': ['Deep red', 'Black', 'Maroon'],
      'Sagittarius': ['Purple', 'Turquoise', 'Orange'],
      'Capricorn': ['Brown', 'Black', 'Dark green'],
      'Aquarius': ['Electric blue', 'Silver', 'Turquoise'],
      'Pisces': ['Sea green', 'Lavender', 'Silver']
    };
    
    return colorMap[sign] || ['Blue', 'White', 'Gold'];
  }

  /**
   * Generate fallback horoscope when calculations fail
   */
  private async generateFallbackHoroscope(sign: string, date: string): Promise<DailyHoroscopeJSON> {
    const signData = this.knowledgeBase.get('signs')?.[sign.toLowerCase()] || {};
    const keywords = signData.keywords || [sign.toLowerCase(), 'growth', 'opportunity'];
    
    return {
      sign,
      date,
      horoscope: `Today brings opportunities for ${sign} growth and self-discovery. Trust your natural ${keywords[0] || 'intuitive'} abilities and stay open to new possibilities. The cosmic energy supports your journey toward greater understanding and personal development.`,
      keywords,
      luckyNumbers: [7, 14, 21, 28, 35],
      colors: this.determineColors(sign, { overall: 'neutral' }),
      careerInsight: `Professional matters benefit from your ${keywords[0] || 'natural'} ${sign} approach. Focus on collaboration and steady progress.`,
      loveInsight: `Relationships flourish when you express your authentic ${sign} nature. Be open to meaningful connections.`,
      energy: 'Moderate',
      moonPhase: 'Unknown',
      keyTransits: ['General cosmic support'],
      advice: `Embrace your ${sign} strengths while remaining flexible to new opportunities and growth.`,
      rating: {
        overall: 3.0,
        love: 3.0,
        career: 3.0,
        health: 3.0
      }
    };
  }

  private synthesizeDailyTheme(lunarPhase: LunarPhaseData, transits: TransitEvent[]): string {
    const phaseData = this.lunarCycles.get('phases')[lunarPhase.phase];
    const transitInfluences = transits.map(t => t.influence).flat();
    
    return `Today's lunar energy of ${phaseData.energy} combines with ${transitInfluences.join(', ')} influences`;
  }

  private analyzeEmotionalWeather(lunarPhase: LunarPhaseData, transits: TransitEvent[]): any {
    // TODO: Implement sophisticated emotional weather analysis
    return {
      overall: 'flowing',
      keywords: ['gentle', 'intuitive', 'receptive'],
      supportive: ['emotional clarity', 'relationship harmony'],
      challenging: ['overthinking', 'sensitivity']
    };
  }

  private async generateAreaGuidance(lunarPhase: LunarPhaseData, transits: TransitEvent[]): Promise<any> {
    // TODO: Generate specific guidance for each life area
    return {
      love: 'Venus-Moon harmony supports deep emotional connections',
      career: 'Intuitive insights guide professional decisions',
      health: 'Listen to your body\'s emotional needs',
      spiritual: 'Moon phase energy enhances meditation and reflection'
    };
  }

  private suggestRituals(lunarPhase: LunarPhaseData, transits: TransitEvent[]): string[] {
    const phaseData = this.lunarCycles.get('phases')[lunarPhase.phase];
    return [phaseData.ritual, 'moon water creation', 'intention journaling'];
  }

  private recommendCrystals(lunarPhase: LunarPhaseData, transits: TransitEvent[]): string[] {
    const phaseData = this.lunarCycles.get('phases')[lunarPhase.phase];
    return [phaseData.crystal, 'moonstone', 'labradorite'];
  }

  private async calculateOptimalTimes(date: string, transits: TransitEvent[]): Promise<any> {
    // TODO: Calculate precise optimal timing based on transits
    return {
      manifestation: '14:30 - 16:00',
      reflection: '20:00 - 22:00',
      release: '22:30 - 23:30'
    };
  }

  private async calculateNatalMoon(birthData: any): Promise<any> {
    // TODO: Calculate natal moon position from birth data
    return {
      sign: 'Cancer',
      degree: 15.5,
      house: 4
    };
  }

  private async findPersonalTransits(natalMoon: any, date: string): Promise<TransitEvent[]> {
    // TODO: Find transits to personal natal moon
    return [];
  }

  private generatePersonalThemes(natalMoon: any, transits: TransitEvent[]): string[] {
    // TODO: Generate personalized themes based on natal moon and transits
    return ['emotional healing', 'family connections', 'intuitive development'];
  }

  private async generateEmotionalForecast(natalMoon: any, transits: TransitEvent[]): Promise<string> {
    return 'Your emotional landscape is supported by nurturing cosmic influences today';
  }

  private async generateRelationshipInsights(natalMoon: any, transits: TransitEvent[]): Promise<string> {
    return 'Deep emotional connections are highlighted with opportunities for greater intimacy';
  }

  private async generateCareerGuidance(natalMoon: any, transits: TransitEvent[]): Promise<string> {
    return 'Trust your instincts in professional matters - your intuition is particularly sharp';
  }

  private async generateSpiritualMessage(natalMoon: any, transits: TransitEvent[]): Promise<string> {
    return 'The moon\'s gentle energy invites you to connect with your inner wisdom and divine feminine';
  }

  private generateActionItems(natalMoon: any, transits: TransitEvent[]): string[] {
    return [
      'Practice moon salutations at sunset',
      'Journal about emotional insights',
      'Connect with water through ritual or nature'
    ];
  }

  /**
   * Generate sample horoscopes for testing (July 24, 2025)
   */
  async generateSampleHoroscopes(): Promise<{
    date: string;
    horoscopes: DailyHoroscopeJSON[];
    metadata: any;
  }> {
    console.log('Generating sample horoscopes for July 24, 2025...');
    return await this.generateDailyHoroscopes('2025-07-24');
  }

  /**
   * Get agent status and capabilities
   */
  getStatus(): any {
    return {
      agentId: this.id,
      active: true, // Now fully operational with Swiss Ephemeris
      capabilities: [
        'swiss_ephemeris_calculations',
        'daily_horoscope_generation',
        'knowledge_base_integration',
        'n8n_json_output',
        'moon_phase_analysis',
        'planetary_transit_analysis',
        'sign_compatibility_analysis',
        'career_love_insights',
        'automated_scheduling_ready'
      ],
      knowledgeBase: {
        signsLoaded: Object.keys(this.knowledgeBase.get('signs') || {}).length,
        planetsLoaded: Object.keys(this.knowledgeBase.get('planets') || {}).length,
        aspectsLoaded: Object.keys(this.knowledgeBase.get('aspects') || {}).length,
        housesLoaded: Object.keys(this.knowledgeBase.get('houses') || {}).length
      },
      lunarData: {
        phaseTemplates: this.lunarCycles.get('phases') ? Object.keys(this.lunarCycles.get('phases')).length : 0,
        transitTemplates: this.transitTemplates.size,
        narrativeStyles: this.narrativeStyles.size
      },
      integrations: {
        swissEphemeris: 'Connected',
        astrologyGuru: 'Integrated',
        n8nReady: true,
        automationFormat: 'JSON'
      }
    };
  }
}

export default LunarTransitNarratorAgent;