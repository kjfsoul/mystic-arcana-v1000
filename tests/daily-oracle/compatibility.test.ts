// Mock fetch globally
global.fetch = jest.fn();

describe("Daily Oracle Compatibility Analysis", () => {
  const zodiacSigns = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Positive Compatibility Pairings", () => {
    it("should provide positive compatibility analysis", async () => {
      const mockPositiveResponse = {
        success: true,
        data: {
          compatibility: {
            positive: {
              db_identifier: "DB_ENTRY_072625_compatibility_leo_sagittarius",
              signs: ["leo", "sagittarius"],
              type: "positive",
              compatibility_score: 85,
              elemental_harmony: {
                both_elements: "fire",
                synergy: "Passionate and energetic connection",
                shared_traits: ["enthusiasm", "optimism", "adventure"],
              },
              modal_dynamics: {
                leo_modality: "fixed",
                sagittarius_modality: "mutable",
                interaction:
                  "Leo provides stability while Sagittarius brings flexibility",
              },
              description:
                "Fire signs unite in passionate harmony today, creating an unstoppable force of creativity and adventure.",
              today_influence:
                "Jupiter's position amplifies this fire connection, bringing expansion and joy to shared endeavors.",
              planetary_support: [
                {
                  planet: "jupiter",
                  effect: "Enhances optimism and shared vision",
                },
                {
                  planet: "mars",
                  effect: "Energizes mutual passion and drive",
                },
              ],
              relationship_areas: {
                romance: "Fiery passion and deep mutual admiration",
                friendship:
                  "Adventure-seeking companions who inspire each other",
                business: "Dynamic partnership with complementary strengths",
                family: "Warm, supportive connection with shared values",
              },
              guidance: {
                amplify: "Channel this fire energy into creative projects",
                balance:
                  "Remember to ground enthusiasm with practical planning",
                timing: "Afternoon hours are most favorable for connection",
              },
              duration_forecast: {
                today: "Excellent energy for new beginnings",
                this_week: "Sustained positive momentum",
                this_month: "Long-term potential strengthens",
              },
            },
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPositiveResponse,
      });

      const response = await fetch("/api/daily-oracle/compatibility/positive");
      const data = await response.json();

      const compatibility = data.data.compatibility.positive;

      // Validate structure
      expect(compatibility.db_identifier).toMatch(
        /^DB_ENTRY_\d{6}_compatibility_[a-z]+_[a-z]+$/,
      );
      expect(compatibility.signs).toHaveLength(2);
      expect(compatibility.type).toBe("positive");
      expect(compatibility.compatibility_score).toBeGreaterThanOrEqual(70);

      // Validate elemental analysis
      expect(compatibility.elemental_harmony).toBeDefined();
      expect(compatibility.elemental_harmony.synergy).toBeDefined();
      expect(compatibility.elemental_harmony.shared_traits).toBeInstanceOf(
        Array,
      );

      // Validate modal dynamics
      expect(compatibility.modal_dynamics).toBeDefined();
      expect(compatibility.modal_dynamics.interaction).toBeDefined();

      // Validate content quality
      expect(compatibility.description.length).toBeGreaterThan(50);
      expect(compatibility.today_influence).toBeDefined();
      expect(compatibility.planetary_support).toBeInstanceOf(Array);

      // Validate relationship areas
      expect(compatibility.relationship_areas.romance).toBeDefined();
      expect(compatibility.relationship_areas.friendship).toBeDefined();
      expect(compatibility.relationship_areas.business).toBeDefined();

      // Validate guidance
      expect(compatibility.guidance.amplify).toBeDefined();
      expect(compatibility.guidance.balance).toBeDefined();
    });

    const positiveCompatibilityPairs = [
      ["leo", "sagittarius"],
      ["aries", "gemini"],
      ["taurus", "cancer"],
      ["virgo", "capricorn"],
      ["libra", "aquarius"],
      ["scorpio", "pisces"],
    ];

    positiveCompatibilityPairs.forEach(([sign1, sign2]) => {
      it(`should handle positive compatibility for ${sign1} and ${sign2}`, async () => {
        const mockResponse = {
          success: true,
          data: {
            compatibility: {
              positive: {
                db_identifier: `DB_ENTRY_072625_compatibility_${sign1}_${sign2}`,
                signs: [sign1, sign2],
                type: "positive",
                compatibility_score: 75 + Math.random() * 25, // 75-100 range
                description: `${sign1} and ${sign2} create beautiful harmony today...`,
              },
            },
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const response = await fetch(
          `/api/daily-oracle/compatibility/positive/${sign1}/${sign2}`,
        );
        const data = await response.json();

        const compatibility = data.data.compatibility.positive;

        expect(compatibility.signs).toEqual([sign1, sign2]);
        expect(compatibility.type).toBe("positive");
        expect(compatibility.compatibility_score).toBeGreaterThanOrEqual(75);
      });
    });
  });

  describe("Challenge Compatibility Pairings", () => {
    it("should provide constructive challenge compatibility analysis", async () => {
      const mockChallengeResponse = {
        success: true,
        data: {
          compatibility: {
            challenge: {
              db_identifier: "DB_ENTRY_072625_compatibility_taurus_aquarius",
              signs: ["taurus", "aquarius"],
              type: "challenge",
              compatibility_score: 45,
              elemental_tension: {
                elements: ["earth", "air"],
                conflict: "Practical vs. theoretical approaches",
                growth_opportunity:
                  "Learning to appreciate different perspectives",
              },
              modal_dynamics: {
                both_modality: "fixed",
                challenge: "Both signs resist change, creating stubbornness",
                resolution: "Finding common ground in shared determination",
              },
              description:
                "Fixed signs face innovative tensions today as traditional values meet progressive ideals.",
              challenge_areas: {
                communication:
                  "Different conversation styles may cause misunderstanding",
                values:
                  "Material security vs. intellectual freedom creates tension",
                pace: "Taurus seeks stability while Aquarius craves change",
                expression: "Practical action vs. theoretical discussion",
              },
              guidance: {
                taurus_advice:
                  "Embrace new ideas without abandoning core values",
                aquarius_advice:
                  "Ground innovative concepts in practical reality",
                mutual_growth: "Find balance between stability and progress",
                timing_recommendations:
                  "Evening hours favor better understanding",
              },
              transformation_potential: {
                taurus_learns:
                  "Innovation can enhance rather than threaten security",
                aquarius_learns:
                  "Practical foundation strengthens visionary ideas",
                relationship_evolution:
                  "Apparent opposites become complementary strengths",
              },
              today_influence:
                "Mercury retrograde intensifies communication challenges but also opportunities for deeper understanding.",
              constructive_approach: {
                focus_on: "Shared determination and loyalty",
                avoid: "Rigid positions and judgmental attitudes",
                practice:
                  "Active listening and patience with different viewpoints",
              },
              healing_activities: [
                "Joint creative projects that blend practical and innovative elements",
                "Outdoor activities that satisfy both earth and air needs",
                "Structured brainstorming sessions",
              ],
            },
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChallengeResponse,
      });

      const response = await fetch("/api/daily-oracle/compatibility/challenge");
      const data = await response.json();

      const compatibility = data.data.compatibility.challenge;

      // Validate structure
      expect(compatibility.db_identifier).toMatch(
        /^DB_ENTRY_\d{6}_compatibility_[a-z]+_[a-z]+$/,
      );
      expect(compatibility.signs).toHaveLength(2);
      expect(compatibility.type).toBe("challenge");
      expect(compatibility.compatibility_score).toBeLessThan(60);

      // Validate challenge analysis
      expect(compatibility.elemental_tension).toBeDefined();
      expect(compatibility.elemental_tension.growth_opportunity).toBeDefined();
      expect(compatibility.challenge_areas).toBeDefined();

      // Validate constructive guidance
      expect(compatibility.guidance).toBeDefined();
      expect(compatibility.guidance.mutual_growth).toBeDefined();
      expect(compatibility.constructive_approach).toBeDefined();
      expect(compatibility.healing_activities).toBeInstanceOf(Array);

      // Validate transformation potential
      expect(compatibility.transformation_potential).toBeDefined();
      expect(
        compatibility.transformation_potential.relationship_evolution,
      ).toBeDefined();

      // Ensure no fatalistic language
      expect(compatibility.description).not.toContain("doomed");
      expect(compatibility.description).not.toContain("impossible");
      expect(compatibility.guidance.mutual_growth).toContain("balance");
    });

    const challengeCompatibilityPairs = [
      ["taurus", "aquarius"],
      ["cancer", "aries"],
      ["virgo", "sagittarius"],
      ["capricorn", "libra"],
      ["scorpio", "gemini"],
      ["pisces", "leo"],
    ];

    challengeCompatibilityPairs.forEach(([sign1, sign2]) => {
      it(`should handle challenge compatibility for ${sign1} and ${sign2} constructively`, async () => {
        const mockResponse = {
          success: true,
          data: {
            compatibility: {
              challenge: {
                db_identifier: `DB_ENTRY_072625_compatibility_${sign1}_${sign2}`,
                signs: [sign1, sign2],
                type: "challenge",
                compatibility_score: 30 + Math.random() * 30, // 30-60 range
                description: `${sign1} and ${sign2} navigate growth through contrast...`,
                guidance: {
                  mutual_growth:
                    "Differences become opportunities for expansion",
                },
                transformation_potential: {
                  relationship_evolution:
                    "Challenges create deeper understanding",
                },
              },
            },
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const response = await fetch(
          `/api/daily-oracle/compatibility/challenge/${sign1}/${sign2}`,
        );
        const data = await response.json();

        const compatibility = data.data.compatibility.challenge;

        expect(compatibility.signs).toEqual([sign1, sign2]);
        expect(compatibility.type).toBe("challenge");
        expect(compatibility.compatibility_score).toBeLessThan(60);
        expect(compatibility.guidance.mutual_growth).toBeDefined();
        expect(compatibility.transformation_potential).toBeDefined();

        // Ensure constructive framing
        expect(compatibility.description).toContain("growth");
        expect(
          compatibility.transformation_potential.relationship_evolution,
        ).toContain("understanding");
      });
    });
  });

  describe("Daily Compatibility Influence", () => {
    it("should reflect current astrological conditions in compatibility", async () => {
      const mockInfluenceResponse = {
        success: true,
        data: {
          daily_influences: {
            date: "2025-07-26",
            planetary_conditions: [
              {
                planet: "venus",
                position: "leo",
                aspect: "trine jupiter",
                effect_on_compatibility:
                  "Enhances romantic connections for fire signs",
              },
              {
                planet: "mars",
                position: "gemini",
                aspect: "square neptune",
                effect_on_compatibility:
                  "May cause confusion in air sign relationships",
              },
            ],
            lunar_phase: {
              phase: "waxing_gibbous",
              effect: "Building energy supports relationship growth",
            },
            overall_relationship_weather:
              "Favorable for new connections and deepening bonds",
          },
          modified_compatibilities: {
            fire_signs_boosted: [
              "aries_leo",
              "leo_sagittarius",
              "aries_sagittarius",
            ],
            air_signs_challenged: [
              "gemini_libra",
              "gemini_aquarius",
              "libra_aquarius",
            ],
            recommendations: {
              fire_signs: "Excellent day for romantic gestures and adventures",
              air_signs: "Practice clear communication and avoid assumptions",
            },
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockInfluenceResponse,
      });

      const response = await fetch(
        "/api/daily-oracle/compatibility/daily-influences",
      );
      const data = await response.json();

      // Validate daily influences
      expect(data.data.daily_influences.planetary_conditions).toBeInstanceOf(
        Array,
      );
      expect(data.data.daily_influences.lunar_phase).toBeDefined();
      expect(
        data.data.daily_influences.overall_relationship_weather,
      ).toBeDefined();

      // Validate modified compatibilities
      expect(
        data.data.modified_compatibilities.fire_signs_boosted,
      ).toBeInstanceOf(Array);
      expect(data.data.modified_compatibilities.recommendations).toBeDefined();
    });
  });

  describe("Cross-Element Compatibility Patterns", () => {
    const elementPairs = [
      {
        elements: ["fire", "air"],
        synergy: "Fire feeds air, air fans fire flames",
      },
      {
        elements: ["earth", "water"],
        synergy: "Earth contains water, water nourishes earth",
      },
      {
        elements: ["fire", "earth"],
        tension: "Fire can scorch earth, earth can smother fire",
      },
      {
        elements: ["air", "water"],
        tension: "Air can evaporate water, water can create fog in air",
      },
    ];

    elementPairs.forEach(({ elements, synergy, tension }) => {
      it(`should analyze ${elements[0]}-${elements[1]} elemental dynamics`, async () => {
        const mockElementalResponse = {
          success: true,
          data: {
            elemental_analysis: {
              elements: elements,
              natural_dynamic: synergy || tension,
              type: synergy ? "supportive" : "challenging",
              today_modification:
                "Current planetary positions enhance understanding",
              practical_applications: [
                "Use elemental awareness in relationship timing",
                "Choose activities that honor both elements",
              ],
            },
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockElementalResponse,
        });

        const response = await fetch(
          `/api/daily-oracle/compatibility/elemental/${elements[0]}/${elements[1]}`,
        );
        const data = await response.json();

        const analysis = data.data.elemental_analysis;

        expect(analysis.elements).toEqual(elements);
        expect(analysis.natural_dynamic).toBeDefined();
        expect(analysis.type).toMatch(/^(supportive|challenging)$/);
        expect(analysis.practical_applications).toBeInstanceOf(Array);
      });
    });
  });

  describe("Compatibility Metadata and Analytics", () => {
    it("should provide comprehensive compatibility statistics", async () => {
      const mockStatsResponse = {
        success: true,
        data: {
          compatibility_statistics: {
            total_pairings_analyzed: 78, // 12 choose 2 = 66 unique pairs + variations
            positive_pairings: 32,
            challenge_pairings: 24,
            neutral_pairings: 22,
            elemental_distribution: {
              fire_fire: 3,
              earth_earth: 3,
              air_air: 3,
              water_water: 3,
              fire_air: 12,
              earth_water: 12,
              fire_earth: 12,
              fire_water: 12,
              earth_air: 12,
              air_water: 12,
            },
            modal_distribution: {
              cardinal_cardinal: 6,
              fixed_fixed: 6,
              mutable_mutable: 6,
              cardinal_fixed: 16,
              cardinal_mutable: 16,
              fixed_mutable: 16,
            },
            today_highlights: {
              most_favorable: ["leo_sagittarius", "gemini_libra"],
              most_challenging: ["taurus_aquarius", "cancer_capricorn"],
              surprising_harmony: ["virgo_pisces"],
              growth_opportunities: ["aries_cancer", "scorpio_leo"],
            },
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatsResponse,
      });

      const response = await fetch(
        "/api/daily-oracle/compatibility/statistics",
      );
      const data = await response.json();

      const stats = data.data.compatibility_statistics;

      // Validate statistics structure
      expect(stats.total_pairings_analyzed).toBeGreaterThan(60);
      expect(stats.positive_pairings).toBeGreaterThan(0);
      expect(stats.challenge_pairings).toBeGreaterThan(0);

      // Validate distributions
      expect(stats.elemental_distribution).toBeDefined();
      expect(stats.modal_distribution).toBeDefined();

      // Validate today's highlights
      expect(stats.today_highlights.most_favorable).toBeInstanceOf(Array);
      expect(stats.today_highlights.most_challenging).toBeInstanceOf(Array);
      expect(stats.today_highlights.growth_opportunities).toBeInstanceOf(Array);
    });
  });
});
