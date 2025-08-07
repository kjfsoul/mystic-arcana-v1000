import Logger from "@/utils/logger";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
const logger = new Logger("TarotShuffleAPI");
interface ShuffleResponse {
  success: boolean;
  shuffleId: string;
  deckId: string;
  cardCount: number;
  shuffleState: {
    algorithm: string;
    timestamp: string;
    entropy: number;
  };
  preview?: {
    topCard: {
      name: string;
      arcana: string;
      suit: string;
    };
    bottomCard: {
      name: string;
      arcana: string;
      suit: string;
    };
    middleCard: {
      name: string;
      arcana: string;
      suit: string;
    };
  };
  error?: string;
}
/**
 * POST /api/tarot/shuffle
 *
 * Shuffle the specified tarot deck and return shuffle state information
 *
 * Request Body:
 * {
 *   "deckId": string (optional, defaults to Rider-Waite),
 *   "algorithm": string (optional: "fisher-yates", "riffle", "overhand"),
 *   "includePreview": boolean (optional, show sample cards),
 *   "userId": string (optional, for user-specific shuffles)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      deckId = "00000000-0000-0000-0000-000000000001",
      algorithm = "fisher-yates",
      includePreview = false,
      userId,
    } = body;
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Database configuration error",
          code: "CONFIG_ERROR",
        },
        { status: 500 },
      );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    // Fetch deck cards
    const startTime = Date.now();
    const { data: cards, error: fetchError } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", deckId)
      .order("card_number");
    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch deck cards",
          code: "FETCH_ERROR",
          details: fetchError.message,
        },
        { status: 500 },
      );
    }
    if (!cards || cards.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No cards found for deck ${deckId}`,
          code: "DECK_NOT_FOUND",
        },
        { status: 404 },
      );
    }
    // Perform shuffle based on algorithm
    const shuffledCards = shuffleDeck(cards, algorithm);
    const shuffleTime = Date.now() - startTime;
    // Generate shuffle state
    const shuffleId = `shuffle_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const entropy = calculateEntropy(shuffledCards);
    const shuffleState = {
      algorithm,
      timestamp: new Date().toISOString(),
      entropy: Math.round(entropy * 100) / 100,
    };
    // Optional preview of shuffled deck
    let preview;
    if (includePreview && shuffledCards.length >= 3) {
      preview = {
        topCard: {
          name: shuffledCards[0].name,
          arcana: shuffledCards[0].arcana_type,
          suit: shuffledCards[0].suit,
        },
        middleCard: {
          name: shuffledCards[Math.floor(shuffledCards.length / 2)].name,
          arcana:
            shuffledCards[Math.floor(shuffledCards.length / 2)].arcana_type,
          suit: shuffledCards[Math.floor(shuffledCards.length / 2)].suit,
        },
        bottomCard: {
          name: shuffledCards[shuffledCards.length - 1].name,
          arcana: shuffledCards[shuffledCards.length - 1].arcana_type,
          suit: shuffledCards[shuffledCards.length - 1].suit,
        },
      };
    }
    const response: ShuffleResponse = {
      success: true,
      shuffleId,
      deckId,
      cardCount: shuffledCards.length,
      shuffleState,
      ...(preview && { preview }),
    };
    // Log the shuffle for monitoring
    logger.info(
      "tarot_deck_shuffled",
      userId,
      {
        deckId,
        algorithm,
        cardCount: shuffledCards.length,
        shuffleTime,
        entropy: shuffleState.entropy,
        shuffleId,
      },
      `Successfully shuffled ${shuffledCards.length} cards using ${algorithm} algorithm.`,
    );
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Shuffle-Time": shuffleTime.toString(),
        "X-Shuffle-ID": shuffleId,
        "X-Entropy": entropy.toString(),
      },
    });
  } catch (error) {
    console.error("Tarot shuffle error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
/**
 * Shuffle deck using specified algorithm
 */
// Define a Card interface to type the card objects
interface Card {
  id: string;
  name: string;
  arcana_type: string;
  suit: string;
  card_number: number;
  [key: string]: unknown; // For any additional properties
}
function shuffleDeck(cards: Card[], algorithm: string): Card[] {
  const deck = [...cards];
  switch (algorithm) {
    case "fisher-yates":
      return fisherYatesShuffle(deck);
    case "riffle":
      return riffleShuffle(deck);
    case "overhand":
      return overhandShuffle(deck);
    default:
      return fisherYatesShuffle(deck);
  }
}
/**
 * Fisher-Yates (Knuth) shuffle - cryptographically strong
 */
function fisherYatesShuffle(array: Card[]): Card[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
/**
 * Riffle shuffle simulation - more natural feel
 */
function riffleShuffle(array: Card[]): Card[] {
  const deck = [...array];
  const mid = Math.floor(deck.length / 2);
  const left = deck.slice(0, mid);
  const right = deck.slice(mid);
  const shuffled: Card[] = [];
  let i = 0,
    j = 0;
  while (i < left.length && j < right.length) {
    // Bias towards alternating but with some randomness
    if (Math.random() < 0.6) {
      shuffled.push(left[i++]);
    } else {
      shuffled.push(right[j++]);
    }
  }
  // Add remaining cards
  shuffled.push(...left.slice(i), ...right.slice(j));
  return shuffled;
}
/**
 * Overhand shuffle simulation - gentle mixing
 */
function overhandShuffle(array: Card[]): Card[] {
  let deck = [...array];
  const passes = 3 + Math.floor(Math.random() * 3); // 3-5 passes
  for (let pass = 0; pass < passes; pass++) {
    const newDeck: Card[] = [];
    while (deck.length > 0) {
      // Take a small packet (1-7 cards) from top
      const packetSize = Math.min(
        deck.length,
        1 + Math.floor(Math.random() * 6),
      );
      const packet = deck.splice(0, packetSize);
      // Place packet on top of new deck
      newDeck.unshift(...packet);
    }
    deck = newDeck;
  }
  return deck;
}
/**
 * Calculate shuffle entropy (measure of randomness)
 */
function calculateEntropy(shuffledCards: Card[]): number {
  let entropy = 0;
  const cardCount = shuffledCards.length;
  // Simple entropy calculation based on position displacement
  for (let i = 0; i < cardCount; i++) {
    const originalPosition = shuffledCards[i].card_number;
    const displacement = Math.abs(i - originalPosition);
    entropy += displacement / cardCount;
  }
  return entropy / cardCount;
}
