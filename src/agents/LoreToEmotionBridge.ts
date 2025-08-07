import type { SummarizedLoreProfile } from "./LoreLinkerAgentMulti";

// Configuration constants
const DEFAULT_MOOD_COLOR = "#8B7CF6"; // Soft purple
const DEFAULT_TONE_DESCRIPTORS = ["neutral", "balanced"];
const MAX_DOMINANT_THEMES = 5;
const MAX_TONE_DESCRIPTORS = 4;
const MAX_INFERRED_NEEDS = 6;

// Interface definitions
export interface EmotionalSnapshot {
  dominantThemes: string[];
  moodColor: string; // e.g., "#ffccdd"
  toneDescriptors: string[];
  inferredNeeds: string[];
}

export interface CosmicViewMetadata {
  topArchetypeConstellations: string[];
  planetMoodMap: Record<string, string>; // e.g., { Venus: "soft pink", Mars: "red-orange" }
  archetypeToColorMap: Record<string, string>;
}

// Archetype-to-emotion mappings
interface ArchetypeEmotionMapping {
  emotions: string[];
  moodColor: string;
  toneDescriptors: string[];
  inferredNeeds: string[];
  planetAssociation?: string;
  constellationGroup: string;
}

// Comprehensive archetype mappings for emotional and cosmic transformations
const ARCHETYPE_MAPPINGS: Record<string, ArchetypeEmotionMapping> = {
  Hero: {
    emotions: ["courage", "determination", "aspiration"],
    moodColor: "#FF6B35", // Bold orange-red
    toneDescriptors: ["brave", "ambitious", "inspiring"],
    inferredNeeds: ["challenge", "purpose", "recognition", "growth"],
    planetAssociation: "Mars",
    constellationGroup: "Fire Warriors",
  },
  Shadow: {
    emotions: ["mystery", "introspection", "transformation"],
    moodColor: "#2C1810", // Deep shadow brown
    toneDescriptors: ["mysterious", "profound", "introspective"],
    inferredNeeds: ["understanding", "integration", "healing", "acceptance"],
    planetAssociation: "Pluto",
    constellationGroup: "Deep Mysteries",
  },
  Lover: {
    emotions: ["passion", "connection", "beauty"],
    moodColor: "#FFB6C1", // Light pink
    toneDescriptors: ["romantic", "sensual", "harmonious"],
    inferredNeeds: ["intimacy", "beauty", "connection", "pleasure"],
    planetAssociation: "Venus",
    constellationGroup: "Heart Constellation",
  },
  Sage: {
    emotions: ["wisdom", "contemplation", "clarity"],
    moodColor: "#4169E1", // Royal blue
    toneDescriptors: ["wise", "thoughtful", "insightful"],
    inferredNeeds: ["knowledge", "understanding", "truth", "guidance"],
    planetAssociation: "Jupiter",
    constellationGroup: "Wisdom Keepers",
  },
  Magician: {
    emotions: ["wonder", "transformation", "power"],
    moodColor: "#9932CC", // Dark orchid
    toneDescriptors: ["mystical", "transformative", "powerful"],
    inferredNeeds: ["mastery", "transformation", "influence", "manifestation"],
    planetAssociation: "Mercury",
    constellationGroup: "Mystic Circle",
  },
  Innocent: {
    emotions: ["joy", "hope", "purity"],
    moodColor: "#F0F8FF", // Alice blue
    toneDescriptors: ["pure", "optimistic", "trusting"],
    inferredNeeds: ["safety", "simplicity", "joy", "belonging"],
    planetAssociation: "Moon",
    constellationGroup: "Pure Light",
  },
  Explorer: {
    emotions: ["adventure", "curiosity", "freedom"],
    moodColor: "#32CD32", // Lime green
    toneDescriptors: ["adventurous", "curious", "independent"],
    inferredNeeds: ["freedom", "discovery", "adventure", "authenticity"],
    planetAssociation: "Uranus",
    constellationGroup: "Pathfinders",
  },
  Rebel: {
    emotions: ["defiance", "revolution", "liberation"],
    moodColor: "#DC143C", // Crimson
    toneDescriptors: ["rebellious", "fierce", "revolutionary"],
    inferredNeeds: ["change", "freedom", "justice", "authenticity"],
    planetAssociation: "Mars",
    constellationGroup: "Fire Warriors",
  },
  Creator: {
    emotions: ["inspiration", "innovation", "expression"],
    moodColor: "#FFD700", // Gold
    toneDescriptors: ["creative", "innovative", "expressive"],
    inferredNeeds: ["expression", "creation", "inspiration", "recognition"],
    planetAssociation: "Sun",
    constellationGroup: "Creative Spark",
  },
  Ruler: {
    emotions: ["authority", "responsibility", "control"],
    moodColor: "#800080", // Purple
    toneDescriptors: ["authoritative", "responsible", "commanding"],
    inferredNeeds: ["control", "stability", "legacy", "respect"],
    planetAssociation: "Saturn",
    constellationGroup: "Crown Circle",
  },
  Caregiver: {
    emotions: ["compassion", "nurturing", "protection"],
    moodColor: "#98FB98", // Pale green
    toneDescriptors: ["nurturing", "compassionate", "protective"],
    inferredNeeds: ["service", "protection", "care", "healing"],
    planetAssociation: "Moon",
    constellationGroup: "Gentle Guardians",
  },
  Jester: {
    emotions: ["joy", "playfulness", "humor"],
    moodColor: "#FF69B4", // Hot pink
    toneDescriptors: ["playful", "humorous", "lighthearted"],
    inferredNeeds: ["fun", "connection", "laughter", "lightness"],
    planetAssociation: "Mercury",
    constellationGroup: "Cosmic Jesters",
  },
  Orphan: {
    emotions: ["longing", "resilience", "community"],
    moodColor: "#708090", // Slate gray
    toneDescriptors: ["resilient", "seeking", "vulnerable"],
    inferredNeeds: ["belonging", "support", "connection", "healing"],
    planetAssociation: "Neptune",
    constellationGroup: "Seekers",
  },
  Warrior: {
    emotions: ["strength", "courage", "protection"],
    moodColor: "#B22222", // Fire brick red
    toneDescriptors: ["strong", "protective", "determined"],
    inferredNeeds: ["challenge", "honor", "protection", "victory"],
    planetAssociation: "Mars",
    constellationGroup: "Fire Warriors",
  },
  Mentor: {
    emotions: ["guidance", "wisdom", "support"],
    moodColor: "#4682B4", // Steel blue
    toneDescriptors: ["guiding", "supportive", "wise"],
    inferredNeeds: ["teaching", "guidance", "legacy", "wisdom"],
    planetAssociation: "Jupiter",
    constellationGroup: "Wisdom Keepers",
  },
  Trickster: {
    emotions: ["mischief", "change", "chaos"],
    moodColor: "#FF4500", // Orange red
    toneDescriptors: ["mischievous", "unpredictable", "transformative"],
    inferredNeeds: ["change", "chaos", "transformation", "freedom"],
    planetAssociation: "Mercury",
    constellationGroup: "Cosmic Jesters",
  },
};

// Keyword-to-emotion mappings for semantic analysis
const KEYWORD_EMOTION_MAPPINGS: Record<string, string[]> = {
  // Love and relationships
  love: ["romantic", "connected", "warm"],
  passion: ["intense", "fiery", "devoted"],
  romance: ["tender", "sweet", "enchanting"],

  // Spiritual and mystical
  spiritual: ["transcendent", "elevated", "sacred"],
  mystic: ["mysterious", "profound", "otherworldly"],
  sacred: ["reverent", "holy", "blessed"],

  // Adventure and exploration
  adventure: ["exciting", "bold", "thrilling"],
  journey: ["transformative", "meaningful", "progressive"],
  quest: ["purposeful", "determined", "noble"],

  // Wisdom and knowledge
  wisdom: ["insightful", "deep", "knowing"],
  knowledge: ["informed", "curious", "scholarly"],
  truth: ["honest", "revealing", "clear"],

  // Power and transformation
  power: ["strong", "influential", "commanding"],
  magic: ["enchanting", "mysterious", "transformative"],
  transformation: ["changing", "evolving", "metamorphic"],

  // Nature and cosmos
  celestial: ["heavenly", "cosmic", "divine"],
  cosmos: ["infinite", "expansive", "universal"],
  star: ["bright", "guiding", "aspirational"],

  // Emotions and states
  joy: ["happy", "light", "celebratory"],
  peace: ["calm", "serene", "tranquil"],
  strength: ["powerful", "resilient", "enduring"],
};

export class LoreToEmotionBridge {
  /**
   * Transform SummarizedLoreProfile into an EmotionalSnapshot
   */
  public transformToEmotionalFormat(
    profile: SummarizedLoreProfile,
  ): EmotionalSnapshot {
    // Extract dominant themes from top archetypes and keywords
    const dominantThemes = this.extractDominantThemes(profile);

    // Calculate mood color based on archetype blend
    const moodColor = this.calculateMoodColor(profile.topArchetypes);

    // Generate tone descriptors from archetypes and keywords
    const toneDescriptors = this.generateToneDescriptors(profile);

    // Infer psychological/spiritual needs from content analysis
    const inferredNeeds = this.inferNeeds(profile);

    return {
      dominantThemes,
      moodColor,
      toneDescriptors,
      inferredNeeds,
    };
  }

  /**
   * Generate visualization metadata for cosmic/galaxy view components
   */
  public generateVisualizationMetadata(
    profile: SummarizedLoreProfile,
  ): CosmicViewMetadata {
    // Group archetypes into constellation patterns
    const topArchetypeConstellations = this.groupArchetypesIntoConstellations(
      profile.topArchetypes,
    );

    // Map archetypes to planetary associations with mood colors
    const planetMoodMap = this.createPlanetMoodMap(profile.topArchetypes);

    // Create color mapping for each archetype
    const archetypeToColorMap = this.createArchetypeColorMap(
      profile.topArchetypes,
    );

    return {
      topArchetypeConstellations,
      planetMoodMap,
      archetypeToColorMap,
    };
  }

  /**
   * Extract dominant themes from profile data
   */
  private extractDominantThemes(profile: SummarizedLoreProfile): string[] {
    const themes = new Set<string>();

    // Add top archetypes as primary themes
    profile.topArchetypes.forEach((archetype) => {
      if (ARCHETYPE_MAPPINGS[archetype]) {
        themes.add(archetype.toLowerCase());
        // Add primary emotion as theme
        const primaryEmotion = ARCHETYPE_MAPPINGS[archetype].emotions[0];
        if (primaryEmotion) {
          themes.add(primaryEmotion);
        }
      }
    });

    // Add semantic themes from high-frequency keywords
    const allKeywords = [
      ...profile.allKeywords.nouns.slice(0, 3),
      ...profile.allKeywords.adjectives.slice(0, 2),
      ...profile.allKeywords.verbs.slice(0, 2),
    ];

    allKeywords.forEach((keyword) => {
      const emotions = KEYWORD_EMOTION_MAPPINGS[keyword.toLowerCase()];
      if (emotions) {
        emotions.slice(0, 1).forEach((emotion) => themes.add(emotion));
      }
    });

    return Array.from(themes).slice(0, MAX_DOMINANT_THEMES);
  }

  /**
   * Calculate blended mood color from multiple archetypes
   */
  private calculateMoodColor(archetypes: string[]): string {
    if (archetypes.length === 0) {
      return DEFAULT_MOOD_COLOR;
    }

    // Get color for primary archetype
    const primaryArchetype = archetypes[0];
    const mapping = ARCHETYPE_MAPPINGS[primaryArchetype];

    if (!mapping) {
      return DEFAULT_MOOD_COLOR;
    }

    // For now, return the primary archetype's color
    // In future iterations, this could blend multiple colors
    return mapping.moodColor;
  }

  /**
   * Generate tone descriptors from archetypes and content
   */
  private generateToneDescriptors(profile: SummarizedLoreProfile): string[] {
    const descriptors = new Set<string>();

    // Add descriptors from archetypes
    profile.topArchetypes.forEach((archetype) => {
      const mapping = ARCHETYPE_MAPPINGS[archetype];
      if (mapping) {
        mapping.toneDescriptors.forEach((descriptor) =>
          descriptors.add(descriptor),
        );
      }
    });

    // Add descriptors based on content analysis
    if (profile.successfulDocuments > profile.failedDocuments) {
      descriptors.add("comprehensive");
    }

    if (profile.metaSummary.length > 200) {
      descriptors.add("detailed");
    }

    // Add descriptors from semantic keywords
    const topNouns = profile.allKeywords.nouns.slice(0, 3);
    topNouns.forEach((noun) => {
      if (KEYWORD_EMOTION_MAPPINGS[noun.toLowerCase()]) {
        const emotions = KEYWORD_EMOTION_MAPPINGS[noun.toLowerCase()];
        emotions.slice(0, 1).forEach((emotion) => descriptors.add(emotion));
      }
    });

    const result = Array.from(descriptors).slice(0, MAX_TONE_DESCRIPTORS);
    return result.length > 0 ? result : DEFAULT_TONE_DESCRIPTORS;
  }

  /**
   * Infer psychological and spiritual needs from content
   */
  private inferNeeds(profile: SummarizedLoreProfile): string[] {
    const needs = new Set<string>();

    // Add needs from archetypes
    profile.topArchetypes.forEach((archetype) => {
      const mapping = ARCHETYPE_MAPPINGS[archetype];
      if (mapping) {
        mapping.inferredNeeds.forEach((need) => needs.add(need));
      }
    });

    // Infer needs from content patterns
    const keywords = profile.allKeywords.nouns.concat(
      profile.allKeywords.verbs,
    );

    // Spiritual/mystical content suggests need for transcendence
    if (
      keywords.some((k) =>
        ["spiritual", "mystic", "sacred", "divine"].includes(k.toLowerCase()),
      )
    ) {
      needs.add("transcendence");
      needs.add("meaning");
    }

    // Adventure/journey content suggests need for growth
    if (
      keywords.some((k) =>
        ["journey", "adventure", "quest", "exploration"].includes(
          k.toLowerCase(),
        ),
      )
    ) {
      needs.add("growth");
      needs.add("discovery");
    }

    // Relationship content suggests need for connection
    if (
      keywords.some((k) =>
        ["love", "relationship", "connection", "community"].includes(
          k.toLowerCase(),
        ),
      )
    ) {
      needs.add("connection");
      needs.add("intimacy");
    }

    return Array.from(needs).slice(0, MAX_INFERRED_NEEDS);
  }

  /**
   * Group archetypes into meaningful constellation patterns
   */
  private groupArchetypesIntoConstellations(archetypes: string[]): string[] {
    const constellations = new Set<string>();

    archetypes.forEach((archetype) => {
      const mapping = ARCHETYPE_MAPPINGS[archetype];
      if (mapping) {
        constellations.add(mapping.constellationGroup);
      }
    });

    return Array.from(constellations);
  }

  /**
   * Create planet-to-mood-color mapping
   */
  private createPlanetMoodMap(archetypes: string[]): Record<string, string> {
    const planetMap: Record<string, string> = {};

    archetypes.forEach((archetype) => {
      const mapping = ARCHETYPE_MAPPINGS[archetype];
      if (mapping && mapping.planetAssociation) {
        planetMap[mapping.planetAssociation] =
          this.convertColorToMoodDescription(mapping.moodColor);
      }
    });

    return planetMap;
  }

  /**
   * Create archetype-to-color mapping
   */
  private createArchetypeColorMap(
    archetypes: string[],
  ): Record<string, string> {
    const colorMap: Record<string, string> = {};

    archetypes.forEach((archetype) => {
      const mapping = ARCHETYPE_MAPPINGS[archetype];
      if (mapping) {
        colorMap[archetype] = mapping.moodColor;
      }
    });

    return colorMap;
  }

  /**
   * Convert hex color to descriptive mood color name
   */
  private convertColorToMoodDescription(hexColor: string): string {
    const colorDescriptions: Record<string, string> = {
      "#FF6B35": "warm orange-red",
      "#2C1810": "deep shadow brown",
      "#FFB6C1": "soft pink",
      "#4169E1": "royal blue",
      "#9932CC": "mystical purple",
      "#F0F8FF": "pure light blue",
      "#32CD32": "vibrant green",
      "#DC143C": "fierce crimson",
      "#FFD700": "radiant gold",
      "#800080": "regal purple",
      "#98FB98": "gentle green",
      "#FF69B4": "playful pink",
      "#708090": "contemplative gray",
      "#B22222": "warrior red",
      "#4682B4": "wise steel blue",
      "#FF4500": "transformative orange",
      "#8B7CF6": "balanced violet", // Default
    };

    return colorDescriptions[hexColor] || "neutral violet";
  }

  /**
   * Validate archetype exists in mappings
   */
  public static isValidArchetype(archetype: string): boolean {
    return archetype in ARCHETYPE_MAPPINGS;
  }

  /**
   * Get available archetype options
   */
  public static getAvailableArchetypes(): string[] {
    return Object.keys(ARCHETYPE_MAPPINGS);
  }

  /**
   * Get archetype details for debugging/inspection
   */
  public static getArchetypeMapping(
    archetype: string,
  ): ArchetypeEmotionMapping | null {
    return ARCHETYPE_MAPPINGS[archetype] || null;
  }
}

// Export types and mappings for external use
export type { ArchetypeEmotionMapping };

export { ARCHETYPE_MAPPINGS, KEYWORD_EMOTION_MAPPINGS };
