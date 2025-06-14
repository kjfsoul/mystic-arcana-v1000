/**
 * Coordinate Transformation Utilities for Mystic Arcana
 * 
 * Provides high-precision coordinate transformations between
 * different astronomical coordinate systems.
 */

import type { GeoLocation, EquatorialCoordinates, HorizontalCoordinates, ScreenCoordinates } from '../../types/astronomical';

export class CoordinateTransforms {

  /**
   * Convert Julian Day to Greenwich Mean Sidereal Time
   */
  static julianDayToGMST(jd: number): number {
    const T = (jd - 2451545.0) / 36525.0;

    // GMST at 0h UT
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
      0.000387933 * T * T - T * T * T / 38710000.0;

    // Normalize to 0-360 degrees
    gmst = gmst % 360;
    if (gmst < 0) gmst += 360;

    return gmst;
  }

  /**
   * Convert Greenwich Mean Sidereal Time to Local Sidereal Time
   */
  static gmstToLST(gmst: number, longitude: number): number {
    let lst = gmst + longitude;
    lst = lst % 360;
    if (lst < 0) lst += 360;
    return lst;
  }

  /**
   * Convert equatorial coordinates (RA/Dec) to horizontal coordinates (Alt/Az)
   */
  static equatorialToHorizontal(
    coords: EquatorialCoordinates,
    location: GeoLocation,
    jd: number
  ): HorizontalCoordinates {
    const { ra, dec } = coords;
    const latitude = location.latitude;
    const longitude = location.longitude;

    // Convert to radians
    const raRad = ra * Math.PI / 180; // Degrees to radians
    const decRad = dec * Math.PI / 180;
    const lat = latitude * Math.PI / 180;

    // Calculate Local Sidereal Time
    const gmst = this.julianDayToGMST(jd);
    const lst = this.gmstToLST(gmst, longitude);
    const lstRad = lst * Math.PI / 180;

    // Calculate Hour Angle
    const ha = lstRad - raRad;

    // Calculate altitude
    const sinAlt = Math.sin(decRad) * Math.sin(lat) +
      Math.cos(decRad) * Math.cos(lat) * Math.cos(ha);
    const altitude = Math.asin(sinAlt) * 180 / Math.PI;

    // Calculate azimuth
    const cosAz = (Math.sin(decRad) - Math.sin(lat) * sinAlt) /
      (Math.cos(lat) * Math.cos(Math.asin(sinAlt)));
    let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;

    // Determine correct quadrant for azimuth
    if (Math.sin(ha) > 0) {
      azimuth = 360 - azimuth;
    }

    return { azimuth, altitude };
  }

  /**
   * Convert horizontal coordinates to screen coordinates
   */
  static horizontalToScreen(
    horizontal: HorizontalCoordinates,
    canvasWidth: number,
    canvasHeight: number,
    projection: 'stereographic' | 'orthographic' | 'mercator' = 'stereographic'
  ): ScreenCoordinates {
    const { azimuth, altitude } = horizontal;

    // Check if object is above horizon
    const visible = altitude > -0.5; // Include objects slightly below horizon due to refraction

    if (!visible) {
      return { x: 0, y: 0, visible: false };
    }

    let x: number, y: number;

    switch (projection) {
      case 'stereographic':
        x = this.stereographicProjection(azimuth, altitude, canvasWidth, canvasHeight).x;
        y = this.stereographicProjection(azimuth, altitude, canvasWidth, canvasHeight).y;
        break;

      case 'orthographic':
        x = this.orthographicProjection(azimuth, altitude, canvasWidth, canvasHeight).x;
        y = this.orthographicProjection(azimuth, altitude, canvasWidth, canvasHeight).y;
        break;

      case 'mercator':
        x = this.mercatorProjection(azimuth, altitude, canvasWidth, canvasHeight).x;
        y = this.mercatorProjection(azimuth, altitude, canvasWidth, canvasHeight).y;
        break;

      default:
        x = this.stereographicProjection(azimuth, altitude, canvasWidth, canvasHeight).x;
        y = this.stereographicProjection(azimuth, altitude, canvasWidth, canvasHeight).y;
    }

    return { x, y, visible };
  }

  /**
   * Stereographic projection (good for wide-field views)
   */
  private static stereographicProjection(
    azimuth: number,
    altitude: number,
    width: number,
    height: number
  ): { x: number; y: number } {
    const azRad = azimuth * Math.PI / 180;
    const altRad = altitude * Math.PI / 180;

    // Project onto plane
    const k = 2 / (1 + Math.sin(altRad));
    const x = k * Math.cos(altRad) * Math.sin(azRad);
    const y = k * Math.cos(altRad) * Math.cos(azRad);

    // Convert to screen coordinates
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 4;

    return {
      x: centerX + x * scale,
      y: centerY - y * scale // Flip Y axis
    };
  }

  /**
   * Orthographic projection (good for hemisphere views)
   */
  private static orthographicProjection(
    azimuth: number,
    altitude: number,
    width: number,
    height: number
  ): { x: number; y: number } {
    const azRad = azimuth * Math.PI / 180;
    const altRad = altitude * Math.PI / 180;

    const x = Math.cos(altRad) * Math.sin(azRad);
    const y = Math.cos(altRad) * Math.cos(azRad);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 2.2;

    return {
      x: centerX + x * scale,
      y: centerY - y * scale
    };
  }

  /**
   * Mercator projection (good for all-sky maps)
   */
  private static mercatorProjection(
    azimuth: number,
    altitude: number,
    width: number,
    height: number
  ): { x: number; y: number } {
    const azRad = azimuth * Math.PI / 180;
    const altRad = altitude * Math.PI / 180;

    const x = azRad / (2 * Math.PI);
    const y = Math.log(Math.tan(Math.PI / 4 + altRad / 2)) / (2 * Math.PI);

    return {
      x: x * width,
      y: height / 2 - y * height
    };
  }

  /**
   * Apply atmospheric refraction correction
   */
  static applyRefraction(altitude: number): number {
    if (altitude < -0.5) return altitude;

    // Simple refraction model (more accurate models available)
    const altRad = altitude * Math.PI / 180;
    const refraction = 1.02 / Math.tan(altRad + 10.3 / (altRad + 5.11)) / 60;

    return altitude + refraction;
  }

  /**
   * Apply precession correction
   */
  static applyPrecession(
    coords: EquatorialCoordinates,
    fromEpoch: number,
    toEpoch: number
  ): EquatorialCoordinates {
    const T = (fromEpoch - 2000.0) / 100.0;
    const t = (toEpoch - fromEpoch) / 100.0;

    // Precession constants (simplified)
    const zeta = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * t +
      (0.30188 - 0.000344 * T) * t * t + 0.017998 * t * t * t;
    const z = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * t +
      (1.09468 + 0.000066 * T) * t * t + 0.018203 * t * t * t;
    const theta = (2004.3109 - 0.85330 * T - 0.000217 * T * T) * t -
      (0.42665 + 0.000217 * T) * t * t - 0.041833 * t * t * t;

    // Convert to radians
    const zetaRad = zeta * Math.PI / (180 * 3600);
    const zRad = z * Math.PI / (180 * 3600);
    const thetaRad = theta * Math.PI / (180 * 3600);

    // Original coordinates in radians
    const ra0 = coords.ra * Math.PI / 180; // Already in degrees
    const dec0 = coords.dec * Math.PI / 180;

    // Apply precession transformation
    const A = Math.cos(dec0) * Math.sin(ra0 + zetaRad);
    const B = Math.cos(thetaRad) * Math.cos(dec0) * Math.cos(ra0 + zetaRad) -
      Math.sin(thetaRad) * Math.sin(dec0);
    const C = Math.sin(thetaRad) * Math.cos(dec0) * Math.cos(ra0 + zetaRad) +
      Math.cos(thetaRad) * Math.sin(dec0);

    const ra = Math.atan2(A, B) + zRad;
    const dec = Math.asin(C);

    return {
      ra: ra * 180 / Math.PI, // Convert back to degrees
      dec: dec * 180 / Math.PI
    };
  }

  /**
   * Convert Date to Julian Day
   */
  static dateToJulianDay(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
      Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    const jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;

    return jd;
  }

  /**
   * Convert Julian Day to Date
   */
  static julianDayToDate(jd: number): Date {
    const a = jd + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);

    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = 100 * b + d - 4800 + Math.floor(m / 10);

    const fractionalDay = jd - Math.floor(jd) + 0.5;
    const hours = (fractionalDay % 1) * 24;
    const minutes = (hours % 1) * 60;
    const seconds = (minutes % 1) * 60;

    return new Date(Date.UTC(
      year,
      month - 1,
      day,
      Math.floor(hours),
      Math.floor(minutes),
      Math.floor(seconds)
    ));
  }
}
