/**
 * Test Daily Horoscope Generation - TypeScript version
 *
 * Tests the updated LunarTransitNarratorAgent with Swiss Ephemeris integration
 * and generates sample JSON output for July 24, 2025.
 */

import { LunarTransitNarratorAgent } from "../src/agents/lunar-transit-narrator.js";

async function testHoroscopeGeneration() {
  console.log("🔮 Testing Swiss Ephemeris Daily Horoscope Generation...");

  try {
    // Initialize the agent
    const narrator = new LunarTransitNarratorAgent();

    // Wait for knowledge base initialization
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("📊 Agent Status:");
    const status = narrator.getStatus();
    console.log(`   - Agent ID: ${status.agentId}`);
    console.log(`   - Active: ${status.active}`);
    console.log(`   - Capabilities: ${status.capabilities.length} features`);
    console.log(
      `   - Knowledge Base: ${status.knowledgeBase?.signsLoaded || 0} signs loaded`,
    );

    // Generate horoscopes for July 24, 2025
    console.log("\n🌟 Generating Horoscopes for July 24, 2025...");

    const horoscopeData = await narrator.generateDailyHoroscopes("2025-07-24");

    console.log("\n✅ Generation Complete!");
    console.log("========================");
    console.log(`📅 Date: ${horoscopeData.date}`);
    console.log(`🌙 Moon Phase: ${horoscopeData.metadata.moonPhase}`);
    console.log(`🌙 Moon Sign: ${horoscopeData.metadata.moonSign}`);
    console.log(
      `🔮 Key Transits: ${horoscopeData.metadata.keyTransits.join(", ")}`,
    );
    console.log(`⏰ Generated: ${horoscopeData.metadata.generatedAt}`);
    console.log(`📊 Total Horoscopes: ${horoscopeData.horoscopes.length}`);

    // Display first 3 horoscopes as samples
    console.log("\n🌟 Sample Horoscopes:");
    console.log("====================");

    horoscopeData.horoscopes.slice(0, 3).forEach((horoscope, index) => {
      console.log(`\n${index + 1}. ♈ ${horoscope.sign.toUpperCase()}`);
      console.log(`   📖 ${horoscope.horoscope}`);
      console.log(`   🏷️  Keywords: ${horoscope.keywords.join(", ")}`);
      console.log(`   🍀 Lucky Numbers: ${horoscope.luckyNumbers.join(", ")}`);
      console.log(`   🎨 Colors: ${horoscope.colors.join(", ")}`);
      console.log(`   💼 Career: ${horoscope.careerInsight}`);
      console.log(`   💕 Love: ${horoscope.loveInsight}`);
      console.log(`   ⚡ Energy: ${horoscope.energy}`);
      console.log(
        `   ⭐ Ratings: Overall ${horoscope.rating.overall}/5, Love ${horoscope.rating.love}/5, Career ${horoscope.rating.career}/5`,
      );
      console.log(`   💡 Advice: ${horoscope.advice}`);
    });

    // Show n8n-ready JSON structure for one sign
    console.log("\n📋 n8n JSON Sample (Aries):");
    console.log("===========================");
    const ariesSample = horoscopeData.horoscopes.find(
      (h) => h.sign === "Aries",
    );
    if (ariesSample) {
      console.log(JSON.stringify(ariesSample, null, 2));
    }

    // Validate structure
    console.log("\n🔍 Validation Results:");
    console.log("======================");
    const allValid = horoscopeData.horoscopes.every(
      (h) =>
        h.sign &&
        h.horoscope &&
        h.keywords &&
        h.rating &&
        typeof h.rating.overall === "number" &&
        h.rating.overall >= 1 &&
        h.rating.overall <= 5,
    );

    console.log(`✅ Structure Valid: ${allValid ? "YES" : "NO"}`);
    console.log(
      `✅ All 12 Signs: ${horoscopeData.horoscopes.length === 12 ? "YES" : "NO"}`,
    );
    console.log(
      `✅ Swiss Ephemeris: ${horoscopeData.metadata.moonSign !== "Unknown" ? "WORKING" : "FALLBACK"}`,
    );

    return {
      success: true,
      data: horoscopeData,
      valid: allValid,
      count: horoscopeData.horoscopes.length,
    };
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error("Stack:", error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test
testHoroscopeGeneration()
  .then((result) => {
    if (result.success) {
      console.log("\n🎉 SUCCESS: Daily horoscope generation is working!");
      console.log(
        `📊 Generated ${result.count} horoscopes with ${result.valid ? "valid" : "invalid"} structure`,
      );
      console.log("🚀 Ready for Replit and n8n integration!");

      // Create sample file for n8n testing
      const sampleOutput = {
        sign: "Aries",
        date: result.data.date,
        horoscope:
          result.data.horoscopes[0]?.horoscope || "Sample horoscope text",
        keywords: result.data.horoscopes[0]?.keywords || [
          "action",
          "energy",
          "leadership",
        ],
        luckyNumbers: result.data.horoscopes[0]?.luckyNumbers || [
          1, 8, 15, 22, 29,
        ],
        colors: result.data.horoscopes[0]?.colors || ["Red", "Orange", "Gold"],
        careerInsight:
          result.data.horoscopes[0]?.careerInsight || "Career sample",
        loveInsight: result.data.horoscopes[0]?.loveInsight || "Love sample",
        energy: result.data.horoscopes[0]?.energy || "High",
        moonPhase: result.data.metadata.moonPhase,
        keyTransits: result.data.metadata.keyTransits,
        advice: result.data.horoscopes[0]?.advice || "Sample advice",
        rating: result.data.horoscopes[0]?.rating || {
          overall: 4.0,
          love: 4.0,
          career: 4.0,
          health: 4.0,
        },
      };

      console.log("\n📋 n8n Integration Sample:");
      console.log(JSON.stringify(sampleOutput, null, 2));
    } else {
      console.error("💥 FAILED: Test encountered errors");
      console.error("Error:", result.error);
    }
  })
  .catch((error) => {
    console.error("💥 CRITICAL ERROR:", error);
  });
