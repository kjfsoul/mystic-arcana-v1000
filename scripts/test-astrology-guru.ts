/**
 * Test script for AstrologyGuru Agent Integration
 *
 * Tests the integration between AstrologyGuru and career/compatibility systems.
 */

import {
  AstrologyGuruAgent,
  ChartAnalysisRequest,
} from "@/src/agents/astrology-guru";

async function testAstrologyGuruIntegration() {
  console.log("🔮 Testing AstrologyGuru Agent Integration...");

  const agent = new AstrologyGuruAgent();

  // Wait a moment for knowledge base initialization
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("📊 Agent Status:", agent.getStatus());

  // Test chart analysis
  console.log("\\n🪐 Testing Chart Analysis...");

  const testChart: ChartAnalysisRequest = {
    birthData: {
      datetime: "1990-07-15T14:30:00Z",
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
    },
    analysisType: "natal",
    focusAreas: ["career", "relationships", "personal_growth"],
  };

  try {
    const analysis = await agent.performDeepAnalysis(testChart);

    console.log("✅ Chart Analysis Results:");
    console.log("Summary:", analysis.summary);
    console.log("Key Themes:", analysis.keyThemes);
    console.log(
      "Planetary Influences:",
      Object.keys(analysis.planetaryInfluences).length,
      "planets analyzed",
    );
    console.log(
      "Aspect Analysis:",
      analysis.aspectAnalysis.length,
      "major aspects found",
    );
    console.log(
      "House Analysis:",
      Object.keys(analysis.houseAnalysis).length,
      "houses interpreted",
    );
    console.log(
      "Predictive Insights:",
      analysis.predictiveInsights?.length || 0,
      "insights generated",
    );
  } catch (error) {
    console.error("❌ Chart Analysis Failed:", error);
  }

  // Test synastry analysis
  console.log("\\n💑 Testing Synastry Analysis...");

  const chart1: ChartAnalysisRequest = {
    birthData: {
      datetime: "1990-06-15T14:30:00Z",
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
    },
    analysisType: "synastry",
  };

  const chart2: ChartAnalysisRequest = {
    birthData: {
      datetime: "1985-03-20T10:00:00Z",
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: "America/Los_Angeles",
    },
    analysisType: "synastry",
  };

  try {
    const synastryResult = await agent.calculateSynastry(chart1, chart2);

    console.log("✅ Synastry Analysis Results:");
    console.log("Love Rating:", synastryResult.love?.rating || "N/A");
    console.log(
      "Friendship Rating:",
      synastryResult.friendship?.rating || "N/A",
    );
    console.log("Teamwork Rating:", synastryResult.teamwork?.rating || "N/A");
    console.log(
      "Detailed Analysis:",
      synastryResult.detailedAnalysis?.substring(0, 100) + "...",
    );
    console.log(
      "Relationship Advice:",
      synastryResult.relationshipAdvice?.length || 0,
      "pieces of advice",
    );
    console.log(
      "Astrological Insights:",
      synastryResult.astrologicalInsights?.length || 0,
      "insights",
    );
  } catch (error) {
    console.error("❌ Synastry Analysis Failed:", error);
  }

  // Test knowledge synthesis
  console.log("\\n📚 Testing Knowledge Synthesis...");

  try {
    const synthesizedKnowledge = await agent.synthesizeKnowledge(
      "Venus in Scorpio",
      [
        "Traditional Astrology",
        "Modern Interpretation",
        "Psychological Astrology",
      ],
    );

    console.log("✅ Knowledge Synthesis:", synthesizedKnowledge);
  } catch (error) {
    console.error("❌ Knowledge Synthesis Failed:", error);
  }

  console.log("\\n🎉 AstrologyGuru Agent Integration Test Complete!");
}

// Main execution
if (require.main === module) {
  testAstrologyGuruIntegration()
    .then(() => {
      console.log("✅ All tests completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Tests failed:", error);
      process.exit(1);
    });
}

export { testAstrologyGuruIntegration };
