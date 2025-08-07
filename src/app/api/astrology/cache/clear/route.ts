import { NextResponse } from "next/server";
import { AstrologyCache } from "@/lib/cache/AstrologyCache";
export async function POST() {
  try {
    const cache = new AstrologyCache();

    // Clear cache
    const cleanupResult = await cache.cleanExpiredCache();

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
      birth_charts_cleaned: cleanupResult.birth_charts_cleaned,
      transits_cleaned: cleanupResult.transits_cleaned,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache clear error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
export async function GET() {
  // Return cache clear endpoint info
  return NextResponse.json({
    endpoint: "/api/astrology/cache/clear",
    method: "POST",
    description: "Clear expired astrology cache entries",
    response: {
      success: "boolean",
      birth_charts_cleaned: "number",
      transits_cleaned: "number",
    },
  });
}
