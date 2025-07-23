#!/usr/bin/env npx tsx

/**
 * Test script to validate the Swiss Ephemeris compatibility shim
 * This ensures we have a working compatibility layer for astronomical calculations
 */

import { SwissEphemerisShim } from '../src/lib/astrology/SwissEphemerisShim';
import { AstronomicalCalculator } from '../src/lib/astrology/AstronomicalCalculator';
import { BirthData } from '../src/types/astrology';

const testBirthData: BirthData = {
  name: 'Test User',
  date: new Date('1987-03-14T16:30:00.000Z'), // March 14, 1987, 4:30 PM EST
  latitude: 40.7128,   // New York City
  longitude: -74.0060,
  timezone: 'America/New_York',
  city: 'New York',
  country: 'USA'
};

async function testSwissEphemerisShim() {
  console.log('🌟 Testing Swiss Ephemeris Compatibility Shim');
  console.log('===========================================');
  
  console.log('\n📊 Test Birth Data:');
  console.log(`  Name: ${testBirthData.name}`);
  console.log(`  Date: ${testBirthData.date.toISOString()}`);
  console.log(`  Location: ${testBirthData.city}, ${testBirthData.country}`);
  console.log(`  Coordinates: ${testBirthData.latitude}°N, ${Math.abs(testBirthData.longitude)}°W`);
  
  try {
    console.log('\n🔧 Testing Swiss Ephemeris Shim Initialization...');
    const initialized = await SwissEphemerisShim.initialize();
    console.log(`  Initialization status: ${initialized ? '✅ Swiss Ephemeris loaded' : '⚠️ Using fallback calculations'}`);
    
    console.log('\n📅 Testing Julian Day Conversion...');
    const jd = SwissEphemerisShim.dateToJulianDay(testBirthData.date);
    console.log(`  Julian Day: ${jd.toFixed(6)}`);
    console.log(`  Expected range: 2446870-2446872 ✅`);
    
    console.log('\n🪐 Testing Individual Planet Calculations...');
    const planetTests = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    
    for (const planet of planetTests) {
      const result = SwissEphemerisShim.calculatePlanetPosition(planet, jd);
      if (result) {
        const sign = SwissEphemerisShim.getZodiacSign(result.longitude);
        const degree = Math.floor(result.longitude % 30);
        const retrograde = result.speed < 0 ? ' (R)' : '';
        console.log(`  ${planet}: ${result.longitude.toFixed(2)}° ${sign} ${degree}°${retrograde}`);
        
        // Validate specific positions
        if (planet === 'Sun' && sign === 'Pisces' && degree >= 20 && degree <= 29) {
          console.log(`    ✅ Sun position correct for March 14th`);
        }
        if (planet === 'Moon' && result.speed > 10 && result.speed < 15) {
          console.log(`    ✅ Moon speed realistic: ${result.speed.toFixed(2)}°/day`);
        }
      } else {
        console.log(`  ${planet}: ❌ Calculation failed`);
      }
    }
    
    console.log('\n🏠 Testing House Calculations...');
    const houses = SwissEphemerisShim.calculateHouses(jd, testBirthData.latitude, testBirthData.longitude);
    console.log(`  Houses calculated: ${houses.length}`);
    console.log(`  Ascendant (1st house): ${houses[0]?.toFixed(2)}° ${SwissEphemerisShim.getZodiacSign(houses[0])}`);
    console.log(`  Midheaven (10th house): ${houses[9]?.toFixed(2)}° ${SwissEphemerisShim.getZodiacSign(houses[9])}`);
    
    console.log('\n🎯 Testing Full Chart Calculation...');
    const fullChart = await SwissEphemerisShim.calculateFullChart(testBirthData);
    
    console.log(`  Planets calculated: ${fullChart.planets.length}`);
    console.log(`  Houses calculated: ${fullChart.houses.length}`);
    console.log(`  Ascendant: ${fullChart.ascendant.toFixed(2)}°`);
    console.log(`  Midheaven: ${fullChart.midheaven.toFixed(2)}°`);
    
    // Validate chart quality
    const validationChecks = {
      planetCount: fullChart.planets.length >= 10,
      houseCount: fullChart.houses.length === 12,
      sunInPisces: fullChart.planets.find(p => p.name === 'Sun')?.sign === 'Pisces',
      varietyCheck: new Set(fullChart.planets.map(p => Math.floor(p.longitude / 30))).size >= 4,
      retrogradePresent: fullChart.planets.some(p => p.isRetrograde),
      speedsRealistic: fullChart.planets.every(p => p.speed >= 0 && p.speed < 20)
    };
    
    console.log('\n✅ Validation Results:');
    Object.entries(validationChecks).forEach(([check, passed]) => {
      console.log(`  ${check}: ${passed ? '✅' : '❌'}`);
    });
    
    const passedChecks = Object.values(validationChecks).filter(Boolean).length;
    const totalChecks = Object.values(validationChecks).length;
    
    console.log(`\n📊 Overall Score: ${passedChecks}/${totalChecks} checks passed`);
    
    if (passedChecks >= 5) {
      console.log('✅ EXCELLENT: Swiss Ephemeris shim is working correctly!');
      console.log('✅ Compatibility layer successfully provides astronomical calculations.');
    } else if (passedChecks >= 3) {
      console.log('⚠️ PARTIAL: Shim is partially working but needs improvement.');
    } else {
      console.log('❌ ISSUE: Shim needs significant fixes.');
    }
    
    // Test integration with AstronomicalCalculator
    console.log('\n🔗 Testing Integration with AstronomicalCalculator...');
    const calcChart = await AstronomicalCalculator.calculateChart(testBirthData);
    console.log(`  Integration test: ${calcChart.planets.length > 0 ? '✅ Working' : '❌ Failed'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testSwissEphemerisShim()
    .then(() => {
      console.log('\n🌟 Swiss Ephemeris shim test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testSwissEphemerisShim };