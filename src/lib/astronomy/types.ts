/**
 * Type definitions for the Mystic Arcana Astronomical System
 * 
 * Provides comprehensive types for celestial calculations,
 * star catalogs, planetary ephemeris, and spiritual correlations.
 */

// === Core Astronomical Types ===

export interface Star {
  id: string;                    // Catalog ID (e.g., HIP32349 for Sirius)
  name?: string;                 // Common name if available
  ra: number;                    // Right ascension (degrees)
  dec: number;                   // Declination (degrees)
  magnitude: number;             // Visual magnitude
  spectralType?: string;         // Spectral classification
  distance?: number;             // Distance in light years
  properMotion?: {              // Proper motion in milliarcseconds/year
    ra: number;
    dec: number;
  };
  constellation?: string;        // IAU constellation
  colorIndex?: number;          // B-V color index
  variableType?: string;        // Variable star type if applicable
  multiplicity?: string;        // Binary/multiple star info
  metadata?: Record<string, unknown>;
}

export interface PlanetaryData {
  name: string;
  symbol: string;
  position: CelestialCoordinates;
  eclipticLongitude: number;
  eclipticLatitude: number;
  distance: number;              // AU from Earth
  magnitude: number;
  phase: number;                 // Illuminated fraction
  angularSize: number;           // Arcseconds
  speed: number;                 // Degrees per day
  retrograde: boolean;
  rise?: Date;
  transit?: Date;
  set?: Date;
  zodiacSign: string;
  zodiacDegree: number;
  house?: number;
  aspects?: AspectData[];
}

export interface GeoLocation {
  lat: number;                   // Latitude in degrees
  lon: number;                   // Longitude in degrees
  altitude?: number;             // Altitude in meters
  timezone?: string;             // IANA timezone
}

export interface CelestialCoordinates {
  ra: number;                    // Right ascension in degrees
  dec: number;                   // Declination in degrees
}

export interface HorizontalCoordinates {
  altitude: number;              // Degrees above horizon
  azimuth: number;              // Degrees from north
}

export interface EclipticCoordinates {
  longitude: number;             // Ecliptic longitude in degrees
  latitude: number;              // Ecliptic latitude in degrees
}

export interface ScreenCoordinates {
  x: number;                     // Normalized screen X (-1 to 1)
  y: number;                     // Normalized screen Y (-1 to 1)
  visible: boolean;              // Is above horizon?
  brightness: number;            // Visual brightness factor (0-1)
}

// === Aspect Calculations ===

export interface AspectData {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' |
  'semisextile' | 'quincunx' | 'semisquare' | 'sesquiquadrate';
  angle: number;                 // Actual angle in degrees
  orb: number;                   // Degrees from exact
  exact: boolean;                // Within 1 degree of exact?
  applying: boolean;             // Is aspect forming or separating?
  influence?: 'harmonious' | 'challenging' | 'neutral';
  strength?: number;             // 0-1 based on orb and planets
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
  coordinates: CelestialCoordinates;
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

// === Cosmic Weather & Spiritual Correlations ===

export interface CosmicInfluenceData {
  timestamp: Date;
  moonPhase: MoonPhaseData;
  planetaryHours: PlanetaryHourData;
  aspects: {
    major: AspectData[];
    minor: AspectData[];
    applying: AspectData[];
  };
  retrogrades: RetrogradeInfo[];
  cosmicIntensity: 'calm' | 'active' | 'intense' | 'transformative';
  spiritualInfluences: SpiritualInfluence[];
  optimalActivities: OptimalActivity[];
  warnings?: CosmicWarning[];
}

export interface MoonPhaseData {
  phase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' |
  'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  illumination: number;         // 0-1
  age: number;                 // Days since new moon
  zodiacSign: string;
  distance: number;            // km from Earth
  angularSize: number;         // Arc minutes
  libration: {                 // Moon wobble
    longitude: number;
    latitude: number;
  };
  nextPhase: {
    type: string;
    date: Date;
  };
}

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
  ruler: string;               // Day ruler planet
  dayNight: 'day' | 'night';
}

export interface RetrogradeInfo {
  planet: string;
  isRetrograde: boolean;
  nextChange?: Date;
  shadow: boolean;            // In shadow period?
  influence: string;          // Description of influence
}

export interface SpiritualInfluence {
  type: 'enhancing' | 'challenging' | 'neutral' | 'transformative';
  source: string;             // What's causing this influence
  areas: string[];           // Life areas affected
  advice: string;            // Spiritual guidance
  tarotCorrelation?: {
    cards: string[];         // Related tarot cards
    spread: string;          // Recommended spread
  };
}

export interface OptimalActivity {
  activity: string;
  rating: number;            // 0-10
  reason: string;
  timing: {
    start: Date;
    peak: Date;
    end: Date;
  };
  enhancers: string[];       // What enhances this activity
  cautions: string[];        // What to be careful about
}

export interface CosmicWarning {
  level: 'info' | 'caution' | 'warning';
  type: string;
  message: string;
  duration: {
    start: Date;
    end: Date;
  };
  mitigation: string[];      // How to work with this energy
}

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