#!/usr/bin/env node

/**
 * Quick test script to check if the tarot API is working
 * and seed the database if needed
 */

const RIDER_WAITE_DECK_ID = "00000000-0000-0000-0000-000000000001";

async function testTarotAPI() {
  console.log("🃏 Testing Tarot API...");

  try {
    // Test the API endpoint
    const response = await fetch(
      `http://localhost:3000/api/tarot/deck/${RIDER_WAITE_DECK_ID}`,
    );

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.error("Error details:", errorData);
      return false;
    }

    const data = await response.json();
    console.log(
      `✅ API Success: Loaded ${data.cards.length} cards from "${data.deck.name}"`,
    );
    console.log(
      `📊 Stats: ${data.stats.majorArcana} Major + ${data.stats.minorArcana} Minor Arcana`,
    );

    if (data.cards.length === 78) {
      console.log("🎉 Complete deck loaded successfully!");
      return true;
    } else {
      console.warn(
        `⚠️ Incomplete deck: Expected 78 cards, got ${data.cards.length}`,
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Failed to test API:", error.message);
    return false;
  }
}

async function checkDeckInDatabase() {
  console.log("🔍 Checking if deck exists in database...");

  try {
    // This would require Supabase client setup
    // For now, we'll rely on the API test
    console.log("ℹ️ Use the API test to verify database state");
    return true;
  } catch (error) {
    console.error("❌ Database check failed:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Tarot System Diagnostic...\n");

  // Test 1: Check if API is working
  const apiWorking = await testTarotAPI();

  if (apiWorking) {
    console.log("\n✅ Tarot system is working correctly!");
    console.log('🎯 The "draw cards" functionality should now work properly.');
  } else {
    console.log("\n❌ Tarot system needs attention:");
    console.log("1. Make sure the development server is running: npm run dev");
    console.log("2. Check that Supabase environment variables are set");
    console.log("3. Verify the database migrations have been applied");
    console.log("4. Run the seeding script: npm run seed:tarot");
  }
}

// Run the diagnostic
main().catch(console.error);
