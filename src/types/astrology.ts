/**
 * Core astrology type definitions
 */
/**
 * Birth data required for astrological calculations
 */
export interface BirthData {
  name?: string;
  birthDate: string; // Changed from Date to string to match usage
  birthTime?: string; // Added missing property
  birthLocation?: string; // Added missing property
  city?: string;
  country?: string;
  latitude?: number; // Standardized coordinate property
  longitude?: number; // Standardized coordinate property
  timezone?: string;
  // For backward compatibility
  date?: Date; // Keep if needed elsewhere
  lat?: number; // Deprecated in favor of latitude
  lng?: number; // Deprecated in favor of longitude
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
  sign: string; // Standardized property name
  house?: number;
  symbol?: string;
  isRetrograde?: boolean;
  // For backward compatibility
  zodiacSign?: string; // Deprecated in favor of sign
  zodiacDegree?: number; // Deprecated in favor of longitude
}
/**
 * House position data
 */
export interface HousePosition {
  number: number; // Changed from 'house' to match usage
  cusp: number; // Made required as it's used in calculations
  sign: string; // Standardized property name
  ruler?: string;
  longitude: number; // Added for consistency
  zodiacSign: string; // Kept for compatibility
  zodiacDegree: number; // Kept for compatibility
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
  aspect: AspectType; // Changed from string to specific type
  angle: number;
  orb: number;
  isApplying: boolean;
}
/**
 * Aspect types used in astrological calculations
 */
export type AspectType =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition";
/**
 * House systems used in astrological calculations
 */
export type HouseSystem = "Placidus" | "Koch" | "Equal" | "WholeSign";
/**
 * Planet names for transit calculations
 */
export type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';
/**
 * Additional utility types for compatibility
 */
export interface BirthCoordinates {
  lat: number;
  lng: number;
}
export interface PlanetInHouse {
  planet: string;
  house: number;
  sign: string;
  degree: number;
}
export interface TransitData {
  planet: Planet;
  position: number;
  sign: string;
  house?: number;
  aspects?: AspectData[];
}
