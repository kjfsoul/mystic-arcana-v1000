/**
 * AstrologyService - TypeScript interface for Python astrology calculations
 * Uses real astronomical data via PySwisseph and Kerykeion
 */

export interface PlanetPosition {
  planet: string;
  zodiacSign: string;
  zodiacDegree: number;
  longitude: number;
  latitude: number;
  distance: number;
  retrograde: boolean;
  speed?: {
    longitude: number;
    latitude: number;
    distance: number;
  };
}

export interface BirthChart {
  subjectData: {
    name: string;
    birthDate: string;
    location: {
      lat: number;
      lng: number;
      timezone: string;
      formattedAddress: string;
      city: string;
      country: string;
    };
    julianDay: number;
  };
  svgChart: string;
  chartData: Record<string, unknown>;
  detailedPositions: Record<string, PlanetPosition>;
  houses: Record<string, unknown>;
  aspects: Aspect[];
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
  applying?: boolean;
}

export interface CurrentTransits {
  timestamp: string;
  julianDay: number;
  planets: Record<string, PlanetPosition>;
}

export interface SynastryChart {
  svgChart: string;
  synastryAspects: unknown[];
  compatibilityScore: number;
  scoreDescription: string;
  relevantAspects: unknown[];
}

export interface LocationData {
  lat: number;
  lng: number;
  timezone: string;
  formattedAddress: string;
  city: string;
  country: string;
}

class AstrologyService {
  private apiEndpoint = '/api/astrology';

  /**
   * Calculate a complete birth chart
   */
  async calculateBirthChart(
    name: string,
    birthDate: Date,
    city: string,
    country?: string
  ): Promise<BirthChart> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'calculate-birth-chart',
        data: {
          name,
          birthDate: birthDate.toISOString(),
          city,
          country
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate birth chart: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to calculate birth chart');
    }

    return result.data;
  }

  /**
   * Calculate synastry (compatibility) between two people
   */
  async calculateSynastry(
    person1: {
      name: string;
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      city: string;
      country?: string;
    },
    person2: {
      name: string;
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      city: string;
      country?: string;
    }
  ): Promise<SynastryChart> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'calculate-synastry',
        data: { person1, person2 }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate synastry: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to calculate synastry');
    }

    return result.data;
  }

  /**
   * Get current planetary transits
   */
  async getCurrentTransits(): Promise<CurrentTransits> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get-current-transits'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get current transits: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get current transits');
    }

    return result.data;
  }

  /**
   * Geocode a location
   */
  async geocodeLocation(city: string, country?: string): Promise<LocationData> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'geocode-location',
        data: { city, country }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to geocode location: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to geocode location');
    }

    return result.data;
  }

  /**
   * Format planet position for display
   */
  formatPosition(position: { zodiacSign: string; zodiacDegree: number; retrograde: boolean }): string {
    const degree = Math.floor(position.zodiacDegree);
    const minute = Math.floor((position.zodiacDegree - degree) * 60);
    const retrograde = position.retrograde ? ' ℞' : '';
    return `${position.zodiacSign} ${degree}°${minute}'${retrograde}`;
  }

  /**
   * Get zodiac symbol
   */
  getZodiacSymbol(sign: string): string {
    const symbols: Record<string, string> = {
      'Aries': '♈',
      'Taurus': '♉',
      'Gemini': '♊',
      'Cancer': '♋',
      'Leo': '♌',
      'Virgo': '♍',
      'Libra': '♎',
      'Scorpio': '♏',
      'Sagittarius': '♐',
      'Capricorn': '♑',
      'Aquarius': '♒',
      'Pisces': '♓'
    };
    return symbols[sign] || sign;
  }

  /**
   * Get planet symbol
   */
  getPlanetSymbol(planet: string): string {
    const symbols: Record<string, string> = {
      'sun': '☉',
      'moon': '☽',
      'mercury': '☿',
      'venus': '♀',
      'mars': '♂',
      'jupiter': '♃',
      'saturn': '♄',
      'uranus': '♅',
      'neptune': '♆',
      'pluto': '♇',
      'chiron': '⚷',
      'north_node': '☊',
      'south_node': '☋'
    };
    return symbols[planet.toLowerCase()] || planet;
  }

  /**
   * Get aspect symbol
   */
  getAspectSymbol(aspect: string): string {
    const symbols: Record<string, string> = {
      'conjunction': '☌',
      'sextile': '⚹',
      'square': '□',
      'trine': '△',
      'opposition': '☍'
    };
    return symbols[aspect.toLowerCase()] || aspect;
  }
}

const astrologyService = new AstrologyService();
export default astrologyService;