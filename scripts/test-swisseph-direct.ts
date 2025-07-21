#!/usr/bin/env npx tsx

/**
 * Direct test of swisseph-v2 to verify its API
 */

async function testSwissEphDirect() {
  console.log('🔧 Testing swisseph-v2 directly...\n');
  
  try {
    const swisseph = await import('swisseph-v2');
    console.log('✅ swisseph-v2 module loaded');
    
    // Check available methods
    console.log('\n📚 Available methods:');
    const methods = Object.keys(swisseph.default || swisseph).filter(key => typeof (swisseph.default || swisseph)[key] === 'function');
    console.log(methods.slice(0, 10).join(', ') + '...');
    
    // Try to use the API
    const swe = swisseph.default || swisseph;
    
    // Test date conversion
    console.log('\n📅 Testing date conversion:');
    const date = new Date('1987-03-14T16:30:00.000Z');
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
    
    console.log(`Input: ${year}-${month}-${day} ${hour}h UTC`);
    
    // Try different API patterns
    console.log('\n🔍 Trying different API patterns:');
    
    // Pattern 1: swe_utc_to_jd
    if (swe.swe_utc_to_jd) {
      try {
        const result = swe.swe_utc_to_jd(year, month, day, hour, 0, 0, 1);
        console.log('Pattern 1 (swe_utc_to_jd):', result);
      } catch (e) {
        console.log('Pattern 1 failed:', e.message);
      }
    }
    
    // Pattern 2: utc_to_jd
    if (swe.utc_to_jd) {
      try {
        const result = swe.utc_to_jd(year, month, day, hour, 0, 0);
        console.log('Pattern 2 (utc_to_jd):', result);
      } catch (e) {
        console.log('Pattern 2 failed:', e.message);
      }
    }
    
    // Pattern 3: julday
    if (swe.julday) {
      try {
        const result = swe.julday(year, month, day, hour);
        console.log('Pattern 3 (julday):', result);
      } catch (e) {
        console.log('Pattern 3 failed:', e.message);
      }
    }
    
    // Pattern 4: constants check
    console.log('\n🌟 Checking constants:');
    console.log('SE_SUN:', swe.SE_SUN);
    console.log('SE_MOON:', swe.SE_MOON);
    console.log('SEFLG_SPEED:', swe.SEFLG_SPEED);
    
    // Pattern 5: calc function variants
    console.log('\n🪐 Testing calc functions:');
    const testJd = 2446869.1875; // Known JD for our test date
    
    if (swe.swe_calc_ut) {
      try {
        const result = swe.swe_calc_ut(testJd, 0, 256); // Sun with speed flag
        console.log('swe_calc_ut result:', result);
      } catch (e) {
        console.log('swe_calc_ut failed:', e.message);
      }
    }
    
    if (swe.calc_ut) {
      try {
        const result = swe.calc_ut(testJd, 0, 256);
        console.log('calc_ut result:', result);
      } catch (e) {
        console.log('calc_ut failed:', e.message);
      }
    }
    
    if (swe.calc) {
      try {
        const result = swe.calc(testJd, 0, 256);
        console.log('calc result:', result);
      } catch (e) {
        console.log('calc failed:', e.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to test swisseph-v2:', error);
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testSwissEphDirect().catch(console.error);
}

export { testSwissEphDirect };