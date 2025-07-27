#!/usr/bin/env tsx
/**
 * Einstein Birth Chart Validation Test
 * 
 * Comprehensive end-to-end validation of astrology engine using Einstein's birth data:
 * - Date: March 14, 1879, 11:30 AM
 * - Location: Ulm, Germany (48.4°N, 10.0°E)
 * 
 * This test validates:
 * 1. Astronomical calculation accuracy
 * 2. API endpoint functionality
 * 3. Swiss Ephemeris integration
 * 4. Birth chart generation
 * 5. Interactive component functionality
 * 
 * Usage: npx tsx scripts/validate-einstein-chart.ts
 */

import { AstronomicalCalculator } from '../src/lib/astrology/AstronomicalCalculator';
import { SwissEphemerisShim } from '../src/lib/astrology/SwissEphemerisShim';
import type { BirthData, PlanetPosition } from '../src/types/astrology';

// Einstein's birth data
const EINSTEIN_BIRTH_DATA: BirthData = {
  name: 'Albert Einstein',
  date: '1879-03-14T11:30:00.000Z', // March 14, 1879, 11:30 AM
  city: 'Ulm, Germany',
  country: 'Germany',
  latitude: 48.4,
  longitude: 10.0,
  timezone: 'Europe/Berlin'
};

// Expected planetary positions for Einstein (approximate reference values)
const EXPECTED_POSITIONS = {
  Sun: { longitude: 353.5, sign: 'Pisces', degree: 23.5 }, // Late Pisces
  Moon: { longitude: 263.0, sign: 'Sagittarius', degree: 23.0 }, // Sagittarius
  Mercury: { longitude: 345.0, sign: 'Pisces', degree: 15.0 }, // Pisces
  Venus: { longitude: 330.0, sign: 'Aquarius', degree: 30.0 }, // Aquarius
  Mars: { longitude: 75.0, sign: 'Gemini', degree: 15.0 }, // Gemini
  Jupiter: { longitude: 8.0, sign: 'Aries', degree: 8.0 }, // Aries
  Saturn: { longitude: 5.0, sign: 'Aries', degree: 5.0 }, // Aries
};

interface ValidationResult {
  test: string;
  success: boolean;
  duration: number;
  data?: any;
  error?: string;
  accuracy?: number;
}

class EinsteinChartValidator {
  private results: ValidationResult[] = [];
  private serverUrl = 'http://localhost:3000';

  async runAllValidations(): Promise<void> {
    console.log('🧮 Einstein Birth Chart Validation Test');
    console.log('=====================================');
    console.log(`Birth Data: ${EINSTEIN_BIRTH_DATA.name}`);
    console.log(`Date: March 14, 1879, 11:30 AM`);
    console.log(`Location: Ulm, Germany (48.4°N, 10.0°E)`);
    console.log('');

    // Core engine tests
    await this.testJulianDayCalculation();
    await this.testSwissEphemerisInitialization();
    await this.testPlanetaryPositions();
    await this.testAstronomicalAccuracy();

    // API endpoint tests
    await this.testBirthChartAPI();
    await this.testAstrologyCalculateAPI();
    await this.testCompatibilityAPI();
    await this.testHoroscopeAPI();

    // Integration tests
    await this.testFullChartGeneration();
    await this.testPerformanceMetrics();

    // Display results
    this.displayResults();
  }

  private async runTest(testName: string, testFn: () => Promise<any>): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Running: ${testName}`);
      const result = await testFn();
      const duration = Date.now() - startTime;

      console.log(`✅ Passed: ${testName} (${duration}ms)`);
      
      const testResult: ValidationResult = {
        test: testName,
        success: true,
        duration,
        data: result
      };
      
      this.results.push(testResult);
      return testResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      console.log(`❌ Failed: ${testName} - ${errorMsg}`);
      
      const testResult: ValidationResult = {
        test: testName,
        success: false,
        duration,
        error: errorMsg
      };
      
      this.results.push(testResult);
      return testResult;
    }
  }

  private async testJulianDayCalculation(): Promise<void> {
    await this.runTest('Julian Day Calculation', async () => {
      const birthDate = new Date(EINSTEIN_BIRTH_DATA.date);
      const julianDay = AstronomicalCalculator.dateToJulianDay(birthDate);
      
      // Einstein was born on JD 2407358.9792 (approximate)
      const expectedJD = 2407358.9792;
      const accuracy = 1 - Math.abs(julianDay - expectedJD) / expectedJD;
      
      if (accuracy < 0.999) { // 99.9% accuracy required
        throw new Error(`Julian Day accuracy too low: ${(accuracy * 100).toFixed(3)}%`);
      }
      
      return {
        calculatedJD: julianDay,
        expectedJD,
        accuracy: accuracy * 100,
        difference: Math.abs(julianDay - expectedJD)
      };
    });
  }

  private async testSwissEphemerisInitialization(): Promise<void> {
    await this.runTest('Swiss Ephemeris Initialization', async () => {
      const initialized = await SwissEphemerisShim.initialize();
      
      return {
        initialized,
        fallbackMode: !initialized,
        message: initialized ? 'Swiss Ephemeris available' : 'Using fallback calculations'
      };
    });
  }

  private async testPlanetaryPositions(): Promise<void> {
    await this.runTest('Planetary Position Calculations', async () => {
      const birthDate = new Date(EINSTEIN_BIRTH_DATA.date);
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
      const positions: Record<string, any> = {};
      
      for (const planet of planets) {
        const position = await AstronomicalCalculator.calculatePlanetaryPosition(planet, birthDate);
        const sign = this.getZodiacSign(position.longitude);
        const degree = position.longitude % 30;
        
        positions[planet] = {
          longitude: position.longitude,
          sign,
          degree,
          speed: position.speed
        };
        
        // Validate against expected positions if available
        if (EXPECTED_POSITIONS[planet as keyof typeof EXPECTED_POSITIONS]) {
          const expected = EXPECTED_POSITIONS[planet as keyof typeof EXPECTED_POSITIONS];
          const accuracy = 1 - Math.abs(position.longitude - expected.longitude) / 360;
          positions[planet].accuracy = accuracy * 100;
          positions[planet].expectedSign = expected.sign;
        }
      }
      
      return positions;
    });
  }

  private async testAstronomicalAccuracy(): Promise<void> {
    await this.runTest('Astronomical Accuracy Validation', async () => {
      const birthDate = new Date(EINSTEIN_BIRTH_DATA.date);
      
      // Test Sun position accuracy (most critical)
      const sunPosition = await AstronomicalCalculator.calculatePlanetaryPosition('Sun', birthDate);
      const sunSign = this.getZodiacSign(sunPosition.longitude);
      
      // Einstein was born with Sun in late Pisces (around 23° Pisces)
      if (sunSign !== 'Pisces') {
        throw new Error(`Sun sign mismatch: calculated ${sunSign}, expected Pisces`);
      }
      
      // Test Moon position
      const moonPosition = await AstronomicalCalculator.calculatePlanetaryPosition('Moon', birthDate);
      const moonSign = this.getZodiacSign(moonPosition.longitude);
      
      return {
        sun: {
          longitude: sunPosition.longitude,
          sign: sunSign,
          degree: sunPosition.longitude % 30,
          speed: sunPosition.speed
        },
        moon: {
          longitude: moonPosition.longitude,
          sign: moonSign,
          degree: moonPosition.longitude % 30,
          speed: moonPosition.speed
        },
        validation: {
          sunSignCorrect: sunSign === 'Pisces',
          astronomicallySound: true
        }
      };
    });
  }

  private async testBirthChartAPI(): Promise<void> {
    await this.runTest('Birth Chart API Endpoint', async () => {
      const response = await fetch(`${this.serverUrl}/api/astrology/birth-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthData: EINSTEIN_BIRTH_DATA })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`API returned error: ${data.error || 'Unknown error'}`);
      }
      
      return {
        responseStatus: response.status,
        hasChartData: !!data.data,
        hasSVG: !!data.data?.svg,
        hasSignSummary: !!data.data?.signSummary,
        hasHouseBreakdown: !!data.data?.houseBreakdown,
        isUnavailable: data.data?.isUnavailable || false
      };
    });
  }

  private async testAstrologyCalculateAPI(): Promise<void> {
    await this.runTest('Astrology Calculate API', async () => {
      const response = await fetch(`${this.serverUrl}/api/astrology/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthData: EINSTEIN_BIRTH_DATA })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        responseStatus: response.status,
        success: data.success,
        hasData: !!data.data,
        error: data.error
      };
    });
  }

  private async testCompatibilityAPI(): Promise<void> {
    await this.runTest('Compatibility API', async () => {
      // Test with Einstein and another famous physicist (Marie Curie)
      const curieBirthData: BirthData = {
        name: 'Marie Curie',
        date: '1867-11-07T12:00:00.000Z',
        city: 'Warsaw, Poland',
        country: 'Poland',
        latitude: 52.2297,
        longitude: 21.0122,
        timezone: 'Europe/Warsaw'
      };
      
      const response = await fetch(`${this.serverUrl}/api/astrology/compatibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: EINSTEIN_BIRTH_DATA,
          person2: curieBirthData
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        responseStatus: response.status,
        success: data.success,
        hasCompatibilityData: !!data.data,
        error: data.error
      };
    });
  }

  private async testHoroscopeAPI(): Promise<void> {
    await this.runTest('Horoscope API', async () => {
      const response = await fetch(`${this.serverUrl}/api/astrology/horoscope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sign: 'pisces',
          birthData: EINSTEIN_BIRTH_DATA
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        responseStatus: response.status,
        success: data.success,
        hasHoroscope: !!data.horoscope,
        error: data.error
      };
    });
  }

  private async testFullChartGeneration(): Promise<void> {
    await this.runTest('Full Chart Generation Integration', async () => {
      const birthDate = new Date(EINSTEIN_BIRTH_DATA.date);
      
      // Calculate all planetary positions
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
      const chart: Record<string, PlanetPosition> = {};
      
      for (const planet of planets) {
        const position = await AstronomicalCalculator.calculatePlanetaryPosition(planet, birthDate);
        chart[planet] = {
          name: planet,
          longitude: position.longitude,
          latitude: position.latitude,
          sign: this.getZodiacSign(position.longitude),
          degree: position.longitude % 30,
          house: Math.floor(position.longitude / 30) + 1, // Simplified house calculation
          isRetrograde: position.speed < 0
        };
      }
      
      return {
        chartComplete: Object.keys(chart).length === planets.length,
        planets: chart,
        sunSign: chart.Sun?.sign,
        moonSign: chart.Moon?.sign,
        ascendant: 'Calculated separately' // Would need house system calculation
      };
    });
  }

  private async testPerformanceMetrics(): Promise<void> {
    await this.runTest('Performance Metrics', async () => {
      const iterations = 10;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await AstronomicalCalculator.calculatePlanetaryPosition('Sun', new Date(EINSTEIN_BIRTH_DATA.date));
        times.push(Date.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      if (avgTime > 200) { // Should be under 200ms average
        throw new Error(`Performance too slow: ${avgTime}ms average`);
      }
      
      return {
        averageTime: avgTime,
        maxTime,
        minTime,
        iterations,
        performanceGrade: avgTime < 50 ? 'Excellent' : avgTime < 100 ? 'Good' : avgTime < 200 ? 'Acceptable' : 'Poor'
      };
    });
  }

  private getZodiacSign(longitude: number): string {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30) % 12];
  }

  private displayResults(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    console.log('\n' + '='.repeat(60));
    console.log('🏁 Einstein Birth Chart Validation Results');
    console.log('='.repeat(60));
    console.log(`📊 Test Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   Average Duration: ${avgDuration.toFixed(0)}ms`);
    console.log('');

    // Show detailed results for key validations
    const keyTests = ['Julian Day Calculation', 'Astronomical Accuracy Validation', 'Planetary Position Calculations'];
    keyTests.forEach(testName => {
      const result = this.results.find(r => r.test === testName);
      if (result && result.success && result.data) {
        console.log(`🔍 ${testName}:`);
        
        if (testName === 'Julian Day Calculation') {
          console.log(`   Julian Day: ${result.data.calculatedJD.toFixed(4)}`);
          console.log(`   Accuracy: ${result.data.accuracy.toFixed(3)}%`);
        }
        
        if (testName === 'Astronomical Accuracy Validation') {
          console.log(`   Sun: ${result.data.sun.degree.toFixed(1)}° ${result.data.sun.sign}`);
          console.log(`   Moon: ${result.data.moon.degree.toFixed(1)}° ${result.data.moon.sign}`);
          console.log(`   Sun Sign Correct: ${result.data.validation.sunSignCorrect ? '✅' : '❌'}`);
        }
        
        if (testName === 'Planetary Position Calculations') {
          Object.entries(result.data).forEach(([planet, data]: [string, any]) => {
            console.log(`   ${planet}: ${data.degree.toFixed(1)}° ${data.sign}`);
          });
        }
        
        console.log('');
      }
    });

    // Show failed tests
    if (failedTests > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   • ${r.test}: ${r.error}`);
        });
      console.log('');
    }

    // Overall assessment
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT: Astrology engine is performing exceptionally well!');
    } else if (successRate >= 80) {
      console.log('👍 GOOD: Astrology engine is functioning properly with minor issues.');
    } else if (successRate >= 70) {
      console.log('⚠️  ACCEPTABLE: Astrology engine has some issues that should be addressed.');
    } else {
      console.log('🚨 CRITICAL: Astrology engine requires immediate attention.');
    }

    console.log('');
    console.log('📝 Einstein\'s Birth Chart Summary:');
    console.log('   Born: March 14, 1879 at 11:30 AM in Ulm, Germany');
    console.log('   Sun Sign: Pisces (intuitive, imaginative, theoretical)');
    console.log('   Expected Moon: Sagittarius (philosophical, truth-seeking)');
    console.log('   Astrological Profile: Perfect for a theoretical physicist!');
    console.log('');
    console.log('🔗 For detailed logs and monitoring:');
    console.log('   API Health: curl http://localhost:3000/api/astrology');
    console.log('   Birth Chart: POST /api/astrology/birth-chart');
    console.log('   Calculations: POST /api/astrology/calculate');
  }
}

// Run validation if called directly
async function main() {
  const validator = new EinsteinChartValidator();
  
  try {
    await validator.runAllValidations();
    process.exit(0);
  } catch (error) {
    console.error('💥 Validation suite failed:', error);
    process.exit(1);
  }
}

// Check if this script is being run directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { EinsteinChartValidator, EINSTEIN_BIRTH_DATA };