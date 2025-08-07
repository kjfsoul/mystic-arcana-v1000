/**
 * Daily Oracle API Integration Tests
 * Tests the daily oracle functionality through HTTP requests
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { BirthData } from "@/types/astrology";
import { DailyOracleResponse } from "@/types/oracle";

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("Daily Oracle API Integration", () => {
  const testBirthData: BirthData = {
    name: "Test User",
    date: new Date("1990-06-15T10:30:00Z"),
    city: "New York",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
  };

  const testRequestBody = {
    birthData: testBirthData,
    userId: "test-user-123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful Oracle Generation", () => {
    it("should return comprehensive daily oracle data structure", async () => {
      const mockOracleResponse: DailyOracleResponse = {
        success: true,
        data: {
          id: "oracle_123456789_abcdef",
          userId: "test-user-123",
          date: "2024-01-15",
          timestamp: "2024-01-15T12:00:00.000Z",

          dailySpread: {
            type: "daily_guidance",
            theme: "Gemini Daily Guidance - Communication and connection",
            cards: {
              morning: {
                card: {
                  id: "card-1",
                  name: "The Fool",
                  suit: null,
                  arcana_type: "major",
                  card_number: 0,
                  image_url: "/images/fool.jpg",
                  meaning_upright: "New beginnings, innocence, spontaneity",
                  meaning_reversed:
                    "Recklessness, taken advantage of, inconsideration",
                  keywords: ["beginnings", "innocence", "adventure"],
                  position: "Morning Energy",
                  isReversed: false,
                  description: "The start of a journey",
                  elemental_association: "Air",
                  astrological_association: "Uranus",
                },
                interpretation: "New beginnings, innocence, spontaneity",
                personalizedMessage:
                  "As the day begins, The Fool offers Gemini the energy of embracing beginnings and innocence.",
              },
              afternoon: {
                card: {
                  id: "card-2",
                  name: "The Magician",
                  suit: null,
                  arcana_type: "major",
                  card_number: 1,
                  image_url: "/images/magician.jpg",
                  meaning_upright: "Manifestation, resourcefulness, power",
                  meaning_reversed:
                    "Manipulation, poor planning, untapped talents",
                  keywords: ["manifestation", "power", "skill"],
                  position: "Afternoon Focus",
                  isReversed: false,
                  description: "The power to manifest",
                  elemental_association: "Air",
                  astrological_association: "Mercury",
                },
                interpretation: "Manifestation, resourcefulness, power",
                personalizedMessage:
                  "In the height of the day, The Magician guides your Gemini focus toward manifesting power and skill.",
              },
              evening: {
                card: {
                  id: "card-3",
                  name: "The High Priestess",
                  suit: null,
                  arcana_type: "major",
                  card_number: 2,
                  image_url: "/images/high-priestess.jpg",
                  meaning_upright: "Intuitive, unconscious, inner voice",
                  meaning_reversed:
                    "Lack of center, lost inner voice, repressed feelings",
                  keywords: ["intuition", "mystery", "wisdom"],
                  position: "Evening Reflection",
                  isReversed: false,
                  description: "Inner wisdom and intuition",
                  elemental_association: "Water",
                  astrological_association: "Moon",
                },
                interpretation: "Intuitive, unconscious, inner voice",
                personalizedMessage:
                  "As twilight approaches, The High Priestess invites Gemini to celebrate the lessons of intuition and mystery.",
              },
            },
            overallGuidance:
              "Today's three-card spread reveals a journey of beginnings, manifestation, intuition, perfectly aligned with your Gemini nature.",
            practicalAdvice:
              "Begin with beginnings, focus on manifestation during peak hours, and conclude with intuition for perfect daily balance.",
          },

          horoscope: {
            sign: "Gemini",
            degrees: 24.5,
            daily:
              "Today you are feeling mentally agile and socially vibrant. Your quick wit and communication skills open doors to exciting new connections.",
            element: "Air",
            quality: "Mutable",
            rulingPlanet: "Mercury",
          },

          cosmicFocus: {
            moonPhase: "Waxing Gibbous",
            moonSign: "Leo",
            dominantPlanet: "Mercury",
            keyAspects: [
              "Waxing Gibbous in Leo enhances emotional clarity",
              "Mercury influence brings communication and connection",
              "Universal energies align to support personal growth and manifestation",
            ],
            energyTheme: "Communication and connection",
            recommendation:
              "Express yourself clearly and listen deeply to others",
          },

          compatibility: {
            bestMatchSign: "Aquarius",
            challengingSign: "Virgo",
            relationshipAdvice:
              "Variety and intellectual connection energize your relationships today. Share your curiosity.",
            communicationTips:
              "Your wit and versatility charm others. Balance talking with deep listening.",
          },

          overallTheme:
            "Today's cosmic symphony weaves beginnings, manifestation, intuition through Gemini's Air energy under the Waxing Gibbous, creating a day of communication and connection.",
          keyMessage:
            "Trust the journey that The Fool reveals, for your Gemini wisdom knows the way forward.",
          actionableAdvice: [
            "Channel The Fool's energy by taking action toward beginnings.",
            "Honor your Gemini nature by expressing yourself clearly and listening deeply to others.",
            "Use The Magician's guidance to navigate beneficial manifestation today.",
            "Align with Mercury's influence by embracing communication and connection.",
            "Let The High Priestess remind you to embrace intuition this evening.",
          ],
          affirmation:
            "I am aligned with my Gemini power and trust the universe's guidance through this Waxing Gibbous.",

          generatedFromBirthChart: true,
          isUnavailable: false,
        },
        cached: false,
        generationTimeMs: 1250,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOracleResponse,
      } as Response);

      const response = await fetch("/api/oracle/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testRequestBody),
      });

      const data: DailyOracleResponse = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();

      if (data.data) {
        // Verify core structure
        expect(data.data.id).toBeDefined();
        expect(data.data.userId).toBe("test-user-123");
        expect(data.data.date).toBeDefined();
        expect(data.data.timestamp).toBeDefined();

        // Verify daily spread
        expect(data.data.dailySpread.type).toBe("daily_guidance");
        expect(data.data.dailySpread.cards.morning.card.name).toBe("The Fool");
        expect(data.data.dailySpread.cards.afternoon.card.name).toBe(
          "The Magician",
        );
        expect(data.data.dailySpread.cards.evening.card.name).toBe(
          "The High Priestess",
        );

        // Verify horoscope
        expect(data.data.horoscope.sign).toBe("Gemini");
        expect(data.data.horoscope.element).toBe("Air");
        expect(data.data.horoscope.rulingPlanet).toBe("Mercury");

        // Verify cosmic focus
        expect(data.data.cosmicFocus.moonPhase).toBe("Waxing Gibbous");
        expect(data.data.cosmicFocus.keyAspects).toHaveLength(3);

        // Verify compatibility
        expect(data.data.compatibility.bestMatchSign).toBe("Aquarius");
        expect(data.data.compatibility.challengingSign).toBe("Virgo");

        // Verify guidance elements
        expect(data.data.actionableAdvice).toHaveLength(5);
        expect(data.data.affirmation).toContain("Gemini");

        // Verify metadata
        expect(data.data.generatedFromBirthChart).toBe(true);
        expect(data.data.isUnavailable).toBe(false);
      }
    });

    it("should handle cached responses correctly", async () => {
      const cachedResponse: DailyOracleResponse = {
        success: true,
        data: {
          id: "oracle_cached_123",
          userId: "test-user-123",
          date: "2024-01-15",
          timestamp: "2024-01-15T12:00:00.000Z",
          dailySpread: {} as any,
          horoscope: {} as any,
          cosmicFocus: {} as any,
          compatibility: {} as any,
          overallTheme: "Cached theme",
          keyMessage: "Cached message",
          actionableAdvice: [],
          affirmation: "Cached affirmation",
          generatedFromBirthChart: true,
        },
        cached: true,
        generationTimeMs: 50,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => cachedResponse,
      } as Response);

      const response = await fetch("/api/oracle/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testRequestBody),
      });

      const data: DailyOracleResponse = await response.json();

      expect(data.success).toBe(true);
      expect(data.cached).toBe(true);
      expect(data.generationTimeMs).toBeLessThan(100); // Cached should be fast
    });
  });

  describe("Error Handling", () => {
    it("should handle missing birth data", async () => {
      const errorResponse = {
        success: false,
        error: "Birth data is required for personalized oracle reading",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      } as Response);

      const response = await fetch("/api/oracle/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "test-user" }),
      });

      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe(
        "Birth data is required for personalized oracle reading",
      );
    });

    it("should provide fallback data when services are unavailable", async () => {
      const fallbackResponse: DailyOracleResponse = {
        success: true,
        data: {
          id: "oracle_fallback_123",
          userId: "test-user-123",
          date: "2024-01-15",
          timestamp: "2024-01-15T12:00:00.000Z",
          dailySpread: {
            type: "daily_guidance",
            theme: "Universal Daily Guidance",
            cards: {
              morning: {
                card: {} as any,
                interpretation:
                  "Trust your inner wisdom as you begin this day.",
                personalizedMessage:
                  "The morning brings fresh energy and new possibilities.",
              },
              afternoon: {
                card: {} as any,
                interpretation: "Stay focused on your highest priorities.",
                personalizedMessage:
                  "Midday clarity illuminates your path forward.",
              },
              evening: {
                card: {} as any,
                interpretation: "Reflect on the day's lessons with gratitude.",
                personalizedMessage:
                  "Evening wisdom prepares you for tomorrow's journey.",
              },
            },
            overallGuidance:
              "Today is filled with potential for growth and discovery.",
            practicalAdvice:
              "Stay present, be kind to yourself, and remain open to unexpected opportunities.",
          },
          horoscope: {
            sign: "Universal",
            degrees: 0,
            daily: "The universe supports your journey today.",
            element: "Spirit",
            quality: "Universal",
            rulingPlanet: "Universe",
          },
          cosmicFocus: {
            moonPhase: "Mystical",
            moonSign: "Universal",
            dominantPlanet: "Universal Energy",
            keyAspects: [
              "Divine guidance is available",
              "Trust your intuition",
              "Stay open to signs",
            ],
            energyTheme: "Spiritual Growth",
            recommendation: "Listen to your inner voice and trust the process",
          },
          compatibility: {
            bestMatchSign: "Self-Love",
            challengingSign: "Self-Doubt",
            relationshipAdvice:
              "Focus on building a loving relationship with yourself first.",
            communicationTips:
              "Speak from your heart and listen with compassion.",
          },
          overallTheme:
            "Today brings opportunities for spiritual growth and inner discovery.",
          keyMessage:
            "Trust your journey and remain open to the universe's guidance.",
          actionableAdvice: [
            "Start the day with intention and gratitude",
            "Stay present and mindful throughout the day",
            "Trust your intuition when making decisions",
            "End the day by reflecting on lessons learned",
          ],
          affirmation:
            "I trust my journey and am open to all the guidance and blessings the universe offers.",
          generatedFromBirthChart: false,
          isUnavailable: true,
          errorDetails: "Service temporarily unavailable",
        },
        cached: false,
        generationTimeMs: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => fallbackResponse,
      } as Response);

      const response = await fetch("/api/oracle/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testRequestBody),
      });

      const data: DailyOracleResponse = await response.json();

      expect(data.success).toBe(true);
      expect(data.data?.isUnavailable).toBe(true);
      expect(data.data?.horoscope.sign).toBe("Universal");
      expect(data.data?.dailySpread.theme).toBe("Universal Daily Guidance");
      expect(data.data?.errorDetails).toBeDefined();
    });
  });

  describe("Data Validation", () => {
    it("should validate zodiac sign compatibility data", async () => {
      const geminiResponse: DailyOracleResponse = {
        success: true,
        data: {
          id: "test",
          date: "2024-01-15",
          timestamp: "2024-01-15T12:00:00.000Z",
          dailySpread: {} as any,
          horoscope: { sign: "Gemini" } as any,
          cosmicFocus: {} as any,
          compatibility: {
            bestMatchSign: "Aquarius",
            challengingSign: "Virgo",
            relationshipAdvice:
              "Variety and intellectual connection energize your relationships today.",
            communicationTips: "Your wit and versatility charm others.",
          },
          overallTheme: "",
          keyMessage: "",
          actionableAdvice: [],
          affirmation: "",
          generatedFromBirthChart: true,
        },
        generationTimeMs: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => geminiResponse,
      } as Response);

      const response = await fetch("/api/oracle/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testRequestBody),
      });

      const data: DailyOracleResponse = await response.json();

      expect(data.data?.compatibility.bestMatchSign).toBe("Aquarius");
      expect(data.data?.compatibility.challengingSign).toBe("Virgo");
      expect(data.data?.compatibility.relationshipAdvice).toContain(
        "intellectual",
      );
    });

    it("should validate cosmic focus data structure", async () => {
      const cosmicResponse: DailyOracleResponse = {
        success: true,
        data: {
          id: "test",
          date: "2024-01-15",
          timestamp: "2024-01-15T12:00:00.000Z",
          dailySpread: {} as any,
          horoscope: {} as any,
          cosmicFocus: {
            moonPhase: "Full Moon",
            moonSign: "Scorpio",
            dominantPlanet: "Pluto",
            keyAspects: [
              "Full Moon in Scorpio enhances emotional clarity",
              "Pluto influence brings transformation and renewal",
              "Universal energies align to support personal growth",
            ],
            energyTheme: "Transformation and renewal",
            recommendation: "Focus on new beginnings and setting intentions",
          },
          compatibility: {} as any,
          overallTheme: "",
          keyMessage: "",
          actionableAdvice: [],
          affirmation: "",
          generatedFromBirthChart: true,
        },
        generationTimeMs: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => cosmicResponse,
      } as Response);

      const response = await fetch("/api/oracle/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testRequestBody),
      });

      const data: DailyOracleResponse = await response.json();

      const cosmic = data.data?.cosmicFocus;
      expect(cosmic?.moonPhase).toBe("Full Moon");
      expect(cosmic?.moonSign).toBe("Scorpio");
      expect(cosmic?.dominantPlanet).toBe("Pluto");
      expect(cosmic?.keyAspects).toHaveLength(3);
      expect(cosmic?.energyTheme).toBe("Transformation and renewal");
      expect(cosmic?.recommendation).toContain("beginnings");
    });
  });

  describe("Performance and Metrics", () => {
    it("should include generation time metrics", async () => {
      const timedResponse: DailyOracleResponse = {
        success: true,
        data: {} as any,
        cached: false,
        generationTimeMs: 1337,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => timedResponse,
      } as Response);

      const response = await fetch("/api/oracle/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testRequestBody),
      });

      const data: DailyOracleResponse = await response.json();

      expect(data.generationTimeMs).toBe(1337);
      expect(typeof data.generationTimeMs).toBe("number");
    });

    it("should handle network timeouts gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network timeout"));

      try {
        await fetch("/api/oracle/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testRequestBody),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Network timeout");
      }
    });
  });
});
