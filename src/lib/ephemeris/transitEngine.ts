/**
 * Transit Engine - Real-time planetary movement analysis
 * Uses Swiss Ephemeris for accurate astronomical calculations
 */
import { AstronomicalCalculator } from '@/lib/astrology/AstronomicalCalculator';
import { SwissEphemerisShim } from '@/lib/astrology/SwissEphemerisShim';
import { BirthData, Planet, AspectType, HouseSystem } from '../../types/astrology';
export interface PlanetaryPosition {
  planet: Planet;
  longitude: number;
  latitude?: number;
  distance?: number;
  speed: number;
  sign: string;
  house?: number;
  retrograde: boolean;
}
export interface TransitAspect {
  transitPlanet: Planet;
  natalPlanet: Planet;
  aspect: AspectType;
  orb: number;
  exactDate: Date;
  applying: boolean;
  separating: boolean;
  strength: 'strong' | 'moderate' | 'weak';
}
export interface DailyTransit {
  date: Date;
  planetaryPositions: PlanetaryPosition[];
  majorAspects: TransitAspect[];
  lunarPhase: {
    phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
    illumination: number;
    nextPhaseDate: Date;
  };
  cosmicWeather: {
    energy: 'high' | 'medium' | 'low';
    focus: string[];
    challenges: string[];
    opportunities: string[];
  };
}
export interface PersonalizedHoroscope {
  date: Date;
  overallTheme: string;
  keyTransits: TransitAspect[];
  dailyGuidance: {
    love: string;
    career: string;
    health: string;
    spiritual: string;
  };
  luckyNumbers: number[];
  affirmation: string;
  bestTimeOfDay: string;
}
export class TransitEngine {
  private astroCalc: AstronomicalCalculator;
  private ephemeris: SwissEphemerisShim;
  constructor() {
    this.astroCalc = new AstronomicalCalculator();
    this.ephemeris = new SwissEphemerisShim();
  }
  /**
   * Calculate current planetary positions
   */
  async getCurrentPlanetaryPositions(): Promise<PlanetaryPosition[]> {
    const today = new Date();
    const positions: PlanetaryPosition[] = [];
    
    const planets: Planet[] = [
      'sun', 'moon', 'mercury', 'venus', 'mars', 
      'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
    ];
    for (const planet of planets) {
      try {
        const position = await AstronomicalCalculator.calculatePlanetaryPosition(planet, today);
        const speed = await this.calculatePlanetarySpeed(planet, today, position);
        const sign = this.getZodiacSign(position.longitude);
        
        positions.push({
          planet,
          longitude: position.longitude,
          latitude: position.latitude,
          distance: position.distance,
          speed,
          sign,
          retrograde: speed < 0
        });
      } catch (error) {
        console.warn(`Failed to get position for ${planet}:`, error);
        // Fallback to approximate position
        positions.push(this.getFallbackPosition(planet, today));
      }
    }
    return positions;
  }
  /**
   * Calculate planetary speed (degrees per day)
   */
  private async calculatePlanetarySpeed(planet: Planet, date: Date, position?: { longitude: number; latitude: number; distance: number; speed?: number }): Promise<number> {
    // If position already includes speed, use it
    if (position && typeof position.speed === 'number') {
      return position.speed;
    }
    
    try {
      const today = await AstronomicalCalculator.calculatePlanetaryPosition(planet, date);
      // If the position includes speed, use it
      if (typeof today.speed === 'number') {
        return today.speed;
      }
      
      // Otherwise calculate speed from positions
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextDay = await AstronomicalCalculator.calculatePlanetaryPosition(planet, tomorrow);
      
      let speed = nextDay.longitude - today.longitude;
      
      // Handle crossing 0° Aries
      if (speed < -300) speed += 360;
      if (speed > 300) speed -= 360;
      
      return speed;
    } catch (error) {
      // Fallback average speeds (degrees per day)
      const averageSpeeds: Record<Planet, number> = {
        sun: 0.9856,
        moon: 13.1764,
        mercury: 1.59,
        venus: 1.21,
        mars: 0.64,
        jupiter: 0.083,
        saturn: 0.033,
        uranus: 0.011,
        neptune: 0.006,
        pluto: 0.004
      };
      return averageSpeeds[planet] || 0.5;
    }
  }
  /**
   * Get zodiac sign from longitude
   */
  private getZodiacSign(longitude: number): string {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex] || 'Aries';
  }
  /**
   * Calculate transits to natal chart
   */
  async calculateTransits(birthData: BirthData, targetDate: Date = new Date()): Promise<TransitAspect[]> {
    try {
      const transitPositions = await this.getCurrentPlanetaryPositions();
      // Use SwissEphemerisShim instead since AstronomicalCalculator doesn't have calculateBirthChart
      const SwissEphemerisShim = (await import('@/lib/astrology/SwissEphemerisShim')).SwissEphemerisShim;
      const natalChart = await SwissEphemerisShim.calculateFullChart(birthData);
      const aspects: TransitAspect[] = [];
      for (const transitPos of transitPositions) {
        // natalChart.planets is an array, not an object
        for (const planetData of natalChart.planets) {
          const natalLongitude = planetData?.longitude;
          if (natalLongitude === undefined) continue;
          
          const natalPlanet = planetData.name as Planet;
          const aspect = this.calculateAspect(transitPos.longitude, natalLongitude);
          if (aspect) {
            const orb = this.calculateOrb(transitPos.longitude, natalLongitude, aspect.type);
            
            if (orb <= this.getMaxOrb(aspect.type)) {
              aspects.push({
                transitPlanet: transitPos.planet,
                natalPlanet,
                aspect: aspect.type,
                orb,
                exactDate: this.calculateExactAspectDate(transitPos, natalLongitude, aspect.type),
                applying: transitPos.speed > 0 ? orb > 0 : orb < 0,
                separating: transitPos.speed > 0 ? orb < 0 : orb > 0,
                strength: orb <= 1 ? 'strong' : orb <= 3 ? 'moderate' : 'weak'
              });
            }
          }
        }
      }
      return aspects.sort((a, b) => a.orb - b.orb);
    } catch (error) {
      console.warn('Failed to calculate transits:', error);
      return [];
    }
  }
  /**
   * Calculate aspect between two planetary positions
   */
  private calculateAspect(longitude1: number, longitude2: number): { type: AspectType; angle: number } | null {
    let diff = Math.abs(longitude1 - longitude2);
    if (diff > 180) diff = 360 - diff;
    const aspects = [
      { type: 'conjunction' as AspectType, angle: 0, orb: 8 },
      { type: 'sextile' as AspectType, angle: 60, orb: 4 },
      { type: 'square' as AspectType, angle: 90, orb: 6 },
      { type: 'trine' as AspectType, angle: 120, orb: 6 },
      { type: 'opposition' as AspectType, angle: 180, orb: 8 }
    ];
    for (const aspect of aspects) {
      if (Math.abs(diff - aspect.angle) <= aspect.orb) {
        return { type: aspect.type, angle: aspect.angle };
      }
    }
    return null;
  }
  /**
   * Calculate orb (exactness) of aspect
   */
  private calculateOrb(longitude1: number, longitude2: number, aspectType: AspectType): number {
    let diff = longitude1 - longitude2;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const aspectAngles = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180
    };
    const targetAngle = aspectAngles[aspectType];
    return Math.abs(Math.abs(diff) - targetAngle);
  }
  /**
   * Get maximum orb for aspect type
   */
  private getMaxOrb(aspectType: AspectType): number {
    const orbs = {
      conjunction: 8,
      sextile: 4,
      square: 6,
      trine: 6,
      opposition: 8
    };
    return orbs[aspectType] || 3;
  }
  /**
   * Calculate exact date when aspect becomes exact
   */
  private calculateExactAspectDate(transitPos: PlanetaryPosition, natalLongitude: number, aspectType: AspectType): Date {
    const aspectAngles = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180
    };
    const targetAngle = aspectAngles[aspectType];
    let diff = transitPos.longitude - natalLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const currentAngle = Math.abs(diff);
    const degreesToTarget = Math.abs(currentAngle - targetAngle);
    const daysToExact = degreesToTarget / Math.abs(transitPos.speed);
    const exactDate = new Date();
    exactDate.setDate(exactDate.getDate() + daysToExact);
    return exactDate;
  }
  /**
   * Generate daily transit report
   */
  async getDailyTransit(date: Date = new Date()): Promise<DailyTransit> {
    const planetaryPositions = await this.getCurrentPlanetaryPositions();
    const lunarPhase = await this.calculateLunarPhase(date);
    const cosmicWeather = this.analyzeCosmicWeather(planetaryPositions);
    return {
      date,
      planetaryPositions,
      majorAspects: [], // Will be populated when natal chart is available
      lunarPhase,
      cosmicWeather
    };
  }
  /**
   * Calculate lunar phase
   */
  private async calculateLunarPhase(date: Date) {
    try {
      const sunPos = await AstronomicalCalculator.calculatePlanetaryPosition('sun', date);
      const moonPos = await AstronomicalCalculator.calculatePlanetaryPosition('moon', date);
      
      let diff = moonPos.longitude - sunPos.longitude;
      if (diff < 0) diff += 360;
      const phases = [
        { name: 'new', min: 0, max: 22.5 },
        { name: 'waxing_crescent', min: 22.5, max: 67.5 },
        { name: 'first_quarter', min: 67.5, max: 112.5 },
        { name: 'waxing_gibbous', min: 112.5, max: 157.5 },
        { name: 'full', min: 157.5, max: 202.5 },
        { name: 'waning_gibbous', min: 202.5, max: 247.5 },
        { name: 'last_quarter', min: 247.5, max: 292.5 },
        { name: 'waning_crescent', min: 292.5, max: 337.5 },
        { name: 'new', min: 337.5, max: 360 }
      ];
      const currentPhase = phases.find(phase => diff >= phase.min && diff < phase.max) || phases[0];
      const illumination = (1 - Math.cos(diff * Math.PI / 180)) / 2;
      // Calculate next phase date (simplified)
      const nextPhaseDate = new Date(date);
      nextPhaseDate.setDate(nextPhaseDate.getDate() + 7);
      return {
        phase: currentPhase.name as any,
        illumination: Math.round(illumination * 100) / 100,
        nextPhaseDate
      };
    } catch (error) {
      return {
        phase: 'new' as any,
        illumination: 0.5,
        nextPhaseDate: new Date()
      };
    }
  }
  /**
   * Analyze cosmic weather patterns
   */
  private analyzeCosmicWeather(positions: PlanetaryPosition[]) {
    const retrogradeCount = positions.filter(p => p.retrograde).length;
    const fastMovingPlanets = positions.filter(p => Math.abs(p.speed) > 1).length;
    
    let energy: 'high' | 'medium' | 'low' = 'medium';
    const focus: string[] = [];
    const challenges: string[] = [];
    const opportunities: string[] = [];
    // Analyze energy level
    if (fastMovingPlanets >= 3) energy = 'high';
    if (retrogradeCount >= 3) energy = 'low';
    // Analyze retrograde effects
    if (retrogradeCount > 0) {
      challenges.push('Retrograde energy calls for patience and reflection');
      focus.push('Review and revision');
    }
    // Analyze planetary positions
    const fireSignPlanets = positions.filter(p => ['Aries', 'Leo', 'Sagittarius'].includes(p.sign)).length;
    const earthSignPlanets = positions.filter(p => ['Taurus', 'Virgo', 'Capricorn'].includes(p.sign)).length;
    const airSignPlanets = positions.filter(p => ['Gemini', 'Libra', 'Aquarius'].includes(p.sign)).length;
    const waterSignPlanets = positions.filter(p => ['Cancer', 'Scorpio', 'Pisces'].includes(p.sign)).length;
    if (fireSignPlanets >= 3) {
      focus.push('Action and initiative');
      opportunities.push('Leadership opportunities');
    }
    if (earthSignPlanets >= 3) {
      focus.push('Practical matters');
      opportunities.push('Material progress');
    }
    if (airSignPlanets >= 3) {
      focus.push('Communication and ideas');
      opportunities.push('Networking and learning');
    }
    if (waterSignPlanets >= 3) {
      focus.push('Emotions and intuition');
      opportunities.push('Spiritual insights');
    }
    return {
      energy,
      focus,
      challenges,
      opportunities
    };
  }
  /**
   * Generate personalized horoscope
   */
  async generatePersonalizedHoroscope(birthData: BirthData, date: Date = new Date()): Promise<PersonalizedHoroscope> {
    const transits = await this.calculateTransits(birthData, date);
    const dailyTransit = await this.getDailyTransit(date);
    
    // Select key transits (most exact and significant)
    const keyTransits = transits
      .filter(t => t.strength === 'strong' || t.strength === 'moderate')
      .slice(0, 3);
    // Generate guidance based on transits
    const guidance = this.generateGuidanceFromTransits(keyTransits, dailyTransit);
    
    return {
      date,
      overallTheme: this.generateOverallTheme(keyTransits, dailyTransit),
      keyTransits,
      dailyGuidance: guidance,
      luckyNumbers: this.generateLuckyNumbers(date, birthData),
      affirmation: this.generateAffirmation(keyTransits),
      bestTimeOfDay: this.getBestTimeOfDay(dailyTransit)
    };
  }
  /**
   * Generate overall theme for the day
   */
  private generateOverallTheme(transits: TransitAspect[], dailyTransit: DailyTransit): string {
    if (transits.length === 0) {
      return `A day of ${dailyTransit.cosmicWeather.energy} cosmic energy. Focus on ${dailyTransit.cosmicWeather.focus[0] || 'personal growth'}.`;
    }
    const majorTransit = transits[0];
    const themes = {
      conjunction: 'new beginnings and focused energy',
      sextile: 'harmonious opportunities and easy flow',
      square: 'challenges that catalyze growth',
      trine: 'natural talents and favorable conditions',
      opposition: 'balance and integration of opposites'
    };
    return `${majorTransit.transitPlanet} ${majorTransit.aspect} ${majorTransit.natalPlanet} brings ${themes[majorTransit.aspect]}. ${dailyTransit.cosmicWeather.energy === 'high' ? 'High energy day' : dailyTransit.cosmicWeather.energy === 'low' ? 'Reflective day' : 'Balanced energy'}.`;
  }
  /**
   * Generate daily guidance from transits
   */
  private generateGuidanceFromTransits(transits: TransitAspect[], dailyTransit: DailyTransit) {
    const defaultGuidance = {
      love: 'Open your heart to unexpected connections and deeper understanding.',
      career: 'Focus on your long-term goals and take practical steps forward.',
      health: 'Listen to your body and prioritize rest and nourishment.',
      spiritual: 'Trust your intuition and seek moments of quiet reflection.'
    };
    if (transits.length === 0) return defaultGuidance;
    const guidance = { ...defaultGuidance };
    
    for (const transit of transits) {
      if (transit.transitPlanet === 'venus' || transit.natalPlanet === 'venus') {
        guidance.love = transit.aspect === 'conjunction' || transit.aspect === 'trine' ?
          'Love energy is heightened. Express affection and enjoy beautiful moments.' :
          'Relationship dynamics may need attention. Practice patience and understanding.';
      }
      
      if (transit.transitPlanet === 'mars' || transit.natalPlanet === 'mars') {
        guidance.career = transit.aspect === 'conjunction' || transit.aspect === 'trine' ?
          'Dynamic energy supports bold career moves and leadership.' :
          'Channel competitive energy constructively. Avoid conflicts at work.';
      }
      
      if (transit.transitPlanet === 'moon' || transit.natalPlanet === 'moon') {
        guidance.health = 'Pay attention to emotional well-being. Your feelings are especially important today.';
      }
      
      if (transit.transitPlanet === 'jupiter' || transit.natalPlanet === 'jupiter') {
        guidance.spiritual = 'Opportunities for growth and expansion. Stay open to new perspectives.';
      }
    }
    return guidance;
  }
  /**
   * Generate lucky numbers based on birth data and date
   */
  private generateLuckyNumbers(date: Date, birthData: BirthData): number[] {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const birthDay = new Date(birthData.birthDate).getDate();
    const birthMonth = new Date(birthData.birthDate).getMonth() + 1;
    
    return [
      day,
      month,
      birthDay,
      birthMonth,
      (day + birthDay) % 9 + 1,
      (month + birthMonth) % 9 + 1
    ].slice(0, 6);
  }
  /**
   * Generate affirmation based on transits
   */
  private generateAffirmation(transits: TransitAspect[]): string {
    const affirmations = [
      'I trust the perfect timing of the universe.',
      'I am aligned with my highest purpose.',
      'I embrace change as an opportunity for growth.',
      'I am open to the abundance flowing into my life.',
      'I trust my intuition to guide me forward.',
      'I radiate love and attract positive experiences.',
      'I am exactly where I need to be in this moment.'
    ];
    if (transits.length === 0) {
      return affirmations[Math.floor(Math.random() * affirmations.length)];
    }
    const majorTransit = transits[0];
    if (majorTransit.aspect === 'conjunction') {
      return 'I embrace new beginnings with confidence and clarity.';
    } else if (majorTransit.aspect === 'trine') {
      return 'I am in harmony with the natural flow of life.';
    } else if (majorTransit.aspect === 'square') {
      return 'I transform challenges into opportunities for growth.';
    } else {
      return affirmations[Math.floor(Math.random() * affirmations.length)];
    }
  }
  /**
   * Determine best time of day based on cosmic weather
   */
  private getBestTimeOfDay(dailyTransit: DailyTransit): string {
    const times = ['Early morning', 'Late morning', 'Afternoon', 'Evening', 'Night'];
    
    if (dailyTransit.cosmicWeather.energy === 'high') {
      return 'Late morning';
    } else if (dailyTransit.cosmicWeather.energy === 'low') {
      return 'Evening';
    } else {
      return 'Afternoon';
    }
  }
  /**
   * Fallback position when ephemeris fails
   */
  private getFallbackPosition(planet: Planet, date: Date): PlanetaryPosition {
    // Simple fallback based on approximate positions
    const approximatePositions = {
      sun: (date.getMonth() * 30 + date.getDate()) % 360,
      moon: (date.getDate() * 13) % 360,
      mercury: (date.getMonth() * 25 + date.getDate() * 2) % 360,
      venus: (date.getMonth() * 20 + date.getDate() * 1.5) % 360,
      mars: (date.getMonth() * 15 + date.getDate() * 0.5) % 360,
      jupiter: (date.getFullYear() % 12) * 30,
      saturn: (date.getFullYear() % 29) * 12.4,
      uranus: (date.getFullYear() % 84) * 4.3,
      neptune: (date.getFullYear() % 165) * 2.2,
      pluto: (date.getFullYear() % 248) * 1.5
    };
    const longitude = approximatePositions[planet] || 0;
    return {
      planet,
      longitude,
      speed: 0.5,
      sign: this.getZodiacSign(longitude),
      retrograde: false
    };
  }
}
