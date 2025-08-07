#!/usr/bin/env tsx

/**
 * Local Tarot Setup Script
 *
 * Sets up the Mystic Arcana application with local authentication
 * and mock tarot data for development and demonstration purposes.
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// Mock tarot deck data (subset for demo)
const MOCK_TAROT_DECK = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Rider-Waite Tarot",
  description:
    "The classic tarot deck with 78 cards representing the journey of life",
  cards: [
    {
      id: "0-the-fool",
      name: "The Fool",
      arcana: "major",
      number: 0,
      suit: null,
      frontImage: "/images/tarot/major/00-the-fool.jpg",
      backImage: "/images/tarot/card-back.svg",
      meaning: {
        upright: "New beginnings, innocence, spontaneity, free spirit",
        reversed: "Holding back, recklessness, risk-taking",
        keywords: ["beginning", "journey", "innocence", "faith", "potential"],
      },
      description:
        "The Fool represents new beginnings and the start of a journey.",
    },
    {
      id: "1-the-magician",
      name: "The Magician",
      arcana: "major",
      number: 1,
      suit: null,
      frontImage: "/images/tarot/major/01-the-magician.jpg",
      backImage: "/images/tarot/card-back.svg",
      meaning: {
        upright: "Manifestation, resourcefulness, power, inspired action",
        reversed: "Manipulation, poor planning, untapped talents",
        keywords: [
          "manifestation",
          "power",
          "skill",
          "concentration",
          "action",
        ],
      },
      description:
        "The Magician represents the power to manifest your desires into reality.",
    },
    {
      id: "2-the-high-priestess",
      name: "The High Priestess",
      arcana: "major",
      number: 2,
      suit: null,
      frontImage: "/images/tarot/major/02-the-high-priestess.jpg",
      backImage: "/images/tarot/card-back.svg",
      meaning: {
        upright:
          "Intuition, sacred knowledge, divine feminine, the subconscious mind",
        reversed:
          "Secrets, disconnected from intuition, withdrawal and silence",
        keywords: [
          "intuition",
          "mystery",
          "subconscious",
          "wisdom",
          "inner voice",
        ],
      },
      description:
        "The High Priestess represents intuition, mystery, and inner wisdom.",
    },
    {
      id: "ace-cups",
      name: "Ace of Cups",
      arcana: "minor",
      number: 1,
      suit: "cups",
      frontImage: "/images/tarot/minor/cups/ace-cups.jpg",
      backImage: "/images/tarot/card-back.svg",
      meaning: {
        upright: "Love, new relationships, compassion, creativity",
        reversed: "Self-love, intuition, repressed emotions",
        keywords: [
          "love",
          "emotion",
          "compassion",
          "creativity",
          "new beginnings",
        ],
      },
      description:
        "The Ace of Cups represents new emotional beginnings and love.",
    },
    {
      id: "ace-wands",
      name: "Ace of Wands",
      arcana: "minor",
      number: 1,
      suit: "wands",
      frontImage: "/images/tarot/minor/wands/ace-wands.jpg",
      backImage: "/images/tarot/card-back.svg",
      meaning: {
        upright: "Inspiration, new opportunities, growth",
        reversed: "An emerging idea, lack of direction, distractions",
        keywords: [
          "inspiration",
          "power",
          "creation",
          "beginnings",
          "potential",
        ],
      },
      description:
        "The Ace of Wands represents inspiration and new creative energy.",
    },
  ],
  stats: {
    totalCards: 5,
    majorArcana: 3,
    minorArcana: 2,
    suits: {
      cups: 1,
      pentacles: 0,
      swords: 0,
      wands: 1,
    },
  },
};

function createDirectoryIfNotExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function createMockDataFile(): void {
  console.log("Creating mock tarot data...");

  const dataDir = join(process.cwd(), "src", "data");
  createDirectoryIfNotExists(dataDir);

  const mockDataPath = join(dataDir, "mockTarotData.ts");

  const content = `// Mock Tarot Data for Local Development
export const MOCK_TAROT_DECK = ${JSON.stringify(MOCK_TAROT_DECK, null, 2)};

export type MockTarotCard = typeof MOCK_TAROT_DECK.cards[0];
export type MockTarotDeck = typeof MOCK_TAROT_DECK;

export const getRandomCards = (count: number): MockTarotCard[] => {
  const shuffled = [...MOCK_TAROT_DECK.cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const getCardById = (id: string): MockTarotCard | undefined => {
  return MOCK_TAROT_DECK.cards.find(card => card.id === id);
};

export const getCardsByArcana = (arcana: 'major' | 'minor'): MockTarotCard[] => {
  return MOCK_TAROT_DECK.cards.filter(card => card.arcana === arcana);
};
`;

  writeFileSync(mockDataPath, content, "utf-8");
  console.log(`Created mock data file: ${mockDataPath}`);
}

async function runLocalSetup(): Promise<void> {
  console.log("Setting up Mystic Arcana for Local Development...\n");

  try {
    createMockDataFile();
    console.log("");

    console.log("Local setup complete!");
    console.log("");
    console.log("Next steps:");
    console.log("   1. npm run dev");
    console.log("   2. Open http://localhost:3000/local-demo");
    console.log("   3. Test the authentication and tarot features");
    console.log("");
    console.log("The galaxy background should now be clearly visible!");
    console.log("Authentication works completely locally!");
    console.log("Enjoy your cosmic journey!");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runLocalSetup().catch((error) => {
    console.error("Setup execution failed:", error);
    process.exit(1);
  });
}

export { runLocalSetup };
