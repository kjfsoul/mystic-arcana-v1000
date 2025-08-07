import { LoreToEmotionBridge, ARCHETYPE_MAPPINGS } from './LoreToEmotionBridge';
import type { 
  EmotionalSnapshot, 
  CosmicViewMetadata, 
  ArchetypeEmotionMapping 
} from './LoreToEmotionBridge';
import type { SummarizedLoreProfile } from './LoreLinkerAgentMulti';

// Mock data for testing
const createMockProfile = (overrides: Partial<SummarizedLoreProfile> = {}): SummarizedLoreProfile => ({
  metaSummary: 'The hero embarks on a mystical journey to discover inner wisdom and transform their spiritual understanding.',
  topArchetypes: ['Hero', 'Sage', 'Magician'],
  allKeywords: {
    nouns: ['hero', 'journey', 'wisdom', 'magic', 'transformation', 'spirit'],
    verbs: ['discover', 'transform', 'embark', 'seek', 'evolve'],
    adjectives: ['mystical', 'spiritual', 'wise', 'powerful', 'transformative'],
  },
  sourceURLs: ['https://example.com/mythology', 'https://example.com/spirituality'],
  sourceTitles: ['Hero Mythology', 'Spiritual Wisdom'],
  totalDocuments: 2,
  successfulDocuments: 2,
  failedDocuments: 0,
  ...overrides,
});

const createMinimalProfile = (): SummarizedLoreProfile => ({
  metaSummary: 'Simple content.',
  topArchetypes: [],
  allKeywords: { nouns: [], verbs: [], adjectives: [] },
  sourceURLs: ['https://example.com/simple'],
  sourceTitles: ['Simple Content'],
  totalDocuments: 1,
  successfulDocuments: 0,
  failedDocuments: 1,
});

describe('LoreToEmotionBridge', () => {
  let bridge: LoreToEmotionBridge;

  beforeEach(() => {
    bridge = new LoreToEmotionBridge();
  });

  describe('transformToEmotionalFormat', () => {
    it('should transform a complete profile into EmotionalSnapshot', () => {
      const profile = createMockProfile();
      const result = bridge.transformToEmotionalFormat(profile);

      expect(result).toMatchObject({
        dominantThemes: expect.any(Array),
        moodColor: expect.stringMatching(/^#[0-9A-F]{6}$/i),
        toneDescriptors: expect.any(Array),
        inferredNeeds: expect.any(Array),
      });

      // Should contain archetype-based themes
      expect(result.dominantThemes).toContain('hero');
      expect(result.dominantThemes.length).toBeGreaterThan(0);
      expect(result.dominantThemes.length).toBeLessThanOrEqual(5);

      // Should have Hero archetype color (orange-red)
      expect(result.moodColor).toBe('#FF6B35');

      // Should contain Hero-based descriptors
      expect(result.toneDescriptors).toContain('brave');
      expect(result.toneDescriptors.length).toBeGreaterThan(0);
      expect(result.toneDescriptors.length).toBeLessThanOrEqual(4);

      // Should contain Hero-based needs
      expect(result.inferredNeeds).toContain('challenge');
      expect(result.inferredNeeds.length).toBeGreaterThan(0);
      expect(result.inferredNeeds.length).toBeLessThanOrEqual(6);
    });

    it('should handle profile with no archetypes', () => {
      const profile = createMinimalProfile();
      const result = bridge.transformToEmotionalFormat(profile);

      expect(result.dominantThemes).toEqual([]);
      expect(result.moodColor).toBe('#8B7CF6'); // Default purple
      expect(result.toneDescriptors).toEqual(['neutral', 'balanced']); // Default
      expect(result.inferredNeeds).toEqual([]);
    });

    it('should handle single archetype profiles', () => {
      const profile = createMockProfile({
        topArchetypes: ['Lover'],
        allKeywords: {
          nouns: ['love', 'beauty', 'romance'],
          verbs: ['love', 'connect', 'embrace'],
          adjectives: ['beautiful', 'passionate', 'tender'],
        },
      });

      const result = bridge.transformToEmotionalFormat(profile);

      expect(result.moodColor).toBe('#FFB6C1'); // Light pink for Lover
      expect(result.dominantThemes).toContain('lover');
      expect(result.dominantThemes).toContain('passion');
      expect(result.toneDescriptors).toContain('romantic');
      expect(result.inferredNeeds).toContain('intimacy');
    });

    it('should infer spiritual needs from mystical keywords', () => {
      const profile = createMockProfile({
        topArchetypes: ['Sage'],
        allKeywords: {
          nouns: ['spiritual', 'sacred', 'divine', 'mystic'],
          verbs: ['pray', 'meditate', 'transcend'],
          adjectives: ['sacred', 'holy', 'mystical'],
        },
      });

      const result = bridge.transformToEmotionalFormat(profile);

      expect(result.inferredNeeds).toContain('transcendence');
      expect(result.inferredNeeds).toContain('meaning');
    });

    it('should infer growth needs from adventure keywords', () => {
      const profile = createMockProfile({
        topArchetypes: ['Explorer'],
        allKeywords: {
          nouns: ['journey', 'adventure', 'quest', 'exploration'],
          verbs: ['explore', 'discover', 'venture'],
          adjectives: ['adventurous', 'bold', 'daring'],
        },
      });

      const result = bridge.transformToEmotionalFormat(profile);

      expect(result.inferredNeeds).toContain('growth');
      expect(result.inferredNeeds).toContain('discovery');
    });

    it('should infer connection needs from relationship keywords', () => {
      const profile = createMockProfile({
        topArchetypes: ['Caregiver'],
        allKeywords: {
          nouns: ['love', 'relationship', 'community', 'connection'],
          verbs: ['care', 'nurture', 'support'],
          adjectives: ['caring', 'supportive', 'loving'],
        },
      });

      const result = bridge.transformToEmotionalFormat(profile);

      expect(result.inferredNeeds).toContain('connection');
      expect(result.inferredNeeds).toContain('intimacy');
    });

    it('should add content-based tone descriptors', () => {
      const longProfile = createMockProfile({
        metaSummary: 'A' + 'very '.repeat(50) + 'long summary that exceeds 200 characters.',
        successfulDocuments: 5,
        failedDocuments: 1,
      });

      const result = bridge.transformToEmotionalFormat(longProfile);

      expect(result.toneDescriptors).toContain('comprehensive');
      expect(result.toneDescriptors).toContain('detailed');
    });
  });

  describe('generateVisualizationMetadata', () => {
    it('should generate cosmic visualization metadata', () => {
      const profile = createMockProfile();
      const result = bridge.generateVisualizationMetadata(profile);

      expect(result).toMatchObject({
        topArchetypeConstellations: expect.any(Array),
        planetMoodMap: expect.any(Object),
        archetypeToColorMap: expect.any(Object),
      });

      // Should group archetypes into constellations
      expect(result.topArchetypeConstellations).toContain('Fire Warriors'); // Hero
      expect(result.topArchetypeConstellations).toContain('Wisdom Keepers'); // Sage
      expect(result.topArchetypeConstellations).toContain('Mystic Circle'); // Magician

      // Should map planets to mood descriptions
      expect(result.planetMoodMap.Mars).toBe('warm orange-red'); // Hero
      expect(result.planetMoodMap.Jupiter).toBe('wise steel blue'); // Sage
      expect(result.planetMoodMap.Mercury).toBe('mystical purple'); // Magician

      // Should map archetypes to colors
      expect(result.archetypeToColorMap.Hero).toBe('#FF6B35');
      expect(result.archetypeToColorMap.Sage).toBe('#4169E1');
      expect(result.archetypeToColorMap.Magician).toBe('#9932CC');
    });

    it('should handle empty archetypes list', () => {
      const profile = createMinimalProfile();
      const result = bridge.generateVisualizationMetadata(profile);

      expect(result.topArchetypeConstellations).toEqual([]);
      expect(result.planetMoodMap).toEqual({});
      expect(result.archetypeToColorMap).toEqual({});
    });

    it('should handle single archetype', () => {
      const profile = createMockProfile({
        topArchetypes: ['Creator'],
      });

      const result = bridge.generateVisualizationMetadata(profile);

      expect(result.topArchetypeConstellations).toEqual(['Creative Spark']);
      expect(result.planetMoodMap).toEqual({ Sun: 'radiant gold' });
      expect(result.archetypeToColorMap).toEqual({ Creator: '#FFD700' });
    });

    it('should group multiple archetypes with same planet', () => {
      const profile = createMockProfile({
        topArchetypes: ['Hero', 'Warrior', 'Rebel'], // All Mars
      });

      const result = bridge.generateVisualizationMetadata(profile);

      // Should contain Fire Warriors constellation for all three
      expect(result.topArchetypeConstellations).toContain('Fire Warriors');
      
      // Mars should appear once with the first archetype's color description
      expect(result.planetMoodMap.Mars).toBe('warm orange-red'); // Hero's color
      
      // Should have color mappings for all archetypes
      expect(result.archetypeToColorMap).toHaveProperty('Hero');
      expect(result.archetypeToColorMap).toHaveProperty('Warrior');
      expect(result.archetypeToColorMap).toHaveProperty('Rebel');
    });
  });

  describe('static utility methods', () => {
    it('should validate archetypes correctly', () => {
      expect(LoreToEmotionBridge.isValidArchetype('Hero')).toBe(true);
      expect(LoreToEmotionBridge.isValidArchetype('InvalidArchetype')).toBe(false);
      expect(LoreToEmotionBridge.isValidArchetype('')).toBe(false);
    });

    it('should return available archetypes', () => {
      const archetypes = LoreToEmotionBridge.getAvailableArchetypes();
      
      expect(archetypes).toBeInstanceOf(Array);
      expect(archetypes.length).toBeGreaterThan(10);
      expect(archetypes).toContain('Hero');
      expect(archetypes).toContain('Sage');
      expect(archetypes).toContain('Magician');
    });

    it('should return archetype mapping details', () => {
      const heroMapping = LoreToEmotionBridge.getArchetypeMapping('Hero');
      
      expect(heroMapping).toBeDefined();
      expect(heroMapping?.emotions).toContain('courage');
      expect(heroMapping?.moodColor).toBe('#FF6B35');
      expect(heroMapping?.planetAssociation).toBe('Mars');

      const invalid = LoreToEmotionBridge.getArchetypeMapping('InvalidArchetype');
      expect(invalid).toBeNull();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle undefined or null keywords gracefully', () => {
      const profile: SummarizedLoreProfile = {
        metaSummary: 'Test summary',
        topArchetypes: ['Hero'],
        allKeywords: { nouns: [], verbs: [], adjectives: [] },
        sourceURLs: [],
        sourceTitles: [],
        totalDocuments: 0,
        successfulDocuments: 0,
        failedDocuments: 0,
      };

      const emotionalResult = bridge.transformToEmotionalFormat(profile);
      const cosmicResult = bridge.generateVisualizationMetadata(profile);

      expect(emotionalResult).toBeDefined();
      expect(cosmicResult).toBeDefined();
      expect(emotionalResult.dominantThemes).toContain('hero');
    });

    it('should handle unknown archetypes in profile', () => {
      const profile = createMockProfile({
        topArchetypes: ['UnknownArchetype', 'Hero', 'AnotherUnknown'],
      });

      const emotionalResult = bridge.transformToEmotionalFormat(profile);
      const cosmicResult = bridge.generateVisualizationMetadata(profile);

      // Should still work with valid archetype
      expect(emotionalResult.moodColor).toBe('#FF6B35'); // Hero color
      expect(cosmicResult.archetypeToColorMap.Hero).toBe('#FF6B35');
      
      // Unknown archetypes should be ignored
      expect(cosmicResult.archetypeToColorMap).not.toHaveProperty('UnknownArchetype');
      expect(cosmicResult.archetypeToColorMap).not.toHaveProperty('AnotherUnknown');
    });

    it('should limit array sizes as configured', () => {
      // Create profile with many keywords and archetypes
      const profile = createMockProfile({
        topArchetypes: Object.keys(ARCHETYPE_MAPPINGS), // All archetypes
        allKeywords: {
          nouns: Array(20).fill(0).map((_, i) => `noun${i}`),
          verbs: Array(20).fill(0).map((_, i) => `verb${i}`),
          adjectives: Array(20).fill(0).map((_, i) => `adj${i}`),
        },
      });

      const result = bridge.transformToEmotionalFormat(profile);

      expect(result.dominantThemes.length).toBeLessThanOrEqual(5);
      expect(result.toneDescriptors.length).toBeLessThanOrEqual(4);
      expect(result.inferredNeeds.length).toBeLessThanOrEqual(6);
    });
  });

  describe('archetype mappings validation', () => {
    it('should have complete mappings for all defined archetypes', () => {
      const requiredProperties: (keyof ArchetypeEmotionMapping)[] = [
        'emotions', 'moodColor', 'toneDescriptors', 'inferredNeeds', 'constellationGroup'
      ];

      Object.entries(ARCHETYPE_MAPPINGS).forEach(([archetype, mapping]) => {
        requiredProperties.forEach(prop => {
          expect(mapping[prop]).toBeDefined();
          if (Array.isArray(mapping[prop])) {
            expect((mapping[prop] as string[]).length).toBeGreaterThan(0);
          }
        });

        // Validate color format
        expect(mapping.moodColor).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have unique constellation groups', () => {
      const constellationGroups = Object.values(ARCHETYPE_MAPPINGS)
        .map(mapping => mapping.constellationGroup);
      
      const uniqueGroups = new Set(constellationGroups);
      expect(uniqueGroups.size).toBeGreaterThan(3); // Should have multiple groups
    });

    it('should have valid planet associations where defined', () => {
      const validPlanets = [
        'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 
        'Uranus', 'Neptune', 'Pluto'
      ];

      Object.values(ARCHETYPE_MAPPINGS).forEach(mapping => {
        if (mapping.planetAssociation) {
          expect(validPlanets).toContain(mapping.planetAssociation);
        }
      });
    });
  });

  describe('integration scenarios', () => {
    it('should produce consistent results for same input', () => {
      const profile = createMockProfile();
      
      const result1 = bridge.transformToEmotionalFormat(profile);
      const result2 = bridge.transformToEmotionalFormat(profile);
      
      expect(result1).toEqual(result2);
    });

    it('should handle realistic mythology profile', () => {
      const mythologyProfile = createMockProfile({
        metaSummary: 'Ancient Greek mythology tells the story of heroes like Achilles and Odysseus, who faced trials guided by wise mentors and magical interventions from the gods.',
        topArchetypes: ['Hero', 'Mentor', 'Magician'],
        allKeywords: {
          nouns: ['hero', 'mythology', 'gods', 'trials', 'wisdom', 'magic'],
          verbs: ['guide', 'face', 'transform', 'journey', 'overcome'],
          adjectives: ['ancient', 'wise', 'magical', 'heroic', 'divine'],
        },
      });

      const emotional = bridge.transformToEmotionalFormat(mythologyProfile);
      const cosmic = bridge.generateVisualizationMetadata(mythologyProfile);

      expect(emotional.dominantThemes).toContain('hero');
      expect(emotional.toneDescriptors).toContain('brave');
      expect(cosmic.topArchetypeConstellations).toContain('Fire Warriors');
      expect(cosmic.planetMoodMap).toHaveProperty('Mars');
    });

    it('should handle realistic spiritual profile', () => {
      const spiritualProfile = createMockProfile({
        metaSummary: 'The path of spiritual awakening requires inner wisdom, connection to the divine, and the courage to transform old patterns.',
        topArchetypes: ['Sage', 'Innocent', 'Magician'],
        allKeywords: {
          nouns: ['spiritual', 'wisdom', 'divine', 'awakening', 'transformation'],
          verbs: ['awaken', 'connect', 'transform', 'transcend', 'evolve'],
          adjectives: ['spiritual', 'divine', 'pure', 'transformative', 'sacred'],
        },
      });

      const emotional = bridge.transformToEmotionalFormat(spiritualProfile);
      
      expect(emotional.inferredNeeds).toContain('transcendence');
      expect(emotional.inferredNeeds).toContain('meaning');
      expect(emotional.toneDescriptors).toContain('wise');
      expect(emotional.dominantThemes).toContain('wisdom');
    });
  });
});