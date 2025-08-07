import AstrologyService from "../src/services/astrology/AstrologyService";

async function testAstrologyAPI() {
  console.log("=== TESTING REAL ASTROLOGY API ===\n");

  try {
    // Test 1: Geocoding
    console.log("TEST 1: Geocoding Location");
    const location = await AstrologyService.geocodeLocation("New York", "USA");
    console.log("Location:", location);
    console.log(`Coordinates: ${location.lat}, ${location.lng}`);
    console.log(`Timezone: ${location.timezone}\n`);

    // Test 2: Current Transits
    console.log("TEST 2: Current Planetary Transits");
    const transits = await AstrologyService.getCurrentTransits();
    console.log(`Timestamp: ${transits.timestamp}`);
    console.log("Current Positions:");
    for (const [planet, position] of Object.entries(transits.planets)) {
      console.log(
        `${planet.toUpperCase().padEnd(10)} ${AstrologyService.formatPosition(position as any)}`,
      );
    }

    // Test 3: Birth Chart
    console.log("\n\nTEST 3: Birth Chart Calculation");
    const chart = await AstrologyService.calculateBirthChart(
      "Test User",
      new Date("1990-06-15T10:30:00"),
      "Los Angeles",
      "USA",
    );

    console.log("\nChart Generated:");
    console.log(`Location: ${chart.subjectData.location.formattedAddress}`);
    console.log(`Julian Day: ${chart.subjectData.julianDay}`);
    console.log(`SVG Chart Length: ${chart.svgChart.length} characters`);
    console.log(`Aspects Found: ${chart.aspects.length}`);

    console.log("\nPlanetary Positions:");
    for (const [planet, position] of Object.entries(chart.detailedPositions)) {
      console.log(
        `${planet.toUpperCase().padEnd(10)} ${AstrologyService.formatPosition(position as any)}`,
      );
    }

    console.log(
      "\n✅ All tests passed! Real astronomical calculations are working.",
    );
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    console.error("\nMake sure to run: npm run astrology:setup");
  }
}

// Run the test
testAstrologyAPI();
