/**
 * Core astrology type definitions
 */

/**
 * Birth data required for astrological calculations
 */
export interface BirthData {
  name?: string;
  date: Date;
  city: string;
  country?: string;
  lat?: number;
  lng?: number;
  latitude?: number;  // Alternative property name used in some places
  longitude?: number; // Alternative property name used in some places
  timezone?: string;
}

/**
 * Planetary position data
 */
export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  zodiacSign?: string;
  zodiacDegree?: number;
  isRetrograde?: boolean;
}

/**
 * House position data
 */
export interface HousePosition {
  house: number;
  longitude: number;
  zodiacSign: string;
  zodiacDegree: number;
}

/**
 * Complete birth chart data
 */
export interface BirthChart {
  birthData: BirthData;
  planets: PlanetPosition[];
  houses: HousePosition[];
  aspects?: AspectData[];
}

/**
 * Aspect data between planets
 */
export interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  angle: number;
  orb: number;
  isApplying: boolean;
}