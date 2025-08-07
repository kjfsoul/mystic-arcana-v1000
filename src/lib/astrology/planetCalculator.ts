import { SwissEphemerisShim } from './SwissEphemerisShim';
import { PlanetPosition } from '@/types/astrology';

// Realistic (but scaled) sizes and colors for planets
const planetProperties: Record<string, { size: number; color: number }> = {
  Sun: { size: 10, color: 0xFFD700 },
  Moon: { size: 0.27, color: 0xCCCCCC },
  Mercury: { size: 0.38, color: 0x999999 },
  Venus: { size: 0.95, color: 0xFFD700 },
  Earth: { size: 1, color: 0x0077FF },
  Mars: { size: 0.53, color: 0xFF4500 },
  Jupiter: { size: 5, color: 0xFFD700 },
  Saturn: { size: 4, color: 0xFFD700 },
  Uranus: { size: 2, color: 0x00FFFF },
  Neptune: { size: 2, color: 0x0000FF },
  Pluto: { size: 0.18, color: 0xCCCCCC },
};

// Function to convert spherical coordinates to Cartesian
const sphericalToCartesian = (longitude: number, latitude: number, distance: number) => {
  // Convert degrees to radians
  const lonRad = longitude * (Math.PI / 180);
  const latRad = latitude * (Math.PI / 180);

  // Using astronomical conventions (scaled for visualization)
  const x = distance * Math.cos(latRad) * Math.cos(lonRad);
  const y = distance * Math.cos(latRad) * Math.sin(lonRad);
  const z = distance * Math.sin(latRad);

  return { x, y, z };
};

export const getPlanetPositions = async (date: Date): Promise<any[]> => {
  try {
    const birthData = { date, time: '12:00', location: 'Greenwich' }; // Use a standard time
    const chart = await SwissEphemerisShim.calculateFullChart(birthData);

    return chart.planets.map((planet: PlanetPosition) => {
      const properties = planetProperties[planet.name] || { size: 1, color: 0xffffff };
      const { x, y, z } = sphericalToCartesian(planet.longitude, planet.latitude, planet.distance * 50); // Scale distance for visibility

      return {
        name: planet.name,
        x,
        y,
        z,
        size: properties.size,
        color: properties.color,
        house: planet.house,
        sign: planet.sign,
        isRetrograde: planet.isRetrograde,
      };
    });
  } catch (error) {
    console.error('Failed to get planet positions from Swiss Ephemeris:', error);
    // Fallback to hardcoded values if the ephemeris fails
    return [
      { name: 'Sun', x: 0, y: 0, z: 0, size: 10, color: 0xFFD700, house: 1, sign: 'Leo', isRetrograde: false },
      { name: 'Earth', x: 100, y: 0, z: 0, size: 1, color: 0x0077FF, house: 7, sign: 'Aquarius', isRetrograde: false },
    ];
  }
};