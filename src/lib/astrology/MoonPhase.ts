export interface MoonPhaseData {
  phase: string; // e.g. 'Waning Gibbous'
  illumination: number; // e.g. 82.4 (percentage)
  emoji: string; // 🌕
  nextFullMoon: string; // ISO timestamp
  nextNewMoon: string; // ISO timestamp
  isUnavailable?: boolean;
}
interface MoonPhaseAPIResponse {
  success: boolean;
  data?: MoonPhaseData & {
    isUnavailable?: boolean;
    error?: string;
  };
  error?: string;
}
async function callMoonPhaseAPI(): Promise<MoonPhaseAPIResponse> {
  try {
    const response = await fetch("/api/astrology/moon-phase", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to call moon phase API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
function getFallbackMoonPhase(): MoonPhaseData {
  return {
    phase: "Moon phase temporarily unavailable",
    illumination: 0,
    emoji: "🌙",
    nextFullMoon: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextNewMoon: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isUnavailable: true,
  };
}
export async function getMoonPhase(): Promise<MoonPhaseData> {
  try {
    // Call the Python backend for real moon phase calculations
    const apiResponse = await callMoonPhaseAPI();

    if (!apiResponse.success || !apiResponse.data) {
      console.warn("Moon phase API failed, using fallback:", apiResponse.error);
      return getFallbackMoonPhase();
    }
    // Check if service is temporarily unavailable
    if (apiResponse.data.isUnavailable) {
      return getFallbackMoonPhase();
    }
    // Return the real moon phase data from Python backend
    return {
      phase: apiResponse.data.phase,
      illumination: apiResponse.data.illumination,
      emoji: apiResponse.data.emoji,
      nextFullMoon: apiResponse.data.nextFullMoon,
      nextNewMoon: apiResponse.data.nextNewMoon,
    };
  } catch (error) {
    console.error("Error in getMoonPhase:", error);
    return getFallbackMoonPhase();
  }
}
// Helper function to check if it's a full moon (for animation effects)
export function isFullMoon(moonPhase: MoonPhaseData): boolean {
  return (
    moonPhase.phase.toLowerCase().includes("full") &&
    moonPhase.illumination > 95
  );
}
// Helper function to format next phase dates
export function formatNextPhaseDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Date unavailable";
    }
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Date unavailable";
  }
}
