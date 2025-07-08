import { supabase } from "@/lib/supabase";
import Logger from "@/utils/logger";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const logger = new Logger("TarotGetReadingAPI");

// Define your Supabase credentials (replace with your actual environment variable names)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

interface Card {
  id: string;
  name: string;
  arcana_type: string;
  suit: string;
  card_number: number;
  [key: string]: unknown;
}

interface GetReadingResponse {
  success: boolean;
  reading?: {
    id: string;
    userId: string;
    spreadType: string;
    cards: Card[];
    positions: string[];
    interpretation: string;
    question?: string;
    notes?: string;
    cosmicInfluence?: unknown;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    drawId?: string;
  };
  readings?: {
    id: string;
    userId: string;
    spreadType: string;
    cards: Card[];
    positions: string[];
    interpretation: string;
    question?: string;
    notes?: string;
    cosmicInfluence?: unknown;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    drawId?: string;
  }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

/**
 * GET /api/tarot/get-reading
 *
 * Retrieve tarot readings by various filters
 *
 * Query Parameters:
 * - id: string (specific reading ID)
 * - userId: string (get all readings for user)
 * - date: string (ISO date to filter by day)
 * - dateFrom: string (start date for range)
 * - dateTo: string (end date for range)
 * - spreadType: string (filter by spread type)
 * - tags: string (comma-separated tags)
 * - isPublic: boolean (filter public readings)
 * - page: number (pagination, default 1)
 * - limit: number (per page, default 10, max 100)
 * - sort: string (createdAt, spreadType, default createdAt)
 * - order: string (asc, desc, default desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn(
        "tarot_get_reading_unauthenticated",
        undefined,
        undefined,
        "Attempted to get reading without authentication."
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

    // Extract query parameters
    const id = searchParams.get("id");
    const date = searchParams.get("date");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const spreadType = searchParams.get("spreadType");
    const tags = searchParams.get("tags");
    const isPublic = searchParams.get("isPublic");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    // Case 1: Get specific reading by ID
    if (id) {
      const { data: reading, error } = await supabase
        .from("tarot_readings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return NextResponse.json(
            {
              success: false,
              error: "Reading not found",
              code: "READING_NOT_FOUND",
            },
            { status: 404 }
          );
        }

        console.error("Database fetch error:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch reading",
            code: "FETCH_ERROR",
          },
          { status: 500 }
        );
      }

      const formattedReading = formatReading(reading);

      return NextResponse.json({
        success: true,
        reading: formattedReading,
      });
    }

    // Case 2: Get multiple readings with filters
    let query = supabase.from("tarot_readings").select("*", { count: "exact" });

    // Apply filters
    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (
      spreadType &&
      ["single", "three-card", "celtic-cross"].includes(spreadType)
    ) {
      query = query.eq("spread_type", spreadType);
    }

    if (isPublic !== null) {
      const publicFilter = isPublic === "true";
      query = query.eq("metadata->>isPublic", publicFilter.toString());
    }

    // Date filtering
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);

      query = query
        .gte("created_at", startOfDay.toISOString())
        .lt("created_at", endOfDay.toISOString());
    } else {
      if (dateFrom) {
        query = query.gte("created_at", new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1); // Include full day
        query = query.lt("created_at", endDate.toISOString());
      }
    }

    // Tag filtering (search in JSONB array)
    if (tags) {
      const tagList = tags.split(",").map((tag) => tag.trim());
      for (const tag of tagList) {
        query = query.contains("cards_drawn->tags", [tag]);
      }
    }

    // Sorting
    const validSortFields = ["created_at", "spread_type"];
    const sortField = validSortFields.includes(sort) ? sort : "created_at";
    query = query.order(sortField, { ascending: order === "asc" });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: readings, error: fetchError, count } = await query;

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch readings",
          code: "FETCH_ERROR",
          details: fetchError.message,
        },
        { status: 500 }
      );
    }

    const formattedReadings = readings?.map(formatReading) || [];
    const total = count || 0;
    const hasMore = offset + limit < total;

    const response: GetReadingResponse = {
      success: true,
      readings: formattedReadings,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    };

    // Log the fetch for monitoring
    logger.info(
      "tarot_readings_fetched",
      userId || undefined,
      {
        page,
        limit,
        spreadType,
        date,
        tags: tags ? tags.split(",") : undefined,
        totalReadings: formattedReadings.length,
        queryId: id,
      },
      `Fetched ${formattedReadings.length} readings.`
    );

    return NextResponse.json(response, {
      headers: {
        "X-Total-Count": total.toString(),
        "X-Page": page.toString(),
        "X-Has-More": hasMore.toString(),
      },
    });
  } catch (error) {
    console.error("Get reading error:", error);
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
 * Format raw database reading into API response format
 */
interface RawReading {
  id: string;
  user_id: string;
  spread_type: string;
  cards_drawn?: {
    cards?: Card[];
    positions?: string[];
    question?: string;
    tags?: string[];
    drawId?: string;
  };
  interpretation_text: string;
  metadata?: {
    notes?: string;
    isPublic?: boolean;
  };
  cosmic_influence?: unknown;
  created_at: string;
}

function formatReading(rawReading: RawReading) {
  const cardsDrawn = rawReading.cards_drawn || {};

  return {
    id: rawReading.id,
    userId: rawReading.user_id,
    spreadType: rawReading.spread_type,
    cards: cardsDrawn.cards || [],
    positions: cardsDrawn.positions || [],
    interpretation: rawReading.interpretation_text,
    question: cardsDrawn.question,
    notes: rawReading.metadata?.notes,
    cosmicInfluence: rawReading.cosmic_influence,
    isPublic: rawReading.metadata?.isPublic || false,
    tags: cardsDrawn.tags || [],
    createdAt: rawReading.created_at,
    drawId: cardsDrawn.drawId,
  };
}

/**
 * DELETE /api/tarot/get-reading
 *
 * Delete a specific reading (only by owner)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Reading ID and User ID are required",
          code: "MISSING_PARAMETERS",
        },
        { status: 400 }
      );
    }

    // Delete reading (only if user owns it)
    const { data, error } = await supabase
      .from("tarot_readings")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id");

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete reading",
          code: "DELETE_ERROR",
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Reading not found or access denied",
          code: "NOT_FOUND_OR_FORBIDDEN",
        },
        { status: 404 }
      );
    }

    logger.info(
      "tarot_reading_deleted",
      userId,
      { readingId: id },
      `Reading ${id} deleted by user ${userId}.`
    );

    return NextResponse.json({
      success: true,
      deletedId: id,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete reading error:", error);
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
