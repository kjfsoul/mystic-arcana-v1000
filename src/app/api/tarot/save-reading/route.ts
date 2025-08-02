import Logger from "@/utils/logger";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
const logger = new Logger("TarotSaveReadingAPI");
interface SaveReadingRequest {
  userId: string;
  spreadType: "single" | "three-card" | "celtic-cross";
  cards: Array<{
    id: string;
    name: string;
    position: string;
    isReversed: boolean;
    meaning?: string;
    frontImage?: string;
    backImage?: string;
  }>;
  interpretation: string;
  question?: string;
  notes?: string;
  cosmicInfluence?: unknown;
  drawId?: string;
  isPublic?: boolean;
  tags?: string[];
}
interface SaveReadingResponse {
  success: boolean;
  readingId: string;
  savedAt: string;
  error?: string;
}
/**
 * POST /api/tarot/save-reading
 *
 * Save a tarot reading to the database for future reference
 *
 * Request Body:
 * {
 *   "userId": string (required),
 *   "spreadType": "single" | "three-card" | "celtic-cross",
 *   "cards": Array of card objects with positions and reversals,
 *   "interpretation": string (the reading interpretation),
 *   "question": string (optional, the question asked),
 *   "notes": string (optional, user notes),
 *   "cosmicInfluence": object (optional, cosmic/astrological data),
 *   "drawId": string (optional, reference to draw session),
 *   "isPublic": boolean (optional, for sharing),
 *   "tags": string[] (optional, for categorization)
 * }
 */
export async function POST(request: NextRequest) {
  let body: SaveReadingRequest | undefined;
  try {
    body = await request.json();
    // Validation
    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          code: "INVALID_BODY",
        },
        { status: 400 }
      );
    }
    
    const { spreadType, cards, interpretation } = body;
    // Get the authorization header from the request
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          code: "UNAUTHENTICATED",
        },
        { status: 401 }
      );
    }
    const token = authorization.split(' ')[1];
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);
    
    if (authError) {
      logger.warn(
        "tarot_save_reading_auth_error",
        undefined,
        { error: authError.message, details: authError },
        "Authentication error while saving reading."
      );
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed - " + authError.message,
          code: "AUTH_ERROR",
          details: authError.message
        },
        { status: 401 }
      );
    }
    if (!user) {
      logger.warn(
        "tarot_save_reading_unauthenticated",
        undefined,
        {},
        "Attempted to save reading without authentication."
      );
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          code: "UNAUTHENTICATED",
        },
        { status: 401 }
      );
    }
    const userId = user.id;
    if (
      !spreadType ||
      !["single", "three-card", "celtic-cross"].includes(spreadType)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valid spread type is required (single, three-card, celtic-cross)",
          code: "INVALID_SPREAD_TYPE",
        },
        { status: 400 }
      );
    }
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cards array is required and cannot be empty",
          code: "INVALID_CARDS",
        },
        { status: 400 }
      );
    }
    if (!interpretation || interpretation.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Interpretation is required",
          code: "MISSING_INTERPRETATION",
        },
        { status: 400 }
      );
    }
    // Validate card count matches spread type
    const expectedCardCounts = {
      single: 1,
      "three-card": 3,
      "celtic-cross": 10,
    };
    if (cards.length !== expectedCardCounts[spreadType]) {
      return NextResponse.json(
        {
          success: false,
          error: `${spreadType} spread requires exactly ${expectedCardCounts[spreadType]} cards, got ${cards.length}`,
          code: "CARD_COUNT_MISMATCH",
        },
        { status: 400 }
      );
    }
    // Prepare reading data for database
    const readingData = {
      user_id: userId,
      spread_type: spreadType,
      cards_drawn: {
        cards: cards.map((card) => ({
          id: card.id,
          name: card.name,
          position: card.position,
          isReversed: card.isReversed,
          meaning: card.meaning,
          frontImage: card.frontImage,
          backImage: card.backImage,
        })),
        positions: cards.map((card) => card.position),
        drawId: body.drawId,
        question: body.question,
        tags: body.tags || [],
      },
      interpretation_text: interpretation,
      cosmic_influence: body.cosmicInfluence || null,
      metadata: {
        isPublic: body.isPublic || false,
        notes: body.notes,
        savedAt: new Date().toISOString(),
        version: "1.0",
      },
    };
    // Save reading to database
    const startTime = Date.now();
    const { data: savedReading, error: saveError } = await supabase
      .from("tarot_readings")
      .insert([readingData])
      .select("id, created_at")
      .single();
    if (saveError) {
      console.error("Database save error:", saveError);
      logger.error(
        "tarot_save_reading_db_error",
        userId,
        { 
          error: saveError.message, 
          code: saveError.code,
          details: saveError,
          readingData: {
            spread_type: spreadType,
            cardsCount: cards.length,
            hasInterpretation: !!interpretation
          }
        },
        saveError,
        "Database error while saving reading."
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save reading: " + saveError.message,
          code: "SAVE_ERROR",
          details: saveError.message,
        },
        { status: 500 }
      );
    }
    const saveTime = Date.now() - startTime;
    const response: SaveReadingResponse = {
      success: true,
      readingId: savedReading.id,
      savedAt: savedReading.created_at,
    };
    // Log the save for monitoring
    logger.info(
      "tarot_reading_saved",
      userId || undefined,
      {
        readingId: savedReading.id,
        spreadType,
        cardCount: cards.length,
        question: body.question,
        tags: body.tags,
        saveTime,
      },
      `Tarot reading (ID: ${savedReading.id}) saved for user ${userId}.`
    );
    return NextResponse.json(response, {
      headers: {
        "X-Save-Time": saveTime.toString(),
        "X-Reading-ID": savedReading.id,
      },
      status: 201,
    });
  } catch (error) {
    logger.error(
      "tarot_save_reading_error",
      body?.userId,
      { spreadType: body?.spreadType, cardsCount: body?.cards?.length },
      error as Error,
      "Failed to save tarot reading."
    );
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
/**
 * GET /api/tarot/save-reading
 *
 * Get reading save statistics and limits for a user
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  try {
    if (!userId) {
      logger.warn(
        "tarot_get_save_stats_missing_user_id",
        undefined,
        {},
        "Attempted to get save statistics without a user ID."
      );
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
          code: "MISSING_USER_ID",
        },
        { status: 400 }
      );
    }
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error(
        "tarot_get_save_stats_config_error",
        userId || undefined,
        {},
        undefined,
        "Database configuration error for save statistics."
      );
      return NextResponse.json(
        {
          success: false,
          error: "Database configuration error",
          code: "CONFIG_ERROR",
        },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    // Get user reading statistics
    const { data: readings, error } = await supabase
      .from("tarot_readings")
      .select("id, spread_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      logger.error(
        "tarot_get_save_stats_fetch_error",
        userId || undefined,
        {},
        error,
        "Failed to fetch reading statistics from database."
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch reading statistics",
          code: "FETCH_ERROR",
        },
        { status: 500 }
      );
    }
    const stats = {
      totalReadings: readings?.length || 0,
      readingsByType: {
        single: readings?.filter((r) => r.spread_type === "single").length || 0,
        "three-card":
          readings?.filter((r) => r.spread_type === "three-card").length || 0,
        "celtic-cross":
          readings?.filter((r) => r.spread_type === "celtic-cross").length || 0,
      },
      lastReading: readings?.[0]?.created_at || null,
      limits: {
        maxReadingsPerDay: 50,
        maxReadingsPerMonth: 500,
        storageRetention: "1 year",
      },
    };
    logger.info(
      "tarot_get_save_stats_success",
      userId || undefined,
      {
        totalReadings: stats.totalReadings,
        readingsByType: stats.readingsByType,
      },
      "Successfully retrieved tarot save statistics."
    );
    return NextResponse.json({
      success: true,
      userId,
      statistics: stats,
    });
  } catch (error) {
    logger.error(
      "tarot_get_save_stats_internal_error",
      userId || undefined,
      {},
      error as Error,
      "Internal server error while getting tarot save statistics."
    );
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
