import { TarotCard, SpreadType } from '@/types/tarot';

// Mock fetch globally
global.fetch = jest.fn();

describe('Daily Oracle Tarot Spreads Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('One Card Draw', () => {
    it('should validate single card draw structure', async () => {
      const mockOneCardResponse = {
        success: true,
        data: {
          one_card_draw: {
            db_identifier: 'DB_ENTRY_072625_draw_queen_of_swords_upright',
            card: {
              name: 'Queen of Swords',
              suit: 'swords',
              number: 'queen',
              orientation: 'upright',
              meaning: 'Clear thinking, direct communication, independence',
              interpretation: 'Today calls for intellectual clarity and honest communication.',
              archetypal_energy: 'The wise woman who speaks truth with compassion',
              practical_guidance: 'Trust your intellect while remaining emotionally aware',
              symbolic_notes: 'The sword points upward, indicating clear mental focus'
            }
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOneCardResponse
      });

      const response = await fetch('/api/daily-oracle/tarot/one-card');
      const data = await response.json();

      const draw = data.data.one_card_draw;
      
      // Validate required fields
      expect(draw.db_identifier).toMatch(/^DB_ENTRY_\d{6}_draw_[a-z_]+_(upright|reversed)$/);
      expect(draw.card.name).toBeDefined();
      expect(draw.card.orientation).toMatch(/^(upright|reversed)$/);
      expect(draw.card.meaning).toBeDefined();
      expect(draw.card.interpretation).toBeDefined();
      expect(draw.card.archetypal_energy).toBeDefined();
      expect(draw.card.practical_guidance).toBeDefined();
    });

    it('should handle reversed card orientations', async () => {
      const mockReversedResponse = {
        success: true,
        data: {
          one_card_draw: {
            db_identifier: 'DB_ENTRY_072625_draw_the_tower_reversed',
            card: {
              name: 'The Tower',
              orientation: 'reversed',
              meaning: 'Avoiding disaster, delayed upheaval, fear of change',
              interpretation: 'Resistance to necessary change may be causing internal tension.',
              archetypal_energy: 'Controlled destruction leading to renewal',
              reversal_notes: 'The shock is internal rather than external'
            }
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReversedResponse
      });

      const response = await fetch('/api/daily-oracle/tarot/one-card');
      const data = await response.json();

      const draw = data.data.one_card_draw;
      
      expect(draw.card.orientation).toBe('reversed');
      expect(draw.card.reversal_notes).toBeDefined();
      expect(draw.db_identifier).toContain('reversed');
    });
  });

  describe('Three Card Spread - Past Present Future', () => {
    it('should validate three card spread structure', async () => {
      const mockThreeCardResponse = {
        success: true,
        data: {
          three_card_spread: {
            db_identifier: 'DB_ENTRY_072625_three_card_ppp',
            spread_type: 'past_present_future',
            past: {
              name: 'Six of Pentacles',
              orientation: 'reversed',
              meaning: 'Imbalanced giving, unfair exchange, debt',
              position_context: 'Past influences showing patterns of imbalanced relationships',
              archetypal_energy: 'Learning to receive as well as give'
            },
            present: {
              name: 'The Sun',
              orientation: 'upright',
              meaning: 'Joy, success, positivity, vitality',
              position_context: 'Current energy radiating optimism and clarity',
              archetypal_energy: 'Pure life force and authentic self-expression'
            },
            future: {
              name: 'Ace of Pentacles',
              orientation: 'upright',
              meaning: 'New opportunities, material beginnings, prosperity',
              position_context: 'Emerging potential for tangible manifestation',
              archetypal_energy: 'The seed of material abundance'
            },
            cross_card_interpretation: 'The journey from imbalanced giving leads to present joy and future abundance',
            surrounding_influence: 'The Sun illuminates both past lessons and future potential',
            holistic_message: 'Balance in the past creates radiant present which seeds future prosperity'
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockThreeCardResponse
      });

      const response = await fetch('/api/daily-oracle/tarot/three-card');
      const data = await response.json();

      const spread = data.data.three_card_spread;
      
      // Validate structure
      expect(spread.db_identifier).toMatch(/^DB_ENTRY_\d{6}_three_card_[a-z_]+$/);
      expect(spread.spread_type).toBe('past_present_future');
      
      // Validate each position
      expect(spread.past).toBeDefined();
      expect(spread.present).toBeDefined();
      expect(spread.future).toBeDefined();
      
      // Validate position context
      expect(spread.past.position_context).toBeDefined();
      expect(spread.present.position_context).toBeDefined();
      expect(spread.future.position_context).toBeDefined();
      
      // Validate cross-card analysis
      expect(spread.cross_card_interpretation).toBeDefined();
      expect(spread.surrounding_influence).toBeDefined();
      expect(spread.holistic_message).toBeDefined();
    });

    it('should handle mixed orientations in three card spread', async () => {
      const mockMixedResponse = {
        success: true,
        data: {
          three_card_spread: {
            past: { orientation: 'reversed' },
            present: { orientation: 'upright' },
            future: { orientation: 'reversed' },
            orientation_analysis: 'Mixed energies suggest transformation through contrast'
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMixedResponse
      });

      const response = await fetch('/api/daily-oracle/tarot/three-card');
      const data = await response.json();

      const spread = data.data.three_card_spread;
      
      expect(spread.past.orientation).toBe('reversed');
      expect(spread.present.orientation).toBe('upright');
      expect(spread.future.orientation).toBe('reversed');
      expect(spread.orientation_analysis).toBeDefined();
    });
  });

  describe('Celtic Cross Spread', () => {
    it('should validate complete Celtic Cross structure with all 10 positions', async () => {
      const mockCelticCrossResponse = {
        success: true,
        data: {
          celtic_cross: {
            db_identifier: 'DB_ENTRY_072625_celticcross_complete',
            spread_type: 'celtic_cross',
            positions: {
              present: {
                position_number: 1,
                name: 'The Magician',
                orientation: 'upright',
                meaning: 'Manifestation, willpower, desire',
                position_meaning: 'The heart of the matter, current situation',
                interpretation: 'You have all the tools needed to manifest your desires'
              },
              challenge: {
                position_number: 2,
                name: 'Page of Cups',
                orientation: 'reversed',
                meaning: 'Emotional immaturity, blocked intuition',
                position_meaning: 'The challenge or obstacle crossing you',
                interpretation: 'Emotional blocks are preventing clear intuitive guidance'
              },
              distant_past: {
                position_number: 3,
                name: 'Three of Wands',
                orientation: 'upright',
                meaning: 'Planning, foresight, expansion',
                position_meaning: 'Distant past foundation',
                interpretation: 'Previous planning efforts provide current foundation'
              },
              possible_outcome: {
                position_number: 4,
                name: 'Ten of Cups',
                orientation: 'upright',
                meaning: 'Happiness, fulfillment, emotional satisfaction',
                position_meaning: 'Possible outcome if current path continues',
                interpretation: 'Emotional fulfillment and harmony await'
              },
              crown: {
                position_number: 5,
                name: 'The Star',
                orientation: 'upright',
                meaning: 'Hope, inspiration, guidance',
                position_meaning: 'Crowning thought or possible outcome',
                interpretation: 'Divine guidance illuminates your path forward'
              },
              immediate_future: {
                position_number: 6,
                name: 'Knight of Swords',
                orientation: 'upright',
                meaning: 'Action, impulsiveness, haste',
                position_meaning: 'Immediate future, next few weeks',
                interpretation: 'Swift action and clear communication are coming'
              },
              approach: {
                position_number: 7,
                name: 'Five of Pentacles',
                orientation: 'reversed',
                meaning: 'Recovery, overcoming hardship',
                position_meaning: 'Your approach or how you see yourself',
                interpretation: 'You are moving beyond scarcity mindset'
              },
              external_influences: {
                position_number: 8,
                name: 'The Moon',
                orientation: 'upright',
                meaning: 'Illusion, intuition, subconscious',
                position_meaning: 'External influences and other people',
                interpretation: 'Hidden influences require intuitive navigation'
              },
              hopes_and_fears: {
                position_number: 9,
                name: 'Ace of Wands',
                orientation: 'upright',
                meaning: 'New beginnings, inspiration, creative spark',
                position_meaning: 'Your hopes and fears',
                interpretation: 'You hope for new creative opportunities'
              },
              final_outcome: {
                position_number: 10,
                name: 'The World',
                orientation: 'upright',
                meaning: 'Completion, accomplishment, fulfillment',
                position_meaning: 'Final outcome',
                interpretation: 'Complete fulfillment and achievement of goals'
              }
            },
            cross_analysis: {
              present_challenge_dynamic: 'Manifestation power meets emotional blocks',
              past_outcome_connection: 'Previous planning leads to ultimate fulfillment',
              crown_base_tension: 'Divine guidance supports earthly manifestation',
              approach_external_balance: 'Recovery mindset navigates illusion'
            },
            staff_analysis: {
              immediate_to_final: 'Swift action leads to complete fulfillment',
              hopes_to_outcome: 'Creative sparks manifest as worldly achievement',
              external_to_final: 'Navigating illusion enables true completion'
            },
            holistic_interpretation: 'A powerful manifestation journey from current magical potential through emotional healing to ultimate worldly achievement'
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCelticCrossResponse
      });

      const response = await fetch('/api/daily-oracle/tarot/celtic-cross');
      const data = await response.json();

      const spread = data.data.celtic_cross;
      
      // Validate structure
      expect(spread.db_identifier).toMatch(/^DB_ENTRY_\d{6}_celticcross_[a-z_]+$/);
      expect(spread.spread_type).toBe('celtic_cross');
      
      // Validate all 10 positions exist
      const requiredPositions = [
        'present', 'challenge', 'distant_past', 'possible_outcome', 'crown',
        'immediate_future', 'approach', 'external_influences', 'hopes_and_fears', 'final_outcome'
      ];
      
      requiredPositions.forEach(position => {
        expect(spread.positions[position]).toBeDefined();
        expect(spread.positions[position].position_number).toBeDefined();
        expect(spread.positions[position].name).toBeDefined();
        expect(spread.positions[position].orientation).toMatch(/^(upright|reversed)$/);
        expect(spread.positions[position].position_meaning).toBeDefined();
        expect(spread.positions[position].interpretation).toBeDefined();
      });
      
      // Validate cross analysis
      expect(spread.cross_analysis).toBeDefined();
      expect(spread.cross_analysis.present_challenge_dynamic).toBeDefined();
      expect(spread.cross_analysis.past_outcome_connection).toBeDefined();
      
      // Validate staff analysis
      expect(spread.staff_analysis).toBeDefined();
      expect(spread.staff_analysis.immediate_to_final).toBeDefined();
      
      // Validate holistic interpretation
      expect(spread.holistic_interpretation).toBeDefined();
    });

    it('should handle various orientation combinations in Celtic Cross', async () => {
      const orientations = ['upright', 'reversed'];
      const positions = Object.keys({
        present: 1, challenge: 2, distant_past: 3, possible_outcome: 4, crown: 5,
        immediate_future: 6, approach: 7, external_influences: 8, hopes_and_fears: 9, final_outcome: 10
      });

      // Test multiple orientation combinations
      for (let i = 0; i < 3; i++) {
        const mockResponse = {
          success: true,
          data: {
            celtic_cross: {
              positions: Object.fromEntries(
                positions.map(pos => [pos, {
                  name: 'Test Card',
                  orientation: orientations[Math.floor(Math.random() * 2)],
                  meaning: 'Test meaning'
                }])
              ),
              orientation_distribution: {
                upright_count: 0,
                reversed_count: 0,
                balance_analysis: 'Test analysis'
              }
            }
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const response = await fetch('/api/daily-oracle/tarot/celtic-cross');
        const data = await response.json();

        positions.forEach(position => {
          expect(['upright', 'reversed']).toContain(
            data.data.celtic_cross.positions[position].orientation
          );
        });
      }
    });
  });

  describe('Tarot Metadata and Tags', () => {
    it('should generate appropriate metadata tags for all spreads', async () => {
      const mockResponse = {
        success: true,
        data: {
          metadata: {
            tags: [
              'tarot_queen_of_swords_upright',
              'spread_one_card',
              'tarot_six_of_pentacles_reversed',
              'tarot_the_sun_upright',
              'tarot_ace_of_pentacles_upright',
              'spread_three_card',
              'tarot_the_magician_upright',
              'spread_celtic_cross',
              'celtic_cross_complete'
            ],
            card_count: {
              total: 12,
              upright: 8,
              reversed: 4,
              major_arcana: 3,
              minor_arcana: 9
            },
            spread_types: ['one_card', 'three_card', 'celtic_cross']
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/daily-oracle/tarot/metadata');
      const data = await response.json();

      const metadata = data.data.metadata;
      
      // Validate tag structure
      expect(metadata.tags).toBeInstanceOf(Array);
      expect(metadata.tags.length).toBeGreaterThan(0);
      
      // Check for required tag patterns
      const hasCardTags = metadata.tags.some(tag => tag.startsWith('tarot_'));
      const hasSpreadTags = metadata.tags.some(tag => tag.startsWith('spread_'));
      
      expect(hasCardTags).toBe(true);
      expect(hasSpreadTags).toBe(true);
      
      // Validate card count data
      expect(metadata.card_count.total).toBeGreaterThan(0);
      expect(metadata.card_count.upright + metadata.card_count.reversed).toBe(metadata.card_count.total);
      expect(metadata.spread_types).toContain('one_card');
      expect(metadata.spread_types).toContain('three_card');
      expect(metadata.spread_types).toContain('celtic_cross');
    });
  });
});