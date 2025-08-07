# Claude Type System Resolution Prompt

## Context

You previously created an astronomical calculation system for Mystic Arcana that now has cascading TypeScript compilation errors due to inconsistent type definitions across multiple files. The build is failing with type mismatches.

## Current State

- **Build Status**: FAILING - TypeScript compilation errors
- **Root Cause**: Multiple competing type systems for the same astronomical concepts
- **Impact**: Cannot deploy or test the application

## Specific Problem Areas

### 1. Coordinate System Types

**Files Affected**: `AstronomicalEngine.ts`, `CoordinateTransforms.ts`, `HighPerformanceStarField.tsx`
**Issue**: Inconsistent property names (`ra`/`dec` vs `rightAscension`/`declination`)

### 2. Screen Coordinate Types

**Files Affected**: `CoordinateTransforms.ts`, various renderers
**Issue**: Some expect `brightness` property, others don't

### 3. Astronomical Data Interfaces

**Files Affected**: `SwissEphemerisBridge.ts`, `CosmicWeatherAPI.ts`, `AstronomicalEngine.ts`
**Issue**: Mock data doesn't match expected interface structures

### 4. Import Inconsistencies

**Issue**: Files import types from different sources causing conflicts

## Required Actions

### PRIORITY 1: Establish Type Authority

- Designate `src/types/astronomical.ts` as the single source of truth
- Update `src/lib/astronomy/types.ts` to be compatible/complementary
- Ensure all coordinate types use consistent property names

### PRIORITY 2: Fix Mock Data Generators

- Update `SwissEphemerisBridge.ts` mock data to match real interfaces
- Ensure `AspectData`, `PlanetaryData`, `CosmicInfluenceData` are consistent
- Add missing properties (`aspect`, `separating`, `brightness`, etc.)

### PRIORITY 3: Coordinate Import Strategy

- Update all files to import from consistent type sources
- Fix property name mismatches throughout the codebase
- Ensure type compatibility across component boundaries

### PRIORITY 4: Validate & Test

- Ensure `npm run build` passes without TypeScript errors
- Verify runtime compatibility of type changes
- Test that astronomical calculations still work correctly

## Success Criteria

1. ✅ `npm run build` completes successfully
2. ✅ No TypeScript compilation errors
3. ✅ All astronomical components render without runtime errors
4. ✅ Type system is consistent and maintainable

## Files Requiring Attention

```
src/types/astronomical.ts (authority)
src/lib/astronomy/types.ts (make compatible)
src/lib/astronomy/AstronomicalEngine.ts
src/lib/astronomy/CoordinateTransforms.ts
src/lib/astronomy/SwissEphemerisBridge.ts
src/lib/astronomy/CosmicWeatherAPI.ts
src/services/astronomical/AstronomicalEngine.ts
src/components/astronomical/HighPerformanceStarField/HighPerformanceStarField.tsx
src/app/astronomical-demo/page.tsx
```

## Request

Please systematically resolve all TypeScript type conflicts in the astronomical system to achieve a successful build. Focus on creating a coherent, maintainable type system rather than piecemeal fixes.

**Approach**: Start with the type definitions, then update implementations to match, ensuring consistency across the entire system.
