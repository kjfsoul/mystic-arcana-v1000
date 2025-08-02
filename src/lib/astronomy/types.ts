/**
 * Type definitions for the Mystic Arcana Astronomical System
 * 
 * Provides comprehensive types for celestial calculations,
 * star catalogs, planetary ephemeris, and spiritual correlations.
 */
// Re-export all core types from the main astronomical types file
export * from '../../types/astronomical';
// Import types needed for local interfaces
import type { 
  EquatorialCoordinates, 
  HorizontalCoordinates, 
  MoonPhaseData,
  Star,
  PlanetaryData
} from '../../types/astronomical';
// === Additional Types ===
// Alias for backward compatibility
export type CelestialCoordinates = EquatorialCoordinates;
export interface EclipticCoordinates {
  longitude: number;             // Ecliptic longitude in degrees
  latitude: number;              // Ecliptic latitude in degrees
}
// === Retrograde Detection ===
export interface RetrogradeData {
  planet: string;
  startDate: Date;
  endDate: Date;
  peakDate: Date;               // Middle of retrograde period
  shadow: {
    pre: Date;                  // Pre-retrograde shadow begins
    post: Date;                 // Post-retrograde shadow ends
  };
  zodiacRange: {
    start: { sign: string; degree: number };
    end: { sign: string; degree: number };
  };
}
// === Precession Calculations ===
export interface PrecessionCorrection {
  deltaRA: number;              // Change in RA (arcseconds)
  deltaDec: number;             // Change in Dec (arcseconds)
  epoch: Date;
  targetDate: Date;
  matrix: number[][];           // 3x3 rotation matrix
}
// === Visible Sky Data ===
export interface VisibleCelestialBodies {
  stars: (Star & HorizontalCoordinates)[];
  planets: (PlanetaryData & HorizontalCoordinates)[];
  messierObjects: MessierObject[];
  constellations: ConstellationData[];
  milkyWayVisible: boolean;
  limitingMagnitude: number;    // Faintest visible magnitude
  moonPhase?: MoonPhaseData;
  satellites?: SatellitePass[];
}
export interface MessierObject {
  id: string;                   // M1-M110
  name?: string;                // Common name (e.g., "Orion Nebula")
  type: 'galaxy' | 'nebula' | 'cluster' | 'planetary-nebula';
  coordinates: EquatorialCoordinates;
  magnitude: number;
  angularSize: number;          // Arc minutes
  distance?: number;            // Light years
}
export interface ConstellationData {
  name: string;
  abbreviation: string;         // IAU 3-letter code
  genitive: string;            // Latin genitive form
  stars: string[];             // Star IDs forming the constellation
  boundaries: CelestialCoordinates[]; // Constellation boundary
  mythology?: string;          // Cultural significance
  bestViewing?: {
    months: number[];          // Best months to view (1-12)
    latitude: { min: number; max: number };
  };
}
// === Planet and Aspect Type Enums ===
// Enums and additional cosmic weather types are re-exported from main types file
// All CosmicInfluenceData, MoonPhaseData, etc. are already exported above
// === Performance & Rendering Types ===
export interface RenderConfiguration {
  maxStars: number;
  lodLevels: number;
  cullingDistance: number;
  updateInterval: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  effects: {
    twinkle: boolean;
    atmosphericScattering: boolean;
    milkyWay: boolean;
    zodiacalLight: boolean;
    meteorShowers: boolean;
  };
}
export interface SatellitePass {
  name: string;
  noradId: number;
  startTime: Date;
  peakTime: Date;
  endTime: Date;
  startAzimuth: number;
  peakAltitude: number;
  endAzimuth: number;
  magnitude: number;
  visible: boolean;
}
// === Star Catalog Formats ===
export interface HipparcosCatalogEntry {
  HIP: number;                 // Hipparcos catalog number
  Vmag: number;               // Visual magnitude
  RAdeg: number;              // Right ascension (degrees)
  DEdeg: number;              // Declination (degrees)
  Plx: number;                // Parallax (mas)
  pmRA: number;               // Proper motion in RA (mas/yr)
  pmDE: number;               // Proper motion in Dec (mas/yr)
  B_V?: number;               // B-V color index
  SpType?: string;            // Spectral type
}
export interface YaleBrightStarEntry {
  HR: number;                 // Harvard Revised number
  Name?: string;              // Star name
  RAh: number;                // RA hours
  RAm: number;                // RA minutes
  RAs: number;                // RA seconds
  DEd: number;                // Dec degrees
  DEm: number;                // Dec minutes
  DEs: number;                // Dec seconds
  Vmag: number;               // Visual magnitude
  B_V?: number;               // Color index
  SpType?: string;            // Spectral type
}
// === WebGL Optimization Types ===
export interface StarBuffer {
  positions: Float32Array;     // x, y, z positions
  colors: Float32Array;        // r, g, b, a colors
  sizes: Float32Array;         // Point sizes
  magnitudes: Float32Array;    // For LOD calculations
  count: number;
  dirty: boolean;              // Needs GPU update?
}
export interface ShaderUniforms {
  time: number;
  viewMatrix: Float32Array;
  projectionMatrix: Float32Array;
  fov: number;
  twinkleIntensity: number;
  atmosphericDensity: number;
  milkyWayOpacity: number;
  limitingMagnitude: number;
}
