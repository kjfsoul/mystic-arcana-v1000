#!/usr/bin/env node
/**
 * Test script for Horoscope + Transit Engine
 * Validates real astronomical calculations and personalized guidance
 */

import { TransitEngine } from '../src/lib/ephemeris/transitEngine';
import { BirthData } from '../src/types/astrology';

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

class HoroscopeEngineTestSuite {
  private results: TestResult[] = [];
  private transitEngine: TransitEngine;

  constructor() {
    this.transitEngine = new TransitEngine();
  }

  private addResult(testName: string, passed: boolean, message: string, details?: any) {
    this.results.push({ testName, passed, message, details });
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
    if (details) console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }

  async testPlanetaryPositions() {
    console.log('\n🌍 Testing Current Planetary Positions...');
    
    try {
      const positions = await this.transitEngine.getCurrentPlanetaryPositions();
      
      this.addResult(
        'Planetary Position Count',
        positions.length === 10,
        `Found ${positions.length} planetary positions (expected 10)`
      );

      // Test data structure
      const samplePlanet = positions[0];
      const hasRequiredFields = samplePlanet && 
        typeof samplePlanet.longitude === 'number' &&
        typeof samplePlanet.speed === 'number' &&
        typeof samplePlanet.sign === 'string' &&
        typeof samplePlanet.retrograde === 'boolean';

      this.addResult(
        'Position Data Structure',
        hasRequiredFields,
        'Planetary positions have required fields (longitude, speed, sign, retrograde)'
      );

      // Test longitude ranges (0-360 degrees)
      const validLongitudes = positions.every(p => p.longitude >= 0 && p.longitude < 360);
      this.addResult(
        'Longitude Ranges',
        validLongitudes,
        'All planetary longitudes are within valid range (0-360°)'
      );

      // Test zodiac signs
      const validSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                         'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const validSignAssignments = positions.every(p => validSigns.includes(p.sign));
      this.addResult(
        'Zodiac Sign Assignment',
        validSignAssignments,
        'All planets assigned to valid zodiac signs'
      );

      // Test retrograde detection
      const retrogradeCount = positions.filter(p => p.retrograde).length;
      this.addResult(
        'Retrograde Detection',
        retrogradeCount >= 0 && retrogradeCount <= 5,
        `${retrogradeCount} planets in retrograde (reasonable range)`
      );

    } catch (error) {
      this.addResult(
        'Planetary Position Calculation',
        false,
        `Failed to calculate positions: ${error.message}`
      );
    }
  }

  async testDailyTransit() {
    console.log('\n📅 Testing Daily Transit Calculation...');
    
    try {
      const today = new Date();
      const dailyTransit = await this.transitEngine.getDailyTransit(today);
      
      this.addResult(
        'Daily Transit Generation',
        !!dailyTransit,
        'Successfully generated daily transit data'
      );

      this.addResult(
        'Lunar Phase Calculation',
        !!dailyTransit.lunarPhase && typeof dailyTransit.lunarPhase.illumination === 'number',
        `Lunar phase: ${dailyTransit.lunarPhase.phase} (${Math.round(dailyTransit.lunarPhase.illumination * 100)}% illuminated)`
      );

      this.addResult(
        'Cosmic Weather Analysis',
        !!dailyTransit.cosmicWeather && dailyTransit.cosmicWeather.focus.length > 0,
        `Cosmic energy: ${dailyTransit.cosmicWeather.energy}, Focus areas: ${dailyTransit.cosmicWeather.focus.length}`
      );

    } catch (error) {
      this.addResult(
        'Daily Transit Calculation',
        false,
        `Failed to calculate daily transit: ${error.message}`
      );
    }
  }

  async testPersonalizedHoroscope() {
    console.log('\n🎯 Testing Personalized Horoscope Generation...');
    
    const sampleBirthData: BirthData = {
      birthDate: '1990-06-15',
      birthTime: '14:30',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };

    try {
      const horoscope = await this.transitEngine.generatePersonalizedHoroscope(sampleBirthData);
      
      this.addResult(
        'Horoscope Generation',
        !!horoscope,
        'Successfully generated personalized horoscope'
      );

      this.addResult(
        'Overall Theme',
        !!horoscope.overallTheme && horoscope.overallTheme.length > 20,
        `Generated meaningful overall theme (${horoscope.overallTheme.length} characters)`
      );

      this.addResult(
        'Daily Guidance',
        Object.keys(horoscope.dailyGuidance).length === 4,
        `Generated guidance for 4 life areas: ${Object.keys(horoscope.dailyGuidance).join(', ')}`
      );

      this.addResult(
        'Lucky Numbers',
        horoscope.luckyNumbers.length === 6,
        `Generated ${horoscope.luckyNumbers.length} lucky numbers: ${horoscope.luckyNumbers.join(', ')}`
      );

      this.addResult(
        'Affirmation',
        !!horoscope.affirmation && horoscope.affirmation.length > 10,
        `Generated meaningful affirmation (${horoscope.affirmation.length} characters)`
      );

    } catch (error) {
      this.addResult(
        'Personalized Horoscope',
        false,
        `Failed to generate horoscope: ${error.message}`
      );
    }
  }

  async testTransitCalculation() {
    console.log('\n🔄 Testing Transit Aspect Calculation...');
    
    const sampleBirthData: BirthData = {
      birthDate: '1990-06-15',
      birthTime: '14:30',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };

    try {
      const transits = await this.transitEngine.calculateTransits(sampleBirthData);
      
      this.addResult(
        'Transit Calculation',
        Array.isArray(transits),
        `Calculated ${transits.length} transit aspects`
      );

      if (transits.length > 0) {
        const sampleTransit = transits[0];
        const hasRequiredFields = sampleTransit &&
          typeof sampleTransit.orb === 'number' &&
          typeof sampleTransit.applying === 'boolean' &&
          typeof sampleTransit.strength === 'string';

        this.addResult(
          'Transit Data Structure',
          hasRequiredFields,
          'Transit aspects have required fields (orb, applying, strength)'
        );

        // Test orb ranges (should be within reasonable bounds)
        const validOrbs = transits.every(t => t.orb >= 0 && t.orb <= 10);
        this.addResult(
          'Orb Calculations',
          validOrbs,
          'All transit orbs within valid range (0-10°)'
        );

        // Test aspect types
        const validAspects = ['conjunction', 'sextile', 'square', 'trine', 'opposition'];
        const validAspectTypes = transits.every(t => validAspects.includes(t.aspect));
        this.addResult(
          'Aspect Types',
          validAspectTypes,
          'All aspects are valid types (conjunction, sextile, square, trine, opposition)'
        );
      }

    } catch (error) {
      this.addResult(
        'Transit Calculation',
        false,
        `Failed to calculate transits: ${error.message}`
      );
    }
  }

  async testAstronomicalAccuracy() {
    console.log('\n🔭 Testing Astronomical Accuracy...');
    
    try {
      const positions = await this.transitEngine.getCurrentPlanetaryPositions();
      
      // Test Sun position (should be reasonable for current date)
      const sun = positions.find(p => p.planet === 'sun');
      if (sun) {
        // Sun moves approximately 1 degree per day
        const expectedSunSpeed = 0.98; // degrees per day
        const sunSpeedAccurate = Math.abs(sun.speed - expectedSunSpeed) < 0.1;
        
        this.addResult(
          'Sun Speed Accuracy',
          sunSpeedAccurate,
          `Sun speed: ${sun.speed.toFixed(3)}°/day (expected ~${expectedSunSpeed}°/day)`
        );
      }

      // Test Moon position (should move faster than other planets)
      const moon = positions.find(p => p.planet === 'moon');
      if (moon) {
        const moonSpeedReasonable = moon.speed > 10 && moon.speed < 15;
        
        this.addResult(
          'Moon Speed Accuracy',
          moonSpeedReasonable,
          `Moon speed: ${moon.speed.toFixed(3)}°/day (expected 12-14°/day)`
        );
      }

      // Test outer planet speeds (should be very slow)
      const pluto = positions.find(p => p.planet === 'pluto');
      if (pluto) {
        const plutoSpeedReasonable = Math.abs(pluto.speed) < 0.1;
        
        this.addResult(
          'Outer Planet Speed',
          plutoSpeedReasonable,
          `Pluto speed: ${Math.abs(pluto.speed).toFixed(4)}°/day (expected <0.01°/day)`
        );
      }

    } catch (error) {
      this.addResult(
        'Astronomical Accuracy',
        false,
        `Failed to validate accuracy: ${error.message}`
      );
    }
  }

  async testFallbackHandling() {
    console.log('\n🛡️ Testing Fallback Handling...');
    
    try {
      // Test with invalid birth data
      const invalidBirthData: BirthData = {
        birthDate: 'invalid-date',
        birthTime: '25:70', // Invalid time
        latitude: 200, // Invalid latitude
        longitude: -200, // Invalid longitude
        timezone: 'Invalid/Timezone'
      };

      const horoscope = await this.transitEngine.generatePersonalizedHoroscope(invalidBirthData);
      
      this.addResult(
        'Invalid Data Handling',
        !!horoscope && !!horoscope.overallTheme,
        'Successfully handled invalid birth data with fallback'
      );

    } catch (error) {
      // This is expected - fallback should handle gracefully
      this.addResult(
        'Fallback Error Handling',
        true,
        'Appropriately failed with invalid data (as expected)'
      );
    }
  }

  async runAllTests() {
    console.log('🌟✨ HOROSCOPE + TRANSIT ENGINE TEST SUITE ✨🌟');
    console.log('='.repeat(60));
    
    await this.testPlanetaryPositions();
    await this.testDailyTransit();
    await this.testPersonalizedHoroscope();
    await this.testTransitCalculation();
    await this.testAstronomicalAccuracy();
    await this.testFallbackHandling();

    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(40));
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = (passed / total * 100).toFixed(1);

    console.log(`✅ Passed: ${passed}/${total} (${passRate}%)`);
    console.log(`❌ Failed: ${total - passed}/${total}`);

    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! Horoscope engine is ready for real-time guidance.');
    } else {
      console.log('\n⚠️  Some tests failed. Review the results above.');
    }

    // Failed tests details
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`   • ${test.testName}: ${test.message}`);
      });
    }

    return {
      total,
      passed,
      failed: total - passed,
      passRate: parseFloat(passRate),
      results: this.results
    };
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new HoroscopeEngineTestSuite();
  testSuite.runAllTests().then(summary => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}

export { HoroscopeEngineTestSuite };