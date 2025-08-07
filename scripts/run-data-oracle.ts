#!/usr/bin/env tsx

/**
 * DataOracle Activation Script
 * Initializes and runs the DataOracle agent for Knowledge Graph ingestion
 */

import { DataOracleAgent } from "../src/agents/DataOracle";
import DataOracleWebScraper from "../src/agents/DataOracle-WebScraper";

async function main() {
  console.log("🔮 MYSTIC ARCANA - DATAORACLE ACTIVATION");
  console.log("=====================================");
  console.log("Initializing Knowledge Graph Foundation Mission...\n");

  try {
    // Initialize DataOracle agent
    console.log("⚡ Initializing DataOracle agent...");
    const dataOracle = new DataOracleAgent();

    // Wait a moment for async initialization to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check agent health
    const isHealthy = await dataOracle.healthCheck();
    if (!isHealthy) {
      throw new Error(
        "DataOracle health check failed - database connection issues",
      );
    }
    console.log("✅ DataOracle agent initialized and healthy\n");

    // Get initial status
    console.log("📊 Pre-ingestion Knowledge Graph status:");
    const initialStatus = await dataOracle.getStatus();
    console.log(`   Sources: ${initialStatus.knowledgeGraph.sources}`);
    console.log(`   Concepts: ${initialStatus.knowledgeGraph.concepts}`);
    console.log(
      `   Interpretations: ${initialStatus.knowledgeGraph.interpretations}`,
    );
    console.log(
      `   Relationships: ${initialStatus.knowledgeGraph.relationships}\n`,
    );

    console.log(`🎭 Agent Archetype: ${initialStatus.archetype}`);
    console.log(`💫 Wisdom: "${initialStatus.lastSignature}"\n`);

    // Run comprehensive ingestion
    console.log("🚀 Beginning comprehensive Knowledge Graph ingestion...");
    const ingestionMetrics = await dataOracle.orchestrateIngestion({
      include_relationships: true,
      generate_syntheses: true,
      create_lineage: true,
    });

    // Display results
    console.log("\n🎉 INGESTION COMPLETED!");
    console.log("======================");
    console.log(`📈 Processing time: ${ingestionMetrics.processing_time_ms}ms`);
    console.log(`📊 Sources processed: ${ingestionMetrics.sources_processed}`);
    console.log(`🧠 Concepts created: ${ingestionMetrics.concepts_created}`);
    console.log(
      `📝 Interpretations created: ${ingestionMetrics.interpretations_created}`,
    );
    console.log(
      `🔗 Relationships created: ${ingestionMetrics.relationships_created}`,
    );
    console.log(`⚗️ Syntheses created: ${ingestionMetrics.syntheses_created}`);
    console.log(`📜 Lineages created: ${ingestionMetrics.lineages_created}`);
    console.log(
      `🎯 Data quality score: ${ingestionMetrics.data_quality_score.toFixed(2)}/10`,
    );
    console.log(
      `⚠️ Errors encountered: ${ingestionMetrics.errors_encountered}`,
    );

    if (ingestionMetrics.error_details.length > 0) {
      console.log("\n⚠️ Error Details:");
      ingestionMetrics.error_details.forEach((error, index) => {
        console.log(
          `   ${index + 1}. ${error.error_type}: ${error.error_message}`,
        );
      });
    }

    // Get final status
    console.log("\n📊 Post-ingestion Knowledge Graph status:");
    const finalStatus = await dataOracle.getStatus();
    console.log(`   Sources: ${finalStatus.knowledgeGraph.sources}`);
    console.log(`   Concepts: ${finalStatus.knowledgeGraph.concepts}`);
    console.log(
      `   Interpretations: ${finalStatus.knowledgeGraph.interpretations}`,
    );
    console.log(
      `   Relationships: ${finalStatus.knowledgeGraph.relationships}\n`,
    );

    // Test search functionality
    console.log("🔍 Testing Knowledge Graph search...");
    const searchResults = await dataOracle.searchKnowledgeGraph("fool", {
      conceptTypes: ["tarot_card"],
      includeRelationships: true,
      limit: 5,
    });

    console.log(`   Found ${searchResults.length} results for "fool"`);
    if (searchResults.length > 0) {
      console.log(
        `   Example: ${searchResults[0].name} - ${searchResults[0].archetypal_energy}`,
      );
    }

    // Display concept details for The Fool if available
    const foolConcept = searchResults.find((r: any) => r.name === "The Fool");
    if (foolConcept) {
      console.log("\n🃏 The Fool Concept Details:");
      const conceptDetails = await dataOracle.getConceptDetails(foolConcept.id);
      console.log(`   Interpretations: ${conceptDetails.length}`);
      if (conceptDetails.length > 0) {
        console.log(
          `   Sample interpretation: "${conceptDetails[0].primary_meaning}"`,
        );
      }
    }

    console.log("\n✨ DataOracle activation completed successfully!");
    console.log("🔮 Knowledge Graph is now ready for personalized readings.");
  } catch (error) {
    console.error("\n❌ DataOracle activation failed:", error);
    process.exit(1);
  }
}

// Optional: Web scraping demonstration
async function demonstrateWebScraping() {
  console.log("\n🌐 Web Scraping Demonstration");
  console.log("============================");
  console.log("Note: This is a demonstration of capabilities.");
  console.log("Actual scraping should respect robots.txt and rate limits.\n");

  const scraper = new DataOracleWebScraper({
    rateLimitDelay: 5000, // 5 seconds between requests for demo
    maxRetries: 2,
  });

  // Generate sample URLs (commented out to avoid actual scraping in demo)
  const biddyUrls = scraper.generateBiddyTarotUrls();
  const labyrinthosUrls = scraper.generateLabyrinthosUrls();

  console.log(`📋 Generated ${biddyUrls.length} Biddy Tarot URLs`);
  console.log(`📋 Generated ${labyrinthosUrls.length} Labyrinthos URLs`);
  console.log("   Example URL:", biddyUrls[0]);

  console.log("\n⚠️  To activate web scraping:");
  console.log("   1. Review and respect each site's robots.txt");
  console.log("   2. Implement appropriate rate limiting");
  console.log("   3. Ensure compliance with terms of service");
  console.log("   4. Consider reaching out to site owners for permission");

  // Uncomment below to run actual scraping (with proper permissions)
  /*
  try {
    const results = await scraper.scrapeBiddyTarot(biddyUrls.slice(0, 1)); // Test with just one URL
    console.log(`✅ Scraping test completed. Success: ${results[0]?.success}`);
    if (results[0]?.success && results[0].content) {
      console.log(`   Card: ${results[0].content.extractedData.cardName}`);
      console.log(`   Quality score: ${results[0].content.qualityScore}/10`);
    }
  } catch (error) {
    console.log(`❌ Scraping test failed: ${error}`);
  }
  */
}

// Run the main function (ES module compatible)
main()
  .then(() => {
    console.log("\n🌟 DataOracle mission accomplished!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💀 Fatal error:", error);
    process.exit(1);
  });

export { main, demonstrateWebScraping };
