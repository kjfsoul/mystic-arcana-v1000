/**
 * Real-Time Ephemeris System
 * 
 * Calculates real-time planetary positions, lunar phases, and celestial events
 * for integration into the cosmic UI elements.
 */

export interface PlanetaryPosition {
  name: string;
  x: number; // Screen position (0-1)
  y: number; // Screen position (0-1)
  size: number; // Relative size
  color: string;
  brightness: number; // 0-1
  angle: number; // Current orbital angle in degrees
  speed: number; // Animation speed multiplier
  trail: { x: number; y: number; opacity: number }[];
}

export interface LunarPhase {
  phase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  illumination: number; // 0-1
  age: number; // Days since new moon
  energy: 'manifestation' | 'growth' | 'culmination' | 'release';
  nextPhase: string;
  daysToNext: number;
}

export interface CelestialWeather {
  solarWind: {
    speed: number; // km/s
    density: number;
    intensity: 'low' | 'moderate' | 'high' | 'extreme';
  };
  geomagneticActivity: {
    kIndex: number; // 0-9
    activity: 'quiet' | 'unsettled' | 'active' | 'storm';
  };
  cosmicRayIntensity: number; // 0-1
}

export interface AsteroidData {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  brightness: number;
  type: 'rocky' | 'metallic' | 'carbonaceous';
}

class RealTimeEphemeris {
  private startTime: number;
  private planetaryData: Map<string, PlanetaryPosition>;
  private asteroidBelt: AsteroidData[];
  private updateInterval: number = 1000; // 1 second

  constructor() {
    this.startTime = Date.now();
    this.planetaryData = new Map();
    this.asteroidBelt = [];
    this.initializePlanets();
    this.initializeAsteroidBelt();
  }

  private initializePlanets(): void {
    const planets = [
      { name: 'Mercury', baseAngle: 0, speed: 4.15, size: 0.8, color: '#FFC649' },
      { name: 'Venus', baseAngle: 45, speed: 1.62, size: 1.2, color: '#FFC649' },
      { name: 'Mars', baseAngle: 90, speed: 0.53, size: 1.0, color: '#FF6B47' },
      { name: 'Jupiter', baseAngle: 135, speed: 0.08, size: 2.5, color: '#D8CA9D' },
      { name: 'Saturn', baseAngle: 180, speed: 0.03, size: 2.2, color: '#FAD5A5' },
      { name: 'Uranus', baseAngle: 225, speed: 0.01, size: 1.8, color: '#4FD0E7' },
      { name: 'Neptune', baseAngle: 270, speed: 0.006, size: 1.7, color: '#4B70DD' }
    ];

    planets.forEach(planet => {
      this.planetaryData.set(planet.name, {
        name: planet.name,
        x: 0.5,
        y: 0.5,
        size: planet.size,
        color: planet.color,
        brightness: 0.7 + Math.random() * 0.3,
        angle: planet.baseAngle,
        speed: planet.speed,
        trail: []
      });
    });
  }

  private initializeAsteroidBelt(): void {
    // Create 50 asteroids in the belt between Mars and Jupiter
    for (let i = 0; i < 50; i++) {
      this.asteroidBelt.push({
        id: `asteroid-${i}`,
        x: Math.random(),
        y: Math.random(),
        size: 0.1 + Math.random() * 0.3,
        speed: 0.1 + Math.random() * 0.2,
        angle: Math.random() * 360,
        brightness: 0.3 + Math.random() * 0.4,
        type: ['rocky', 'metallic', 'carbonaceous'][Math.floor(Math.random() * 3)] as any
      });
    }
  }

  public updatePlanetaryPositions(): Map<string, PlanetaryPosition> {
    const currentTime = Date.now();
    const elapsed = (currentTime - this.startTime) / 1000; // seconds

    this.planetaryData.forEach((planet, name) => {
      // Update orbital position
      const currentAngle = (planet.angle + (planet.speed * elapsed * 0.1)) % 360;
      const radians = (currentAngle * Math.PI) / 180;
      
      // Calculate elliptical orbit positions
      const orbitRadius = 0.2 + (Array.from(this.planetaryData.keys()).indexOf(name) * 0.08);
      const x = 0.5 + Math.cos(radians) * orbitRadius;
      const y = 0.5 + Math.sin(radians) * orbitRadius * 0.6; // Elliptical

      // Update trail
      const newTrailPoint = { x, y, opacity: 1.0 };
      planet.trail.unshift(newTrailPoint);
      
      // Fade and limit trail length
      planet.trail = planet.trail.slice(0, 20).map((point, index) => ({
        ...point,
        opacity: Math.max(0, 1 - (index * 0.1))
      }));

      // Update brightness with subtle pulsing
      const pulseSpeed = 0.5 + (planet.speed * 0.1);
      planet.brightness = 0.6 + 0.3 * Math.sin(elapsed * pulseSpeed);

      this.planetaryData.set(name, {
        ...planet,
        x,
        y,
        angle: currentAngle,
        brightness: planet.brightness
      });
    });

    return this.planetaryData;
  }

  public updateAsteroidBelt(): AsteroidData[] {
    const currentTime = Date.now();
    const elapsed = (currentTime - this.startTime) / 1000;

    return this.asteroidBelt.map(asteroid => {
      const newAngle = (asteroid.angle + (asteroid.speed * elapsed * 0.05)) % 360;
      const radians = (newAngle * Math.PI) / 180;
      
      // Asteroid belt position (between Mars and Jupiter orbits)
      const beltRadius = 0.35 + (Math.random() * 0.1);
      const x = 0.5 + Math.cos(radians) * beltRadius;
      const y = 0.5 + Math.sin(radians) * beltRadius * 0.7;

      return {
        ...asteroid,
        x,
        y,
        angle: newAngle,
        brightness: asteroid.brightness * (0.8 + 0.4 * Math.sin(elapsed * 0.3))
      };
    });
  }

  public getCurrentLunarPhase(): LunarPhase {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    
    // Simplified lunar phase calculation (approximate)
    const dayOfYear = Math.floor((now.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
    const lunarCycle = 29.53; // Average lunar cycle in days
    const phasePosition = (dayOfYear % lunarCycle) / lunarCycle;
    
    let phase: LunarPhase['phase'];
    let energy: LunarPhase['energy'];
    
    if (phasePosition < 0.125) {
      phase = 'new';
      energy = 'manifestation';
    } else if (phasePosition < 0.25) {
      phase = 'waxing-crescent';
      energy = 'growth';
    } else if (phasePosition < 0.375) {
      phase = 'first-quarter';
      energy = 'growth';
    } else if (phasePosition < 0.5) {
      phase = 'waxing-gibbous';
      energy = 'growth';
    } else if (phasePosition < 0.625) {
      phase = 'full';
      energy = 'culmination';
    } else if (phasePosition < 0.75) {
      phase = 'waning-gibbous';
      energy = 'release';
    } else if (phasePosition < 0.875) {
      phase = 'last-quarter';
      energy = 'release';
    } else {
      phase = 'waning-crescent';
      energy = 'release';
    }

    const illumination = phasePosition < 0.5 ? phasePosition * 2 : (1 - phasePosition) * 2;
    const age = phasePosition * lunarCycle;
    const daysToNext = lunarCycle - age;

    return {
      phase,
      illumination,
      age,
      energy,
      nextPhase: this.getNextPhase(phase),
      daysToNext: Math.ceil(daysToNext)
    };
  }

  private getNextPhase(currentPhase: LunarPhase['phase']): string {
    const phases = ['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 'full', 'waning-gibbous', 'last-quarter', 'waning-crescent'];
    const currentIndex = phases.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex].replace('-', ' ');
  }

  public getCelestialWeather(): CelestialWeather {
    // Simulated space weather data (in production, this would come from NOAA/NASA APIs)
    const time = Date.now() / 1000;
    
    const solarWindSpeed = 300 + 100 * Math.sin(time * 0.001) + 50 * Math.random();
    const kIndex = Math.floor(3 + 3 * Math.sin(time * 0.0005) + Math.random() * 2);
    
    let solarIntensity: CelestialWeather['solarWind']['intensity'];
    if (solarWindSpeed < 350) solarIntensity = 'low';
    else if (solarWindSpeed < 450) solarIntensity = 'moderate';
    else if (solarWindSpeed < 600) solarIntensity = 'high';
    else solarIntensity = 'extreme';

    let geoActivity: CelestialWeather['geomagneticActivity']['activity'];
    if (kIndex < 3) geoActivity = 'quiet';
    else if (kIndex < 5) geoActivity = 'unsettled';
    else if (kIndex < 7) geoActivity = 'active';
    else geoActivity = 'storm';

    return {
      solarWind: {
        speed: solarWindSpeed,
        density: 5 + 3 * Math.sin(time * 0.002),
        intensity: solarIntensity
      },
      geomagneticActivity: {
        kIndex,
        activity: geoActivity
      },
      cosmicRayIntensity: 0.5 + 0.3 * Math.sin(time * 0.0003)
    };
  }

  public getConstellationHighlights(): string[] {
    // Return constellations that should be highlighted based on current astrological transits
    const month = new Date().getMonth();
    const seasonalConstellations = [
      ['Capricorn', 'Aquarius', 'Pisces'], // Winter
      ['Aries', 'Taurus', 'Gemini'],       // Spring
      ['Cancer', 'Leo', 'Virgo'],          // Summer
      ['Libra', 'Scorpio', 'Sagittarius']  // Autumn
    ];
    
    const season = Math.floor(month / 3);
    return seasonalConstellations[season] || [];
  }
}

// Singleton instance
export const ephemeris = new RealTimeEphemeris();

// Utility functions
export const formatLunarPhase = (phase: LunarPhase['phase']): string => {
  return phase.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export const getLunarEnergyColor = (energy: LunarPhase['energy']): string => {
  const colors = {
    manifestation: '#4A90E2',
    growth: '#7ED321',
    culmination: '#F5A623',
    release: '#9013FE'
  };
  return colors[energy];
};

export const getSolarWindColor = (intensity: CelestialWeather['solarWind']['intensity']): string => {
  const colors = {
    low: '#4A90E2',
    moderate: '#7ED321',
    high: '#F5A623',
    extreme: '#D0021B'
  };
  return colors[intensity];
};
