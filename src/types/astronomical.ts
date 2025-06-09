/**
 * Astronomical Type Definitions
 * 
 * Core types for the astronomical calculation system
 */

// Geographic location for observer
export interface GeoLocation {
  latitude: number;   // degrees, -90 to +90
  longitude: number;  // degrees, -180 to +180
  elevation: number;  // meters above sea level
  timezone: string;   // IANA timezone identifier
}

// Celestial coordinates
export interface EquatorialCoordinates {
  rightAscension: number;  // hours (0-24)
  declination: number;     // degrees (-90 to +90)
  epoch: number;          // Julian year (e.g., 2000.0)
}

export interface HorizontalCoordinates {
  azimuth: number;    // degrees (0-360, N=0, E=90)
  altitude: number;   // degrees (-90 to +90)
}

export interface ScreenCoordinates {
  x: number;          // pixel coordinates
  y: number;
  visible: boolean;   // above horizon
}

// Star catalog data
export interface Star {
  id: string;                    // catalog identifier (e.g., "HIP 37279")
  name?: string;                 // common name (e.g., "Sirius")
  coordinates: EquatorialCoordinates;
  magnitude: number;             // apparent magnitude
  colorIndex: number;            // B-V color index
  spectralClass: string;         // stellar classification
  properMotion: {
    ra: number;                  // mas/year
    dec: number;                 // mas/year
  };
  parallax?: number;             // milliarcseconds
  constellation: string;         // IAU constellation code
}

// Planetary data
export interface PlanetaryData {
  planet: Planet;
  coordinates: EquatorialCoordinates;
  horizontalCoords: HorizontalCoordinates;
  eclipticLongitude: number;     // degrees (0-360)
  eclipticLatitude: number;      // degrees
  distance: number;              // AU from Earth
  magnitude: number;             // apparent magnitude
  phase: number;                 // illuminated fraction (0-1)
  angularDiameter: number;       // arcseconds
  retrograde: boolean;
  sign: ZodiacSign;
  degree: number;                // degree within sign (0-30)
  house?: number;                // astrological house (1-12)
}

// Planetary bodies
export enum Planet {
  SUN = 'Sun',
  MOON = 'Moon',
  MERCURY = 'Mercury',
  VENUS = 'Venus',
  MARS = 'Mars',
  JUPITER = 'Jupiter',
  SATURN = 'Saturn',
  URANUS = 'Uranus',
  NEPTUNE = 'Neptune',
  PLUTO = 'Pluto',
  CHIRON = 'Chiron',
  NORTH_NODE = 'North Node',
  SOUTH_NODE = 'South Node'
}

// Zodiac signs
export enum ZodiacSign {
  ARIES = 'Aries',
  TAURUS = 'Taurus',
  GEMINI = 'Gemini',
  CANCER = 'Cancer',
  LEO = 'Leo',
  VIRGO = 'Virgo',
  LIBRA = 'Libra',
  SCORPIO = 'Scorpio',
  SAGITTARIUS = 'Sagittarius',
  CAPRICORN = 'Capricorn',
  AQUARIUS = 'Aquarius',
  PISCES = 'Pisces'
}

// Astrological aspects
export interface AspectData {
  planet1: Planet;
  planet2: Planet;
  aspect: AspectType;
  orb: number;                   // degrees from exact
  applying: boolean;             // aspect getting tighter
  separating: boolean;           // aspect getting wider
  exactTime?: Date;              // when aspect becomes exact
}

export enum AspectType {
  CONJUNCTION = 'Conjunction',
  OPPOSITION = 'Opposition',
  TRINE = 'Trine',
  SQUARE = 'Square',
  SEXTILE = 'Sextile',
  QUINCUNX = 'Quincunx',
  SEMISEXTILE = 'Semisextile',
  SEMISQUARE = 'Semisquare',
  SESQUIQUADRATE = 'Sesquiquadrate'
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
  phase: MoonPhase;
  illumination: number;          // fraction illuminated (0-1)
  age: number;                   // days since new moon
  distance: number;              // km from Earth
  angularDiameter: number;       // arcseconds
  nextPhase: {
    phase: MoonPhase;
    date: Date;
  };
}

export enum MoonPhase {
  NEW_MOON = 'New Moon',
  WAXING_CRESCENT = 'Waxing Crescent',
  FIRST_QUARTER = 'First Quarter',
  WAXING_GIBBOUS = 'Waxing Gibbous',
  FULL_MOON = 'Full Moon',
  WANING_GIBBOUS = 'Waning Gibbous',
  LAST_QUARTER = 'Last Quarter',
  WANING_CRESCENT = 'Waning Crescent'
}

// Cosmic weather data
export interface CosmicInfluenceData {
  moonPhase: MoonPhaseData;
  planetaryHour: Planet;
  dominantAspects: AspectData[];
  retrogradePlanets: Planet[];
  cosmicWeather: CosmicWeatherType;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  influences: string[];
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
