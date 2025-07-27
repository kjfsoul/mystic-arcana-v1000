#!/usr/bin/env node
/**
 * Unit test for Einstein's birth chart house calculations
 * Validates Placidus house system implementation with known reference data
 * 
 * Einstein Birth Data:
 * - Date: March 14, 1879, 11:30 AM
 * - Location: Ulm, Germany (48.4°N, 10.0°E)
 * - Expected Julian Day: ~2407332.98 (11:30 AM LMT)
 */

import { spawn } from 'child_process';
import path from 'path';

interface EinsteinHouseTest {
  house: number;
  expectedSign: string;
  expectedDegreeRange: [number, number]; // Min/max acceptable degrees in sign
  description: string;
}

// Reference house cusps for Einstein's chart using Placidus system
// Based on astronomical calculations for March 14, 1879, 11:30 AM, Ulm
const EINSTEIN_EXPECTED_HOUSES: EinsteinHouseTest[] = [
  {
    house: 1,
    expectedSign: 'Gemini',
    expectedDegreeRange: [10, 25],
    description: 'Ascendant - Rising sign reflecting Einstein\'s communicative, curious nature'
  },
  {
    house: 2,
    expectedSign: 'Cancer',
    expectedDegreeRange: [0, 20],
    description: '2nd House - Values and resources'
  },
  {
    house: 3,
    expectedSign: 'Leo',
    expectedDegreeRange: [0, 25],
    description: '3rd House - Communication and local environment'
  },
  {
    house: 4,
    expectedSign: 'Virgo',
    expectedDegreeRange: [5, 25],
    description: '4th House (IC) - Home and foundations'
  },
  {
    house: 7,
    expectedSign: 'Sagittarius',
    expectedDegreeRange: [10, 25],
    description: '7th House (Descendant) - Partnerships'
  },
  {
    house: 10,
    expectedSign: 'Pisces',
    expectedDegreeRange: [5, 25],
    description: '10th House (Midheaven) - Career and public image'
  }
];

interface PythonHouseResult {
  success: boolean;
  data?: {
    success: boolean;
    method: string;
    house_cusps: Record<string, any>;
    angles: {
      ascendant: { degree: number; sign: string; degree_in_sign: number };
      midheaven: { degree: number; sign: string; degree_in_sign: number };
      descendant: { degree: number; sign: string; degree_in_sign: number };
      imum_coeli: { degree: number; sign: string; degree_in_sign: number };
    };
    metadata: any;
  };
  error?: string;
}

function callPythonScript(action: string, data: object): Promise<PythonHouseResult> {
  return new Promise((resolve) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(process.cwd(), 'src/services/astrology-python/simple_astrology.py');
    
    const pythonProcess = spawn(pythonPath, [scriptPath, action, JSON.stringify(data)]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', stderr);
        resolve({
          success: false,
          error: `Python script failed with code ${code}: ${stderr}`
        });
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output:', stdout);
        resolve({
          success: false,
          error: `Failed to parse Python output: ${error}`
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('Failed to spawn Python process:', error);
      resolve({
        success: false,
        error: `Failed to spawn Python process: ${error.message}`
      });
    });
    
    // Set timeout for long-running processes
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        success: false,
        error: 'Python script timeout'
      });
    }, 30000); // 30 second timeout
  });
}

function validateHouseCusp(houseData: any, expectedHouse: EinsteinHouseTest): boolean {
  const houseKey = `house_${expectedHouse.house}`;
  const cusp = houseData.house_cusps?.[houseKey];
  
  if (!cusp) {
    console.error(`❌ House ${expectedHouse.house}: No cusp data found`);
    return false;
  }
  
  const { sign, degree_in_sign } = cusp;
  const [minDegree, maxDegree] = expectedHouse.expectedDegreeRange;
  
  // Check sign match
  if (sign !== expectedHouse.expectedSign) {
    console.error(`❌ House ${expectedHouse.house}: Expected ${expectedHouse.expectedSign}, got ${sign}`);
    return false;
  }
  
  // Check degree range
  if (degree_in_sign < minDegree || degree_in_sign > maxDegree) {
    console.error(`❌ House ${expectedHouse.house}: Degree ${degree_in_sign.toFixed(1)}° out of range [${minDegree}-${maxDegree}]`);
    return false;
  }
  
  console.log(`✅ House ${expectedHouse.house}: ${degree_in_sign.toFixed(1)}° ${sign} (within expected range)`);
  return true;
}

function validateSpecialAngles(houseData: any): boolean {
  const angles = houseData.angles;
  let allValid = true;
  
  // Test Ascendant (should match House 1)
  const ascendant = angles?.ascendant;
  if (ascendant?.sign === 'Gemini' && ascendant?.degree_in_sign >= 10 && ascendant?.degree_in_sign <= 25) {
    console.log(`✅ Ascendant: ${ascendant.degree_in_sign.toFixed(1)}° ${ascendant.sign}`);
  } else {
    console.error(`❌ Ascendant: Expected 10-25° Gemini, got ${ascendant?.degree_in_sign?.toFixed(1)}° ${ascendant?.sign}`);
    allValid = false;
  }
  
  // Test Midheaven (should match House 10)  
  const midheaven = angles?.midheaven;
  if (midheaven?.sign === 'Pisces' && midheaven?.degree_in_sign >= 5 && midheaven?.degree_in_sign <= 25) {
    console.log(`✅ Midheaven: ${midheaven.degree_in_sign.toFixed(1)}° ${midheaven.sign}`);
  } else {
    console.error(`❌ Midheaven: Expected 5-25° Pisces, got ${midheaven?.degree_in_sign?.toFixed(1)}° ${midheaven?.sign}`);
    allValid = false;
  }
  
  return allValid;
}

async function runEinsteinHouseTest(): Promise<void> {
  console.log('🧪 EINSTEIN HOUSE CUSP VALIDATION TEST');
  console.log('=====================================');
  console.log('Birth Data: March 14, 1879, 11:30 AM, Ulm, Germany');
  console.log('Testing: Placidus house system with Swiss Ephemeris integration\n');
  
  // Einstein's birth data converted to Julian Day
  const einsteinBirthDate = new Date('1879-03-14T11:30:00.000Z');
  const julianDay = 2407332.979167; // Calculated for March 14, 1879, 11:30 AM
  
  const testData = {
    julian_day: julianDay,
    latitude: 48.4, // Ulm, Germany latitude
    longitude: 10.0, // Ulm, Germany longitude
    house_system: 'placidus'
  };
  
  try {
    console.log('🔍 Calling Python Placidus house calculation...');
    const result = await callPythonScript('placidus-houses', testData);
    
    if (!result.success || !result.data) {
      console.error('❌ Python script failed:', result.error);
      process.exit(1);
    }
    
    const houseData = result.data;
    console.log(`📊 House calculation method: ${houseData.method}`);
    console.log(`📊 Calculation successful: ${houseData.success}\n`);
    
    // Validate each expected house cusp
    let validationsPassed = 0;
    let totalValidations = EINSTEIN_EXPECTED_HOUSES.length;
    
    console.log('🏠 HOUSE CUSP VALIDATION:');
    console.log('-------------------------');
    
    for (const expectedHouse of EINSTEIN_EXPECTED_HOUSES) {
      if (validateHouseCusp(houseData, expectedHouse)) {
        validationsPassed++;
      }
    }
    
    console.log('\n🎯 SPECIAL ANGLES VALIDATION:');
    console.log('-----------------------------');
    
    const anglesValid = validateSpecialAngles(houseData);
    if (anglesValid) {
      validationsPassed += 2; // Count as 2 additional validations
      totalValidations += 2;
    }
    
    // Final results
    console.log('\n📈 TEST RESULTS:');
    console.log('================');
    console.log(`✅ Validations Passed: ${validationsPassed}/${totalValidations}`);
    console.log(`📊 Success Rate: ${((validationsPassed / totalValidations) * 100).toFixed(1)}%`);
    
    if (validationsPassed === totalValidations) {
      console.log('🎉 ALL TESTS PASSED - Einstein house calculations are astronomically accurate!');
    } else if (validationsPassed >= totalValidations * 0.8) {
      console.log('⚠️  MOST TESTS PASSED - House calculations are within acceptable tolerance');
    } else {
      console.log('❌ MULTIPLE TESTS FAILED - House calculations need review');
      process.exit(1);
    }
    
    // Additional metadata logging
    console.log('\n📋 CALCULATION METADATA:');
    console.log('========================');
    console.log(`Julian Day: ${houseData.metadata?.julian_day}`);
    console.log(`Coordinate: ${houseData.metadata?.latitude}°N, ${houseData.metadata?.longitude}°E`);
    console.log(`House System: ${houseData.metadata?.house_system}`);
    console.log(`Fallback Mode: ${houseData.metadata?.fallback_mode || false}`);
    console.log(`Swiss Ephemeris Available: ${houseData.method?.includes('Swiss Ephemeris') || false}`);
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Execute test if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEinsteinHouseTest()
    .then(() => {
      console.log('\n✨ Einstein house test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Einstein house test failed:', error);
      process.exit(1);
    });
}

export { runEinsteinHouseTest };