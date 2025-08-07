import { LoveEngine } from "../../calculate/LoveEngine";

describe("LoveEngine", () => {
  let loveEngine: LoveEngine;

  beforeEach(() => {
    loveEngine = new LoveEngine();
  });

  describe("calculateCompatibility", () => {
    it("should return compatibility score between two users", () => {
      const result = loveEngine.calculateCompatibility({
        user1: { birthDate: new Date("1990-02-14") },
        user2: { birthDate: new Date("1995-07-22") },
      });

      expect(result).toHaveProperty("score");
      expect(result.score).toBeGreaterThan(0);
    });

    it("should handle missing birth dates", () => {
      expect(() => {
        LoveEngine.calculateCompatibility({
          person1: { birthDate: new Date("1990-02-14") },
          person2: { birthDate: undefined },
        });
      }).toThrow("Missing birth date");
    });
  });
});
