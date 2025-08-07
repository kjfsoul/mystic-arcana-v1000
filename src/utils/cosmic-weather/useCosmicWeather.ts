import { useState, useEffect, useCallback } from "react";
interface CosmicWeatherData {
  moonPhase: string;
  moonSign: string;
  currentPhase: string;
  planetaryAlignment: string;
  planetaryHour: string;
  nextHourTime: string;
  retrogradeAlert?: string;
  cosmicIntensity: "calm" | "active" | "intense";
}
interface Transit {
  planet: string;
  aspect: string;
  natalPlanet: string;
  orb: number;
  influence: "harmonious" | "challenging" | "neutral";
}
interface CosmicInfluence {
  currentPhase: string;
  planetaryAlignment: string;
  favorableFor: string[];
  challengingFor: string[];
}
/**
 * useCosmicWeather Hook
 *
 * Provides real-time cosmic weather data including moon phases,
 * planetary positions, and astrological influences for readings.
 *
 * Features:
 * - Real-time moon phase calculations
 * - Planetary hour tracking
 * - Transit monitoring
 * - Retrograde alerts
 * - Integration with tarot timing
 */
export const useCosmicWeather = () => {
  const [cosmicWeather, setCosmicWeather] = useState<CosmicWeatherData>({
    moonPhase: "Waxing Crescent",
    moonSign: "Moon in Cancer",
    currentPhase: "Building Energy",
    planetaryAlignment: "Mercury trine Jupiter",
    planetaryHour: "Venus",
    nextHourTime: "3:42 PM",
    cosmicIntensity: "active",
  });
  const [currentTransits] = useState<Transit[]>([
    {
      planet: "Mars",
      aspect: "conjunct",
      natalPlanet: "Sun",
      orb: 1.5,
      influence: "neutral",
    },
    {
      planet: "Venus",
      aspect: "trine",
      natalPlanet: "Moon",
      orb: 0.8,
      influence: "harmonious",
    },
  ]);
  const [cosmicInfluence] = useState<CosmicInfluence>({
    currentPhase: "Manifestation Window",
    planetaryAlignment: "Favorable for new beginnings",
    favorableFor: ["Romance", "Creative Projects", "Spiritual Work"],
    challengingFor: ["Major Decisions", "Confrontations"],
  });
  // Calculate moon phase based on current date

  const calculateMoonPhase = useCallback(() => {
    const phases = [
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Waning Gibbous",
      "Last Quarter",
      "Waning Crescent",
    ];
    // Simplified moon phase calculation (would use precise ephemeris in production)
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let adjustedYear = year;
    let adjustedMonth = month;
    if (month < 3) {
      adjustedYear--;
      adjustedMonth += 12;
    }
    const c = 365.25 * adjustedYear;
    const e = 30.6 * adjustedMonth;
    let jd = c + e + day - 694039.09; // Julian day
    jd /= 29.5305882; // Moon cycle
    const b = parseInt(jd.toString());
    jd -= b;
    let phaseIndex = Math.round(jd * 8);
    if (phaseIndex >= 8) phaseIndex = 0;
    return phases[phaseIndex];
  }, []);
  // Calculate current planetary hour

  const calculatePlanetaryHour = useCallback(() => {
    const planets = [
      "Saturn",
      "Jupiter",
      "Mars",
      "Sun",
      "Venus",
      "Mercury",
      "Moon",
    ];
    const dayOfWeek = new Date().getDay();
    const hour = new Date().getHours();
    // Simplified planetary hour calculation
    const planetIndex = (dayOfWeek * 24 + hour) % 7;
    return planets[planetIndex];
  }, []);
  // Update cosmic weather data

  const updateCosmicWeather = useCallback(() => {
    const moonPhase = calculateMoonPhase();
    const planetaryHour = calculatePlanetaryHour();
    // Calculate next planetary hour time
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    const nextHourTime = nextHour.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    // Determine cosmic intensity based on current aspects
    let cosmicIntensity: "calm" | "active" | "intense" = "active";
    if (moonPhase === "Full Moon" || moonPhase === "New Moon") {
      cosmicIntensity = "intense";
    } else if (moonPhase === "First Quarter" || moonPhase === "Last Quarter") {
      cosmicIntensity = "active";
    } else {
      cosmicIntensity = "calm";
    }
    setCosmicWeather({
      moonPhase,
      moonSign: getMoonSign(), // Would calculate from ephemeris
      currentPhase: getPhaseDescription(moonPhase),
      planetaryAlignment: getCurrentAlignment(),
      planetaryHour,
      nextHourTime,
      retrogradeAlert: checkRetrogrades(),
      cosmicIntensity,
    });
  }, [calculateMoonPhase, calculatePlanetaryHour]);
  // Helper functions (would use real ephemeris data in production)
  const getMoonSign = () => {
    const signs = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    const dayOfMonth = new Date().getDate();
    return `Moon in ${signs[dayOfMonth % 12]}`;
  };
  const getPhaseDescription = (phase: string): string => {
    const descriptions: Record<string, string> = {
      "New Moon": "New Beginnings & Intention Setting",
      "Waxing Crescent": "Building Energy & Taking Action",
      "First Quarter": "Decision Point & Challenges",
      "Waxing Gibbous": "Refinement & Adjustment",
      "Full Moon": "Culmination & Release",
      "Waning Gibbous": "Gratitude & Sharing",
      "Last Quarter": "Release & Forgiveness",
      "Waning Crescent": "Rest & Reflection",
    };
    return descriptions[phase] || "Cosmic Flow";
  };
  const getCurrentAlignment = () => {
    const alignments = [
      "Sun conjunct Mercury - Clear Communication",
      "Venus trine Jupiter - Abundance & Joy",
      "Mars square Saturn - Patience Required",
      "Mercury sextile Uranus - Innovative Ideas",
      "Moon opposite Neptune - Heightened Intuition",
    ];
    const hour = new Date().getHours();
    return alignments[hour % alignments.length];
  };
  const checkRetrogrades = () => {
    // Simplified retrograde check (would use ephemeris)
    const month = new Date().getMonth();
    if (month % 4 === 0) {
      return "Mercury Retrograde - Review & Revise";
    }
    return undefined;
  };
  // Get tarot timing recommendations

  const getTarotTiming = useCallback(() => {
    const { moonPhase, planetaryHour, cosmicIntensity } = cosmicWeather;
    const timing = {
      optimal: false,
      reason: "",
      alternatives: [] as string[],
    };
    // Check if current time is optimal for readings
    if (moonPhase === "Full Moon" || moonPhase === "New Moon") {
      timing.optimal = true;
      timing.reason = "Powerful lunar energy enhances intuition";
    } else if (planetaryHour === "Moon" || planetaryHour === "Venus") {
      timing.optimal = true;
      timing.reason = `${planetaryHour} hour favors emotional and spiritual insights`;
    } else if (cosmicIntensity === "calm") {
      timing.optimal = true;
      timing.reason = "Calm cosmic weather allows clear reception";
    } else {
      timing.alternatives = [
        "Wait for Moon or Venus hour",
        "Ground yourself with meditation first",
        "Focus on specific questions rather than general readings",
      ];
    }
    return timing;
  }, [cosmicWeather]);
  // Initialize and update periodically

  useEffect(() => {
    updateCosmicWeather();
    // Update every 5 minutes
    const interval = setInterval(updateCosmicWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateCosmicWeather]);
  return {
    cosmicWeather,
    currentTransits,
    cosmicInfluence,
    updateCosmicWeather,
    getTarotTiming,
  };
};
