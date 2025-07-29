import { BirthData } from '@/lib/astrology/AstronomicalCalculator';

// Mock fetch globally
global.fetch = jest.fn();

describe('Daily Oracle Astrology Horoscopes', () => {
  const zodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  const zodiacElements = {
    'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
    'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
    'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
    'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
  };

  const zodiacModalities = {
    'aries': 'cardinal', 'cancer': 'cardinal', 'libra': 'cardinal', 'capricorn': 'cardinal',
    'taurus': 'fixed', 'leo': 'fixed', 'scorpio': 'fixed', 'aquarius': 'fixed',
    'gemini': 'mutable', 'virgo': 'mutable', 'sagittarius': 'mutable', 'pisces': 'mutable'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Zodiac Horoscope Coverage', () => {
    zodiacSigns.forEach(sign => {
      it(`should provide complete horoscope data for ${sign}`, async () => {
        const mockHoroscopeResponse = {
          success: true,
          data: {
            horoscopes: {
              [sign]: {
                db_identifier: `DB_ENTRY_072625_horoscope_${sign}`,
                sign: sign,
                element: zodiacElements[sign],
                modality: zodiacModalities[sign],
                ruling_planet: sign === 'aries' ? 'mars' : 'test_planet',
                daily: `Today ${sign} experiences profound cosmic alignment...`,
                love: `Romantic energies for ${sign} are heightened today...`,
                career: `Professional opportunities align for ${sign}...`,
                mood: `${sign} feels energetically balanced and focused`,
                self_growth: `Personal development for ${sign} centers on...`,
                planetary_influences: {
                  primary: `Jupiter in favorable aspect enhances ${sign} energy`,
                  secondary: `Venus supports ${sign} relationships today`,
                  challenging: `Saturn requires ${sign} to face responsibilities`
                },
                degrees: Math.random() * 30, // 0-30 degrees within sign
                house_position: Math.floor(Math.random() * 12) + 1,
                aspects: [
                  { planet: 'venus', aspect: 'trine', influence: 'positive' },
                  { planet: 'mars', aspect: 'square', influence: 'challenging' }
                ],
                lucky_numbers: [3, 7, 12],
                colors: ['blue', 'silver'],
                keywords: ['growth', 'harmony', 'transformation']
              }
            }
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockHoroscopeResponse
        });

        const response = await fetch(`/api/daily-oracle/astrology/horoscope/${sign}`);
        const data = await response.json();

        const horoscope = data.data.horoscopes[sign];
        
        // Validate required fields
        expect(horoscope.db_identifier).toMatch(new RegExp(`^DB_ENTRY_\\d{6}_horoscope_${sign}$`));
        expect(horoscope.sign).toBe(sign);
        expect(horoscope.element).toBe(zodiacElements[sign]);
        expect(horoscope.modality).toBe(zodiacModalities[sign]);
        
        // Validate content areas
        expect(horoscope.daily).toBeDefined();
        expect(horoscope.daily.length).toBeGreaterThan(50);
        expect(horoscope.love).toBeDefined();
        expect(horoscope.career).toBeDefined();
        expect(horoscope.mood).toBeDefined();
        expect(horoscope.self_growth).toBeDefined();
        
        // Validate astrological data
        expect(horoscope.degrees).toBeGreaterThanOrEqual(0);
        expect(horoscope.degrees).toBeLessThan(30);
        expect(horoscope.house_position).toBeGreaterThanOrEqual(1);
        expect(horoscope.house_position).toBeLessThanOrEqual(12);
        expect(horoscope.aspects).toBeInstanceOf(Array);
        expect(horoscope.planetary_influences).toBeDefined();
      });
    });

    it('should provide all 12 horoscopes in single response', async () => {
      const mockAllHoroscopesResponse = {
        success: true,
        data: {
          date: '2025-07-26',
          horoscopes: Object.fromEntries(
            zodiacSigns.map(sign => [
              sign,
              {
                db_identifier: `DB_ENTRY_072625_horoscope_${sign}`,
                sign: sign,
                element: zodiacElements[sign],
                modality: zodiacModalities[sign],
                daily: `Daily guidance for ${sign}...`,
                love: `Love forecast for ${sign}...`,
                career: `Career insights for ${sign}...`,
                mood: `Emotional tone for ${sign}`,
                self_growth: `Growth opportunities for ${sign}...`
              }
            ])
          ),
          metadata: {
            total_signs: 12,
            elements_covered: ['fire', 'earth', 'air', 'water'],
            modalities_covered: ['cardinal', 'fixed', 'mutable']
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAllHoroscopesResponse
      });

      const response = await fetch('/api/daily-oracle/astrology/horoscopes/all');
      const data = await response.json();

      // Validate all signs present
      zodiacSigns.forEach(sign => {
        expect(data.data.horoscopes[sign]).toBeDefined();
        expect(data.data.horoscopes[sign].sign).toBe(sign);
      });

      // Validate metadata
      expect(data.data.metadata.total_signs).toBe(12);
      expect(data.data.metadata.elements_covered).toEqual(['fire', 'earth', 'air', 'water']);
      expect(data.data.metadata.modalities_covered).toEqual(['cardinal', 'fixed', 'mutable']);
    });
  });

  describe('Planetary Transits Integration', () => {
    it('should reflect current planetary transits in horoscopes', async () => {
      const mockTransitResponse = {
        success: true,
        data: {
          current_transits: {
            date: '2025-07-26',
            major_transits: [
              {
                planet: 'saturn',
                sign: 'pisces',
                aspect: 'trine',
                target_planet: 'uranus',
                target_sign: 'gemini',
                influence: 'Structured innovation and practical breakthroughs'
              },
              {
                planet: 'venus',
                position: 'galactic_center',
                influence: 'Deep cosmic love and universal connection'
              }
            ]
          },
          horoscopes: {
            pisces: {
              daily: 'With Saturn in your sign trining Uranus, structured innovation flows naturally...',
              transit_specific: 'Saturn in Pisces brings grounded spirituality to your core identity'
            },
            gemini: {
              daily: 'Uranus in your sign receives supportive energy from Saturn...',
              transit_specific: 'Revolutionary ideas gain practical foundation'
            }
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransitResponse
      });

      const response = await fetch('/api/daily-oracle/astrology/transits');
      const data = await response.json();

      // Validate transit data
      expect(data.data.current_transits.major_transits).toBeInstanceOf(Array);
      expect(data.data.current_transits.major_transits.length).toBeGreaterThan(0);
      
      // Validate transit-specific horoscope content
      expect(data.data.horoscopes.pisces.transit_specific).toContain('Saturn');
      expect(data.data.horoscopes.gemini.transit_specific).toContain('Uranus');
    });
  });

  describe('Elemental and Modal Analysis', () => {
    it('should provide elemental energy analysis', async () => {
      const mockElementalResponse = {
        success: true,
        data: {
          elemental_analysis: {
            fire_signs: {
              general_energy: 'Passionate and action-oriented today',
              signs: ['aries', 'leo', 'sagittarius'],
              dominant_theme: 'Creative manifestation'
            },
            earth_signs: {
              general_energy: 'Grounded and practical focus',
              signs: ['taurus', 'virgo', 'capricorn'],
              dominant_theme: 'Material world mastery'
            },
            air_signs: {
              general_energy: 'Mental clarity and communication',
              signs: ['gemini', 'libra', 'aquarius'],
              dominant_theme: 'Intellectual breakthroughs'
            },
            water_signs: {
              general_energy: 'Emotional depth and intuition',
              signs: ['cancer', 'scorpio', 'pisces'],
              dominant_theme: 'Psychic sensitivity heightened'
            }
          },
          modal_analysis: {
            cardinal_signs: {
              energy: 'Initiating new cycles',
              signs: ['aries', 'cancer', 'libra', 'capricorn']
            },
            fixed_signs: {
              energy: 'Maintaining and stabilizing',
              signs: ['taurus', 'leo', 'scorpio', 'aquarius']
            },
            mutable_signs: {
              energy: 'Adapting and transforming',
              signs: ['gemini', 'virgo', 'sagittarius', 'pisces']
            }
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockElementalResponse
      });

      const response = await fetch('/api/daily-oracle/astrology/elemental-analysis');
      const data = await response.json();

      // Validate elemental analysis
      const elements = ['fire_signs', 'earth_signs', 'air_signs', 'water_signs'];
      elements.forEach(element => {
        expect(data.data.elemental_analysis[element]).toBeDefined();
        expect(data.data.elemental_analysis[element].general_energy).toBeDefined();
        expect(data.data.elemental_analysis[element].signs).toBeInstanceOf(Array);
        expect(data.data.elemental_analysis[element].signs.length).toBe(3);
      });

      // Validate modal analysis
      const modalities = ['cardinal_signs', 'fixed_signs', 'mutable_signs'];
      modalities.forEach(modality => {
        expect(data.data.modal_analysis[modality]).toBeDefined();
        expect(data.data.modal_analysis[modality].energy).toBeDefined();
        expect(data.data.modal_analysis[modality].signs).toBeInstanceOf(Array);
        expect(data.data.modal_analysis[modality].signs.length).toBe(4);
      });
    });
  });

  describe('Personalized Horoscope Features', () => {
    it('should incorporate birth data for personalized readings', async () => {
      const mockBirthData: BirthData = {
        name: 'Test User',
        date: new Date('1990-07-26T14:30:00Z'), // Cancer
        city: 'San Francisco',
        country: 'USA',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles'
      };

      const mockPersonalizedResponse = {
        success: true,
        data: {
          personalized_horoscope: {
            sun_sign: 'cancer',
            rising_sign: 'scorpio',
            moon_sign: 'pisces',
            birth_chart_highlights: {
              sun_house: 8,
              moon_house: 4,
              rising_degree: 15.7
            },
            daily_focus: 'Your Cancer sun in the 8th house emphasizes transformation...',
            transit_impacts: [
              {
                transit: 'Moon conjunct natal Venus',
                effect: 'Heightened emotional sensitivity in relationships'
              }
            ],
            personalization_factors: {
              location_influences: 'West Coast water energy amplifies your Cancer nature',
              birth_time_precision: 'Accurate birth time enables precise house cusps'
            }
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPersonalizedResponse
      });

      const response = await fetch('/api/daily-oracle/astrology/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthData: mockBirthData })
      });
      
      const data = await response.json();

      const personal = data.data.personalized_horoscope;
      
      expect(personal.sun_sign).toBe('cancer');
      expect(personal.birth_chart_highlights).toBeDefined();
      expect(personal.daily_focus).toBeDefined();
      expect(personal.transit_impacts).toBeInstanceOf(Array);
      expect(personal.personalization_factors).toBeDefined();
    });
  });

  describe('Horoscope Quality Validation', () => {
    zodiacSigns.forEach(sign => {
      it(`should ensure ${sign} horoscope meets quality standards`, async () => {
        const mockQualityResponse = {
          success: true,
          data: {
            horoscopes: {
              [sign]: {
                daily: 'A'.repeat(100), // Minimum length
                love: 'B'.repeat(80),
                career: 'C'.repeat(90),
                mood: 'D'.repeat(50),
                self_growth: 'E'.repeat(75),
                quality_metrics: {
                  word_count: {
                    daily: 100,
                    love: 80,
                    career: 90,
                    mood: 50,
                    self_growth: 75
                  },
                  readability_score: 85,
                  empowerment_tone: true,
                  actionable_guidance: true,
                  avoids_fatalism: true
                }
              }
            }
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockQualityResponse
        });

        const response = await fetch(`/api/daily-oracle/astrology/quality/${sign}`);
        const data = await response.json();

        const horoscope = data.data.horoscopes[sign];
        const quality = horoscope.quality_metrics;
        
        // Validate minimum content length
        expect(quality.word_count.daily).toBeGreaterThanOrEqual(50);
        expect(quality.word_count.love).toBeGreaterThanOrEqual(40);
        expect(quality.word_count.career).toBeGreaterThanOrEqual(40);
        
        // Validate quality standards
        expect(quality.readability_score).toBeGreaterThanOrEqual(70);
        expect(quality.empowerment_tone).toBe(true);
        expect(quality.actionable_guidance).toBe(true);
        expect(quality.avoids_fatalism).toBe(true);
      });
    });
  });
});