/**
 * Swiss Ephemeris Compatibility Shim
 * This module provides a compatibility layer between swisseph-v2 and our application
 * It handles API differences and provides fallback calculations when needed
 */

import type { BirthData, PlanetPosition, HousePosition } from './AstronomicalCalculator';

// Swiss Ephemeris constants
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MERCURY = 2;
const SE_VENUS = 3;
const SE_MARS = 4;
const SE_JUPITER = 5;
const SE_SATURN = 6;
const SE_URANUS = 7;
const SE_NEPTUNE = 8;
const SE_PLUTO = 9;

const SEFLG_SWIEPH = 2;
const SEFLG_SPEED = 256;

// Planet mapping
const PLANET_MAP = {
  'Sun': SE_SUN,
  'Moon': SE_MOON,
  'Mercury': SE_MERCURY,
  'Venus': SE_VENUS,
  'Mars': SE_MARS,
  'Jupiter': SE_JUPITER,
  'Saturn': SE_SATURN,
  'Uranus': SE_URANUS,
  'Neptune': SE_NEPTUNE,
  'Pluto': SE_PLUTO
};

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

export class SwissEphemerisShim {
  private static swisseph: unknown = null;
  private static initialized = false;

  /**
   * Initialize the Swiss Ephemeris shim
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    // Always use fallback calculations since swisseph-v2 is not installed
    console.log('Using enhanced fallback calculations (Swiss Ephemeris compatibility mode)');

    this.initialized = true;
    return false;
  }

  /**
   * Convert date to Julian Day
   */
  static dateToJulianDay(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

    // If swisseph is available, try to use it
    if (this.swisseph && this.swisseph.swe_utc_to_jd) {
      try {
        const result = this.swisseph.swe_utc_to_jd(year, month, day, hour, 0, 0, 1);
        if (result && typeof result.julianDayUT === 'number') {
          return result.julianDayUT;
        }
      } catch (error) {
        // Fall through to manual calculation
      }
    }

    // Manual Julian Day calculation
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
                Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    return jdn + (hour - 12) / 24;
  }

  /**
   * Calculate planetary position using Swiss Ephemeris or fallback
   */
  static calculatePlanetPosition(
    planetName: string, 
    jd: number, 
    options?: { highPrecision?: boolean }
  ): { longitude: number; latitude: number; distance: number; speed: number } | null {
    const planetNum = PLANET_MAP[planetName as keyof typeof PLANET_MAP];
    if (planetNum === undefined) return null;

    // Try Swiss Ephemeris first
    if (this.swisseph && this.swisseph.swe_calc_ut) {
      try {
        const flags = SEFLG_SWIEPH | SEFLG_SPEED;
        const result = this.swisseph.swe_calc_ut(jd, planetNum, flags);
        
        if (result && !result.error) {
          // swisseph-v2 returns direct properties, not nested in data
          return {
            longitude: result.longitude || result.data?.[0] || 0,
            latitude: result.latitude || result.data?.[1] || 0,
            distance: result.distance || result.data?.[2] || 0,
            speed: result.longitudeSpeed || result.data?.[3] || 0
          };
        }
      } catch (error) {
        // Fall through to calculation
      }
    }

    // Fallback to enhanced calculations
    return this.calculatePlanetFallback(planetName, jd);
  }

  /**
   * Enhanced fallback calculation for when Swiss Ephemeris is not available
   */
  private static calculatePlanetFallback(planetName: string, jd: number): {
    longitude: number; latitude: number; distance: number; speed: number;
  } | null {
    const t = (jd - 2451545.0) / 36525; // J2000 century

    switch (planetName) {
      case 'Sun':
        return this.calculateSunPosition(t);
      case 'Moon':
        return this.calculateMoonPosition(t, jd);
      case 'Mercury':
        return this.calculateInnerPlanet(t, 0.387098, 0.205635, 7.004986, 48.33167, 77.45645, 252.25084, 4.092317);
      case 'Venus':
        return this.calculateInnerPlanet(t, 0.723332, 0.006777, 3.394662, 76.68069, 131.53298, 181.97973, 1.602136);
      case 'Mars':
        return this.calculateOuterPlanet(t, 1.523688, 0.093412, 1.849726, 49.55809, 336.04084, 355.45332, 0.524071);
      case 'Jupiter':
        return this.calculateOuterPlanet(t, 5.202561, 0.048775, 1.303270, 100.46435, 14.75385, 34.40438, 0.083056);
      case 'Saturn':
        return this.calculateOuterPlanet(t, 9.554747, 0.055723, 2.488980, 113.66424, 93.05723, 50.07571, 0.033371);
      case 'Uranus':
        return this.calculateOuterPlanet(t, 19.218446, 0.046321, 0.773196, 74.00595, 173.00529, 314.05500, 0.011698);
      case 'Neptune':
        return this.calculateOuterPlanet(t, 30.110387, 0.008606, 1.769952, 131.78406, 48.12370, 304.34866, 0.006020);
      case 'Pluto':
        return this.calculateOuterPlanet(t, 39.482117, 0.248808, 17.141175, 110.30347, 224.06676, 238.92881, 0.003964);
      default:
        return null;
    }
  }

  /**
   * Calculate Sun position (VSOP87 simplified)
   */
  private static calculateSunPosition(t: number): {
    longitude: number; latitude: number; distance: number; speed: number;
  } {
    // Mean longitude
    let L = 280.4664567 + 36000.76982779 * t + 0.0003032028 * t * t;
    
    // Mean anomaly
    const M = (357.5291092 + 35999.0502909 * t - 0.0001536667 * t * t) * Math.PI / 180;
    
    // Equation of center
    const C = (1.9146 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M) +
              (0.019993 - 0.000101 * t) * Math.sin(2 * M) +
              0.000289 * Math.sin(3 * M);
    
    // True longitude
    L = (L + C) % 360;
    if (L < 0) L += 360;
    
    // Distance in AU
    const distance = 1.000001018 * (1 - 0.01671123 * Math.cos(M) - 0.00014 * Math.cos(2 * M));
    
    return {
      longitude: L,
      latitude: 0,
      distance: distance,
      speed: 0.985647 // degrees per day average
    };
  }

  /**
   * Calculate Moon position (ELP2000 simplified)
   */
  private static calculateMoonPosition(t: number, jd: number): {
    longitude: number; latitude: number; distance: number; speed: number;
  } {
    // Mean elements
    const L = (218.3164477 + 481267.88123421 * t) % 360;
    const D = (297.8501921 + 445267.1114034 * t) % 360;
    const M = (357.5291092 + 35999.0502909 * t) % 360;
    const M1 = (134.9633964 + 477198.8675055 * t) % 360;
    const F = (93.2720950 + 483202.0175233 * t) % 360;

    // Convert to radians
    const toRad = Math.PI / 180;
    const Dr = D * toRad, Mr = M * toRad, M1r = M1 * toRad, Fr = F * toRad;

    // Longitude corrections (major terms)
    let longitude = L;
    longitude += 6.288774 * Math.sin(M1r);
    longitude += 1.274027 * Math.sin(2 * Dr - M1r);
    longitude += 0.658314 * Math.sin(2 * Dr);
    longitude += 0.213618 * Math.sin(2 * M1r);
    longitude -= 0.185116 * Math.sin(Mr);
    longitude -= 0.114332 * Math.sin(2 * Fr);

    // Latitude
    let latitude = 5.128122 * Math.sin(Fr);
    latitude += 0.280602 * Math.sin(M1r + Fr);
    latitude += 0.277693 * Math.sin(M1r - Fr);

    // Distance (Earth radii, convert to AU)
    let distance = 385000.56;
    distance -= 20905.355 * Math.cos(M1r);
    distance -= 3699.111 * Math.cos(2 * Dr - M1r);
    distance -= 2955.968 * Math.cos(2 * Dr);
    distance = distance / 149597870.7; // Convert to AU

    // Daily motion (approximate)
    const speed = 13.176358;

    // Normalize longitude to 0-360 range
    longitude = longitude % 360;
    if (longitude < 0) longitude += 360;
    
    return {
      longitude: longitude,
      latitude: latitude,
      distance: distance,
      speed: speed
    };
  }

  /**
   * Calculate inner planet position (Mercury, Venus)
   */
  private static calculateInnerPlanet(
    t: number, a: number, e: number, i: number, 
    omega: number, w: number, L0: number, n: number
  ): { longitude: number; latitude: number; distance: number; speed: number; } {
    // Mean longitude
    const L = (L0 + n * t * 36525) % 360;
    
    // Mean anomaly
    const M = ((L - w) % 360) * Math.PI / 180;
    
    // Solve Kepler's equation (simplified)
    let E = M + e * Math.sin(M);
    for (let j = 0; j < 3; j++) {
      E = M + e * Math.sin(E);
    }
    
    // True anomaly
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    
    // Heliocentric longitude
    const lonHelio = (nu * 180 / Math.PI + w) % 360;
    
    // Convert to geocentric
    const earthPos = this.calculateSunPosition(t);
    const earthL = earthPos.longitude;
    
    // For inner planets, we need to calculate the angle from Earth
    // This is more complex than simple subtraction
    const geoLongitude = this.helioToGeo(lonHelio, a, earthL, earthPos.distance);
    const longitude = geoLongitude % 360;
    
    return {
      longitude: longitude < 0 ? longitude + 360 : longitude,
      latitude: 0, // Simplified
      distance: a,
      speed: n
    };
  }

  /**
   * Convert heliocentric to geocentric longitude
   */
  private static helioToGeo(helioLon: number, planetDist: number, earthLon: number, earthDist: number): number {
    // Convert to radians
    const hRad = helioLon * Math.PI / 180;
    const eRad = earthLon * Math.PI / 180;
    
    // Calculate geocentric position using vector geometry
    const px = planetDist * Math.cos(hRad);
    const py = planetDist * Math.sin(hRad);
    const ex = earthDist * Math.cos(eRad);
    const ey = earthDist * Math.sin(eRad);
    
    // Vector from Earth to planet
    const dx = px - ex;
    const dy = py - ey;
    
    // Geocentric longitude
    let geoLon = Math.atan2(dy, dx) * 180 / Math.PI;
    if (geoLon < 0) geoLon += 360;
    
    return geoLon;
  }

  /**
   * Calculate outer planet position
   */
  private static calculateOuterPlanet(
    t: number, a: number, e: number, i: number,
    omega: number, w: number, L0: number, n: number
  ): { longitude: number; latitude: number; distance: number; speed: number; } {
    // Mean longitude
    const L = (L0 + n * t * 36525) % 360;
    
    // Mean anomaly
    const M = ((L - w) % 360) * Math.PI / 180;
    
    // Solve Kepler's equation
    let E = M + e * Math.sin(M);
    for (let j = 0; j < 3; j++) {
      E = M + e * Math.sin(E);
    }
    
    // True anomaly
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    
    // Heliocentric longitude
    const lonHelio = (nu * 180 / Math.PI + w) % 360;
    
    // Convert to geocentric (outer planets need proper calculation)
    const earthPos = this.calculateSunPosition(t);
    const geoLongitude = this.helioToGeo(lonHelio, a, earthPos.longitude + 180, earthPos.distance);
    
    // Calculate apparent speed (will be negative during retrograde)
    const nextDay = t + 1/36525;
    const nextL = (L0 + n * nextDay * 36525) % 360;
    const nextM = ((nextL - w) % 360) * Math.PI / 180;
    const nextE = nextM + e * Math.sin(nextM);
    const nextNu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(nextE / 2), Math.sqrt(1 - e) * Math.cos(nextE / 2));
    const nextLonHelio = (nextNu * 180 / Math.PI + w) % 360;
    const nextEarthPos = this.calculateSunPosition(nextDay);
    const nextGeoLongitude = this.helioToGeo(nextLonHelio, a, nextEarthPos.longitude + 180, nextEarthPos.distance);
    
    let apparentSpeed = nextGeoLongitude - geoLongitude;
    if (apparentSpeed > 180) apparentSpeed -= 360;
    if (apparentSpeed < -180) apparentSpeed += 360;
    
    return {
      longitude: geoLongitude < 0 ? geoLongitude + 360 : geoLongitude,
      latitude: 0, // Simplified
      distance: a,
      speed: apparentSpeed
    };
  }

  /**
   * Calculate houses using Swiss Ephemeris or fallback
   */
  static calculateHouses(jd: number, latitude: number, longitude: number): number[] {
    // Try Swiss Ephemeris first
    if (this.swisseph && this.swisseph.swe_houses) {
      try {
        const result = this.swisseph.swe_houses(jd, latitude, longitude, 'P'.charCodeAt(0));
        if (result && result.house && result.house.length >= 12) {
          return result.house.slice(0, 12);
        }
      } catch (error) {
        // Fall through to calculation
      }
    }

    // Fallback to equal house system
    const lst = this.calculateSiderealTime(jd, longitude);
    const ascendant = this.calculateAscendant(latitude, lst);
    
    const houses: number[] = [];
    for (let i = 0; i < 12; i++) {
      houses.push((ascendant + i * 30) % 360);
    }
    
    return houses;
  }

  /**
   * Calculate sidereal time
   */
  private static calculateSiderealTime(jd: number, longitude: number): number {
    const t = (jd - 2451545.0) / 36525;
    let lst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 
              0.000387933 * t * t - t * t * t / 38710000;
    lst = (lst + longitude) % 360;
    return lst < 0 ? lst + 360 : lst;
  }

  /**
   * Calculate ascendant
   */
  private static calculateAscendant(latitude: number, lst: number): number {
    // Simplified ascendant calculation
    const latRad = latitude * Math.PI / 180;
    const lstRad = lst * Math.PI / 180;
    
    const ascRad = Math.atan2(Math.cos(lstRad), -Math.sin(lstRad) * Math.cos(latRad));
    const asc = ascRad * 180 / Math.PI;
    
    return asc < 0 ? asc + 360 : asc;
  }

  /**
   * Get zodiac sign from longitude
   */
  static getZodiacSign(longitude: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30)] || 'Unknown';
  }

  /**
   * Main calculation method that provides full chart data
   */
  static async calculateFullChart(birthData: BirthData): Promise<{
    planets: PlanetPosition[];
    houses: HousePosition[];
    ascendant: number;
    midheaven: number;
  }> {
    await this.initialize();
    
    const jd = this.dateToJulianDay(birthData.date);
    const planets: PlanetPosition[] = [];
    
    // Calculate all planetary positions
    for (const [planetName, symbol] of Object.entries(PLANET_SYMBOLS)) {
      const pos = this.calculatePlanetPosition(planetName, jd);
      if (pos) {
        const sign = this.getZodiacSign(pos.longitude);
        const degree = Math.floor(pos.longitude % 30);
        const minute = Math.floor(((pos.longitude % 30) % 1) * 60);
        
        // Determine house (simplified)
        const houses = this.calculateHouses(jd, birthData.latitude, birthData.longitude);
        let house = 1;
        for (let i = 0; i < 12; i++) {
          const nextHouse = (i + 1) % 12;
          const cusp1 = houses[i];
          const cusp2 = houses[nextHouse];
          
          if (cusp2 < cusp1) { // Handle wrap-around
            if (pos.longitude >= cusp1 || pos.longitude < cusp2) {
              house = i + 1;
              break;
            }
          } else {
            if (pos.longitude >= cusp1 && pos.longitude < cusp2) {
              house = i + 1;
              break;
            }
          }
        }
        
        planets.push({
          name: planetName,
          symbol: symbol,
          longitude: pos.longitude,
          latitude: pos.latitude,
          distance: pos.distance,
          house: house,
          sign: sign,
          degree: degree,
          minute: minute,
          isRetrograde: pos.speed < 0,
          speed: Math.abs(pos.speed)
        });
      }
    }
    
    // Calculate houses
    const houseCusps = this.calculateHouses(jd, birthData.latitude, birthData.longitude);
    const houses: HousePosition[] = houseCusps.map((cusp, i) => ({
      number: i + 1,
      cusp: cusp,
      sign: this.getZodiacSign(cusp),
      ruler: this.getHouseRuler(this.getZodiacSign(cusp))
    }));
    
    const ascendant = houseCusps[0];
    const midheaven = houseCusps[9];
    
    return { planets, houses, ascendant, midheaven };
  }

  /**
   * Get ruling planet for a sign
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
}

export default SwissEphemerisShim;