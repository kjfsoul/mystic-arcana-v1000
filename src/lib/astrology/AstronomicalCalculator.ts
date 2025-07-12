// Astronomical Calculator for accurate planetary positions
// This uses simplified astronomical formulas - for production, integrate Swiss Ephemeris

export interface BirthData {
  name?: string;
  date: Date;
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
  country?: string;
  lat?: number;  // alias for latitude
  lng?: number;  // alias for longitude
}

export interface PlanetPosition {
  name: string;
  symbol: string;
  longitude: number; // 0-360 degrees in zodiac
  latitude: number;  // celestial latitude
  distance: number;  // AU from Earth
  house: number;     // 1-12
  sign: string;
  degree: number;
  minute: number;
  isRetrograde?: boolean;
  speed: number;     // degrees per day
}

export interface HousePosition {
  number: number;
  cusp: number;      // degree where house begins
  sign: string;
  ruler: string;     // ruling planet
}

// Zodiac sign boundaries
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_SYMBOLS = {
  'Sun': '☉',
  'Moon': '☽', 
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇'
};

// Orbital elements for planetary calculations (simplified J2000.0 epoch)
const ORBITAL_ELEMENTS = {
  Mercury: { 
    L0: 252.25084, n: 4.092317, e: 0.205635, a: 0.387098, 
    i: 7.004986, omega: 48.33167, w: 77.45645 
  },
  Venus: { 
    L0: 181.97973, n: 1.602136, e: 0.006777, a: 0.723332,
    i: 3.394662, omega: 76.68069, w: 131.53298
  },
  Mars: { 
    L0: 355.45332, n: 0.524071, e: 0.093412, a: 1.523688,
    i: 1.849726, omega: 49.55809, w: 336.04084
  },
  Jupiter: { 
    L0: 34.40438, n: 0.083056, e: 0.048775, a: 5.202561,
    i: 1.303270, omega: 100.46435, w: 14.75385
  },
  Saturn: { 
    L0: 50.07571, n: 0.033371, e: 0.055723, a: 9.554747,
    i: 2.488980, omega: 113.66424, w: 93.05723
  },
  Uranus: { 
    L0: 314.05500, n: 0.011698, e: 0.046321, a: 19.218446,
    i: 0.773196, omega: 74.00595, w: 173.00529
  },
  Neptune: { 
    L0: 304.34866, n: 0.006020, e: 0.008606, a: 30.110387,
    i: 1.769952, omega: 131.78406, w: 48.12370
  },
  Pluto: { 
    L0: 238.92881, n: 0.003964, e: 0.248808, a: 39.482117,
    i: 17.141175, omega: 110.30347, w: 224.06676
  }
};

export class AstronomicalCalculator {
  
  /**
   * Calculate all planetary positions for a given birth date and location
   */
  static calculateChart(birthData: BirthData): {
    planets: PlanetPosition[];
    houses: HousePosition[];
    ascendant: number;
    midheaven: number;
  } {
    const jd = this.dateToJulianDay(birthData.date);
    const lst = this.calculateLocalSiderealTime(jd, birthData.longitude);
    
    // Calculate planetary positions
    const planets: PlanetPosition[] = [];
    
    // Sun position
    const sunPosition = this.calculateSunPosition(jd);
    planets.push({
      name: 'Sun',
      symbol: PLANET_SYMBOLS.Sun,
      longitude: sunPosition.longitude,
      latitude: 0,
      distance: sunPosition.distance,
      house: this.getHouseNumber(sunPosition.longitude, birthData.latitude, lst),
      sign: this.getZodiacSign(sunPosition.longitude),
      degree: Math.floor(sunPosition.longitude % 30),
      minute: Math.floor(((sunPosition.longitude % 30) % 1) * 60),
      speed: 0.985647 // degrees per day
    });
    
    // Moon position
    const moonPosition = this.calculateMoonPosition(jd);
    planets.push({
      name: 'Moon',
      symbol: PLANET_SYMBOLS.Moon,
      longitude: moonPosition.longitude,
      latitude: moonPosition.latitude,
      distance: moonPosition.distance,
      house: this.getHouseNumber(moonPosition.longitude, birthData.latitude, lst),
      sign: this.getZodiacSign(moonPosition.longitude),
      degree: Math.floor(moonPosition.longitude % 30),
      minute: Math.floor(((moonPosition.longitude % 30) % 1) * 60),
      speed: 13.176358 // degrees per day
    });
    
    // Calculate other planets
    Object.keys(ORBITAL_ELEMENTS).forEach(planetName => {
      const position = this.calculatePlanetPosition(planetName, jd);
      const speed = ORBITAL_ELEMENTS[planetName as keyof typeof ORBITAL_ELEMENTS].n;
      
      planets.push({
        name: planetName,
        symbol: PLANET_SYMBOLS[planetName as keyof typeof PLANET_SYMBOLS],
        longitude: position.longitude,
        latitude: position.latitude,
        distance: position.distance,
        house: this.getHouseNumber(position.longitude, birthData.latitude, lst),
        sign: this.getZodiacSign(position.longitude),
        degree: Math.floor(position.longitude % 30),
        minute: Math.floor(((position.longitude % 30) % 1) * 60),
        isRetrograde: this.isRetrograde(planetName, jd),
        speed: speed
      });
    });
    
    // Calculate house system (Placidus)
    const houses = this.calculateHouses(birthData.latitude, lst);
    const ascendant = houses[0].cusp;
    const midheaven = houses[9].cusp;
    
    return { planets, houses, ascendant, midheaven };
  }
  
  /**
   * Convert date to Julian Day Number
   */
  private static dateToJulianDay(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();
    
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    const jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;
    
    return jd;
  }
  
  /**
   * Calculate Local Sidereal Time
   */
  private static calculateLocalSiderealTime(jd: number, longitude: number): number {
    const t = (jd - 2451545.0) / 36525;
    let lst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - t * t * t / 38710000;
    lst = lst + longitude;
    return ((lst % 360) + 360) % 360;
  }
  
  /**
   * Calculate Sun position using VSOP87 simplified
   */
  private static calculateSunPosition(jd: number): { longitude: number; distance: number } {
    const t = (jd - 2451545.0) / 36525;
    
    // Mean longitude of the Sun
    const L = 280.4664567 + 36000.76982779 * t + 0.0003032028 * t * t;
    
    // Mean anomaly of the Sun
    let M = 357.5291092 + 35999.0502909 * t - 0.0001536667 * t * t;
    M = this.normalizeAngle(M);
    
    // Equation of center
    let C = (1.9146 - 0.004817 * t - 0.000014 * t * t) * Math.sin(this.deg2rad(M));
    C += (0.019993 - 0.000101 * t) * Math.sin(this.deg2rad(2 * M));
    C += 0.000289 * Math.sin(this.deg2rad(3 * M));
    
    // True longitude
    let trueLongitude = L + C;
    trueLongitude = this.normalizeAngle(trueLongitude);
    
    // Distance (AU)
    const distance = 1.000001018 * (1 - 0.01671123 * Math.cos(this.deg2rad(M)) - 0.00014 * Math.cos(this.deg2rad(2 * M)));
    
    return { longitude: trueLongitude, distance };
  }
  
  /**
   * Calculate Moon position using simplified lunar theory
   */
  private static calculateMoonPosition(jd: number): { longitude: number; latitude: number; distance: number } {
    const t = (jd - 2451545.0) / 36525;
    
    // Mean longitude of the Moon
    const L = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
    
    // Mean elongation of the Moon from the Sun
    const D = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
    
    // Mean anomaly of the Sun
    const M = 357.5291092 + 35999.0502909 * t - 0.0001536667 * t * t;
    
    // Mean anomaly of the Moon
    const M1 = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
    
    // Longitude corrections (major terms only)
    let longitude = L;
    longitude += 6.288774 * Math.sin(this.deg2rad(M1));
    longitude += 1.274027 * Math.sin(this.deg2rad(2 * D - M1));
    longitude += 0.658314 * Math.sin(this.deg2rad(2 * D));
    longitude += 0.213618 * Math.sin(this.deg2rad(2 * M1));
    longitude -= 0.185116 * Math.sin(this.deg2rad(M));
    longitude -= 0.114332 * Math.sin(this.deg2rad(2 * (D - M1)));
    
    longitude = this.normalizeAngle(longitude);
    
    // Latitude calculation (simplified)
    const F = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t;
    let latitude = 5.128122 * Math.sin(this.deg2rad(F));
    latitude += 0.280602 * Math.sin(this.deg2rad(M1 + F));
    latitude += 0.277693 * Math.sin(this.deg2rad(M1 - F));
    
    // Distance in Earth radii (convert to AU)
    let distance = 385000.56 + 20905.355 * Math.cos(this.deg2rad(M1));
    distance = distance / 149597870.7; // Convert km to AU
    
    return { longitude, latitude, distance };
  }
  
  /**
   * Calculate planet position using simplified orbital mechanics
   */
  private static calculatePlanetPosition(planetName: string, jd: number): { longitude: number; latitude: number; distance: number } {
    const elements = ORBITAL_ELEMENTS[planetName as keyof typeof ORBITAL_ELEMENTS];
    
    // Mean longitude
    let L = elements.L0 + elements.n * (jd - 2451545.0);
    L = this.normalizeAngle(L);
    
    // Mean anomaly
    let M = L - elements.w;
    M = this.normalizeAngle(M);
    
    // Eccentric anomaly (simplified)
    const E = M + elements.e * Math.sin(this.deg2rad(M)) * (180 / Math.PI);
    
    // True anomaly
    const nu = 2 * Math.atan2(
      Math.sqrt(1 + elements.e) * Math.sin(this.deg2rad(E / 2)),
      Math.sqrt(1 - elements.e) * Math.cos(this.deg2rad(E / 2))
    ) * (180 / Math.PI);
    
    // Heliocentric longitude
    let longitude = nu + elements.w;
    longitude = this.normalizeAngle(longitude);
    
    // Convert to geocentric longitude (simplified)
    const earthLongitude = this.calculateSunPosition(jd).longitude;
    longitude = longitude - earthLongitude + 180;
    longitude = this.normalizeAngle(longitude);
    
    return {
      longitude,
      latitude: 0, // Simplified - actual calculation requires orbital inclination
      distance: elements.a
    };
  }
  
  /**
   * Calculate house cusps using Placidus system (simplified)
   */
  private static calculateHouses(latitude: number, lst: number): HousePosition[] {
    const houses: HousePosition[] = [];
    
    // Ascendant (1st house cusp)
    const ascendant = this.normalizeAngle(lst);
    
    // Simple house division (equal houses for demonstration)
    // In production, use proper Placidus calculations
    for (let i = 0; i < 12; i++) {
      const cusp = this.normalizeAngle(ascendant + i * 30);
      houses.push({
        number: i + 1,
        cusp,
        sign: this.getZodiacSign(cusp),
        ruler: this.getHouseRuler(this.getZodiacSign(cusp))
      });
    }
    
    return houses;
  }
  
  /**
   * Determine which house a longitude falls into
   */
  private static getHouseNumber(longitude: number, latitude: number, lst: number): number {
    const ascendant = this.normalizeAngle(lst);
    const houseCusp = this.normalizeAngle(longitude - ascendant);
    return Math.floor(houseCusp / 30) + 1;
  }
  
  /**
   * Get zodiac sign for a given longitude
   */
  private static getZodiacSign(longitude: number): string {
    const signIndex = Math.floor(longitude / 30);
    return ZODIAC_SIGNS[signIndex];
  }
  
  /**
   * Get ruling planet for a zodiac sign
   */
  private static getHouseRuler(sign: string): string {
    const rulers: Record<string, string> = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury',
      'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury',
      'Libra': 'Venus', 'Scorpio': 'Pluto', 'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn', 'Aquarius': 'Uranus', 'Pisces': 'Neptune'
    };
    return rulers[sign] || 'Unknown';
  }
  
  /**
   * Check if planet is retrograde (simplified)
   */
  private static isRetrograde(planetName: string, jd: number): boolean {
    // Simple approximation - check if planet is slower than normal
    const elements = ORBITAL_ELEMENTS[planetName as keyof typeof ORBITAL_ELEMENTS];
    if (!elements) return false;
    
    // Planets are more likely to be retrograde when at opposition
    const sunLongitude = this.calculateSunPosition(jd).longitude;
    const planetPosition = this.calculatePlanetPosition(planetName, jd);
    const elongation = Math.abs(planetPosition.longitude - sunLongitude);
    
    // Simplified: retrograde when near opposition (within 60 degrees)
    return elongation > 120 && elongation < 240;
  }
  
  /**
   * Utility functions
   */
  private static normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }
  
  private static deg2rad(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  private static rad2deg(radians: number): number {
    return radians * 180 / Math.PI;
  }
}

export default AstronomicalCalculator;