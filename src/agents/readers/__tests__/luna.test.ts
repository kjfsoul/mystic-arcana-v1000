import { LunaReader, LUNA_PERSONA } from "../luna";
import { ReadingRequest } from "@/types/ReaderPersona";
import { BirthData } from "@/types/astrology";
import { memoryLogger } from "@/lib/mem/memoryLogger";
import {
  ReaderSpecialization,
  SummaryType as SummaryTypeEnum,
  ReadingRequestType,
} from "@/constants/EventTypes";
import { Planet, AspectType } from "@/constants/AstrologyConstants";

// Mock the Swiss Ephemeris Calculator
jest.mock("@/lib/astrology/SwissEphemerisShim", () => ({
  SwissEphemerisCalculator: jest.fn().mockImplementation(() => ({
    calculateBirthChart: jest.fn().mockResolvedValue({
      planets: [
        { planet: "venus", house: 5, sign: "taurus", degree: 20 },
        { planet: "moon", house: 4, sign: "cancer", degree: 15 },
        { planet: "mars", house: 7, sign: "scorpio", degree: 8 },
      ],
      houses: [
        { house: 4, sign: "cancer", degree: 0 },
        { house: 5, sign: "leo", degree: 0 },
        { house: 7, sign: "libra", degree: 0 },
      ],
    }),
    calculateTransits: jest.fn().mockResolvedValue({
      transits: [{ planet: "venus", aspect: "trine", target: "moon", orb: 3 }],
    }),
  })),
}));

// Mock the Love Interpreter
jest.mock("@/lib/astrology/interpretations/love", () => ({
  LoveInterpreter: {
    analyzeLoveProfile: jest.fn().mockReturnValue({
      relationshipStyle:
        "Your Taurus Venus seeks love that feels like coming home - steady, sensual, and deeply rooted.",
      emotionalNeeds: [
        "Emotional security and understanding",
        "Nurturing, protective love",
        "Harmony and beauty",
      ],
      loveLanguage: "Physical touch and receiving gifts",
      compatibility: {
        bestMatches: [
          "Earth signs for stability",
          "Water signs for emotional depth",
        ],
        challenges: ["Fire signs may feel too impulsive"],
        growthAreas: ["Learning to appreciate different love languages"],
      },
      timing:
        "Venus is encouraging you to open your heart to new possibilities.",
      shadowWork:
        "Your healing journey may involve exploring emotional walls or prioritizing status over connection.",
      guidance: "Your heart knows its own rhythm. Trust the timing of love.",
      keywords: ["love", "security", "nurturing", "harmony"],
      confidence: 0.88,
    }),
  },
}));

// Mock the Compatibility Engine
jest.mock("@/lib/astrology/compatibilityEngine", () => ({
  CompatibilityEngine: {
    analyzeSynastry: jest.fn().mockResolvedValue({
      overallCompatibility: 78,
      strengths: ["Deep emotional understanding", "Natural harmony in values"],
      challenges: ["Different approaches to conflict resolution"],
      advice: [
        "Trust the timing of your connection",
        "Honor both individual paths",
      ],
      connectionType: "complementary",
      harmonies: [
        {
          person1Planet: "venus",
          person2Planet: "moon",
          aspect: "trine",
          meaning: "Beautiful emotional compatibility",
        },
      ],
      tensions: [],
      summary:
        "Your connection reveals a harmonious partnership that brings out your best qualities.",
    }),
  },
}));

// Mock memory logger
jest.mock("@/lib/mem/memoryLogger", () => ({
  memoryLogger: {
    getUserInsights: jest.fn().mockResolvedValue([
      {
        trait: "expressive",
        context: "Shows emotional depth in journal entries",
        timestamp: "2024-01-01",
      },
      {
        trait: "seeking-healing",
        context: "Reflects on relationship patterns",
        timestamp: "2024-01-02",
      },
    ]),
  },
}));

describe("LunaReader", () => {
  let lunaReader: LunaReader;
  let mockBirthData: BirthData;
  let mockPartnerBirthData: BirthData;

  beforeEach(() => {
    lunaReader = new LunaReader();

    mockBirthData = {
      date: "1985-05-15",
      time: "10:30",
      location: "San Francisco, CA",
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    };

    mockPartnerBirthData = {
      date: "1983-11-22",
      time: "15:45",
      location: "Los Angeles, CA",
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437,
      },
    };
  });

  describe("Persona Configuration", () => {
    it("should have correct persona configuration", () => {
      const persona = lunaReader.getPersona();

      expect(persona.id).toBe("luna");
      expect(persona.name).toBe("Luna");
      expect(persona.title).toBe("The Love & Emotional Wellness Guide");
      expect(persona.specialization).toBe(ReaderSpecialization.ASTROLOGY);
    });

    it("should have intuitive tone with compassionate communication", () => {
      const persona = lunaReader.getPersona();

      expect(persona.tone.primary).toBe("intuitive");
      expect(persona.tone.secondary).toBe("compassionate");
      expect(persona.tone.voice).toBe("soft and emotionally wise");
      expect(persona.tone.communication).toBe(
        "metaphorical but clear, nurturing yet truthful",
      );
    });

    it("should have love-focused expertise", () => {
      const persona = lunaReader.getPersona();

      expect(persona.expertise.astrology?.houses).toEqual([4, 5, 7, 8]);
      expect(persona.expertise.astrology?.planets).toContain(Planet.VENUS);
      expect(persona.expertise.astrology?.planets).toContain(Planet.MOON);
      expect(persona.expertise.astrology?.specializations).toContain("love");
      expect(persona.expertise.astrology?.specializations).toContain(
        "compatibility",
      );
    });

    it("should have three poetic intro messages", () => {
      expect(LUNA_PERSONA.introMessages).toHaveLength(3);
      expect(LUNA_PERSONA.introMessages[0]).toContain("ancient wisdom");
      expect(LUNA_PERSONA.introMessages[1]).toContain("mirror and mystery");
      expect(LUNA_PERSONA.introMessages[2]).toContain("Moon whispers");
    });
  });

  describe("Birth Data Validation", () => {
    it("should validate complete birth data", async () => {
      const isValid = await lunaReader.validateBirthData(mockBirthData);
      expect(isValid).toBe(true);
    });

    it("should reject incomplete birth data", async () => {
      const incompleteBirthData = {
        date: "1985-05-15",
        time: "",
        location: "San Francisco, CA",
      };

      const isValid = await lunaReader.validateBirthData(incompleteBirthData);
      expect(isValid).toBe(false);
    });
  });

  describe("Individual Love Reading", () => {
    it("should generate a complete love reading", async () => {
      const request: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: ReadingRequestType.BIRTH_CHART,
        focus: ["love", "emotional_wellness"],
        birthData: mockBirthData,
      };

      const response = await lunaReader.generateReading(request);

      expect(response.readerId).toBe("luna");
      expect(response.sessionId).toContain("luna_");
      expect(response.interpretation.primary).toContain("Venus");
      expect(response.interpretation.insights).toHaveLength(3);
      expect(response.confidence).toBe(0.88);
    });

    it("should throw error when birth data is missing", async () => {
      const requestWithoutBirthData: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: ReadingRequestType.BIRTH_CHART,
        focus: ["love"],
      };

      await expect(
        lunaReader.generateReading(requestWithoutBirthData),
      ).rejects.toThrow("Birth data required for Luna readings");
    });

    it("should integrate journal insights when available", async () => {
      const request: ReadingRequest = {
        userId: "user-with-journal",
        readerId: "luna",
        type: ReadingRequestType.BIRTH_CHART,
        focus: ["healing"],
        birthData: mockBirthData,
      };

      const response = await lunaReader.generateReading(request);

      // Should call memory logger to get insights
      expect(memoryLogger.getUserInsights).toHaveBeenCalledWith(
        "user-with-journal",
        20,
      );

      // Should include guidance about journal patterns
      const hasJournalGuidance = response.interpretation.guidance.some(
        (g) =>
          g.includes("emotional patterns") || g.includes("self-compassion"),
      );
      expect(hasJournalGuidance).toBe(true);
    });

    it("should select healing-focused intro for shadow work", async () => {
      const healingRequest: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: ReadingRequestType.BIRTH_CHART,
        focus: ["healing", "shadow"],
        birthData: mockBirthData,
      };

      const response = await lunaReader.generateReading(healingRequest);
      expect(response.interpretation.primary).toContain("mirror and mystery");
    });
  });

  describe("Compatibility Reading", () => {
    it("should generate synastry analysis when partner data provided", async () => {
      const synastryRequest: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: ReadingRequestType.SYNASTRY,
        focus: ["compatibility"],
        birthData: mockBirthData,
        partnerBirthData: mockPartnerBirthData,
      };

      const response = await lunaReader.generateReading(synastryRequest);

      expect(response.interpretation.primary).toContain("souls dance");
      expect(response.interpretation.primary).toContain("78%");
      expect(response.interpretation.secondary).toContain(
        "individual love style",
      );
    });

    it("should use connection-focused intro for compatibility readings", async () => {
      const synastryRequest: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: ReadingRequestType.SYNASTRY,
        birthData: mockBirthData,
        partnerBirthData: mockPartnerBirthData,
      };

      const response = await lunaReader.generateReading(synastryRequest);
      expect(response.interpretation.primary).toContain("Moon whispers");
    });

    it("should provide relationship-specific follow-up questions", async () => {
      const synastryRequest: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: ReadingRequestType.SYNASTRY,
        birthData: mockBirthData,
        partnerBirthData: mockPartnerBirthData,
      };

      const response = await lunaReader.generateReading(synastryRequest);

      expect(response.followUpQuestions).toBeDefined();
      expect(response.followUpQuestions![0]).toContain(
        "patterns from this relationship",
      );
      expect(response.followUpQuestions![1]).toContain("grow in ways");
    });
  });

  describe("Conversational Styles", () => {
    it("should have healing wisdom for heartbreak", () => {
      const persona = lunaReader.getPersona();

      const heartbreakStyle = persona.conversationalStyles.find(
        (style) => style.trigger === "heartbreak_healing",
      );

      expect(heartbreakStyle).toBeDefined();
      expect(heartbreakStyle!.phrases[0]).toContain("breaking open");
      expect(heartbreakStyle!.tone).toBe("gentle healing wisdom");
    });

    it("should have intuitive clarity for relationship confusion", () => {
      const persona = lunaReader.getPersona();

      const confusionStyle = persona.conversationalStyles.find(
        (style) => style.trigger === "relationship_confusion",
      );

      expect(confusionStyle).toBeDefined();
      expect(confusionStyle!.phrases[0]).toContain("moon phases");
      expect(confusionStyle!.tone).toBe("intuitive clarity");
    });

    it("should have nurturing empowerment for self-love", () => {
      const persona = lunaReader.getPersona();

      const selfLoveStyle = persona.conversationalStyles.find(
        (style) => style.trigger === "self_love_journey",
      );

      expect(selfLoveStyle).toBeDefined();
      expect(selfLoveStyle!.phrases[0]).toContain("template for all others");
      expect(selfLoveStyle!.tone).toBe("nurturing empowerment");
    });
  });

  describe("Specialization Keywords", () => {
    it("should return relevant love and emotional keywords", () => {
      const keywords = lunaReader.getSpecializationKeywords();

      expect(keywords).toContain("love compatibility");
      expect(keywords).toContain("emotional wellness");
      expect(keywords).toContain("synastry");
      expect(keywords).toContain("venus moon");
      expect(keywords).toContain("shadow work");
    });
  });

  describe("Summary Types", () => {
    it("should have relationship summary template", () => {
      const persona = lunaReader.getPersona();
      const relationshipSummary = persona.summaryTypes.find(
        (summary) => summary.type === SummaryTypeEnum.RELATIONSHIP,
      );

      expect(relationshipSummary).toBeDefined();
      expect(relationshipSummary!.template).toContain("{VENUS_SIGN}");
      expect(relationshipSummary!.template).toContain("{MOON_SIGN}");
      expect(relationshipSummary!.focusAreas).toContain("compatibility");
    });

    it("should have personal growth summary template", () => {
      const persona = lunaReader.getPersona();
      const growthSummary = persona.summaryTypes.find(
        (summary) => summary.type === SummaryTypeEnum.PERSONAL_GROWTH,
      );

      expect(growthSummary).toBeDefined();
      expect(growthSummary!.template).toContain("{SHADOW_PATTERN}");
      expect(growthSummary!.focusAreas).toContain("shadow work");
    });

    it("should have spiritual summary template", () => {
      const persona = lunaReader.getPersona();
      const spiritualSummary = persona.summaryTypes.find(
        (summary) => summary.type === SummaryTypeEnum.SPIRITUAL,
      );

      expect(spiritualSummary).toBeDefined();
      expect(spiritualSummary!.template).toContain("{SPIRITUAL_LESSON}");
      expect(spiritualSummary!.focusAreas).toContain("soul lessons");
    });
  });

  describe("Action Steps Generation", () => {
    it("should provide emotional wellness action steps", async () => {
      const request: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: ReadingRequestType.BIRTH_CHART,
        focus: ["emotional_wellness"],
        birthData: mockBirthData,
      };

      const response = await lunaReader.generateReading(request);

      expect(response.nextSteps).toBeDefined();
      expect(response.nextSteps!.length).toBeGreaterThan(0);
      expect(response.nextSteps![0]).toContain("emotional check-ins");
    });

    it("should provide relationship-specific steps for synastry", async () => {
      const synastryRequest: ReadingRequest = {
        userId: "user-123",
        readerId: "luna",
        type: ReadingRequestType.SYNASTRY,
        birthData: mockBirthData,
        partnerBirthData: mockPartnerBirthData,
      };

      const response = await lunaReader.generateReading(synastryRequest);

      expect(
        response.nextSteps!.some(
          (step) =>
            step.includes("love languages") || step.includes("appreciating"),
        ),
      ).toBe(true);
    });
  });
});
