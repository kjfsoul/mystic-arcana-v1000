import { OrionReader } from "@/agents/readers/orion";
import { CareerPromptSelector } from "@/lib/knowledge/CareerPrompts";
import { CareerInterpreter } from "@/lib/astrology/interpretations/career";
import { ReadingRequest } from "@/types/ReaderPersona";
import { BirthData } from "@/types/astrology";

// Mock external dependencies
jest.mock("@/lib/astrology/SwissEphemerisShim", () => ({
  SwissEphemerisCalculator: jest.fn().mockImplementation(() => ({
    calculateBirthChart: jest.fn(),
    calculateTransits: jest.fn(),
  })),
}));

describe("Orion Career Flow Integration", () => {
  let orionReader: OrionReader;

  const mockBirthData: BirthData = {
    date: "1990-07-15",
    time: "14:30",
    location: "New York, NY",
    coordinates: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  };

  beforeEach(() => {
    orionReader = new OrionReader();
  });

  describe("Complete Career Reading Flow", () => {
    it("should provide comprehensive career guidance for Leo MC with Sun in 10th", async () => {
      // Mock birth chart data
      const mockBirthChart = {
        planets: [
          { planet: "sun", house: 10, sign: "leo", degree: 15 },
          { planet: "saturn", house: 6, sign: "capricorn", degree: 22 },
          { planet: "jupiter", house: 2, sign: "sagittarius", degree: 8 },
        ],
        houses: [
          { house: 10, sign: "leo", degree: 0 },
          { house: 6, sign: "capricorn", degree: 0 },
          { house: 2, sign: "sagittarius", degree: 0 },
        ],
      };

      const mockTransits = {
        transits: [
          { planet: "jupiter", aspect: "trine", target: "mc", orb: 2 },
        ],
      };

      // Mock the ephemeris calculator
      const mockCalculator =
        require("@/lib/astrology/SwissEphemerisShim").SwissEphemerisCalculator;
      mockCalculator.prototype.calculateBirthChart.mockResolvedValue(
        mockBirthChart,
      );
      mockCalculator.prototype.calculateTransits.mockResolvedValue(
        mockTransits,
      );

      const readingRequest: ReadingRequest = {
        userId: "test-user",
        readerId: "orion",
        type: "birth_chart",
        focus: ["career", "purpose", "timing"],
        birthData: mockBirthData,
      };

      const response = await orionReader.generateReading(readingRequest);

      // Verify comprehensive response structure
      expect(response.readerId).toBe("orion");
      expect(response.interpretation.primary).toBeDefined();
      expect(response.interpretation.insights).toHaveLength(3);
      expect(response.interpretation.guidance).toHaveLength(4);
      expect(response.followUpQuestions).toHaveLength(3);
      expect(response.nextSteps).toHaveLength(4);

      // Verify Leo MC interpretation
      expect(response.interpretation.primary).toContain("Leo Midheaven");

      // Verify Sun in 10th house interpretation
      expect(response.interpretation.primary).toContain(
        "sun in your 10th house",
      );
      expect(response.interpretation.primary).toContain("leadership");
    });

    it("should adapt guidance based on Saturn return timing", async () => {
      // Mock Saturn return scenario (age ~29)
      const saturnReturnChart = {
        planets: [
          { planet: "sun", house: 6, sign: "virgo", degree: 20 },
          { planet: "saturn", house: 10, sign: "capricorn", degree: 15 }, // Saturn return
          { planet: "jupiter", house: 3, sign: "gemini", degree: 12 },
        ],
        houses: [
          { house: 10, sign: "capricorn", degree: 0 },
          { house: 6, sign: "virgo", degree: 0 },
        ],
      };

      const saturnReturnTransits = {
        transits: [
          { planet: "saturn", aspect: "conjunction", target: "saturn", orb: 1 },
        ],
      };

      const mockCalculator =
        require("@/lib/astrology/SwissEphemerisShim").SwissEphemerisCalculator;
      mockCalculator.prototype.calculateBirthChart.mockResolvedValue(
        saturnReturnChart,
      );
      mockCalculator.prototype.calculateTransits.mockResolvedValue(
        saturnReturnTransits,
      );

      const readingRequest: ReadingRequest = {
        userId: "test-user-saturn",
        readerId: "orion",
        type: "birth_chart",
        focus: ["timing", "career"],
        birthData: mockBirthData,
      };

      const response = await orionReader.generateReading(readingRequest);

      // Should include Saturn return timing guidance
      expect(response.interpretation.timing).toContain("pivotal time");
      expect(response.interpretation.timing).toContain("1-2 years");

      // Should have restructuring-focused next steps
      expect(
        response.nextSteps?.some(
          (step) =>
            step.includes("restructuring") || step.includes("1-2 years"),
        ),
      ).toBe(true);
    });

    it("should provide service-oriented guidance for Sun in 6th house", async () => {
      const serviceOrientedChart = {
        planets: [
          { planet: "sun", house: 6, sign: "virgo", degree: 8 },
          { planet: "mercury", house: 6, sign: "virgo", degree: 15 },
          { planet: "saturn", house: 2, sign: "taurus", degree: 22 },
        ],
        houses: [
          { house: 6, sign: "virgo", degree: 0 },
          { house: 10, sign: "cancer", degree: 0 },
        ],
      };

      const mockCalculator =
        require("@/lib/astrology/SwissEphemerisShim").SwissEphemerisCalculator;
      mockCalculator.prototype.calculateBirthChart.mockResolvedValue(
        serviceOrientedChart,
      );
      mockCalculator.prototype.calculateTransits.mockResolvedValue({
        transits: [],
      });

      const readingRequest: ReadingRequest = {
        userId: "test-user-service",
        readerId: "orion",
        type: "birth_chart",
        focus: ["purpose"],
        birthData: mockBirthData,
      };

      const response = await orionReader.generateReading(readingRequest);

      // Should mention service and helping themes
      expect(response.interpretation.primary).toContain("service");
      expect(
        response.interpretation.insights.some(
          (insight) =>
            insight.toLowerCase().includes("service") ||
            insight.toLowerCase().includes("detail"),
        ),
      ).toBe(true);
    });
  });

  describe("Career Prompt Integration", () => {
    it("should select appropriate career prompts for chart configuration", () => {
      const prompts = CareerPromptSelector.selectPromptsForChart(
        "Leo", // MC sign
        ["sun"], // 10th house planets
        ["Jupiter trine Midheaven"], // Major transits
        10, // Sun house
      );

      expect(prompts.length).toBeGreaterThan(0);
      expect(prompts.some((p) => p.category === "career_path")).toBe(true);
      expect(prompts.some((p) => p.category === "purpose")).toBe(true);
      expect(prompts.some((p) => p.category === "strengths")).toBe(true);
    });

    it("should handle Saturn return timing prompts", () => {
      const prompts = CareerPromptSelector.selectPromptsForChart(
        "Capricorn",
        ["saturn"],
        ["Saturn return active"],
        10,
      );

      const saturnReturnPrompt = prompts.find((p) =>
        p.trigger.includes("Saturn return"),
      );

      expect(saturnReturnPrompt).toBeDefined();
      expect(saturnReturnPrompt!.category).toBe("timing");
    });

    it("should provide prompts for different MC signs", () => {
      const ariesPrompts = CareerPromptSelector.selectPromptsForChart(
        "Aries",
        [],
        [],
        undefined,
      );
      const taurusPrompts = CareerPromptSelector.selectPromptsForChart(
        "Taurus",
        [],
        [],
        undefined,
      );

      expect(ariesPrompts.some((p) => p.prompt.includes("pioneer"))).toBe(true);
      expect(taurusPrompts.some((p) => p.prompt.includes("stability"))).toBe(
        true,
      );
    });
  });

  describe("Career Interpreter Integration", () => {
    it("should analyze complete career path with timing", () => {
      const mockPlanets = [
        { planet: "sun", house: 10, sign: "leo", degree: 15 },
        { planet: "saturn", house: 6, sign: "capricorn", degree: 22 },
        { planet: "jupiter", house: 2, sign: "sagittarius", degree: 8 },
      ];

      const mockHouses = [
        { house: 10, sign: "leo", degree: 0 },
        { house: 6, sign: "capricorn", degree: 0 },
        { house: 2, sign: "sagittarius", degree: 0 },
      ];

      const interpretation = CareerInterpreter.analyzeCareerPath(
        mockBirthData,
        mockPlanets,
        mockHouses,
      );

      expect(interpretation.primaryPath).toBeDefined();
      expect(interpretation.strengths.length).toBeGreaterThan(0);
      expect(interpretation.timing).toBeDefined();
      expect(interpretation.guidance).toBeDefined();
      expect(interpretation.confidence).toBeGreaterThan(0.7);
    });

    it("should identify career strengths from planetary positions", () => {
      const leadershipChart = [
        { planet: "sun", house: 10, sign: "leo", degree: 15 },
        { planet: "mars", house: 10, sign: "leo", degree: 20 },
      ];

      const houses = [{ house: 10, sign: "leo", degree: 0 }];

      const interpretation = CareerInterpreter.analyzeCareerPath(
        mockBirthData,
        leadershipChart,
        houses,
      );

      expect(
        interpretation.strengths.some(
          (strength) =>
            strength.toLowerCase().includes("leadership") ||
            strength.toLowerCase().includes("action"),
        ),
      ).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing birth data gracefully", async () => {
      const invalidRequest: ReadingRequest = {
        userId: "test-user",
        readerId: "orion",
        type: "birth_chart",
        focus: ["career"],
        // Missing birthData
      };

      await expect(orionReader.generateReading(invalidRequest)).rejects.toThrow(
        "Birth data required",
      );
    });

    it("should handle ephemeris calculation errors", async () => {
      const mockCalculator =
        require("@/lib/astrology/SwissEphemerisShim").SwissEphemerisCalculator;
      mockCalculator.prototype.calculateBirthChart.mockRejectedValue(
        new Error("Calculation error"),
      );

      const readingRequest: ReadingRequest = {
        userId: "test-user",
        readerId: "orion",
        type: "birth_chart",
        birthData: mockBirthData,
      };

      await expect(orionReader.generateReading(readingRequest)).rejects.toThrow(
        "Calculation error",
      );
    });
  });
});
