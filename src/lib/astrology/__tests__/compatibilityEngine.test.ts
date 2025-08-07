import { CompatibilityEngine } from "@/lib/astrology/compatibilityEngine";
import { mockBirthData, mockPlanets } from "@/lib/astrology/__tests__/mocks";

describe("CompatibilityEngine", () => {
  it("should analyze synastry and return a complete analysis", () => {
    const chart1 = { birthData: mockBirthData, planets: mockPlanets };
    const chart2 = { birthData: mockBirthData, planets: mockPlanets }; // Using same chart for simplicity
    const analysis = CompatibilityEngine.analyzeSynastry(chart1, chart2);
    expect(analysis).toHaveProperty("connectionType");
    expect(analysis).toHaveProperty("overallCompatibility");
    expect(analysis).toHaveProperty("strengths");
    expect(analysis).toHaveProperty("challenges");
    expect(analysis).toHaveProperty("advice");
  });
});
