#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

interface CardValidation {
  id: string;
  name: string;
  card_number: number;
  arcana_type: string;
  suit: string | null;
  meaning_upright: string;
  meaning_reversed: string;
  image_url: string;
  keywords: string[];
}

/**
 * Comprehensive deck validation script
 * Validates all 78 cards with complete metadata integrity
 */
async function validateDeck() {
  console.log("🔍 TAROT DECK VALIDATION REPORT");
  console.log("═".repeat(50));

  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch all cards
    const { data: cards, error } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", "00000000-0000-0000-0000-000000000001")
      .order("card_number");

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!cards) {
      throw new Error("No cards found in database");
    }

    console.log(`📊 Total Cards Found: ${cards.length}/78`);
    console.log("");

    // Validation checks
    const issues: string[] = [];

    // 1. Count validation
    if (cards.length !== 78) {
      issues.push(`❌ Expected 78 cards, found ${cards.length}`);
    } else {
      console.log("✅ Card Count: 78/78 cards present");
    }

    // 2. Arcana distribution
    const majorArcana = cards.filter((c) => c.arcana_type === "major");
    const minorArcana = cards.filter((c) => c.arcana_type === "minor");

    console.log(`✅ Major Arcana: ${majorArcana.length}/22 cards`);
    console.log(`✅ Minor Arcana: ${minorArcana.length}/56 cards`);

    if (majorArcana.length !== 22) {
      issues.push(`❌ Expected 22 Major Arcana, found ${majorArcana.length}`);
    }
    if (minorArcana.length !== 56) {
      issues.push(`❌ Expected 56 Minor Arcana, found ${minorArcana.length}`);
    }

    // 3. Suit distribution (Minor Arcana)
    const suits = ["cups", "pentacles", "swords", "wands"];
    suits.forEach((suit) => {
      const suitCards = cards.filter((c) => c.suit === suit);
      console.log(
        `✅ ${suit.charAt(0).toUpperCase() + suit.slice(1)}: ${suitCards.length}/14 cards`,
      );
      if (suitCards.length !== 14) {
        issues.push(`❌ Expected 14 ${suit} cards, found ${suitCards.length}`);
      }
    });

    console.log("");

    // 4. Data completeness validation
    let incompleteCards = 0;
    const requiredFields = [
      "name",
      "meaning_upright",
      "meaning_reversed",
      "image_url",
      "keywords",
    ];

    cards.forEach((card: CardValidation) => {
      const missing: string[] = [];

      if (!card.name || card.name.trim().length === 0) missing.push("name");
      if (!card.meaning_upright || card.meaning_upright.trim().length === 0)
        missing.push("meaning_upright");
      if (!card.meaning_reversed || card.meaning_reversed.trim().length === 0)
        missing.push("meaning_reversed");
      if (!card.image_url || card.image_url.trim().length === 0)
        missing.push("image_url");
      if (
        !card.keywords ||
        !Array.isArray(card.keywords) ||
        card.keywords.length === 0
      )
        missing.push("keywords");

      if (missing.length > 0) {
        incompleteCards++;
        issues.push(
          `❌ ${card.name} (${card.arcana_type}): Missing ${missing.join(", ")}`,
        );
      }
    });

    if (incompleteCards === 0) {
      console.log("✅ Data Completeness: All cards have complete metadata");
    } else {
      console.log(
        `❌ Data Completeness: ${incompleteCards} cards missing data`,
      );
    }

    // 5. Spot-check specific cards
    console.log("\n🎯 SPOT-CHECK VALIDATION:");
    console.log("─".repeat(30));

    const spotCheckCards = [
      { name: "The Fool", expectedNumber: 0, expectedArcana: "major" },
      { name: "The World", expectedNumber: 21, expectedArcana: "major" },
      {
        name: "Ace of Cups",
        expectedNumber: 1,
        expectedArcana: "minor",
        expectedSuit: "cups",
      },
      {
        name: "King of Wands",
        expectedNumber: 14,
        expectedArcana: "minor",
        expectedSuit: "wands",
      },
    ];

    spotCheckCards.forEach((check) => {
      const card = cards.find((c) => c.name === check.name);
      if (!card) {
        issues.push(`❌ Spot-check: ${check.name} not found`);
      } else {
        console.log(`✅ ${check.name}:`);
        console.log(
          `   Number: ${card.card_number} (expected: ${check.expectedNumber})`,
        );
        console.log(
          `   Arcana: ${card.arcana_type} (expected: ${check.expectedArcana})`,
        );
        if (check.expectedSuit) {
          console.log(
            `   Suit: ${card.suit} (expected: ${check.expectedSuit})`,
          );
        }
        console.log(`   Keywords: [${card.keywords?.join(", ") || "none"}]`);
        console.log(`   Image: ${card.image_url}`);

        if (card.card_number !== check.expectedNumber) {
          issues.push(
            `❌ ${check.name}: Wrong number ${card.card_number}, expected ${check.expectedNumber}`,
          );
        }
        if (card.arcana_type !== check.expectedArcana) {
          issues.push(
            `❌ ${check.name}: Wrong arcana ${card.arcana_type}, expected ${check.expectedArcana}`,
          );
        }
        if (check.expectedSuit && card.suit !== check.expectedSuit) {
          issues.push(
            `❌ ${check.name}: Wrong suit ${card.suit}, expected ${check.expectedSuit}`,
          );
        }
      }
      console.log("");
    });

    // 6. Image path validation
    console.log("🖼️  IMAGE PATH VALIDATION:");
    console.log("─".repeat(25));

    const imagePaths = cards.map((c) => c.image_url);
    const uniquePaths = new Set(imagePaths);

    if (imagePaths.length === uniquePaths.size) {
      console.log("✅ All image paths are unique");
    } else {
      const duplicates = imagePaths.filter(
        (path, index) => imagePaths.indexOf(path) !== index,
      );
      issues.push(`❌ Duplicate image paths found: ${duplicates.join(", ")}`);
    }

    // Sample image paths
    const majorArcanaPath = cards.find(
      (c) => c.arcana_type === "major",
    )?.image_url;
    const minorArcanaPath = cards.find(
      (c) => c.arcana_type === "minor",
    )?.image_url;

    console.log(`✅ Major Arcana path sample: ${majorArcanaPath}`);
    console.log(`✅ Minor Arcana path sample: ${minorArcanaPath}`);

    // 7. Final validation report
    console.log("\n📋 VALIDATION SUMMARY:");
    console.log("═".repeat(30));

    if (issues.length === 0) {
      console.log("🎉 ALL VALIDATIONS PASSED!");
      console.log("✅ Complete 78-card Rider-Waite deck");
      console.log("✅ All metadata fields complete");
      console.log("✅ Proper arcana distribution");
      console.log("✅ Correct suit distribution");
      console.log("✅ Unique image paths");
      console.log("✅ Spot-checks successful");
      console.log("\n🚀 DECK IS PRODUCTION READY");
    } else {
      console.log(`❌ ${issues.length} VALIDATION ISSUES FOUND:`);
      issues.forEach((issue) => console.log(`   ${issue}`));
      console.log("\n⚠️  DECK NEEDS ATTENTION");
    }

    return issues.length === 0;
  } catch (error) {
    console.error("💥 Validation failed:", error);
    return false;
  }
}

// Export for testing
export { validateDeck };

// Run validation if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateDeck()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Validation script error:", error);
      process.exit(1);
    });
}
