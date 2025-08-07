import { CareerEngine } from "../../calculate/CareerEngine";

describe("CareerEngine", () => {
  let careerEngine: CareerEngine;

  beforeEach(() => {
    careerEngine = new CareerEngine();
  });

  describe("calculateCareerPath", () => {
    it("should return valid career path for fire sign", () => {
      const result = careerEngine.calculateCareerPath({
        birthDate: new Date("1990-07-22"),
        currentSkills: ["leadership", "creativity"],
      });

      expect(result).toHaveProperty("path");
      expect(result.path).toMatch(/management|entrepreneur|creative/);
    });

    it("should handle invalid birth dates", () => {
      expect(() => {
        CareerEngine.calculateCareerAnalysis({
          birthDate: new Date("invalid-date"),
          currentSkills: [],
        });
      }).toThrow("Invalid birth date");
    });
  });
});
