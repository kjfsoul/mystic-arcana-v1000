import type { BirthData, PlanetPosition } from './AstronomicalCalculator';

/**
 * NASA API Fallback Handler
 * Provides fallback astronomical calculations when NASA services are unavailable
 */
export class NasaFallbackHandler {
  /**
   * Handle NASA API failure and provide fallback planet positions
   */
  async handleApiFailure(error: any, birthData: BirthData): Promise<PlanetPosition[]> {
    if (!birthData || !(birthData.birthDate instanceof Date) || isNaN(birthData.birthDate.getTime())) {
      throw new Error("Invalid or undefined birthDate in birthData provided to handleApiFailure.");
    }
    console.warn('NASA API failed, using fallback calculations:', error.message);
    
    // Generate basic fallback positions
    const fallbackPlanets = this.generateBasicPlanetPositions(birthData.birthDate);
    
    this.logFallbackUsage('NASA_API_ERROR', birthData);
    return fallbackPlanets;
  }

  /**
   * Generate simplified planet positions based on date
   */
  private generateBasicPlanetPositions(birthDate: Date): PlanetPosition[] {
    if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
      throw new Error("Invalid or undefined birthDate provided to generateBasicPlanetPositions.");
    }
    const dayOfYear = this.getDayOfYear(birthDate);
    
    return [
      {
        planet: 'Sun',
        longitude: this.calculateSunPosition(dayOfYear),
        latitude: 0,
        distance: 1.0,
        speed: 0.98,
        sign: this.getZodiacSign(this.calculateSunPosition(dayOfYear)),
        house: 1,
        retrograde: false,
      },
      {
        planet: 'Moon',
        longitude: this.calculateMoonPosition(birthDate),
        latitude: 0,
        distance: 0.00257,
        speed: 13.18,
        sign: this.getZodiacSign(this.calculateMoonPosition(birthDate)),
        house: 2,
        retrograde: false,
      },
    ];
  }

  private calculateSunPosition(dayOfYear: number): number {
    return (280 + dayOfYear * 0.9856) % 360;
  }

  private calculateMoonPosition(birthDate: Date): number {
    const daysSinceEpoch = (birthDate.getTime() - new Date(2000, 0, 1).getTime()) / (1000 * 60 * 60 * 24);
    return (daysSinceEpoch * 13.2) % 360;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private getZodiacSign(longitude: number): string {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30)] || 'Aries';
  }

  private logFallbackUsage(reason: string, birthData: BirthData): void {
    console.warn('NASA Fallback activated:', {
      reason,
      birthDate: birthData.birthDate?.toISOString(),
      location: birthData.location,
      timestamp: new Date().toISOString()
    });
  }
}