const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

async function testTarotFlow() {
  console.log("🎴 Testing Tarot Reading Flow...\n");

  // Test 1: Fetch deck from API
  console.log("1️⃣ Testing deck API...");
  try {
    const response = await fetch(
      "http://localhost:3002/api/tarot/deck/00000000-0000-0000-0000-000000000001",
    );
    const data = await response.json();

    if (data.error) {
      console.log(`❌ API Error: ${data.error}`);
      return;
    }

    console.log(`✅ Deck loaded: ${data.deck.name}`);
    console.log(`   Total cards: ${data.stats.totalCards}`);
    console.log(`   Major Arcana: ${data.stats.majorArcana}`);
    console.log(`   Minor Arcana: ${data.stats.minorArcana}`);

    // Test 2: Check if cards have images
    const sampleCard = data.cards[0];
    console.log(`\n2️⃣ Sample card: ${sampleCard.name}`);
    console.log(`   Image: ${sampleCard.frontImage}`);
    console.log(
      `   Meaning: ${sampleCard.meaning.upright.substring(0, 50)}...`,
    );

    // Test 3: Check database connection
    console.log("\n3️⃣ Testing database access...");
    const { data: tableData, error } = await supabase
      .from("cards")
      .select("name")
      .limit(3);

    if (error) {
      console.log(`❌ Database error: ${error.message}`);
    } else {
      console.log(
        `✅ Database accessible, sample cards: ${tableData.map((c) => c.name).join(", ")}`,
      );
    }

    console.log("\n✅ Tarot flow test complete!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testTarotFlow();
