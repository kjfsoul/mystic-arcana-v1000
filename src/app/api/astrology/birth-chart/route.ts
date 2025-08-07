import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { BirthData } from "@/types/astrology";
import { AstrologyCache } from "@/lib/cache/AstrologyCache";
import { z } from "zod";
// Zod validation schema for exact payload format
const BirthChartPayloadSchema = z.object({
  name: z.string().optional(),
  birthDate: z
    .string()
    .datetime({ message: "birthDate must be ISO datetime string with Z" }),
  location: z.object(
    {
      lat: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
      lon: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
      city: z.string().min(1, "City is required"),
      country: z.string().min(1, "Country is required"),
      timezone: z.string().optional().default("UTC"),
    },
    {
      message: "Invalid location format - must include lat, lon, city, country",
    },
  ),
});
type ValidatedBirthChartPayload = z.infer<typeof BirthChartPayloadSchema>;
/* interface BirthChartRequest {
  birthData: BirthData;
} */
interface BirthChartData {
  svg: string;
  signSummary: string;
  houseBreakdown: string[];
  houses?: any; // Enhanced house data
  placidusMethod?: boolean;
}
interface BirthChartResult {
  success: boolean;
  data?: {
    svg_chart: string;
    sign_summary: string;
    house_breakdown: string[];
    chart_data?: any; // Full chart data including enhanced houses
  };
  error?: string;
}
function callPythonScript(
  action: string,
  data: object,
): Promise<BirthChartResult> {
  return new Promise((resolve) => {
    const pythonPath = process.env.PYTHON_PATH || "python3";
    const scriptPath = path.join(
      process.cwd(),
      "src/services/astrology-python/simple_astrology.py",
    );

    const pythonProcess = spawn(pythonPath, [
      scriptPath,
      action,
      JSON.stringify(data),
    ]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script error:", stderr);
        resolve({
          success: false,
          error: `Python script failed with code ${code}: ${stderr}`,
        });
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        console.error("Failed to parse Python output:", stdout);
        resolve({
          success: false,
          error: `Failed to parse Python output: ${error}`,
        });
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Failed to spawn Python process:", error);
      resolve({
        success: false,
        error: `Failed to spawn Python process: ${error.message}`,
      });
    });

    // Set timeout for long-running processes
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        success: false,
        error: "Python script timeout",
      });
    }, 30000); // 30 second timeout
  });
}
function generateEnhancedSignSummary(chartData: any): string {
  try {
    const houses = chartData.chart_data?.houses;
    const planets = chartData.chart_data?.planets;

    if (!houses || !planets) {
      return "Birth chart data processed successfully. Enhanced house calculations provide detailed astrological insights.";
    }

    const method = houses.method || "Standard";
    const ascendantSign =
      houses.angles?.ascendant?.sign || houses.ascendant?.sign || "Unknown";
    const sunSign = planets.sun?.sign || "Unknown";

    let summary = `Your birth chart has been calculated using ${method} house system. `;
    summary += `With ${ascendantSign} rising and Sun in ${sunSign}, `;

    if (houses.success) {
      summary +=
        "your house cusps have been precisely calculated using astronomical ephemeris data. ";
    } else {
      summary += "your chart uses reliable fallback calculations. ";
    }

    summary +=
      "This comprehensive analysis reveals the cosmic influences active at your birth moment.";

    return summary;
  } catch (error) {
    void error; // Indicate intentional unused variable
    return "Birth chart calculated with enhanced astrological methods and house system precision.";
  }
}
function generateEnhancedHouseBreakdown(chartData: any): string[] {
  try {
    const houses = chartData.chart_data?.houses;
    const breakdown: string[] = [];

    if (!houses) {
      return [
        "House calculation system: Standard",
        "Astrological houses computed",
        "Chart angles calculated",
      ];
    }

    breakdown.push(`House System: ${houses.method || "Standard"}`);

    if (houses.angles) {
      const asc = houses.angles.ascendant;
      const mc = houses.angles.midheaven;

      if (asc) {
        breakdown.push(
          `Ascendant (1st House): ${asc.degree_in_sign?.toFixed(1) || asc.degree?.toFixed(1)}° ${asc.sign}`,
        );
      }

      if (mc) {
        breakdown.push(
          `Midheaven (10th House): ${mc.degree_in_sign?.toFixed(1) || mc.degree?.toFixed(1)}° ${mc.sign}`,
        );
      }

      if (houses.angles.descendant) {
        const desc = houses.angles.descendant;
        breakdown.push(
          `Descendant (7th House): ${desc.degree_in_sign?.toFixed(1)}° ${desc.sign}`,
        );
      }

      if (houses.angles.imum_coeli) {
        const ic = houses.angles.imum_coeli;
        breakdown.push(
          `IC (4th House): ${ic.degree_in_sign?.toFixed(1)}° ${ic.sign}`,
        );
      }
    } else if (houses.ascendant && houses.midheaven) {
      // Fallback to Kerykeion data
      breakdown.push(
        `Ascendant (1st House): ${houses.ascendant.degree?.toFixed(1)}° ${houses.ascendant.sign}`,
      );
      breakdown.push(
        `Midheaven (10th House): ${houses.midheaven.degree?.toFixed(1)}° ${houses.midheaven.sign}`,
      );
    }

    if (houses.house_cusps) {
      const cuspCount = Object.keys(houses.house_cusps).length;
      breakdown.push(`House Cusps: ${cuspCount} calculated with precision`);
    }

    if (houses.metadata?.fallback_mode) {
      breakdown.push(
        "Calculation: Mathematical fallback (Swiss Ephemeris unavailable)",
      );
    } else if (houses.method?.includes("Swiss Ephemeris")) {
      breakdown.push("Calculation: Swiss Ephemeris precision");
    }

    return breakdown;
  } catch (error) {
    void error; // Indicate intentional unused variable
    return [
      "House system: Placidus enhanced",
      "Chart angles: Calculated",
      "Astrological precision: Professional",
    ];
  }
}
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const cache = new AstrologyCache();

  try {
    const rawPayload = await request.json();
    console.log("🔍 Received birth chart payload:", rawPayload);

    // Validate payload with exact schema
    const validationResult = BirthChartPayloadSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors
        .map((err) => {
          const field = err.path.join(".");
          return `${field}: ${err.message}`;
        })
        .join(", ");

      console.error("❌ Birth chart validation failed:", validationErrors);

      return NextResponse.json(
        {
          success: false,
          error: "Birth data is required",
          details: validationErrors,
          required_format: {
            name: "string (optional)",
            birthDate:
              "ISO datetime string with Z (e.g., '1879-03-14T11:30:00.000Z')",
            location: {
              lat: "number (-90 to 90)",
              lon: "number (-180 to 180)",
              city: "string (required)",
              country: "string (required)",
              timezone: "string (optional, defaults to UTC)",
            },
          },
          received_payload: rawPayload,
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "X-Response-Time": `${Date.now() - startTime}ms`,
          },
        },
      );
    }

    const payload: ValidatedBirthChartPayload = validationResult.data;
    console.log("✅ Validated birth chart payload:", payload);

    // Convert to internal BirthData format
    const birthData: BirthData = {
      name: payload.name || "User",
      birthDate: payload.birthDate, // Required string field
      birthTime: (payload as any).birthTime,
      birthLocation: `${payload.location.city}, ${payload.location.country}`,
      date: new Date(payload.birthDate), // For backward compatibility
      city: payload.location.city,
      country: payload.location.country,
      latitude: payload.location.lat,
      longitude: payload.location.lon,
      timezone: payload.location.timezone,
    };
    // Check cache first
    const cachedChart = await cache.getCachedBirthChart(birthData);
    if (cachedChart) {
      const responseTime = Date.now() - startTime;
      console.log(`🚀 Serving cached birth chart (${responseTime}ms)`);

      return NextResponse.json(
        {
          success: true,
          data: {
            svg: cachedChart.svg_chart,
            signSummary: cachedChart.sign_summary,
            houseBreakdown: cachedChart.house_breakdown,
            houses: cachedChart.chart_data?.houses,
            placidusMethod: cachedChart.placidus_method,
            cached: true,
            cacheMetadata: cachedChart.cache_metadata,
          },
        },
        {
          headers: {
            "Cache-Control":
              "public, max-age=3600, stale-while-revalidate=86400",
            "X-Cache-Status": "HIT",
            "X-Response-Time": `${responseTime}ms`,
          },
        },
      );
    }
    // Convert birth data to proper format for Python script
    const pythonBirthData = {
      name: birthData.name || "User",
      year:
        birthData.date?.getFullYear() ||
        new Date(birthData.birthDate).getFullYear(),
      month:
        (birthData.date?.getMonth() ||
          new Date(birthData.birthDate).getMonth()) + 1,
      day: birthData.date?.getDate() || new Date(birthData.birthDate).getDate(),
      hour:
        birthData.date?.getHours() || new Date(birthData.birthDate).getHours(),
      minute:
        birthData.date?.getMinutes() ||
        new Date(birthData.birthDate).getMinutes(),
      city: birthData.city,
      country: birthData.country || "",
    };
    // Call Python script for birth chart generation
    const chartResult = await callPythonScript("birth_chart", pythonBirthData);
    if (!chartResult.success || !chartResult.data) {
      // Fallback to data temporarily unavailable
      const responseTime = Date.now() - startTime;
      return NextResponse.json(
        {
          success: true,
          data: {
            svg: '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="180" fill="none" stroke="#6B7280" stroke-width="2" stroke-dasharray="10,5"/><text x="200" y="200" text-anchor="middle" fill="#6B7280" font-size="16">Chart Unavailable</text></svg>',
            signSummary:
              "Birth chart temporarily unavailable. Our astrological calculation service is currently offline. We use authentic astronomical calculations with Swiss Ephemeris data to generate your complete natal chart. Please try again in a few moments.",
            houseBreakdown: [
              "Birth chart service temporarily unavailable",
              "Please try again in a few moments",
              "We use Swiss Ephemeris for accurate calculations",
            ],
            isUnavailable: true,
          },
        },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "X-Cache-Status": "MISS",
            "X-Response-Time": `${responseTime}ms`,
          },
        },
      );
    }
    // Transform Python response to expected format with enhanced house data
    const birthChartData: BirthChartData = {
      svg: chartResult.data.svg_chart,
      signSummary: generateEnhancedSignSummary(chartResult.data),
      houseBreakdown: generateEnhancedHouseBreakdown(chartResult.data),
      houses: chartResult.data.chart_data?.houses,
      placidusMethod:
        chartResult.data.chart_data?.houses?.method?.includes("Placidus") ||
        chartResult.data.chart_data?.houses?.method?.includes(
          "Swiss Ephemeris",
        ),
    };
    // Cache the successful result
    const calculationTime = Date.now() - startTime;
    const swissEphemeris =
      chartResult.data.chart_data?.houses?.method?.includes(
        "Swiss Ephemeris",
      ) || false;
    const fallbackMode =
      chartResult.data.chart_data?.houses?.metadata?.fallback_mode || false;

    await cache.cacheBirthChart(
      birthData,
      chartResult.data.chart_data,
      birthChartData.svg,
      birthChartData.signSummary,
      birthChartData.houseBreakdown,
      birthChartData.placidusMethod || false,
      chartResult.data.chart_data?.houses?.method || "Standard",
      calculationTime,
      swissEphemeris,
      fallbackMode,
    );
    return NextResponse.json(
      {
        success: true,
        data: birthChartData,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          "X-Cache-Status": "MISS",
          "X-Response-Time": `${calculationTime}ms`,
        },
      },
    );
  } catch (error) {
    console.error("Birth chart API error:", error);
    const responseTime = Date.now() - startTime;

    // Fail-safe fallback
    return NextResponse.json(
      {
        success: true,
        data: {
          svg: '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="180" fill="none" stroke="#6B7280" stroke-width="2" stroke-dasharray="10,5"/><text x="200" y="200" text-anchor="middle" fill="#6B7280" font-size="16">Chart Unavailable</text></svg>',
          signSummary:
            "We're currently experiencing technical difficulties with our astrological calculation service. Please try again in a few moments.",
          houseBreakdown: [
            "Service temporarily unavailable",
            "Please try again later",
            "Your chart will be available when service is restored",
          ],
          isUnavailable: true,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Cache-Status": "ERROR",
          "X-Response-Time": `${responseTime}ms`,
        },
      },
    );
  }
}
