# Claude Opus 4 - Astronomical Calculation System Prompt

## Context & Mission
You are designing the astronomical calculation engine for Mystic Arcana, a spiritual technology platform that requires **factually accurate, real-time celestial positioning** for tarot readings and astrological guidance. This is not decorative - users expect astronomical precision that rivals professional planetarium software.

## Current State Analysis
The existing codebase has:
- ✅ Swiss Ephemeris Python scripts (validated but disconnected)
- ✅ NASA JPL Horizons API references in documentation  
- ❌ Fake hardcoded planetary positions
- ❌ Random star generation instead of real star catalogs
- ❌ No coordinate system transformations
- ❌ No real-time astronomical calculations

## Your Specific Challenge
Design and implement a **TypeScript/JavaScript astronomical calculation system** that provides:

### 1. Real-Time Star Field Rendering
- **Star Catalog Integration**: Use Hipparcos, Yale Bright Star Catalog, or similar
- **Coordinate Transformations**: RA/Dec → Alt/Az → Screen coordinates
- **Magnitude-based Rendering**: Proper star brightness and color temperature
- **Constellation Boundaries**: Accurate star pattern recognition
- **Proper Motion**: Account for stellar movement over time

### 2. Precise Planetary Ephemeris
- **Swiss Ephemeris Integration**: Connect existing Python scripts to TypeScript frontend
- **Real-time Positions**: Current planetary positions with sub-degree accuracy
- **Retrograde Detection**: Accurate retrograde motion calculations
- **Aspect Calculations**: Precise angular relationships between celestial bodies
- **House System Integration**: Multiple house systems (Placidus, Equal, Whole Sign)

### 3. Advanced Astronomical Features
- **Location-based Sky**: User's geographic coordinates affect visible sky
- **Time-sensitive Calculations**: Real-time updates as celestial bodies move
- **Precession & Nutation**: Account for Earth's axial wobble
- **Atmospheric Refraction**: Correct for horizon effects
- **Twilight Calculations**: Civil, nautical, and astronomical twilight

## Technical Constraints
- **Frontend**: TypeScript/React/Next.js environment
- **Performance**: 60fps canvas rendering with 100,000+ stars
- **Accuracy**: Professional-grade precision (arc-second level)
- **Real-time**: Sub-second calculation updates
- **Cross-platform**: Browser-based, no native dependencies

## Innovation Opportunities
Think beyond traditional astronomy software:

### Spiritual Technology Integration
- **Cosmic Weather API**: Real-time astrological influence calculations
- **Tarot-Astronomy Correlation**: Map card meanings to celestial events
- **Intuitive Timing**: Optimal reading times based on planetary hours
- **Energy Mapping**: Visualize cosmic influences on human consciousness

### Advanced Visualization
- **3D Celestial Sphere**: Interactive sky dome with depth perception
- **Time Acceleration**: Fast-forward/rewind celestial motion
- **Multi-dimensional Views**: Ecliptic, equatorial, galactic coordinate systems
- **Augmented Reality**: Overlay digital sky on real camera feed

## Deliverables Requested

### 1. Core Calculation Engine (TypeScript)
```typescript
interface AstronomicalEngine {
  // Star catalog management
  loadStarCatalog(catalog: 'hipparcos' | 'yale' | 'gaia'): Promise<Star[]>;
  transformCoordinates(ra: number, dec: number, location: GeoLocation, time: Date): ScreenCoordinates;
  
  // Planetary calculations
  getPlanetaryPositions(time: Date, location: GeoLocation): PlanetaryData[];
  calculateAspects(planets: PlanetaryData[]): AspectData[];
  detectRetrogrades(planet: Planet, timeRange: DateRange): RetrogradeData[];
  
  // Advanced features
  calculatePrecession(epoch: Date, targetDate: Date): PrecessionCorrection;
  getVisibleSky(location: GeoLocation, time: Date): VisibleCelestialBodies;
  calculateCosmicWeather(time: Date): CosmicInfluenceData;
}
```

### 2. Swiss Ephemeris Bridge
- TypeScript wrapper for existing Python ephemeris scripts
- WebAssembly compilation strategy for browser compatibility
- Fallback API service for complex calculations

### 3. Performance Optimization Strategy
- Star culling algorithms for viewport optimization
- Level-of-detail rendering for distant objects
- Efficient coordinate transformation caching
- WebGL shader implementations for massive star rendering

### 4. Data Integration Plan
- Star catalog loading and preprocessing
- Ephemeris data caching and updates
- Real-time API integration patterns
- Offline calculation capabilities

## Success Criteria
Your solution should enable:
- **Planetarium-grade accuracy** in star positions
- **Real-time planetary tracking** with professional precision
- **Smooth 60fps rendering** of 100,000+ celestial objects
- **Seamless integration** with existing Mystic Arcana spiritual features
- **Innovative visualization** that enhances mystical experiences

## Constraints & Considerations
- Must work in browser environment (no server-side dependencies for core calculations)
- Should gracefully degrade on lower-performance devices
- Needs to respect user privacy (location data handling)
- Must integrate with existing React/TypeScript codebase patterns

## Your Mission
Create an astronomical calculation system that bridges the gap between scientific accuracy and spiritual technology. Think like both a NASA engineer and a mystical technologist. The goal is to make the cosmos computationally accessible for spiritual guidance while maintaining rigorous scientific standards.

**Be innovative, be precise, be mystical.**
