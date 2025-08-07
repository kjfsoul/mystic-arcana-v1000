#!/usr/bin/env node
/**
 * Test Complete Deck Loading and Validation
 *
 * This script validates that the complete 78-card Rider-Waite deck
 * is properly loaded and structured correctly.
 */

import { RIDER_WAITE_DECK } from "../src/lib/tarot/RiderWaiteDeck.js";
import { TarotCardData } from "../src/types/tarot.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalCards: number;
    majorArcana: number;
    minorArcana: number;
    suits: Record<string, number>;
  };
}

/**
 * Comprehensive validation of the complete tarot deck
 */
function validateCompleteDeck(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalCards: RIDER_WAITE_DECK.length,
      majorArcana: 0,
      minorArcana: 0,
      suits: { cups: 0, pentacles: 0, swords: 0, wands: 0 },
    },
  };

  console.log("🔍 Starting complete deck validation...\n");

  // 1. Check total count (should be 78)
  if (RIDER_WAITE_DECK.length !== 78) {
    result.errors.push(`Expected 78 cards, found ${RIDER_WAITE_DECK.length}`);
    result.isValid = false;
  }

  // 2. Validate each card structure and count arcana types
  const cardIds = new Set<string>();
  const cardNames = new Set<string>();

  for (const card of RIDER_WAITE_DECK) {
    // Check for duplicate IDs
    if (cardIds.has(card.id)) {
      result.errors.push(`Duplicate card ID found: ${card.id}`);
      result.isValid = false;
    }
    cardIds.add(card.id);

    // Check for duplicate names
    if (cardNames.has(card.name)) {
      result.errors.push(`Duplicate card name found: ${card.name}`);
      result.isValid = false;
    }
    cardNames.add(card.name);

    // Validate required fields
    if (!card.name || !card.id || !card.arcana || !card.frontImage) {
      result.errors.push(
        `Missing required fields for card: ${card.name || card.id}`,
      );
      result.isValid = false;
    }

    // Count arcana types
    if (card.arcana === "major") {
      result.stats.majorArcana++;
    } else if (card.arcana === "minor") {
      result.stats.minorArcana++;

      // Count suits for minor arcana
      if (card.suit && card.suit in result.stats.suits) {
        result.stats.suits[card.suit]++;
      }
    }

    // Validate image paths
    if (!card.frontImage.startsWith("/tarot/deck-rider-waite/")) {
      result.warnings.push(
        `Non-standard image path for ${card.name}: ${card.frontImage}`,
      );
    }

    // Validate meanings structure
    if (!card.meaning?.upright || !card.meaning?.reversed) {
      result.warnings.push(`Missing meanings for ${card.name}`);
    }

    // Validate keywords
    if (!card.meaning?.keywords || card.meaning.keywords.length === 0) {
      result.warnings.push(`Missing keywords for ${card.name}`);
    }
  }

  // 3. Check Major Arcana count (should be 22)
  if (result.stats.majorArcana !== 22) {
    result.errors.push(
      `Expected 22 Major Arcana cards, found ${result.stats.majorArcana}`,
    );
    result.isValid = false;
  }

  // 4. Check Minor Arcana count (should be 56)
  if (result.stats.minorArcana !== 56) {
    result.errors.push(
      `Expected 56 Minor Arcana cards, found ${result.stats.minorArcana}`,
    );
    result.isValid = false;
  }

  // 5. Check each suit count (should be 14 each)
  for (const [suit, count] of Object.entries(result.stats.suits)) {
    if (count !== 14) {
      result.errors.push(`Expected 14 cards in ${suit} suit, found ${count}`);
      result.isValid = false;
    }
  }

  // 6. Validate Major Arcana numbering (0-21)
  const majorCards = RIDER_WAITE_DECK.filter((card) => card.arcana === "major");
  const majorNumbers = majorCards
    .map((card) => card.number)
    .sort((a, b) => a - b);

  for (let i = 0; i <= 21; i++) {
    if (!majorNumbers.includes(i)) {
      result.errors.push(`Missing Major Arcana card number ${i}`);
      result.isValid = false;
    }
  }

  // 7. Validate Minor Arcana structure (Ace through King for each suit)
  const expectedMinorNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  for (const suit of ["cups", "pentacles", "swords", "wands"]) {
    const suitCards = RIDER_WAITE_DECK.filter((card) => card.suit === suit);
    const suitNumbers = suitCards
      .map((card) => card.number)
      .sort((a, b) => a - b);

    for (const expectedNum of expectedMinorNumbers) {
      if (!suitNumbers.includes(expectedNum)) {
        result.errors.push(`Missing ${suit} card number ${expectedNum}`);
        result.isValid = false;
      }
    }
  }

  return result;
}

/**
 * Test deck loading performance
 */
function testDeckLoadingPerformance(): void {
  console.log("⚡ Testing deck loading performance...\n");

  const startTime = performance.now();

  // Load deck multiple times to test performance
  for (let i = 0; i < 1000; i++) {
    const deck = RIDER_WAITE_DECK;
    if (deck.length !== 78) break;
  }

  const endTime = performance.now();
  const loadTime = endTime - startTime;

  console.log(`📊 Loaded deck 1000 times in ${loadTime.toFixed(2)}ms`);
  console.log(
    `📊 Average load time: ${(loadTime / 1000).toFixed(4)}ms per load\n`,
  );
}

/**
 * Generate detailed deck report
 */
function generateDeckReport(result: ValidationResult): void {
  console.log("📋 DECK VALIDATION REPORT");
  console.log("=".repeat(50));

  console.log("\n📊 STATISTICS:");
  console.log(`Total Cards: ${result.stats.totalCards}/78`);
  console.log(`Major Arcana: ${result.stats.majorArcana}/22`);
  console.log(`Minor Arcana: ${result.stats.minorArcana}/56`);
  console.log("\nSuit Breakdown:");
  for (const [suit, count] of Object.entries(result.stats.suits)) {
    console.log(
      `  ${suit.charAt(0).toUpperCase() + suit.slice(1)}: ${count}/14`,
    );
  }

  if (result.errors.length > 0) {
    console.log("\n❌ ERRORS:");
    result.errors.forEach((error) => console.log(`  • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  WARNINGS:");
    result.warnings.forEach((warning) => console.log(`  • ${warning}`));
  }

  console.log("\n" + "=".repeat(50));

  if (result.isValid) {
    console.log("✅ DECK VALIDATION PASSED - Complete 78-card deck ready!");
  } else {
    console.log("❌ DECK VALIDATION FAILED - Issues found that need fixing");
  }
}

/**
 * Main test execution
 */
function main(): void {
  console.log("🎴 COMPLETE TAROT DECK VALIDATION TEST\n");

  try {
    // Run validation
    const validationResult = validateCompleteDeck();

    // Test performance
    testDeckLoadingPerformance();

    // Generate report
    generateDeckReport(validationResult);

    // Exit with appropriate code
    process.exit(validationResult.isValid ? 0 : 1);
  } catch (error) {
    console.error("💥 Test execution failed:", error);
    process.exit(1);
  }
}

// Run tests if executed directly
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  main();
}

export { validateCompleteDeck, testDeckLoadingPerformance };
