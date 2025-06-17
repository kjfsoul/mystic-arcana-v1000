#!/usr/bin/env node

/**
 * Diagnostic script to check tarot system status
 * Run this to see what's wrong with the "draw cards" functionality
 */

console.log('🔮 MYSTIC ARCANA TAROT DIAGNOSTIC\n');

// Check 1: Environment Variables
console.log('1️⃣ Checking Environment Variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

let envOk = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: Set`);
  } else {
    console.log(`   ❌ ${envVar}: Missing`);
    envOk = false;
  }
});

if (!envOk) {
  console.log('\n❌ Environment variables missing. Check your .env.local file.');
  process.exit(1);
}

// Check 2: API Endpoint Test
console.log('\n2️⃣ Testing API Endpoint...');
const RIDER_WAITE_DECK_ID = '00000000-0000-0000-0000-000000000001';

async function testAPI() {
  try {
    const response = await fetch(`http://localhost:3000/api/tarot/deck/${RIDER_WAITE_DECK_ID}`);
    
    if (!response.ok) {
      console.log(`   ❌ API Error: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.log(`   📄 Error Details:`, errorData);
      return false;
    }
    
    const data = await response.json();
    console.log(`   ✅ API Success: ${data.cards.length} cards loaded`);
    console.log(`   📊 Deck: "${data.deck.name}"`);
    console.log(`   📈 Stats: ${data.stats.majorArcana} Major + ${data.stats.minorArcana} Minor`);
    
    if (data.cards.length === 78) {
      console.log('   🎉 Complete 78-card deck found!');
      return true;
    } else if (data.cards.length === 0) {
      console.log('   ⚠️ Deck exists but no cards found - needs seeding');
      return false;
    } else {
      console.log(`   ⚠️ Incomplete deck: ${data.cards.length}/78 cards`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ API Test Failed: ${error.message}`);
    return false;
  }
}

// Check 3: Provide Solutions
function provideSolutions(apiWorking) {
  console.log('\n3️⃣ Diagnosis & Solutions...');
  
  if (apiWorking) {
    console.log('   ✅ SYSTEM STATUS: WORKING');
    console.log('   🎯 The tarot "draw cards" functionality should work correctly.');
    console.log('   💡 If you\'re still having issues, try refreshing the page.');
  } else {
    console.log('   ❌ SYSTEM STATUS: NEEDS ATTENTION');
    console.log('\n   🔧 SOLUTIONS TO TRY:');
    console.log('   1. Make sure dev server is running: npm run dev');
    console.log('   2. Seed the database: npm run seed:tarot');
    console.log('   3. Check Supabase project is active');
    console.log('   4. Verify environment variables in .env.local');
    console.log('   5. Check browser console for errors');
  }
}

// Main execution
async function main() {
  const apiWorking = await testAPI();
  provideSolutions(apiWorking);
  
  console.log('\n🔮 Diagnostic Complete!');
  console.log('📝 If issues persist, check the browser console for detailed error messages.');
}

// Only run if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Diagnostic failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testAPI };
