import { LunaReader } from "@/agents/readers/luna";
import { CompatibilityEngine } from "@/lib/astrology/compatibilityEngine";
import { LoveInterpreter } from "@/lib/astrology/interpretations/love";
import { LovePromptSelector } from "@/lib/knowledge/LovePrompts";
import { ReadingRequest } from "@/types/ReaderPersona";
import { BirthData } from "@/types/astrology";

// Mock external dependencies
jest.mock("@/lib/astrology/SwissEphemerisShim", () => ({
  SwissEphemerisCalculator: jest.fn().mockImplementation(() => ({
    calculateBirthChart: jest.fn(),
    calculateTransits: jest.fn(),
  })),
}));

jest.mock("@/lib/mem/memoryLogger", () => ({
  memoryLogger: {
    getUserInsights: jest.fn().mockResolvedValue([]),
  },
}));

describe("Luna Compatibility Flow Integration", () => {
  let lunaReader: LunaReader;

  const person1BirthData: BirthData = {
    date: "1990-07-15",
    time: "14:30",
    location: "New York, NY",
    coordinates: { latitude: 40.7128, longitude: -74.006 },
  };

  const person2BirthData: BirthData = {
    date: "1988-11-22",
    time: "09:15",
    location: "Los Angeles, CA",
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
  };

  beforeEach(() => {
    lunaReader = new LunaReader();
  });

  describe("Complete Compatibility Reading Flow", () => {
    it("should provide comprehensive compatibility analysis for Venus-Moon connection", async () => {
      // Mock harmonious compatibility
      const person1Chart = {
        planets: [
          { planet: "venus", house: 7, sign: "libra", degree: 15 },
          { planet: "moon", house: 4, sign: "cancer", degree: 22 },
          { planet: "mars", house: 1, sign: "aries", degree: 8 },
        ],
        houses: [
          { house: 7, sign: "libra", degree: 0 },
          { house: 4, sign: "cancer", degree: 0 },
        ],
      };

      const person2Chart = {
        planets: [
          { planet: "venus", house: 5, sign: "leo", degree: 18 },
          { planet: "moon", house: 8, sign: "scorpio", degree: 25 },
          { planet: "mars", house: 10, sign: "capricorn", degree: 12 },
        ],
        houses: [
          { house: 5, sign: "leo", degree: 0 },
          { house: 8, sign: "scorpio", degree: 0 },
        ],
      };

      const mockCalculator =
        require("@/lib/astrology/SwissEphemerisShim").SwissEphemerisCalculator;
      mockCalculator.prototype.calculateBirthChart
        .mockResolvedValueOnce(person1Chart)
        .mockResolvedValueOnce(person2Chart);
      mockCalculator.prototype.calculateTransits.mockResolvedValue({
        transits: [],
      });

      const synastryRequest: ReadingRequest = {
        userId: "test-couple",
        readerId: "luna",
        type: "synastry",
        focus: ["compatibility", "love"],
        birthData: person1BirthData,
        partnerBirthData: person2BirthData,
      };

      const response = await lunaReader.generateReading(synastryRequest);

      // Verify comprehensive response structure
      expect(response.readerId).toBe("luna");
      expect(response.interpretation.primary).toBeDefined();
      expect(response.interpretation.insights).toHaveLength(3);
      expect(response.followUpQuestions).toHaveLength(3);
      expect(response.nextSteps).toHaveLength(5);

      // Should mention compatibility percentage
      expect(response.interpretation.primary).toMatch(/\d+%/);

      // Should use Luna's poetic language
      expect(response.interpretation.primary).toMatch(
        /souls|hearts|dance|mirror/,
      );

      // Should include individual love styles
      expect(response.interpretation.secondary).toContain(
        "individual love style",
      );
    });

    it("should handle challenging compatibility with compassionate guidance", async () => {
      // Mock challenging aspects
      const challengingChart1 = {
        planets: [
          { planet: "venus", house: 1, sign: "aries", degree: 10 },
          { planet: "moon", house: 10, sign: "capricorn", degree: 5 },
          { planet: "mars", house: 8, sign: "scorpio", degree: 20 },
        ],
        houses: [],
      };

      const challengingChart2 = {
        planets: [
          { planet: "venus", house: 4, sign: "cancer", degree: 15 },
          { planet: "moon", house: 6, sign: "virgo", degree: 28 },
          { planet: "mars", house: 2, sign: "taurus", degree: 3 },
        ],
        houses: [],
      };

      const mockCalculator =
        require("@/lib/astrology/SwissEphemerisShim").SwissEphemerisCalculator;
      mockCalculator.prototype.calculateBirthChart
        .mockResolvedValueOnce(challengingChart1)
        .mockResolvedValueOnce(challengingChart2);

      const challengingRequest: ReadingRequest = {
        userId: "challenging-couple",
        readerId: "luna",
        type: "synastry",
        focus: ["compatibility", "growth"],
        birthData: person1BirthData,
        partnerBirthData: person2BirthData,
      };

      const response = await lunaReader.generateReading(challengingRequest);

      // Should still provide hope and guidance
      expect(response.interpretation.primary).not.toContain("impossible");
      expect(response.interpretation.primary).not.toContain("doomed");

      // Should focus on growth opportunities
      const hasGrowthGuidance = response.interpretation.guidance.some(
        (g) =>
          g.includes("growth") ||
          g.includes("learning") ||
          g.includes("conscious"),
      );
      expect(hasGrowthGuidance).toBe(true);
    });

    it("should adapt language for different connection types", async () => {
      // Test soulmate connection
      const soulMateAnalysis = await CompatibilityEngine.analyzeSynastry(
        {
          birthData: person1BirthData,
          planets: [
            { planet: "sun", house: 5, sign: "cancer", degree: 15 },
            { planet: "moon", house: 7, sign: "libra", degree: 15 },
          ],
        },
        {
          birthData: person2BirthData,
          planets: [
            { planet: "moon", house: 1, sign: "cancer", degree: 18 },
            { planet: "sun", house: 3, sign: "libra", degree: 12 },
          ],
        },
      );

      expect(soulMateAnalysis.connectionType).toBe("soulmate");
      expect(soulMateAnalysis.summary).toContain("destined connection");
    });
  });

  describe("Love Prompt Integration", () => {
    it("should select appropriate love prompts for Venus/Moon combinations", () => {
      const prompts = LovePromptSelector.selectPromptsForChart(
        "Taurus", // Venus sign
        7, // Venus house
        "Cancer", // Moon sign
        4, // Moon house
        ["Venus trine Moon"], // Major aspects
        ["New Moon in Taurus"], // Current transits
      );

      expect(prompts.length).toBeGreaterThan(0);

      // Should include Venus Taurus prompt
      const venusPrompt = prompts.find((p) =>
        p.trigger.includes("Venus in Taurus"),
      );
      expect(venusPrompt).toBeDefined();

      // Should include Moon Cancer prompt
      const moonPrompt = prompts.find((p) =>
        p.trigger.includes("Moon in Cancer"),
      );
      expect(moonPrompt).toBeDefined();
    });

    it("should provide different tones for different prompt types", () => {
      const gentlePrompts = LovePromptSelector.getPromptsByTone("gentle");
      const healingPrompts = LovePromptSelector.getPromptsByTone("healing");
      const empoweringPrompts =
        LovePromptSelector.getPromptsByTone("empowering");

      expect(gentlePrompts.length).toBeGreaterThan(0);
      expect(healingPrompts.length).toBeGreaterThan(0);
      expect(empoweringPrompts.length).toBeGreaterThan(0);

      // Each should have appropriate language
      expect(gentlePrompts[0].prompt).toMatch(/sweet|gentle|tender|beloved/);
      expect(healingPrompts[0].prompt).toMatch(/healing|shadow|wounds|sacred/);
    });

    it("should handle compatibility prompts for different element combinations", () => {
      const fireWaterPrompts = LovePromptSelector.selectCompatibilityPrompts(
        "Aries",
        "Cancer",
        "Leo",
        "Scorpio",
        ["Venus square Moon"],
      );

      expect(fireWaterPrompts.length).toBeGreaterThan(0);

      const fireWaterPrompt = fireWaterPrompts.find((p) =>
        p.prompt.includes("fire and water"),
      );
      expect(fireWaterPrompt).toBeDefined();
    });
  });

  describe("Love Interpretation Engine", () => {
    it("should analyze complete love profile with emotional needs", () => {
      const mockPlanets = [
        { planet: "venus", house: 7, sign: "libra", degree: 15 },
        { planet: "moon", house: 4, sign: "cancer", degree: 22 },
        { planet: "mars", house: 1, sign: "aries", degree: 8 },
      ];

      const mockHouses = [
        { house: 7, sign: "libra", degree: 0 },
        { house: 4, sign: "cancer", degree: 0 },
        { house: 1, sign: "aries", degree: 0 },
      ];

      const loveProfile = LoveInterpreter.analyzeLoveProfile(
        person1BirthData,
        mockPlanets,
        mockHouses,
      );

      expect(loveProfile.relationshipStyle).toBeDefined();
      expect(loveProfile.emotionalNeeds.length).toBeGreaterThan(0);
      expect(loveProfile.loveLanguage).toBeDefined();
      expect(loveProfile.compatibility.bestMatches.length).toBeGreaterThan(0);
      expect(loveProfile.shadowWork).toBeDefined();
      expect(loveProfile.confidence).toBeGreaterThan(0.8);
    });

    it("should identify love languages based on Venus sign", () => {
      const taurusVenus = [
        { planet: "venus", house: 2, sign: "taurus", degree: 10 },
      ];
      const geminiVenus = [
        { planet: "venus", house: 3, sign: "gemini", degree: 20 },
      ];

      const taurusProfile = LoveInterpreter.analyzeLoveProfile(
        person1BirthData,
        taurusVenus,
        [],
      );
      const geminiProfile = LoveInterpreter.analyzeLoveProfile(
        person1BirthData,
        geminiVenus,
        [],
      );

      expect(taurusProfile.loveLanguage).toContain("Physical touch");
      expect(geminiProfile.loveLanguage).toContain("Words of affirmation");
    });

    it("should provide appropriate shadow work themes", () => {
      const scorpioMoon = [
        { planet: "moon", house: 8, sign: "scorpio", degree: 15 },
      ];
      const libraMoon = [
        { planet: "moon", house: 7, sign: "libra", degree: 20 },
      ];

      const scorpioProfile = LoveInterpreter.analyzeLoveProfile(
        person1BirthData,
        scorpioMoon,
        [],
      );
      const libraProfile = LoveInterpreter.analyzeLoveProfile(
        person1BirthData,
        libraMoon,
        [],
      );

      expect(scorpioProfile.shadowWork).toMatch(/intensity|control|jealousy/);
      expect(libraProfile.shadowWork).toMatch(/people-pleasing|conflict/);
    });
  });

  describe("Synastry Analysis Engine", () => {
    it("should calculate compatibility scores accurately", async () => {
      const person1Planets = [
        { planet: "sun", house: 5, sign: "leo", degree: 15 },
        { planet: "venus", house: 7, sign: "libra", degree: 20 },
        { planet: "moon", house: 4, sign: "cancer", degree: 10 },
      ];

      const person2Planets = [
        { planet: "moon", house: 1, sign: "leo", degree: 18 }, // Close to person1's sun
        { planet: "venus", house: 3, sign: "sagittarius", degree: 22 },
        { planet: "mars", house: 9, sign: "libra", degree: 25 }, // Close to person1's venus
      ];

      const analysis = await CompatibilityEngine.analyzeSynastry(
        { birthData: person1BirthData, planets: person1Planets },
        { birthData: person2BirthData, planets: person2Planets },
      );

      expect(analysis.overallCompatibility).toBeGreaterThan(50);
      expect(analysis.strengths.length).toBeGreaterThan(0);
      expect(analysis.harmonies.length).toBeGreaterThan(0);
      expect(analysis.summary).toContain("meaningful bond");
    });

    it("should identify different connection types appropriately", async () => {
      // Soulmate indicators: Sun-Moon, Venus-Mars connections
      const soulMateP1 = [
        { planet: "sun", house: 1, sign: "aries", degree: 10 },
        { planet: "venus", house: 5, sign: "leo", degree: 15 },
      ];
      const soulMateP2 = [
        { planet: "moon", house: 7, sign: "aries", degree: 12 }, // Close to P1 sun
        { planet: "mars", house: 9, sign: "leo", degree: 18 }, // Close to P1 venus
      ];

      const soulMateAnalysis = await CompatibilityEngine.analyzeSynastry(
        { birthData: person1BirthData, planets: soulMateP1 },
        { birthData: person2BirthData, planets: soulMateP2 },
      );

      // Should identify strong connection
      expect(soulMateAnalysis.connectionType).toMatch(/soulmate|complementary/);
      expect(soulMateAnalysis.overallCompatibility).toBeGreaterThan(70);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing partner birth data gracefully", async () => {
      const invalidRequest: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: "synastry",
        focus: ["compatibility"],
        birthData: person1BirthData,
        // Missing partnerBirthData
      };

      // Should still process as individual reading
      const response = await lunaReader.generateReading(invalidRequest);
      expect(response.interpretation.primary).toBeDefined();
    });

    it("should handle ephemeris calculation errors gracefully", async () => {
      const mockCalculator =
        require("@/lib/astrology/SwissEphemerisShim").SwissEphemerisCalculator;
      mockCalculator.prototype.calculateBirthChart.mockRejectedValue(
        new Error("Calculation failed"),
      );

      const request: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: "birth_chart",
        birthData: person1BirthData,
      };

      await expect(lunaReader.generateReading(request)).rejects.toThrow(
        "Calculation failed",
      );
    });

    it("should handle memory logger failures without breaking readings", async () => {
      const memoryLogger = require("@/lib/mem/memoryLogger").memoryLogger;
      memoryLogger.getUserInsights.mockRejectedValue(
        new Error("Memory access failed"),
      );

      const request: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: "birth_chart",
        focus: ["healing"],
        birthData: person1BirthData,
      };

      // Should still complete reading without journal insights
      const response = await lunaReader.generateReading(request);
      expect(response.interpretation.primary).toBeDefined();
    });
  });
});
