#!/usr/bin/env npx tsx

/**
 * Debug Swiss Ephemeris positions to understand the data
 */

async function debugSwissEphPositions() {
  console.log('🔍 Debugging Swiss Ephemeris Positions\n');
  
  try {
    const swisseph = await import('swisseph-v2');
    const swe = swisseph.default || swisseph;
    
    // Test date: March 14, 1987, 16:30 UTC
    const date = new Date('1987-03-14T16:30:00.000Z');
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
    
    // Get Julian Day
    const jdResult = swe.swe_utc_to_jd(year, month, day, hour, 0, 0, 1);
    const jd = jdResult.julianDayUT;
    console.log(`Julian Day: ${jd}\n`);
    
    // Test all planets
    const planets = [
      { name: 'Sun', id: 0, expected: 353.5 },
      { name: 'Moon', id: 1, expected: 163.0 },
      { name: 'Mercury', id: 2, expected: 41.5 },
      { name: 'Venus', id: 3, expected: 77.8 },
      { name: 'Mars', id: 4, expected: 262.1 },
      { name: 'Jupiter', id: 5, expected: 191.6 },
      { name: 'Saturn', id: 6, expected: 262.4 },
      { name: 'Uranus', id: 7, expected: 271.1 },
      { name: 'Neptune', id: 8, expected: 281.9 },
      { name: 'Pluto', id: 9, expected: 224.2 }
    ];
    
    console.log('Planet    | Calc Lon | Expected | Diff  | Speed    | Flags Used');
    console.log('----------|----------|----------|-------|----------|------------');
    
    for (const planet of planets) {
      // Try different flag combinations
      const flagTests = [
        { flags: 256, desc: 'SPEED' },
        { flags: 258, desc: 'SWIEPH|SPEED' },
        { flags: 2, desc: 'SWIEPH' },
        { flags: 0, desc: 'NONE' }
      ];
      
      let bestResult = null;
      let bestDiff = 999;
      
      for (const test of flagTests) {
        try {
          const result = swe.swe_calc_ut(jd, planet.id, test.flags);
          if (result && !result.error) {
            const diff = Math.abs(result.longitude - planet.expected);
            const adjustedDiff = Math.min(diff, Math.abs(diff - 360));
            
            if (adjustedDiff < bestDiff) {
              bestDiff = adjustedDiff;
              bestResult = { ...result, flags: test.desc, diff: adjustedDiff };
            }
          }
        } catch (e) {
          // Skip errors
        }
      }
      
      if (bestResult) {
        const status = bestResult.diff < 1 ? '✅' : bestResult.diff < 5 ? '⚠️' : '❌';
        console.log(
          `${planet.name.padEnd(9)} | ` +
          `${bestResult.longitude.toFixed(1)}° | ` +
          `${planet.expected}° | ` +
          `${bestResult.diff.toFixed(1)}° ${status} | ` +
          `${(bestResult.longitudeSpeed || 0).toFixed(3)} | ` +
          `${bestResult.flags}`
        );
      }
    }
    
    console.log('\n📝 Notes:');
    console.log('- SWIEPH flag (2) uses Swiss Ephemeris data');
    console.log('- SPEED flag (256) calculates daily motion');
    console.log('- Some planets may need heliocentric to geocentric conversion');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run debug
if (import.meta.url === `file://${process.argv[1]}`) {
  debugSwissEphPositions().catch(console.error);
}

export { debugSwissEphPositions };