/**
 * Cosmic Weather API for Mystic Arcana
 * 
 * Combines astronomical data with spiritual interpretations
 * to provide real-time cosmic influence calculations.
 */

import {
  CosmicInfluenceData,
  PlanetaryData,
  AspectData,
  MoonPhaseData,
  GeoLocation,
  Planet,
  AspectType,
  CosmicWeatherType
} from './types';
import { SwissEphemerisBridge } from './SwissEphemerisBridge';

export class CosmicWeatherAPI {
  private ephemerisBridge: SwissEphemerisBridge;
  private cache: Map<string, { data: CosmicInfluenceData; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.ephemerisBridge = new SwissEphemerisBridge();
  }

  /**
   * Calculate comprehensive cosmic weather for a given time and location
   */
  async calculateCosmicWeather(
    time: Date,
    location: GeoLocation
  ): Promise<CosmicInfluenceData> {
    const cacheKey = `cosmic_weather_${time.getTime()}_${location.lat}_${location.lon}`;

    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get planetary positions
      const planets = await this.ephemerisBridge.getPlanetaryPositions(time, location);

      // Calculate aspects
      const aspects = await this.ephemerisBridge.calculateAspects(planets);

      // Get moon phase
      const moonPhase = await this.ephemerisBridge.getMoonPhase(time);

      // Detect retrogrades
      const retrogrades = await this.detectCurrentRetrogrades(planets);

      // Calculate planetary hour
      const planetaryHour = this.calculatePlanetaryHour(time, location);

      // Determine cosmic weather type
      const weatherType = this.determineCosmicWeatherType(aspects, moonPhase, retrogrades);

      // Calculate intensity
      const intensity = this.calculateCosmicIntensity(aspects, moonPhase, retrogrades);

      // Generate spiritual influences
      const influences = this.generateSpiritualInfluences(aspects, moonPhase, retrogrades, weatherType);

      const cosmicWeather: CosmicInfluenceData = {
        timestamp: time,
        location,
        moonPhase,
        planetaryHour,
        dominantAspects: aspects.slice(0, 5), // Top 5 most significant
        retrogradePlanets: retrogrades,
        cosmicWeather: weatherType,
        intensity,
        influences,
        tarotCorrelations: this.generateTarotCorrelations(aspects, moonPhase),
        optimalReadingTimes: this.calculateOptimalReadingTimes(time, aspects, moonPhase),
        energyMapping: this.generateEnergyMapping(aspects, moonPhase, retrogrades)
      };

      // Cache the result
      this.setCachedData(cacheKey, cosmicWeather);

      return cosmicWeather;

    } catch (error) {
      console.error('Error calculating cosmic weather:', error);
      throw error;
    }
  }

  /**
   * Detect currently retrograde planets
   */
  private async detectCurrentRetrogrades(planets: PlanetaryData[]): Promise<Planet[]> {
    const retrogrades: Planet[] = [];

    for (const planet of planets) {
      // Check if planet is moving backwards (negative speed in longitude)
      if (planet.speed && planet.speed.longitude < 0) {
        retrogrades.push(planet.planet);
      }
    }

    return retrogrades;
  }

  /**
   * Calculate current planetary hour
   */
  private calculatePlanetaryHour(time: Date): Planet {
    const planetarySequence = [
      Planet.SUN, Planet.VENUS, Planet.MERCURY, Planet.MOON,
      Planet.SATURN, Planet.JUPITER, Planet.MARS
    ];

    // Calculate hours since sunrise (simplified calculation)
    const hour = time.getHours();
    const dayOfWeek = time.getDay(); // 0 = Sunday

    // Each day starts with a different planet
    const dayRulers = [
      Planet.SUN,    // Sunday
      Planet.MOON,   // Monday
      Planet.MARS,   // Tuesday
      Planet.MERCURY,// Wednesday
      Planet.JUPITER,// Thursday
      Planet.VENUS,  // Friday
      Planet.SATURN  // Saturday
    ];

    const dayRuler = dayRulers[dayOfWeek];
    const dayRulerIndex = planetarySequence.indexOf(dayRuler);

    // Calculate planetary hour
    const planetaryHourIndex = (dayRulerIndex + hour) % planetarySequence.length;
    return planetarySequence[planetaryHourIndex];
  }

  /**
   * Determine cosmic weather type based on astronomical conditions
   */
  private determineCosmicWeatherType(
    aspects: AspectData[],
    moonPhase: MoonPhaseData,
    retrogrades: Planet[]
  ): CosmicWeatherType {
    // Check for eclipses (simplified)
    if (moonPhase.phase === 'New Moon' || moonPhase.phase === 'Full Moon') {
      const strongAspects = aspects.filter(a => Math.abs(a.orb) < 2);
      if (strongAspects.length > 3) {
        return CosmicWeatherType.ECLIPSE;
      }
    }

    // Check for Mercury retrograde
    if (retrogrades.includes(Planet.MERCURY)) {
      return CosmicWeatherType.MERCURY_RETROGRADE;
    }

    // Check moon phases
    if (moonPhase.phase === 'Full Moon') {
      return CosmicWeatherType.FULL_MOON;
    }
    if (moonPhase.phase === 'New Moon') {
      return CosmicWeatherType.NEW_MOON;
    }

    // Check aspect intensity
    const tensionAspects = aspects.filter(a =>
      a.type === AspectType.SQUARE || a.type === AspectType.OPPOSITION
    );

    if (tensionAspects.length > 2) {
      return CosmicWeatherType.TURBULENT;
    }

    const harmonicAspects = aspects.filter(a =>
      a.type === AspectType.TRINE || a.type === AspectType.SEXTILE
    );

    if (harmonicAspects.length > 2) {
      return CosmicWeatherType.ACTIVE;
    }

    return CosmicWeatherType.CALM;
  }

  /**
   * Calculate cosmic intensity level
   */
  private calculateCosmicIntensity(
    aspects: AspectData[],
    moonPhase: MoonPhaseData,
    retrogrades: Planet[]
  ): 'low' | 'medium' | 'high' | 'extreme' {
    let intensity = 0;

    // Add points for tight aspects
    aspects.forEach(aspect => {
      if (Math.abs(aspect.orb) < 1) intensity += 3;
      else if (Math.abs(aspect.orb) < 2) intensity += 2;
      else if (Math.abs(aspect.orb) < 3) intensity += 1;
    });

    // Add points for moon phase
    if (moonPhase.phase === 'Full Moon' || moonPhase.phase === 'New Moon') {
      intensity += 2;
    }

    // Add points for retrogrades
    intensity += retrogrades.length;

    if (intensity >= 15) return 'extreme';
    if (intensity >= 10) return 'high';
    if (intensity >= 5) return 'medium';
    return 'low';
  }

  /**
   * Generate spiritual influence descriptions
   */
  private generateSpiritualInfluences(
    aspects: AspectData[],
    moonPhase: MoonPhaseData,
    retrogrades: Planet[],
    weatherType: CosmicWeatherType
  ): string[] {
    const influences: string[] = [];

    // Weather type influences
    if (weatherType === 'transformative') {
      influences.push('Deep transformation energies are active');
    }

    // Moon phase influences
    switch (moonPhase.phase) {
      case 'New Moon':
        influences.push('New beginnings and fresh intentions are favored');
        break;
      case 'Waxing Crescent':
        influences.push('Growth and manifestation energy is building');
        break;
      case 'First Quarter':
        influences.push('Decision-making and action-taking are highlighted');
        break;
      case 'Waxing Gibbous':
        influences.push('Refinement and adjustment of plans is needed');
        break;
      case 'Full Moon':
        influences.push('Culmination and heightened intuitive abilities');
        break;
      case 'Waning Gibbous':
        influences.push('Gratitude and sharing wisdom with others');
        break;
      case 'Last Quarter':
        influences.push('Release and letting go of what no longer serves');
        break;
      case 'Waning Crescent':
        influences.push('Rest, reflection, and inner preparation');
        break;
    }

    // Retrograde influences
    retrogrades.forEach(planet => {
      switch (planet) {
        case Planet.MERCURY:
          influences.push('Communication and technology may require extra attention');
          break;
        case Planet.VENUS:
          influences.push('Relationships and values are being reconsidered');
          break;
        case Planet.MARS:
          influences.push('Energy and motivation may feel redirected inward');
          break;
        case Planet.JUPITER:
          influences.push('Philosophical beliefs and growth patterns are being reviewed');
          break;
        case Planet.SATURN:
          influences.push('Structures and responsibilities are being restructured');
          break;
      }
    });

    // Aspect influences (top 3)
    aspects.slice(0, 3).forEach(aspect => {
      const planetNames = `${aspect.planet1} ${aspect.type.toLowerCase()} ${aspect.planet2}`;
      influences.push(`${planetNames} brings ${this.getAspectInfluence(aspect)}`);
    });

    return influences;
  }

  /**
   * Get spiritual influence for an aspect
   */
  private getAspectInfluence(aspect: AspectData): string {
    const influences = {
      [AspectType.CONJUNCTION]: 'unified energy and new beginnings',
      [AspectType.OPPOSITION]: 'balance and integration of opposing forces',
      [AspectType.TRINE]: 'harmonious flow and natural talents',
      [AspectType.SQUARE]: 'dynamic tension and growth opportunities',
      [AspectType.SEXTILE]: 'cooperative energy and helpful connections',
      [AspectType.QUINCUNX]: 'adjustment and adaptation needs',
      [AspectType.SEMISEXTILE]: 'subtle support and gentle nudges',
      [AspectType.SEMISQUARE]: 'minor friction requiring attention',
      [AspectType.SESQUIQUADRATE]: 'creative tension and breakthrough potential'
    };

    return influences[aspect.type] || 'significant energetic influence';
  }

  /**
   * Generate tarot correlations
   */
  private generateTarotCorrelations(aspects: AspectData[], moonPhase: MoonPhaseData): string[] {
    const correlations: string[] = [];

    // Moon phase correlations
    const moonCards = {
      'New Moon': 'The Fool - New beginnings',
      'Waxing Crescent': 'The Magician - Manifestation',
      'First Quarter': 'The Chariot - Determination',
      'Waxing Gibbous': 'Temperance - Balance',
      'Full Moon': 'The Moon - Intuition and illusion',
      'Waning Gibbous': 'The Hermit - Inner wisdom',
      'Last Quarter': 'Death - Transformation',
      'Waning Crescent': 'The Hanged Man - Surrender'
    };

    const moonCard = moonCards[moonPhase.phase as keyof typeof moonCards];
    if (moonCard) correlations.push(moonCard);

    // Aspect correlations (simplified)
    aspects.slice(0, 2).forEach(aspect => {
      if (aspect.type === AspectType.CONJUNCTION) {
        correlations.push('The Sun - Unity and clarity');
      } else if (aspect.type === AspectType.OPPOSITION) {
        correlations.push('Justice - Balance and decisions');
      } else if (aspect.type === AspectType.SQUARE) {
        correlations.push('The Tower - Breakthrough and change');
      }
    });

    return correlations;
  }

  /**
   * Calculate optimal reading times
   */
  private calculateOptimalReadingTimes(
    baseTime: Date,
    aspects: AspectData[],
    moonPhase: MoonPhaseData
  ): Date[] {
    const optimalTimes: Date[] = [];

    // Add current time if conditions are favorable
    const currentScore = this.calculateReadingScore(aspects, moonPhase);
    if (currentScore > 0.7) {
      optimalTimes.push(baseTime);
    }

    // Calculate next few optimal windows (simplified)
    for (let hours = 1; hours <= 24; hours += 3) {
      const futureTime = new Date(baseTime.getTime() + hours * 60 * 60 * 1000);
      const score = this.calculateReadingScore(aspects, moonPhase, hours);

      if (score > 0.8) {
        optimalTimes.push(futureTime);
      }
    }

    return optimalTimes.slice(0, 5); // Return top 5
  }

  /**
   * Calculate reading score based on cosmic conditions
   */
  private calculateReadingScore(
    aspects: AspectData[],
    moonPhase: MoonPhaseData,
    hoursOffset: number = 0
  ): number {
    let score = 0.5; // Base score

    // Time offset adjustment
    if (hoursOffset !== 0) {
      score += Math.abs(hoursOffset) * 0.01; // Small adjustment for time offset
    }

    // Moon phase bonus
    if (moonPhase.phase === 'Full Moon') score += 0.3;
    else if (moonPhase.phase === 'New Moon') score += 0.2;

    // Aspect bonuses
    aspects.forEach(aspect => {
      if (aspect.type === AspectType.TRINE) score += 0.1;
      else if (aspect.type === AspectType.SEXTILE) score += 0.05;
      else if (aspect.type === AspectType.CONJUNCTION) score += 0.15;
    });

    return Math.min(1.0, score);
  }

  /**
   * Generate energy mapping for visualization
   */
  private generateEnergyMapping(
    aspects: AspectData[],
    moonPhase: MoonPhaseData,
    retrogrades: Planet[]
  ): { [key: string]: number } {
    return {
      intuition: this.calculateIntuitionLevel(moonPhase, aspects),
      transformation: this.calculateTransformationLevel(aspects, retrogrades),
      communication: this.calculateCommunicationLevel(retrogrades, aspects),
      love: this.calculateLoveLevel(aspects),
      power: this.calculatePowerLevel(aspects, moonPhase),
      wisdom: this.calculateWisdomLevel(aspects, retrogrades)
    };
  }

  // Helper methods for energy calculations
  private calculateIntuitionLevel(moonPhase: MoonPhaseData, aspects: AspectData[]): number {
    let level = moonPhase.illumination;
    aspects.forEach(aspect => {
      if (aspect.planet1 === Planet.MOON || aspect.planet2 === Planet.MOON) {
        level += 0.1;
      }
    });
    return Math.min(1.0, level);
  }

  private calculateTransformationLevel(aspects: AspectData[], retrogrades: Planet[]): number {
    let level = retrogrades.length * 0.2;
    aspects.forEach(aspect => {
      if (aspect.type === AspectType.SQUARE || aspect.type === AspectType.OPPOSITION) {
        level += 0.15;
      }
    });
    return Math.min(1.0, level);
  }

  private calculateCommunicationLevel(retrogrades: Planet[], aspects: AspectData[]): number {
    let level = 0.5;
    if (retrogrades.includes(Planet.MERCURY)) level -= 0.3;
    aspects.forEach(aspect => {
      if (aspect.planet1 === Planet.MERCURY || aspect.planet2 === Planet.MERCURY) {
        level += 0.1;
      }
    });
    return Math.max(0.0, Math.min(1.0, level));
  }

  private calculateLoveLevel(aspects: AspectData[]): number {
    let level = 0.5;
    aspects.forEach(aspect => {
      if (aspect.planet1 === Planet.VENUS || aspect.planet2 === Planet.VENUS) {
        if (aspect.type === AspectType.TRINE || aspect.type === AspectType.SEXTILE) {
          level += 0.2;
        }
      }
    });
    return Math.min(1.0, level);
  }

  private calculatePowerLevel(aspects: AspectData[], moonPhase: MoonPhaseData): number {
    let level = 0.4;
    if (moonPhase.phase === 'Full Moon') level += 0.3;
    aspects.forEach(aspect => {
      if (aspect.planet1 === Planet.MARS || aspect.planet2 === Planet.MARS) {
        level += 0.15;
      }
    });
    return Math.min(1.0, level);
  }

  private calculateWisdomLevel(aspects: AspectData[], retrogrades: Planet[]): number {
    let level = 0.5;
    
    // Add wisdom influence from Jupiter retrograde
    if (retrogrades.includes(Planet.JUPITER)) {
      level += 0.1;
    }
    
    aspects.forEach(aspect => {
      if (aspect.planet1 === Planet.JUPITER || aspect.planet2 === Planet.JUPITER) {
        level += 0.1;
      }
      if (aspect.planet1 === Planet.SATURN || aspect.planet2 === Planet.SATURN) {
        level += 0.1;
      }
    });
    return Math.min(1.0, level);
  }

  // Cache management
  private getCachedData(key: string): CosmicInfluenceData | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: CosmicInfluenceData): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
