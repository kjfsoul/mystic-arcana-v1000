# Type System Analysis & Resolution Plan

## Current Issue

Build failing due to cascading TypeScript type mismatches across the astronomical calculation system.

## Root Cause Analysis

### 1. Multiple Competing Type Systems

We have **3 different type definitions** for the same concepts:

#### `src/types/astronomical.ts` (Main App Types)

- `EquatorialCoordinates`: `{ ra: number, dec: number }`
- `ScreenCoordinates`: `{ x: number, y: number, visible: boolean }`
- `CosmicInfluenceData`: Uses `moonPhase`, `planetaryHour`, `intensity`

#### `src/lib/astronomy/types.ts` (Library Types)

- `EquatorialCoordinates`: `{ ra: number, dec: number }` (same)
- `ScreenCoordinates`: `{ x: number, y: number, visible: boolean, brightness: number }`
- `CosmicInfluenceData`: Uses `timestamp`, `planetaryHours`, `cosmicIntensity`

#### Component-Specific Types

- Various components expect different property names
- Star interfaces use both `coordinates.ra` and direct `ra` properties

### 2. Mock Data Mismatches

- SwissEphemerisBridge returns data that doesn't match expected interfaces
- Planetary data has `name` vs `planet` property conflicts
- Aspect data missing required properties (`aspect`, `separating`)

### 3. Import Inconsistencies

Files import from different type sources, causing conflicts:

- `AstronomicalEngine.ts` imports from `../../types/astronomical`
- `CoordinateTransforms.ts` imports from `./types`
- `CosmicWeatherAPI.ts` mixes both

## Specific Errors Encountered

1. **Original Error**: `'ra' does not exist in type 'EquatorialCoordinates'`
2. **Coordinate Property Mismatches**: `rightAscension`/`declination` vs `ra`/`dec`
3. **Screen Coordinates**: Missing `brightness` property
4. **Aspect Data**: Missing `aspect` and `separating` properties
5. **Cosmic Weather**: Incompatible interface structures
6. **Planet References**: String vs Enum type mismatches

## Files Requiring Coordination

### Core Type Files

- `src/types/astronomical.ts` (main authority)
- `src/lib/astronomy/types.ts` (should be secondary/compatible)

### Implementation Files

- `src/lib/astronomy/AstronomicalEngine.ts`
- `src/lib/astronomy/CoordinateTransforms.ts`
- `src/lib/astronomy/SwissEphemerisBridge.ts`
- `src/lib/astronomy/CosmicWeatherAPI.ts`
- `src/services/astronomical/AstronomicalEngine.ts`

### Component Files

- `src/components/astronomical/HighPerformanceStarField/HighPerformanceStarField.tsx`
- `src/app/astronomical-demo/page.tsx`

## Recommended Resolution Strategy

### Phase 1: Establish Single Source of Truth

1. Designate `src/types/astronomical.ts` as the authoritative type system
2. Update `src/lib/astronomy/types.ts` to extend/complement (not conflict)
3. Create type conversion utilities for boundary cases

### Phase 2: Systematic Migration

1. Update all imports to use consistent type sources
2. Fix mock data generators to match real interfaces
3. Add proper type guards at system boundaries

### Phase 3: Validation

1. Ensure build passes with strict TypeScript
2. Verify runtime compatibility
3. Add type tests to prevent regression

## Next Steps

Create a comprehensive prompt for Claude to systematically resolve all type conflicts in a coordinated manner, rather than fixing them piecemeal.
