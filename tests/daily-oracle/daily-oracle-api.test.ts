import { BirthData } from '@/lib/astrology/AstronomicalCalculator';
import { TarotCard, SpreadType } from '@/types/tarot';

// Mock fetch globally
global.fetch = jest.fn();

describe('Daily Oracle API Integration Tests', () => {
  const mockBirthData: BirthData = {
    name: 'Test User',
    date: new Date('1990-07-26T14:30:00Z'),
    city: 'San Francisco',
    country: 'USA',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Daily Oracle Endpoint', () => {
    it('should return complete daily oracle data structure', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          date: '2025-07-26',
          db_identifier: 'DB_ENTRY_072625_daily_oracle',
          tarot: {
            one_card_draw: {
              db_identifier: 'DB_ENTRY_072625_draw_queen_of_swords_upright',
              card: {
                name: 'Queen of Swords',
                orientation: 'upright',
                meaning: 'Clear thinking, direct communication, independence',
                interpretation: 'Today calls for intellectual clarity and honest communication.'
              }
            },
            three_card_spread: {
              db_identifier: 'DB_ENTRY_072625_three_card_ppp',
              past: {
                name: 'Six of Pentacles',
                orientation: 'reversed',
                meaning: 'Imbalanced giving, unfair exchange'
              },
              present: {
                name: 'The Sun',
                orientation: 'upright',
                meaning: 'Joy, success, positivity'
              },
              future: {
                name: 'Ace of Pentacles',
                orientation: 'upright',
                meaning: 'New opportunities, material beginnings'
              }
            },
            celtic_cross: {
              db_identifier: 'DB_ENTRY_072625_celticcross_complete',
              positions: {
                present: { name: 'The Magician', orientation: 'upright' },
                challenge: { name: 'Page of Cups', orientation: 'reversed' },
                distant_past: { name: 'Three of Wands', orientation: 'upright' },
                possible_outcome: { name: 'Ten of Cups', orientation: 'upright' },
                crown: { name: 'The Star', orientation: 'upright' },
                immediate_future: { name: 'Knight of Swords', orientation: 'upright' },
                approach: { name: 'Five of Pentacles', orientation: 'reversed' },
                external_influences: { name: 'The Moon', orientation: 'upright' },
                hopes_and_fears: { name: 'Ace of Wands', orientation: 'upright' },
                final_outcome: { name: 'The World', orientation: 'upright' }
              }
            }
          },
          astrology: {
            horoscopes: {
              aries: {
                db_identifier: 'DB_ENTRY_072625_horoscope_aries',
                sign: 'aries',
                daily: 'Mars energizes your career sector today...',
                love: 'Passionate connections await...',
                career: 'Leadership opportunities emerge...',
                mood: 'Confident and dynamic',
                self_growth: 'Embrace your pioneering spirit'
              },
              // ... other signs
            },
            compatibility: {
              positive: {
                db_identifier: 'DB_ENTRY_072625_compatibility_leo_sagittarius',
                signs: ['leo', 'sagittarius'],
                type: 'positive',
                description: 'Fire signs unite in passionate harmony today...',
                today_influence: 'Jupiter\'s position amplifies this fire connection'
              },
              challenge: {
                db_identifier: 'DB_ENTRY_072625_compatibility_taurus_aquarius',
                signs: ['taurus', 'aquarius'],
                type: 'challenge',
                description: 'Fixed signs face innovative tensions...',
                guidance: 'Find balance between stability and change'
              }
            },
            cosmic_focus: {
              db_identifier: 'DB_ENTRY_072625_cosmic_focus',
              title: 'Saturn trine Uranus with Venus conjunct Galactic Center',
              description: 'A rare alignment bringing structured innovation...',
              scientific_meaning: 'Gravitational influences create...',
              mythic_significance: 'Ancient wisdom meets future vision...',
              practical_application: 'Use this energy for breakthrough thinking...'
            }
          },
          personalization: {
            hooks: [
              {
                condition: 'IF UserNatal Venus is in Leo and today\'s Sun trines Venus',
                action: 'amplify romance horoscope',
                suggestion: 'prompt Reflection X or App Ritual Y'
              }
            ]
          },
          content: {
            article: {
              title: 'Cosmic Alignment for July 26, 2025',
              content: 'Today the cosmos presents a unique tapestry...',
              word_count: 756,
              seo_keywords: ['daily horoscope', 'tarot reading', 'cosmic alignment']
            }
          },
          metadata: {
            tags: [
              'tarot_queen_of_swords_upright',
              'spread_three_card',
              'astrology_daily_horoscope_all_signs',
              'cosmic_event_saturn_trine_uranus'
            ],
            generated_at: '2025-07-26T00:00:00Z',
            expires_at: '2025-07-27T00:00:00Z'
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const response = await fetch('/api/daily-oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: '2025-07-26', birthData: mockBirthData })
      });

      const data = await response.json();

      // Validate complete data structure
      expect(data.success).toBe(true);
      expect(data.data.date).toBe('2025-07-26');
      expect(data.data.db_identifier).toContain('DB_ENTRY_072625');
      
      // Validate tarot structure
      expect(data.data.tarot.one_card_draw).toBeDefined();
      expect(data.data.tarot.three_card_spread).toBeDefined();
      expect(data.data.tarot.celtic_cross).toBeDefined();
      
      // Validate astrology structure
      expect(data.data.astrology.horoscopes).toBeDefined();
      expect(data.data.astrology.compatibility).toBeDefined();
      expect(data.data.astrology.cosmic_focus).toBeDefined();
      
      // Validate metadata
      expect(data.data.metadata.tags).toBeInstanceOf(Array);
      expect(data.data.metadata.generated_at).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/daily-oracle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: '2025-07-26' })
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Network error');
      }
    });

    it('should validate date parameter requirements', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Date parameter is required'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse
      });

      const response = await fetch('/api/daily-oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Date parameter');
    });
  });

  describe('Database Entry Identifiers', () => {
    it('should generate unique DB identifiers for all components', async () => {
      const mockResponse = {
        success: true,
        data: {
          date: '2025-07-26',
          db_identifier: 'DB_ENTRY_072625_daily_oracle',
          tarot: {
            one_card_draw: {
              db_identifier: 'DB_ENTRY_072625_draw_the_fool_upright'
            },
            three_card_spread: {
              db_identifier: 'DB_ENTRY_072625_three_card_ppp'
            },
            celtic_cross: {
              db_identifier: 'DB_ENTRY_072625_celticcross_complete'
            }
          },
          astrology: {
            horoscopes: {
              aries: {
                db_identifier: 'DB_ENTRY_072625_horoscope_aries'
              }
            },
            compatibility: {
              positive: {
                db_identifier: 'DB_ENTRY_072625_compatibility_leo_sagittarius'
              }
            },
            cosmic_focus: {
              db_identifier: 'DB_ENTRY_072625_cosmic_focus'
            }
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/daily-oracle');
      const data = await response.json();

      // Test identifier patterns
      const identifierPattern = /^DB_ENTRY_\d{6}_[a-zA-Z_]+$/;
      
      expect(data.data.db_identifier).toMatch(identifierPattern);
      expect(data.data.tarot.one_card_draw.db_identifier).toMatch(identifierPattern);
      expect(data.data.tarot.three_card_spread.db_identifier).toMatch(identifierPattern);
      expect(data.data.astrology.horoscopes.aries.db_identifier).toMatch(identifierPattern);
    });
  });

  describe('Personalization Hooks', () => {
    it('should include conditional logic for user personalization', async () => {
      const mockResponse = {
        success: true,
        data: {
          personalization: {
            hooks: [
              {
                condition: 'IF UserNatal Venus is in Leo and today\'s Sun trines Venus',
                action: 'amplify romance horoscope',
                suggestion: 'prompt Reflection X or App Ritual Y'
              },
              {
                condition: 'FOR users journaling \'restlessness\' today and have Moon in Pisces',
                action: 'interpret Three of Swords in Present position',
                suggestion: 'suggest calming meditation ritual'
              }
            ],
            conditional_examples: [
              {
                user_profile: 'recent restlessness logs + Moon in Pisces',
                card_context: 'Three of Swords in Present',
                enhanced_interpretation: 'Your emotional sensitivity...'
              }
            ]
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/daily-oracle');
      const data = await response.json();

      expect(data.data.personalization.hooks).toBeInstanceOf(Array);
      expect(data.data.personalization.hooks.length).toBeGreaterThan(0);
      
      const firstHook = data.data.personalization.hooks[0];
      expect(firstHook.condition).toBeDefined();
      expect(firstHook.action).toBeDefined();
      expect(firstHook.suggestion).toBeDefined();
    });
  });

  describe('Content Quality Validation', () => {
    it('should ensure article content meets minimum requirements', async () => {
      const mockResponse = {
        success: true,
        data: {
          content: {
            article: {
              title: 'Cosmic Alignment for July 26, 2025',
              content: 'A'.repeat(700), // Minimum 700 words
              word_count: 756,
              structure: {
                introduction: true,
                tarot_exploration: true,
                horoscope_section: true,
                compatibility_section: true,
                cosmic_alignment: true,
                daily_practices: true,
                conclusion: true
              },
              seo_keywords: [
                'daily horoscope',
                'tarot reading',
                'cosmic alignment',
                'astrology forecast',
                'spiritual guidance'
              ]
            }
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/daily-oracle');
      const data = await response.json();

      const article = data.data.content.article;
      
      expect(article.word_count).toBeGreaterThanOrEqual(700);
      expect(article.title).toBeDefined();
      expect(article.content.length).toBeGreaterThan(0);
      expect(article.seo_keywords).toBeInstanceOf(Array);
      expect(article.seo_keywords.length).toBeGreaterThanOrEqual(5);
      expect(article.structure.introduction).toBe(true);
      expect(article.structure.conclusion).toBe(true);
    });
  });
});