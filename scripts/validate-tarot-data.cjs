const fetch = require("node-fetch");

const DECK_ID = "00000000-0000-0000-0000-000000000001"; // Rider-Waite Deck
const API_URL = `http://localhost:3000/api/tarot/deck/${DECK_ID}`;

const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

async function validateTarotData() {
  console.log(
    `${BOLD}🔍 Running Tarot Deck Validation for Deck ID: ${DECK_ID}${RESET}`,
  );

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const { deck, cards, stats } = await response.json();

    console.log(`
${BOLD}Deck: ${deck.name}${RESET}`);
    console.log(`Total cards returned: ${stats.totalCards}`);

    let errors = [];
    let warnings = [];

    // 1. Check for total card count
    if (stats.totalCards !== 78) {
      errors.push(`Expected 78 cards, but found ${stats.totalCards}.`);
    } else {
      console.log(`${GREEN}✅ Correct number of cards (78).${RESET}`);
    }

    // 2. Check for duplicates
    const names = new Set();
    const ids = new Set();
    const duplicates = [];
    cards.forEach((card) => {
      if (names.has(card.name)) {
        duplicates.push(card.name);
      }
      names.add(card.name);
      ids.add(card.id);
    });

    if (duplicates.length > 0) {
      errors.push(`Duplicate card names found: ${duplicates.join(", ")}`);
    } else {
      console.log(`${GREEN}✅ No duplicate card names found.${RESET}`);
    }

    if (ids.size !== cards.length) {
      errors.push(`Duplicate card IDs found.`);
    } else {
      console.log(`${GREEN}✅ All card IDs are unique.${RESET}`);
    }

    // 3. Spot-check individual cards for malformed data
    cards.forEach((card) => {
      const cardIdentifier = `${card.name} (ID: ${card.id})`;
      if (!card.name)
        warnings.push(`Card with ID ${card.id} is missing a name.`);
      if (!card.meaning.upright)
        warnings.push(`${cardIdentifier} is missing an upright meaning.`);
      if (!card.meaning.reversed)
        warnings.push(`${cardIdentifier} is missing a reversed meaning.`);
      if (!card.frontImage)
        warnings.push(`${cardIdentifier} is missing an image URL.`);
      else if (!card.frontImage.startsWith("/tarot/")) {
        warnings.push(
          `${cardIdentifier} has a malformed image URL: ${card.frontImage}`,
        );
      }
    });

    if (warnings.length > 0) {
      console.log(`
${YELLOW}⚠️ Warnings:${RESET}`);
      warnings.forEach((warning) => console.log(`  - ${warning}`));
    } else {
      console.log(
        `${GREEN}✅ All cards have required fields and valid image paths.${RESET}`,
      );
    }

    if (errors.length > 0) {
      console.log(`
${RED}❌ Validation Failed:${RESET}`);
      errors.forEach((error) => console.log(`  - ${error}`));
      process.exit(1);
    } else {
      console.log(`
${GREEN}✨ Tarot data validation successful!${RESET}`);
    }
  } catch (error) {
    console.error(`${RED}Error during validation:`, error.message, RESET);
    process.exit(1);
  }
}

validateTarotData();
