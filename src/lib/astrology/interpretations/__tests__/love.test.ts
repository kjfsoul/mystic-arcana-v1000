import { LoveInterpreter } from "@/lib/astrology/interpretations/love";
import {
  mockBirthData,
  mockPlanets,
  mockHouses,
} from "@/lib/astrology/interpretations/__tests__/mocks";

describe("LoveInterpreter", () => {
  it("should analyze a love profile and return a complete interpretation", () => {
    const interpretation = LoveInterpreter.analyzeLoveProfile(
      mockBirthData,
      mockPlanets,
      mockHouses,
    );
    expect(interpretation).toHaveProperty("relationshipStyle");
    expect(interpretation).toHaveProperty("loveLanguage");
    expect(interpretation).toHaveProperty("emotionalNeeds");
    expect(interpretation).toHaveProperty("shadowWork");
    expect(interpretation).toHaveProperty("compatibility");
    expect(interpretation.confidence).toBe(0.8);
  });
});
