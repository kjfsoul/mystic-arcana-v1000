/**
 * Astronomical Type Definitions
 * 
 * Core types for the astronomical calculation system
 */
import { Planets, ZodiacSigns, AspectTypes, MoonPhases } from '@/constants/AstrologyConstants';
export type Planet = typeof Planets[number];
export type ZodiacSign = typeof ZodiacSigns[number];
export type AspectType = typeof AspectTypes[number];
export type MoonPhase = typeof MoonPhases[number];
export type Planet = typeof Planets[number];
export type ZodiacSign = typeof ZodiacSigns[number];
export type AspectType = typeof AspectTypes[number];
export type MoonPhase = typeof MoonPhases[number];
import { CosmicIntensity, EnergyLevel, InfluenceType, CosmicWeatherType } from '@/constants/EventTypes';

// Geographic location for observer
export interface GeoLocation {
  latitude: number;   // degrees, -90 to +90
  longitude: number;  // degrees, -180 to +180
  elevation: number;  // meters above sea level
  timezone: string;   // IANA timezone identifier
}
// Celestial coordinates
export interface EquatorialCoordinates {
  ra: number;   // right ascension in degrees (0-360)
  dec: number;  // declination in degrees (-90 to +90)
  epoch?: number;  // Julian year (e.g., 2000.0) - optional for compatibility
}
export interface HorizontalCoordinates {
  azimuth: number;    // degrees (0-360, N=0, E=90)
  altitude: number;   // degrees (-90 to +90)
}
export interface ScreenCoordinates {
  x: number;          // pixel coordinates
  y: number;
  visible: boolean;   // above horizon
  brightness?: number; // Visual brightness factor (0-1)
}
// Star catalog data
export interface Star {
  id: string;                    // catalog identifier (e.g., "HIP 37279")
  name?: string;                 // common name (e.g., "Sirius")
  coordinates: EquatorialCoordinates;
  // Alternative coordinate fields for compatibility
  ra?: number;                   // Right ascension (degrees) - use coordinates.ra
  dec?: number;                  // Declination (degrees) - use coordinates.dec
  magnitude: number;             // apparent magnitude
  colorIndex: number;            // B-V color index
  spectralClass: string;         // stellar classification
  spectralType?: string;         // Alternative name for spectralClass
  properMotion: {
    ra: number;                  // mas/year
    dec: number;                 // mas/year
  };
  parallax?: number;             // milliarcseconds
  distance?: number;             // Distance in light years
  constellation: string;         // IAU constellation code
  variableType?: string;         // Variable star type if applicable
  multiplicity?: string;         // Binary/multiple star info
  metadata?: Record<string, unknown>;
}
// Planetary data
export interface PlanetaryData {
  planet: Planet;
  name?: string;                 // Alternative planet name
  symbol?: string;               // Astrological symbol
  coordinates: EquatorialCoordinates;
  position?: EquatorialCoordinates; // Alternative name for coordinates
  horizontalCoords?: HorizontalCoordinates;
  eclipticLongitude: number;     // degrees (0-360)
  eclipticLatitude: number;      // degrees
  distance: number;              // AU from Earth
  magnitude: number;             // apparent magnitude
  phase: number;                 // illuminated fraction (0-1)
  angularDiameter: number;       // arcseconds
  angularSize?: number;          // Alternative name for angularDiameter
  retrograde: boolean;
  sign: ZodiacSign;
  zodiacSign?: string;           // Alternative string representation
  degree: number;                // degree within sign (0-30)
  zodiacDegree?: number;         // Alternative name for degree
  house?: number;                // astrological house (1-12)
  speed?: number;                // Degrees per day
  rise?: Date;
  transit?: Date;
  set?: Date;
  aspects?: AspectData[];
}
// Astrological aspects
export interface AspectData {
  planet1: Planet | string;      // Can be Planet enum or string
  planet2: Planet | string;      // Can be Planet enum or string
  aspect: AspectType;            // Primary aspect type field
  type?: AspectType | string;    // Alternative field name for compatibility
  angle?: number;                // Actual angle in degrees
  orb: number;                   // degrees from exact
  exact?: boolean;               // Within 1 degree of exact?
  applying: boolean;             // aspect getting tighter
  separating?: boolean;          // aspect getting wider
  exactTime?: Date;              // when aspect becomes exact
  influence?: 'harmonious' | 'challenging' | 'neutral';
  strength?: number;             // 0-1 based on orb and planets
}
// Retrograde motion data
export interface RetrogradeData {
  planet: Planet;
  isRetrograde: boolean;
  stationaryDirect?: Date;       // when planet goes direct
  stationaryRetrograde?: Date;   // when planet goes retrograde
  speed: number;                 // degrees per day
}
// Moon phase data
export interface MoonPhaseData {
  phase: MoonPhase | string;     // Can be MoonPhase enum or string
  illumination: number;          // fraction illuminated (0-1)
  age: number;                   // days since new moon
  distance: number;              // km from Earth
  angularDiameter?: number;      // arcseconds
  angularSize?: number;          // Alternative name for angularDiameter
  zodiacSign?: string;           // Zodiac sign the moon is in
  libration?: {                  // Moon wobble
    longitude: number;
    latitude: number;
  };
  nextPhase: {
    phase?: MoonPhase | string;
    type?: string;               // Alternative to phase
    date: Date;
  };
}
// Cosmic weather data
export interface CosmicInfluenceData {
  moonPhase: MoonPhaseData;
  planetaryHour?: Planet | string;
  planetaryHours?: PlanetaryHourData;
  dominantAspects?: AspectData[];
  aspects?: {
    major: AspectData[];
    minor: AspectData[];
    applying: AspectData[];
  };
  retrogradePlanets?: Planet[];
  retrogrades?: RetrogradeInfo[];
  cosmicWeather?: CosmicWeatherType;
  cosmicIntensity?: CosmicIntensity;
  intensity?: EnergyLevel;
  influences?: string[];
  spiritualInfluences?: SpiritualInfluence[];
  optimalActivities?: OptimalActivity[];
  warnings?: CosmicWarning[];
  timestamp?: Date;
}
// Supporting types for cosmic weather
export interface PlanetaryHourData {
  current: {
    planet: string;
    startTime: Date;
    endTime: Date;
  };
  next: {
    planet: string;
    startTime: Date;
  };
  ruler: string;
  dayNight: 'day' | 'night';
}
export interface RetrogradeInfo {
  planet: string;
  isRetrograde: boolean;
  nextChange?: Date;
  shadow?: boolean;
  influence?: string;
}
export interface SpiritualInfluence {
  type: InfluenceType;
  source: string;
  areas: string[];
  advice: string;
  tarotCorrelation?: {
    cards: string[];
    spread: string;
  };
}
export interface OptimalActivity {
  activity: string;
  rating: number;
  reason: string;
  timing: {
    start: Date;
    peak: Date;
    end: Date;
  };
  enhancers: string[];
  cautions: string[];
}
export interface CosmicWarning {
  level: 'info' | 'caution' | 'warning';
  type: string;
  message: string;
  duration: {
    start: Date;
    end: Date;
  };
  mitigation: string[];
}
export enum CosmicWeatherType {
  CALM = 'calm',
  ACTIVE = 'active',
  TURBULENT = 'turbulent',
  TRANSFORMATIVE = 'transformative',
  ECLIPSE = 'eclipse',
  MERCURY_RETROGRADE = 'mercury-retrograde',
  FULL_MOON = 'full-moon',
  NEW_MOON = 'new-moon'
}
// Rendering configuration
export interface RenderConfig {
  starCatalog: 'hipparcos' | 'yale' | 'gaia';
  maxStars: number;              // performance limit
  minMagnitude: number;          // faintest stars to show
  showConstellations: boolean;
  showPlanets: boolean;
  showDeepSky: boolean;
  coordinateSystem: 'equatorial' | 'horizontal' | 'ecliptic';
  projection: 'stereographic' | 'orthographic' | 'mercator';
}
// Calculation precision settings
export interface CalculationConfig {
  ephemerisAccuracy: 'low' | 'medium' | 'high' | 'ultra';
  updateInterval: number;        // milliseconds
  precessionCorrection: boolean;
  nutationCorrection: boolean;
  aberrationCorrection: boolean;
  refractionCorrection: boolean;
}