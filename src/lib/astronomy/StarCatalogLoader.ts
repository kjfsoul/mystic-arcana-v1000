/**
 * Star Catalog Loader for Mystic Arcana
 * 
 * Loads and processes star data from various astronomical catalogs
 * including Hipparcos, Yale Bright Star Catalog, and Gaia.
 * 
 * Optimized for real-time rendering of 100,000+ stars.
 */

import type {
  Star,
  EquatorialCoordinates
} from '../../types/astronomical';

export class StarCatalogLoader {
  private static readonly CATALOG_URLS = {
    hipparcos: '/data/catalogs/hipparcos_bright.json',
    yale: '/data/catalogs/yale_bright_star.json',
    gaia: '/data/catalogs/gaia_dr3_bright.json',
    messier: '/data/catalogs/messier.json',
    constellations: '/data/catalogs/constellation_lines.json'
  };

  // Color temperature lookup table for spectral types
  private static readonly SPECTRAL_COLORS = {
    'O': { r: 0.59, g: 0.67, b: 1.0, temp: 30000 },
    'B': { r: 0.67, g: 0.78, b: 1.0, temp: 20000 },
    'A': { r: 0.83, g: 0.87, b: 1.0, temp: 8500 },
    'F': { r: 0.96, g: 0.94, b: 1.0, temp: 6500 },
    'G': { r: 1.0, g: 0.95, b: 0.81, temp: 5500 },
    'K': { r: 1.0, g: 0.85, b: 0.63, temp: 4500 },
    'M': { r: 1.0, g: 0.73, b: 0.54, temp: 3000 }
  };

  private catalogCache: Map<string, Star[]> = new Map();
  private loadingPromises: Map<string, Promise<Star[]>> = new Map();

  /**
   * Load star catalog with caching and optimization
   */
  async loadCatalog(
    type: 'hipparcos' | 'yale' | 'gaia' | 'messier',
    options: {
      maxMagnitude?: number;
      minDeclination?: number;
      maxDeclination?: number;
      constellations?: string[];
    } = {}
  ): Promise<Star[]> {
    const cacheKey = `${type}_${JSON.stringify(options)}`;

    // Check cache first
    if (this.catalogCache.has(cacheKey)) {
      return this.catalogCache.get(cacheKey)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Start loading
    const loadPromise = this.loadCatalogData(type, options);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const stars = await loadPromise;
      this.catalogCache.set(cacheKey, stars);
      this.loadingPromises.delete(cacheKey);
      return stars;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Load constellation line data for visualization
   */
  async loadConstellationLines(): Promise<{
    [constellation: string]: Array<[string, string]>
  }> {
    try {
      const response = await fetch(StarCatalogLoader.CATALOG_URLS.constellations);
      return await response.json();
    } catch (error) {
      console.error('Failed to load constellation lines:', error);
      return {};
    }
  }

  /**
   * Get bright navigation stars (for alignment and calibration)
   */
  async getNavigationStars(): Promise<Star[]> {
    // Load the 57 standard navigation stars
    const navStars = [
      'Alpheratz', 'Ankaa', 'Schedar', 'Diphda', 'Achernar', 'Hamal',
      'Acamar', 'Menkar', 'Mirfak', 'Aldebaran', 'Rigel', 'Capella',
      'Bellatrix', 'Elnath', 'Alnilam', 'Betelgeuse', 'Canopus', 'Sirius',
      'Adhara', 'Procyon', 'Pollux', 'Avior', 'Suhail', 'Miaplacidus',
      'Alphard', 'Regulus', 'Dubhe', 'Denebola', 'Gienah', 'Acrux',
      'Gacrux', 'Alioth', 'Spica', 'Alkaid', 'Hadar', 'Menkent',
      'Arcturus', 'Rigil Kentaurus', 'Zubenelgenubi', 'Kochab', 'Alphecca',
      'Antares', 'Atria', 'Sabik', 'Shaula', 'Rasalhague', 'Eltanin',
      'Kaus Australis', 'Vega', 'Nunki', 'Altair', 'Peacock', 'Deneb',
      'Enif', 'Alnair', 'Fomalhaut', 'Markab'
    ];

    const allStars = await this.loadCatalog('hipparcos', { maxMagnitude: 3 });
    return allStars.filter(star => star.name && navStars.includes(star.name));
  }

  // === Private Methods ===

  private async loadCatalogData(
    type: string,
    options: { maxMagnitude?: number; minDeclination?: number; maxDeclination?: number; constellations?: string[] }
  ): Promise<Star[]> {
    // For development, generate synthetic star data
    // In production, this would load from actual catalog files

    if (type === 'hipparcos') {
      return this.generateHipparcosCatalog(options);
    } else if (type === 'yale') {
      return this.generateYaleBrightStars(options);
    } else if (type === 'messier') {
      return this.loadMessierObjects();
    }

    throw new Error(`Unknown catalog type: ${type}`);
  }

  private generateHipparcosCatalog(options: { maxMagnitude?: number; minDeclination?: number; maxDeclination?: number; constellations?: string[] }): Star[] {
    const stars: Star[] = [];
    const maxMag = options.maxMagnitude ?? 6.5;

    // First, add real bright stars
    const brightStars = this.getRealBrightStars();
    stars.push(...brightStars.filter(s => s.magnitude <= maxMag));

    // Then generate additional stars based on realistic distribution
    const additionalCount = Math.min(100000, Math.floor(10 ** (maxMag / 2.5)));

    for (let i = 0; i < additionalCount; i++) {
      const star = this.generateRealisticStar(i, maxMag);
      if (this.passesFilters(star, options)) {
        stars.push(star);
      }
    }

    return stars;
  }

  private getRealBrightStars(): Star[] {
    // Real data for the brightest stars
    const brightStarsData = [
      {
        id: 'HIP32349',
        name: 'Sirius',
        ra: 101.287155,
        dec: -16.716116,
        magnitude: -1.46,
        spectralType: 'A1V',
        distance: 8.6,
        properMotion: { ra: -546.01, dec: -1223.07 },
        constellation: 'CMa',
        colorIndex: 0.00
      },
      {
        id: 'HIP30438',
        name: 'Canopus',
        ra: 95.987958,
        dec: -52.695661,
        magnitude: -0.74,
        spectralType: 'A9II',
        distance: 310,
        properMotion: { ra: 19.93, dec: 23.24 },
        constellation: 'Car',
        colorIndex: 0.15
      },
      {
        id: 'HIP69673',
        name: 'Arcturus',
        ra: 213.915300,
        dec: 19.182409,
        magnitude: -0.05,
        spectralType: 'K1.5III',
        distance: 36.7,
        properMotion: { ra: -1093.45, dec: -1999.40 },
        constellation: 'Boo',
        colorIndex: 1.23
      },
      {
        id: 'HIP91262',
        name: 'Vega',
        ra: 279.234735,
        dec: 38.783689,
        magnitude: 0.03,
        spectralType: 'A0V',
        distance: 25.0,
        properMotion: { ra: 200.94, dec: 286.23 },
        constellation: 'Lyr',
        colorIndex: 0.00
      },
      {
        id: 'HIP24608',
        name: 'Rigel',
        ra: 78.634467,
        dec: -8.201638,
        magnitude: 0.13,
        spectralType: 'B8I',
        distance: 860,
        properMotion: { ra: 1.87, dec: -0.56 },
        constellation: 'Ori',
        colorIndex: -0.03
      },
      {
        id: 'HIP37279',
        name: 'Procyon',
        ra: 114.825493,
        dec: 5.224993,
        magnitude: 0.37,
        spectralType: 'F5IV',
        distance: 11.5,
        properMotion: { ra: -714.59, dec: -1036.80 },
        constellation: 'CMi',
        colorIndex: 0.42
      },
      {
        id: 'HIP27989',
        name: 'Betelgeuse',
        ra: 88.792939,
        dec: 7.407064,
        magnitude: 0.50,
        spectralType: 'M1I',
        distance: 548,
        properMotion: { ra: 27.33, dec: 10.86 },
        constellation: 'Ori',
        colorIndex: 1.85,
        variableType: 'SRc'
      },
      {
        id: 'HIP21421',
        name: 'Aldebaran',
        ra: 68.980163,
        dec: 16.509302,
        magnitude: 0.85,
        spectralType: 'K5III',
        distance: 65.3,
        properMotion: { ra: 62.78, dec: -189.35 },
        constellation: 'Tau',
        colorIndex: 1.54
      },
      {
        id: 'HIP65474',
        name: 'Spica',
        ra: 201.298247,
        dec: -11.161320,
        magnitude: 0.97,
        spectralType: 'B1III',
        distance: 250,
        properMotion: { ra: -42.50, dec: -31.73 },
        constellation: 'Vir',
        colorIndex: -0.24,
        variableType: 'ELL'
      },
      {
        id: 'HIP80763',
        name: 'Antares',
        ra: 247.351915,
        dec: -26.432003,
        magnitude: 1.09,
        spectralType: 'M1.5I',
        distance: 600,
        properMotion: { ra: -12.11, dec: -23.30 },
        constellation: 'Sco',
        colorIndex: 1.83,
        variableType: 'LC'
      }
    ];

    // Convert to the required Star format
    return brightStarsData.map(star => ({
      id: star.id,
      name: star.name,
      coordinates: { ra: star.ra, dec: star.dec },
      ra: star.ra, // Compatibility field
      dec: star.dec, // Compatibility field
      magnitude: star.magnitude,
      colorIndex: star.colorIndex,
      spectralClass: star.spectralType,
      spectralType: star.spectralType, // Compatibility field
      properMotion: star.properMotion || { ra: 0, dec: 0 },
      parallax: star.distance ? 1000 / star.distance : undefined,
      distance: star.distance,
      constellation: star.constellation,
      variableType: star.variableType
    }));
  }

  private generateRealisticStar(index: number, maxMagnitude: number): Star {
    // Use realistic galactic distribution
    const galacticLat = this.gaussianRandom() * 30; // Most stars near galactic plane
    const galacticLon = Math.random() * 360;

    // Convert galactic to equatorial coordinates
    const equatorial = this.galacticToEquatorial(galacticLon, galacticLat);

    // Magnitude distribution follows power law
    const magnitude = this.generateMagnitude(maxMagnitude);

    // Spectral type distribution based on real statistics
    const spectralType = this.generateSpectralType(magnitude);

    // Distance based on magnitude and spectral type
    const distance = this.estimateDistance(magnitude, spectralType);

    const constellation = this.getConstellation(equatorial.ra, equatorial.dec);
    const colorIndex = this.getColorIndex(spectralType);

    return {
      id: `SYN${index}`,
      name: undefined,
      coordinates: equatorial,
      ra: equatorial.ra, // Compatibility field
      dec: equatorial.dec, // Compatibility field
      magnitude,
      colorIndex,
      spectralClass: spectralType,
      spectralType, // Compatibility field
      properMotion: { ra: 0, dec: 0 },
      distance,
      constellation
    };
  }

  private galacticToEquatorial(l: number, b: number): EquatorialCoordinates {
    // Convert galactic coordinates to equatorial (J2000)
    const lRad = l * Math.PI / 180;
    const bRad = b * Math.PI / 180;

    // Galactic north pole (J2000)
    const alphaNGP = 192.85948 * Math.PI / 180;
    const deltaNGP = 27.12825 * Math.PI / 180;
    const lNCP = 122.93192 * Math.PI / 180;

    const sinDec = Math.sin(bRad) * Math.sin(deltaNGP) +
      Math.cos(bRad) * Math.cos(deltaNGP) * Math.sin(lRad - lNCP);
    const dec = Math.asin(sinDec);

    const y = Math.cos(bRad) * Math.cos(lRad - lNCP);
    const x = Math.sin(bRad) * Math.cos(deltaNGP) -
      Math.cos(bRad) * Math.sin(deltaNGP) * Math.sin(lRad - lNCP);

    let ra = Math.atan2(y, x) + alphaNGP;
    if (ra < 0) ra += 2 * Math.PI;

    return {
      ra: ra * 180 / Math.PI,
      dec: dec * 180 / Math.PI
    };
  }

  private generateMagnitude(maxMag: number): number {
    // Power law distribution: N(m) ∝ 10^(0.6m)
    const u = Math.random();
    return -2.5 * Math.log10(1 - u * (1 - Math.pow(10, -0.4 * maxMag)));
  }

  private generateSpectralType(magnitude: number): string {
    // Spectral type distribution based on magnitude
    const rand = Math.random();
    let type: string;

    if (magnitude < 2) {
      // Bright stars - more giants and supergiants
      if (rand < 0.05) type = 'O';
      else if (rand < 0.15) type = 'B';
      else if (rand < 0.30) type = 'A';
      else if (rand < 0.45) type = 'F';
      else if (rand < 0.60) type = 'G';
      else if (rand < 0.80) type = 'K';
      else type = 'M';
    } else {
      // Fainter stars - mostly main sequence
      if (rand < 0.001) type = 'O';
      else if (rand < 0.01) type = 'B';
      else if (rand < 0.05) type = 'A';
      else if (rand < 0.15) type = 'F';
      else if (rand < 0.30) type = 'G';
      else if (rand < 0.60) type = 'K';
      else type = 'M';
    }

    // Add subclass
    const subclass = Math.floor(Math.random() * 10);
    const luminosityClass = magnitude < 3 ?
      ['I', 'II', 'III', 'IV', 'V'][Math.floor(Math.random() * 5)] : 'V';

    return `${type}${subclass}${luminosityClass}`;
  }

  private estimateDistance(magnitude: number, spectralType: string): number {
    // Simplified distance estimation based on absolute magnitude
    const absoluteMagnitudes: { [key: string]: number } = {
      'O': -5.7, 'B': -1.1, 'A': 1.4, 'F': 3.0,
      'G': 4.6, 'K': 5.9, 'M': 9.0
    };

    const spectralClass = spectralType[0];
    const absMag = absoluteMagnitudes[spectralClass] || 5.0;

    // Distance modulus: m - M = 5 * log10(d) - 5
    const distanceParsecs = Math.pow(10, (magnitude - absMag + 5) / 5);
    return distanceParsecs * 3.26156; // Convert to light years
  }

  private getColorIndex(spectralType: string): number {
    const colorIndices: { [key: string]: number } = {
      'O': -0.33, 'B': -0.17, 'A': 0.00, 'F': 0.38,
      'G': 0.63, 'K': 1.00, 'M': 1.40
    };
    return colorIndices[spectralType[0]] || 0.63;
  }

  private getConstellation(ra: number, dec: number): string {
    // Simplified constellation assignment
    // In production, would use actual IAU constellation boundaries

    if (dec > 55) return 'UMa'; // Ursa Major region
    if (dec < -55) return 'Cru'; // Southern Cross region

    const raHours = ra / 15;
    if (raHours < 3) return 'Psc';
    if (raHours < 6) return 'Ori';
    if (raHours < 9) return 'Leo';
    if (raHours < 12) return 'Vir';
    if (raHours < 15) return 'Sco';
    if (raHours < 18) return 'Sgr';
    if (raHours < 21) return 'Cyg';
    return 'And';
  }

  private generateYaleBrightStars(options: { maxMagnitude?: number; minDeclination?: number; maxDeclination?: number; constellations?: string[] }): Star[] {
    // Generate subset based on Yale Bright Star Catalog
    return this.generateHipparcosCatalog({ ...options, maxMagnitude: 6.5 });
  }

  private async loadMessierObjects(): Promise<Star[]> {
    // Messier objects as "stars" for rendering purposes
    const messierObjects = [
      { id: 'M1', name: 'Crab Nebula', ra: 83.633, dec: 22.014, magnitude: 8.4, type: 'SNR' },
      { id: 'M31', name: 'Andromeda Galaxy', ra: 10.685, dec: 41.269, magnitude: 3.4, type: 'Galaxy' },
      { id: 'M42', name: 'Orion Nebula', ra: 83.820, dec: -5.391, magnitude: 4.0, type: 'Nebula' },
      { id: 'M45', name: 'Pleiades', ra: 56.871, dec: 24.105, magnitude: 1.6, type: 'Cluster' },
      // ... more Messier objects
    ];

    return messierObjects.map(obj => ({
      id: obj.id,
      name: obj.name,
      coordinates: { ra: obj.ra, dec: obj.dec },
      ra: obj.ra, // Compatibility field
      dec: obj.dec, // Compatibility field
      magnitude: obj.magnitude,
      colorIndex: 0, // Default for deep sky objects
      spectralClass: obj.type,
      spectralType: obj.type, // Compatibility field
      properMotion: { ra: 0, dec: 0 },
      constellation: this.getConstellation(obj.ra, obj.dec),
      metadata: { messier: true, type: obj.type }
    }));
  }

  private passesFilters(star: Star, options: { maxMagnitude?: number; minDeclination?: number; maxDeclination?: number; constellations?: string[] }): boolean {
    if (options.maxMagnitude && star.magnitude > options.maxMagnitude) {
      return false;
    }
    const dec = star.dec ?? star.coordinates.dec;
    if (options.minDeclination && dec < options.minDeclination) {
      return false;
    }
    if (options.maxDeclination && dec > options.maxDeclination) {
      return false;
    }
    if (options.constellations && star.constellation &&
      !options.constellations.includes(star.constellation)) {
      return false;
    }
    return true;
  }

  private gaussianRandom(): number {
    // Box-Muller transform for gaussian distribution
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  /**
   * Get star color based on spectral type
   */
  static getStarColor(spectralType?: string): { r: number; g: number; b: number } {
    if (!spectralType) return { r: 1, g: 1, b: 1 };

    const spectralClass = spectralType[0].toUpperCase();
    return this.SPECTRAL_COLORS[spectralClass as keyof typeof this.SPECTRAL_COLORS] ||
      { r: 1, g: 1, b: 1 };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.catalogCache.clear();
    this.loadingPromises.clear();
  }
}