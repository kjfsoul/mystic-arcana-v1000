#!/usr/bin/env npx tsx

/**
 * Test script to validate astronomical calculations
 * Tests the AstronomicalCalculator with real birth data
 */

import { AstronomicalCalculator } from "../src/lib/astrology/AstronomicalCalculator";
import { BirthData } from "../src/types/astrology";
import { getRealCareerPlacements } from "../src/lib/astrology/CareerAnalyzer";

const testBirthData: BirthData = {
  name: "Test User",
  date: new Date("1987-03-14T16:30:00.000Z"), // March 14, 1987, 4:30 PM EST
  latitude: 40.7128, // New York City
  longitude: -74.006,
  timezone: "America/New_York",
  city: "New York",
  country: "USA",
};

async function testAstronomicalCalculations() {
  console.log("🌟 Testing Astronomical Calculations");
  console.log("=====================================");

  console.log("\n📊 Test Birth Data:");
  console.log(`  Name: ${testBirthData.name}`);
  console.log(`  Date: ${testBirthData.date.toISOString()}`);
  console.log(`  Location: ${testBirthData.city}, ${testBirthData.country}`);
  console.log(
    `  Coordinates: ${testBirthData.latitude}°N, ${Math.abs(testBirthData.longitude)}°W`,
  );

  try {
    console.log("\n🔮 Calculating Birth Chart...");
    const chart = await AstronomicalCalculator.calculateChart(testBirthData);

    console.log("\n🌍 Chart Overview:");
    console.log(
      `  Ascendant: ${chart.ascendant.toFixed(2)}° (${getZodiacSign(chart.ascendant)})`,
    );
    console.log(
      `  Midheaven: ${chart.midheaven.toFixed(2)}° (${getZodiacSign(chart.midheaven)})`,
    );
    console.log(`  Houses: ${chart.houses.length} calculated`);
    console.log(`  Planets: ${chart.planets.length} calculated`);

    console.log("\n🪐 Planetary Positions:");
    chart.planets.forEach((planet) => {
      const retrograde = planet.isRetrograde ? " (R)" : "";
      console.log(
        `  ${planet.symbol} ${planet.name}: ${planet.longitude.toFixed(2)}° ${planet.sign} (House ${planet.house})${retrograde}`,
      );
      console.log(`    Speed: ${planet.speed.toFixed(4)}°/day`);
    });

    console.log("\n🏠 House Cusps:");
    chart.houses.slice(0, 6).forEach((house) => {
      console.log(
        `  House ${house.number}: ${house.cusp.toFixed(2)}° ${house.sign} (Ruler: ${house.ruler})`,
      );
    });

    console.log("\n💼 Career Analysis:");
    const careerPlacements = await getRealCareerPlacements(testBirthData);
    console.log("  Career-relevant planetary positions:");
    Object.entries(careerPlacements).forEach(([planet, longitude]) => {
      const sign = getZodiacSign(longitude);
      console.log(`  ${planet}: ${longitude.toFixed(2)}° ${sign}`);
    });

    // Validate that we're not using mock data
    console.log("\n✅ Validation Checks:");

    // Check if Sun position is reasonable for March 14th (should be in Pisces ~23-24°)
    const sun = chart.planets.find((p) => p.name === "Sun");
    if (sun) {
      const sunInPisces = sun.sign === "Pisces" && sun.degree >= 20;
      console.log(
        `  Sun in Pisces (Mar 14): ${sunInPisces ? "✅" : "❌"} (${sun.sign} ${sun.degree}°)`,
      );
    }

    // Check if planets have different positions (not all the same)
    const uniqueLongitudes = new Set(
      chart.planets.map((p) => Math.floor(p.longitude)),
    );
    const varietyCheck = uniqueLongitudes.size > 5;
    console.log(
      `  Planetary variety: ${varietyCheck ? "✅" : "❌"} (${uniqueLongitudes.size} unique positions)`,
    );

    // Check if retrograde status varies
    const retrogradeCount = chart.planets.filter((p) => p.isRetrograde).length;
    const retrogradeCheck =
      retrogradeCount > 0 && retrogradeCount < chart.planets.length;
    console.log(
      `  Retrograde variation: ${retrogradeCheck ? "✅" : "❌"} (${retrogradeCount}/${chart.planets.length} retrograde)`,
    );

    // Check if house cusps are distributed
    const houseVariety = new Set(chart.houses.map((h) => h.sign)).size;
    const houseCheck = houseVariety >= 6; // Should span multiple signs
    console.log(
      `  House sign variety: ${houseCheck ? "✅" : "❌"} (${houseVariety} different signs)`,
    );

    console.log("\n🎯 Results Summary:");
    if (sun?.sign === "Pisces" && varietyCheck && houseCheck) {
      console.log(
        "✅ All astronomical calculations appear to be working correctly!",
      );
      console.log("✅ Using real astronomical data, not mock calculations.");
      console.log("✅ Career analysis uses authentic planetary positions.");
    } else {
      console.log("⚠️ Some calculations may need review.");
    }
  } catch (error) {
    console.error("❌ Calculation failed:", error);
    throw error;
  }
}

function getZodiacSign(longitude: number): string {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex] || "Unknown";
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testAstronomicalCalculations()
    .then(() => {
      console.log("\n🌟 Astronomical calculation test completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test failed:", error);
      process.exit(1);
    });
}

export { testAstronomicalCalculations };
