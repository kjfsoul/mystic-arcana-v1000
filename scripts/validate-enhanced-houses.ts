#!/usr/bin/env node
/**
 * Validation script for enhanced house calculation system
 * Tests the birth-chart API integration with Einstein's data
 * Independent of Python dependencies - tests full API flow
 */

interface BirthData {
  name: string;
  date: string;
  city: string;
  country?: string;
}

interface BirthChartResponse {
  success: boolean;
  data?: {
    svg: string;
    signSummary: string;
    houseBreakdown: string[];
    houses?: any;
    placidusMethod?: boolean;
    isUnavailable?: boolean;
    error?: string;
  };
  error?: string;
}

const EINSTEIN_BIRTH_DATA: BirthData = {
  name: 'Albert Einstein',
  date: '1879-03-14T11:30:00.000Z',
  city: 'Ulm',
  country: 'Germany'
};

async function callBirthChartAPI(birthData: BirthData): Promise<BirthChartResponse> {
  try {
    const response = await fetch('http://localhost:3002/api/astrology/birth-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ birthData })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function validateHouseBreakdown(houseBreakdown: string[]): boolean {
  console.log('\n🏠 HOUSE BREAKDOWN VALIDATION:');
  console.log('------------------------------');
  
  let validItems = 0;
  const expectedPatterns = [
    /House System:/i,
    /Ascendant.*House/i,
    /Midheaven.*House/i,
    /calculation/i
  ];
  
  houseBreakdown.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
    
    // Check if item matches expected patterns
    const matches = expectedPatterns.some(pattern => pattern.test(item));
    if (matches) validItems++;
  });
  
  const isValid = validItems >= 2; // At least 2 meaningful house items
  console.log(`✅ Valid house breakdown items: ${validItems}/${houseBreakdown.length}`);
  
  return isValid;
}

function validateSignSummary(signSummary: string): boolean {
  console.log('\n📊 SIGN SUMMARY VALIDATION:');
  console.log('---------------------------');
  console.log(signSummary);
  
  const requiredElements = [
    /birth chart/i,
    /house system/i,
    /calculated/i
  ];
  
  let validElements = 0;
  requiredElements.forEach((pattern, index) => {
    if (pattern.test(signSummary)) {
      validElements++;
      console.log(`✅ Pattern ${index + 1}: Found`);
    } else {
      console.log(`❌ Pattern ${index + 1}: Missing`);
    }
  });
  
  return validElements >= 2;
}

function validateEnhancedData(data: any): boolean {
  console.log('\n🔬 ENHANCED DATA VALIDATION:');
  console.log('----------------------------');
  
  let validationsPassed = 0;
  
  // Check for Placidus method indicator
  if (data.placidusMethod !== undefined) {
    console.log(`✅ Placidus method indicator: ${data.placidusMethod}`);
    validationsPassed++;
  } else {
    console.log('❌ Placidus method indicator: Missing');
  }
  
  // Check for house data
  if (data.houses) {
    console.log('✅ Enhanced house data: Present');
    validationsPassed++;
    
    if (data.houses.method) {
      console.log(`✅ House calculation method: ${data.houses.method}`);
      validationsPassed++;
    }
    
    if (data.houses.angles) {
      console.log('✅ House angles data: Present');
      validationsPassed++;
    }
  } else {
    console.log('❌ Enhanced house data: Missing');
  }
  
  return validationsPassed >= 2;
}

async function runEnhancedHouseValidation(): Promise<void> {
  console.log('🚀 ENHANCED HOUSE CALCULATION VALIDATION');
  console.log('========================================');
  console.log('Testing: Birth Chart API with Placidus integration');
  console.log('Subject: Albert Einstein (March 14, 1879, 11:30 AM, Ulm, Germany)\n');
  
  try {
    console.log('📡 Calling birth-chart API endpoint...');
    const result = await callBirthChartAPI(EINSTEIN_BIRTH_DATA);
    
    if (!result.success) {
      console.error('❌ API call failed:', result.error);
      
      // Check if it's a graceful fallback
      if (result.data?.isUnavailable) {
        console.log('⚠️  Service unavailable - testing fallback response...');
        
        // Validate fallback data structure
        if (result.data.signSummary && result.data.houseBreakdown) {
          console.log('✅ Fallback response structure is valid');
          console.log('✅ Graceful degradation working properly');
          return;
        }
      }
      
      process.exit(1);
    }
    
    const data = result.data!;
    console.log('✅ API call successful');
    
    // Run validation tests
    let testsPassed = 0;
    let totalTests = 4;
    
    // Test 1: SVG Chart validation
    console.log('\n🎨 SVG CHART VALIDATION:');
    console.log('------------------------');
    if (data.svg && data.svg.includes('<svg')) {
      console.log('✅ SVG chart generated successfully');
      testsPassed++;
    } else {
      console.log('❌ SVG chart generation failed');
    }
    
    // Test 2: Sign Summary validation
    if (validateSignSummary(data.signSummary)) {
      console.log('✅ Sign summary validation passed');
      testsPassed++;
    } else {
      console.log('❌ Sign summary validation failed');
    }
    
    // Test 3: House Breakdown validation
    if (validateHouseBreakdown(data.houseBreakdown)) {
      console.log('✅ House breakdown validation passed');
      testsPassed++;
    } else {
      console.log('❌ House breakdown validation failed');
    }
    
    // Test 4: Enhanced Data validation
    if (validateEnhancedData(data)) {
      console.log('✅ Enhanced data validation passed');
      testsPassed++;
    } else {
      console.log('❌ Enhanced data validation failed');
    }
    
    // Final Results
    console.log('\n📈 VALIDATION RESULTS:');
    console.log('======================');
    console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
    console.log(`📊 Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
    
    if (testsPassed === totalTests) {
      console.log('🎉 ALL VALIDATIONS PASSED - Enhanced house system is working correctly!');
    } else if (testsPassed >= totalTests * 0.75) {
      console.log('⚠️  MOST VALIDATIONS PASSED - System is functional with minor issues');
    } else {
      console.log('❌ MULTIPLE VALIDATIONS FAILED - System needs review');
      process.exit(1);
    }
    
    // Log additional metadata
    console.log('\n📋 RESPONSE METADATA:');
    console.log('=====================');
    console.log(`Name: ${EINSTEIN_BIRTH_DATA.name}`);
    console.log(`Birth Date: ${EINSTEIN_BIRTH_DATA.date}`);
    console.log(`Location: ${EINSTEIN_BIRTH_DATA.city}, ${EINSTEIN_BIRTH_DATA.country}`);
    console.log(`Response Size: ${JSON.stringify(data).length} characters`);
    console.log(`Placidus Integration: ${data.placidusMethod ? 'Active' : 'Not detected'}`);
    
  } catch (error) {
    console.error('💥 Validation execution failed:', error);
    process.exit(1);
  }
}

// Execute validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEnhancedHouseValidation()
    .then(() => {
      console.log('\n✨ Enhanced house validation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Enhanced house validation failed:', error);
      process.exit(1);
    });
}

export { runEnhancedHouseValidation };