import Swisseph from "swisseph-v2";
// Planet constants from Swiss Ephemeris
export const PLANETS = {
  SUN: Swisseph.SE_SUN,
  MOON: Swisseph.SE_MOON,
  MERCURY: Swisseph.SE_MERCURY,
  VENUS: Swisseph.SE_VENUS,
  MARS: Swisseph.SE_MARS,
  JUPITER: Swisseph.SE_JUPITER,
  SATURN: Swisseph.SE_SATURN,
  URANUS: Swisseph.SE_URANUS,
  NEPTUNE: Swisseph.SE_NEPTUNE,
  PLUTO: Swisseph.SE_PLUTO,
  CHIRON: Swisseph.SE_CHIRON,
  NORTH_NODE: Swisseph.SE_TRUE_NODE,
  SOUTH_NODE: 11, // Using numeric value for South Node
  ASCENDANT: -1, // These need special handling
  MIDHEAVEN: -2, // These need special handling
};
export interface PlanetPosition {
  planet: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  zodiacSign: string;
  zodiacDegree: number;
  retrograde: boolean;
  sign?: string;
  house?: number;
  symbol?: string;
}
export interface BirthChart {
  date: Date;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  planets: PlanetPosition[];
  houses: number[];
  aspects: Aspect[];
}
export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
  applying: boolean;
}
class SwissEphemerisService {
  private initialized = false;
  constructor() {
    // Set ephemeris path - we'll need to download ephemeris files
    // For now, use built-in Moshier ephemeris (less accurate but works without files)
    try {
      Swisseph.swe_set_ephe_path("");
    } catch {
      console.log("Using default ephemeris");
    }
  }
  /**
   * Convert date to Julian Day (UT)
   */
  private dateToJulianDay(date: Date): number {
    const result = Swisseph.swe_utc_to_jd(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      Swisseph.SE_GREG_CAL,
    );
    return result.julianDayUT;
  }
  /**
   * Calculate planet position for a given date
   */
  calculatePlanetPosition(date: Date, planet: number): PlanetPosition | null {
    try {
      const jd = this.dateToJulianDay(date);

      const result = Swisseph.swe_calc_ut(jd, planet, Swisseph.SEFLG_SPEED);

      if (result.error) {
        console.error("Error calculating planet position:", result.error);
        return null;
      }
      const longitude = result.data[0];
      const latitude = result.data[1];
      const distance = result.data[2];
      const speed = result.data[3];
      // Calculate zodiac sign
      const zodiacIndex = Math.floor(longitude / 30);
      const zodiacSigns = [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
      ];

      const planetName = this.getPlanetName(planet);
      return {
        planet: planetName,
        longitude,
        latitude,
        distance,
        speed,
        zodiacSign: zodiacSigns[zodiacIndex],
        zodiacDegree: longitude % 30,
        retrograde: speed < 0,
      };
    } catch (error) {
      console.error("Error in calculatePlanetPosition:", error);
      return null;
    }
  }
  /**
   * Calculate all planet positions for a birth chart
   */
  calculateBirthChart(
    birthDate: Date,
    latitude: number,
    longitude: number,
  ): BirthChart {
    const planetNumbers = [
      PLANETS.SUN,
      PLANETS.MOON,
      PLANETS.MERCURY,
      PLANETS.VENUS,
      PLANETS.MARS,
      PLANETS.JUPITER,
      PLANETS.SATURN,
      PLANETS.URANUS,
      PLANETS.NEPTUNE,
      PLANETS.PLUTO,
      PLANETS.CHIRON,
      PLANETS.NORTH_NODE,
    ];
    const planetPositions: PlanetPosition[] = [];
    // Calculate each planet's position
    for (const planetNum of planetNumbers) {
      const position = this.calculatePlanetPosition(birthDate, planetNum);
      if (position) {
        planetPositions.push(position);
      }
    }
    // Calculate houses (using Placidus system)
    const houses = this.calculateHouses(birthDate, latitude, longitude);
    // Calculate aspects
    const aspects = this.calculateAspects(planetPositions);
    return {
      date: birthDate,
      location: {
        latitude,
        longitude,
        timezone: "UTC", // We'll implement timezone handling later
      },
      planets: planetPositions,
      houses,
      aspects,
    };
  }
  /**
   * Calculate house cusps using Placidus system
   */
  private calculateHouses(
    date: Date,
    latitude: number,
    longitude: number,
  ): number[] {
    try {
      const jd = this.dateToJulianDay(date);

      // 'P' for Placidus house system
      const result = Swisseph.swe_houses(
        jd,
        latitude,
        longitude,
        "P".charCodeAt(0),
      );

      if (result.error) {
        console.error("Error calculating houses:", result.error);
        // Return 12 equal houses as fallback
        const houses: number[] = [];
        for (let i = 0; i < 12; i++) {
          houses.push(i * 30);
        }
        return houses;
      }
      // Extract house cusps (first 12 values)
      const houses = [];
      for (let i = 0; i < 12; i++) {
        houses.push(result.house[i + 1]); // Houses are 1-indexed in Swiss Ephemeris
      }
      return houses;
    } catch (error) {
      console.error("Error in calculateHouses:", error);
      // Return equal houses as fallback
      const houses: number[] = [];
      for (let i = 0; i < 12; i++) {
        houses.push(i * 30);
      }
      return houses;
    }
  }
  /**
   * Calculate aspects between planets
   */
  private calculateAspects(planets: PlanetPosition[]): Aspect[] {
    const aspects: Aspect[] = [];
    const aspectTypes = [
      { name: "conjunction", angle: 0, orb: 8 },
      { name: "sextile", angle: 60, orb: 6 },
      { name: "square", angle: 90, orb: 8 },
      { name: "trine", angle: 120, orb: 8 },
      { name: "opposition", angle: 180, orb: 8 },
    ];
    // Check aspects between each pair of planets
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        // Calculate the angle between planets
        let angle = Math.abs(planet1.longitude - planet2.longitude);
        if (angle > 180) angle = 360 - angle;
        // Check if this angle matches any aspect
        for (const aspectType of aspectTypes) {
          const orb = Math.abs(angle - aspectType.angle);
          if (orb <= aspectType.orb) {
            aspects.push({
              planet1: planet1.planet,
              planet2: planet2.planet,
              type: aspectType.name,
              angle: angle,
              orb: orb,
              applying: this.isAspectApplying(planet1, planet2),
            });
            break;
          }
        }
      }
    }
    return aspects;
  }
  /**
   * Determine if an aspect is applying (getting closer) or separating
   */
  private isAspectApplying(
    planet1: PlanetPosition,
    planet2: PlanetPosition,
  ): boolean {
    // Simplified: if faster planet is behind slower planet, it's applying
    const speed1 = Math.abs(planet1.speed);
    const speed2 = Math.abs(planet2.speed);

    if (speed1 > speed2) {
      return planet1.longitude < planet2.longitude;
    } else {
      return planet2.longitude < planet1.longitude;
    }
  }
  /**
   * Get planet name from Swiss Ephemeris constant
   */
  private getPlanetName(planet: number): string {
    const planetNames: { [key: number]: string } = {
      [PLANETS.SUN]: "Sun",
      [PLANETS.MOON]: "Moon",
      [PLANETS.MERCURY]: "Mercury",
      [PLANETS.VENUS]: "Venus",
      [PLANETS.MARS]: "Mars",
      [PLANETS.JUPITER]: "Jupiter",
      [PLANETS.SATURN]: "Saturn",
      [PLANETS.URANUS]: "Uranus",
      [PLANETS.NEPTUNE]: "Neptune",
      [PLANETS.PLUTO]: "Pluto",
      [PLANETS.CHIRON]: "Chiron",
      [PLANETS.NORTH_NODE]: "North Node",
      [PLANETS.SOUTH_NODE]: "South Node",
    };
    return planetNames[planet] || "Unknown";
  }
  /**
   * Test function to verify calculations
   */
  testCalculations(): void {
    console.log("Testing Swiss Ephemeris calculations...");

    // Test with Einstein's birth data
    const testDate = new Date("1879-03-14T11:30:00Z");
    const testLat = 48.4; // Ulm, Germany
    const testLon = 10.0;
    console.log("\nCalculating positions for:", testDate.toISOString());

    // Calculate Sun position
    const sunPosition = this.calculatePlanetPosition(testDate, PLANETS.SUN);
    if (sunPosition) {
      console.log("\nSun Position:");
      console.log(`- Longitude: ${sunPosition.longitude.toFixed(4)}°`);
      console.log(
        `- Sign: ${sunPosition.zodiacSign} ${sunPosition.zodiacDegree.toFixed(2)}°`,
      );
      console.log(`- Retrograde: ${sunPosition.retrograde}`);
    }
    // Calculate full birth chart
    const birthChart = this.calculateBirthChart(testDate, testLat, testLon);
    console.log("\nFull Birth Chart:");
    console.log(`- Planets calculated: ${birthChart.planets.length}`);
    console.log(`- Houses calculated: ${birthChart.houses.length}`);
    console.log(`- Aspects found: ${birthChart.aspects.length}`);
    // Show all planet positions
    console.log("\nAll Planet Positions:");
    birthChart.planets.forEach((planet) => {
      console.log(
        `${planet.planet}: ${planet.zodiacSign} ${planet.zodiacDegree.toFixed(2)}°${planet.retrograde ? " (R)" : ""}`,
      );
    });
  }
}
const swissEphemerisService = new SwissEphemerisService();
export default swissEphemerisService;
