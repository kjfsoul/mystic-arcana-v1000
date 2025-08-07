/**
 * Example usage of LoreToEmotionBridge
 * 
 * This file demonstrates how to use the bridge to transform
 * LoreLinkerAgentMulti outputs into formats suitable for
 * EmotionalAnalyzer and GalaxyView visualization components.
 */

import { LoreToEmotionBridge } from './LoreToEmotionBridge';
import type { SummarizedLoreProfile } from './LoreLinkerAgentMulti';
import type { EmotionalSnapshot, CosmicViewMetadata } from './LoreToEmotionBridge';

// Example: Processing mythology content
export async function processMythologyContent(): Promise<{
  emotional: EmotionalSnapshot;
  cosmic: CosmicViewMetadata;
}> {
  // Simulated output from LoreLinkerAgentMulti
  const loreProfile: SummarizedLoreProfile = {
    metaSummary: `
      The ancient myths speak of heroes who journey into darkness to face their shadows,
      guided by wise mentors and aided by magical allies. These archetypal patterns
      reveal universal truths about transformation, courage, and the quest for meaning.
    `,
    topArchetypes: ['Hero', 'Shadow', 'Mentor', 'Magician'],
    allKeywords: {
      nouns: ['hero', 'journey', 'transformation', 'wisdom', 'shadow', 'quest', 'magic'],
      verbs: ['journey', 'transform', 'guide', 'face', 'overcome', 'discover'],
      adjectives: ['ancient', 'wise', 'mystical', 'transformative', 'courageous'],
    },
    sourceURLs: [
      'https://mythology.com/hero-journey',
      'https://psychology.com/archetypes',
      'https://spirituality.com/transformation',
    ],
    sourceTitles: [
      'The Hero\'s Journey in World Mythology',
      'Archetypal Psychology and Personal Growth',
      'Spiritual Transformation Through Ancient Wisdom',
    ],
    totalDocuments: 3,
    successfulDocuments: 3,
    failedDocuments: 0,
  };

  // Initialize the bridge
  const bridge = new LoreToEmotionBridge();

  // Transform to emotional format (for EmotionalAnalyzer)
  const emotional = bridge.transformToEmotionalFormat(loreProfile);
  
  // Generate cosmic visualization metadata (for GalaxyView)
  const cosmic = bridge.generateVisualizationMetadata(loreProfile);

  return { emotional, cosmic };
}

// Example: Processing spiritual/self-help content
export async function processSpiritualContent(): Promise<{
  emotional: EmotionalSnapshot;
  cosmic: CosmicViewMetadata;
}> {
  const spiritualProfile: SummarizedLoreProfile = {
    metaSummary: `
      The path of spiritual awakening requires surrendering the ego's need for control
      and embracing the innocent trust of a beginner's mind. Through meditation,
      contemplation, and service to others, we discover our true nature.
    `,
    topArchetypes: ['Innocent', 'Sage', 'Caregiver'],
    allKeywords: {
      nouns: ['spiritual', 'awakening', 'meditation', 'service', 'compassion', 'peace'],
      verbs: ['surrender', 'embrace', 'discover', 'serve', 'contemplate', 'awaken'],
      adjectives: ['pure', 'wise', 'compassionate', 'peaceful', 'loving'],
    },
    sourceURLs: [
      'https://meditation.com/awakening',
      'https://service.com/compassion',
    ],
    sourceTitles: [
      'Awakening Through Meditation',
      'Compassionate Service as Spiritual Practice',
    ],
    totalDocuments: 2,
    successfulDocuments: 2,
    failedDocuments: 0,
  };

  const bridge = new LoreToEmotionBridge();
  
  return {
    emotional: bridge.transformToEmotionalFormat(spiritualProfile),
    cosmic: bridge.generateVisualizationMetadata(spiritualProfile),
  };
}

// Example: Integrating with existing agents
export class ExampleIntegration {
  private bridge: LoreToEmotionBridge;

  constructor() {
    this.bridge = new LoreToEmotionBridge();
  }

  /**
   * Complete pipeline: URL processing → Emotional analysis → Visualization
   */
  public async processUrls(urls: string[]): Promise<{
    loreProfile: SummarizedLoreProfile;
    emotional: EmotionalSnapshot;
    cosmic: CosmicViewMetadata;
  }> {
    // Step 1: Process URLs with LoreLinkerAgentMulti (simulated)
    const loreProfile = await this.simulateLoreProcessing(urls);
    
    // Step 2: Transform to emotional format
    const emotional = this.bridge.transformToEmotionalFormat(loreProfile);
    
    // Step 3: Generate cosmic visualization data
    const cosmic = this.bridge.generateVisualizationMetadata(loreProfile);
    
    return { loreProfile, emotional, cosmic };
  }

  /**
   * Simulate LoreLinkerAgentMulti processing
   * In real usage, this would be: const loreLinker = new LoreLinkerAgentMulti();
   */
  private async simulateLoreProcessing(urls: string[]): Promise<SummarizedLoreProfile> {
    // This would be: return loreLinker.processMultipleUrls(urls).then(loreLinker.reduceSummaries);
    return {
      metaSummary: 'Simulated processing of ' + urls.length + ' URLs.',
      topArchetypes: ['Explorer', 'Creator', 'Sage'],
      allKeywords: {
        nouns: ['exploration', 'creativity', 'wisdom'],
        verbs: ['explore', 'create', 'learn'],
        adjectives: ['curious', 'innovative', 'insightful'],
      },
      sourceURLs: urls,
      sourceTitles: urls.map(url => `Content from ${url}`),
      totalDocuments: urls.length,
      successfulDocuments: urls.length,
      failedDocuments: 0,
    };
  }

  /**
   * Get available archetype options for UI components
   */
  public getAvailableArchetypes(): string[] {
    return LoreToEmotionBridge.getAvailableArchetypes();
  }

  /**
   * Validate user-selected archetypes
   */
  public validateArchetypes(archetypes: string[]): boolean {
    return archetypes.every(archetype => 
      LoreToEmotionBridge.isValidArchetype(archetype)
    );
  }
}

// Example usage demonstrations
if (require.main === module) {
  // Demo 1: Mythology processing
  processMythologyContent().then(result => {
    console.log('Mythology Processing Results:');
    console.log('Emotional Snapshot:', JSON.stringify(result.emotional, null, 2));
    console.log('Cosmic Metadata:', JSON.stringify(result.cosmic, null, 2));
  });

  // Demo 2: Spiritual processing
  processSpiritualContent().then(result => {
    console.log('\nSpiritual Processing Results:');
    console.log('Emotional Snapshot:', JSON.stringify(result.emotional, null, 2));
    console.log('Cosmic Metadata:', JSON.stringify(result.cosmic, null, 2));
  });

  // Demo 3: Integration example
  const integration = new ExampleIntegration();
  integration.processUrls([
    'https://example.com/creativity',
    'https://example.com/wisdom',
    'https://example.com/exploration',
  ]).then(result => {
    console.log('\nIntegration Pipeline Results:');
    console.log('Lore Profile:', result.loreProfile.metaSummary);
    console.log('Emotional Themes:', result.emotional.dominantThemes);
    console.log('Cosmic Constellations:', result.cosmic.topArchetypeConstellations);
  });
}