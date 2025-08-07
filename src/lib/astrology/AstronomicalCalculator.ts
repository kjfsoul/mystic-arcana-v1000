// Updated AstronomicalCalculator.ts to handle Sun and Moon properly
import { ORBITAL_ELEMENTS } from "./OrbitalElements";
// Re-export types from central location for backward compatibility
export type {
  BirthData,
  PlanetPosition,
  HousePosition,
} from "../../types/astrology";
export class AstronomicalCalculator {
  static normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }
  public static async calculatePlanetaryPosition(
    planetName: string,
    date: Date,
  ): Promise<{
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
  }> {
    if (planetName === "Sun") {
      return this.calculateSunPosition(date);
    }
    if (planetName === "Moon") {
      return this.calculateMoonPosition(date);
    }
    const jd = this.dateToJulianDay(date);
    const elements =
      ORBITAL_ELEMENTS[planetName as keyof typeof ORBITAL_ELEMENTS];
    if (!elements) {
      throw new Error(`Missing orbital elements for planet: ${planetName}`);
    }
    const longitude = this.normalizeAngle(
      (elements.L0 || elements.L) + (elements.n || 1.0) * (jd - 2451545.0),
    );
    const latitude = 0; // Simplified, inclination not included
    const distance = elements.a; // semi-major axis (AU)
    const averageSpeeds: Record<string, number> = {
      Mercury: 4.0923,
      Venus: 1.6021,
      Earth: 0.9856,
      Mars: 0.5241,
      Jupiter: 0.0831,
      Saturn: 0.0334,
      Uranus: 0.0117,
      Neptune: 0.006,
      Pluto: 0.004,
    };
    const speed = averageSpeeds[planetName] || 1.0;
    return { longitude, latitude, distance, speed };
  }
  private static calculateSunPosition(date: Date): {
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
  } {
    const jd = this.dateToJulianDay(date);
    const n = jd - 2451545.0;
    const L = this.normalizeAngle(280.46 + 0.9856474 * n);
    const g = this.normalizeAngle(357.528 + 0.9856003 * n);
    const lambda = this.normalizeAngle(
      L +
        1.915 * Math.sin(this.deg2rad(g)) +
        0.02 * Math.sin(this.deg2rad(2 * g)),
    );
    const distance =
      1.00014 -
      0.01671 * Math.cos(this.deg2rad(g)) -
      0.00014 * Math.cos(this.deg2rad(2 * g));
    return { longitude: lambda, latitude: 0, distance, speed: 0.9856 };
  }
  private static calculateMoonPosition(date: Date): {
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
  } {
    const jd = this.dateToJulianDay(date);
    const n = jd - 2451545.0;
    const L = this.normalizeAngle(218.316 + 13.176396 * n);
    const M = this.normalizeAngle(134.963 + 13.064993 * n);
    const F = this.normalizeAngle(93.272 + 13.22935 * n);
    const longitude = this.normalizeAngle(
      L + 6.289 * Math.sin(this.deg2rad(M)),
    );
    const latitude = 5.128 * Math.sin(this.deg2rad(F));
    const distance = 385000.56 + 20905.355 * Math.cos(this.deg2rad(M)); // in km
    const distanceAU = distance / 149597870.7;
    return { longitude, latitude, distance: distanceAU, speed: 13.1764 };
  }
  static dateToJulianDay(date: Date): number {
    const time = date.getTime() / 86400000.0 + 2440587.5;
    return time;
  }
  static deg2rad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
