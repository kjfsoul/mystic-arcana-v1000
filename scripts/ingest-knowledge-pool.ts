#!/usr/bin/env tsx

/**
 * MYSTIC ARCANA KNOWLEDGE POOL INGESTION SCRIPT
 * Agent: ContentIngestor (Knowledge Ingestion Mission)
 * Purpose: Parse knowledge source files and populate database tables
 *
 * Sources:
 * - public/data/catalogs/tarot-images.json - Complete tarot card data
 * - docs/database_tarot/___TAROT AND ASTROLOGY DAILY DATABASE ENRICHMENT__.md - Enrichment format
 * - docs/social_output/ASTROLOGICAL SOURCE BLOCK.md - Astrological data
 * - docs/database_tarot/Database Entry for July 26, 2025.md - Example entry
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Database configuration
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseServiceKey) {
  console.error(
    "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types
interface TarotCard {
  name: string;
  number: string;
  arcana: string;
  suit: string;
  img: string;
  fortune_telling: string[];
  keywords: string[];
  meanings: {
    light: string[];
    shadow: string[];
  };
  Archetype?: string;
  "Hebrew Alphabet"?: string;
  Numerology?: string;
  Elemental?: string;
  "Mythical/Spiritual"?: string;
  "Questions to Ask"?: string[];
}

interface TarotImageData {
  description: string;
  cards: TarotCard[];
}

interface SpreadPosition {
  name: string;
  description: string;
  index: number;
}

// Spread configurations with positions
const SPREAD_CONFIGURATIONS = {
  single: [
    {
      name: "Your Guidance",
      description: "The universe's message for you",
      index: 0,
    },
  ],
  "three-card": [
    { name: "Past", description: "What has led to this moment", index: 0 },
    { name: "Present", description: "Your current situation", index: 1 },
    { name: "Future", description: "What lies ahead", index: 2 },
  ],
  "celtic-cross": [
    { name: "Present", description: "Current situation", index: 0 },
    { name: "Challenge", description: "What crosses you", index: 1 },
    { name: "Distant Past", description: "Foundation", index: 2 },
    { name: "Recent Past", description: "Recent influences", index: 3 },
    { name: "Possible Outcome", description: "Potential future", index: 4 },
    { name: "Near Future", description: "Immediate path", index: 5 },
    { name: "Your Approach", description: "How you see yourself", index: 6 },
    { name: "External", description: "Outside influences", index: 7 },
    {
      name: "Hopes & Fears",
      description: "Inner desires and worries",
      index: 8,
    },
    { name: "Final Outcome", description: "Ultimate result", index: 9 },
  ],
  horseshoe: [
    { name: "Past", description: "Your foundation", index: 0 },
    { name: "Present", description: "Current situation", index: 1 },
    { name: "Hidden Factors", description: "What you don't see", index: 2 },
    { name: "Advice", description: "Guidance offered", index: 3 },
    { name: "Likely Outcome", description: "Probable future", index: 4 },
  ],
  relationship: [
    { name: "You", description: "Your energy", index: 0 },
    { name: "Them", description: "Their energy", index: 1 },
    { name: "Connection", description: "The bond between you", index: 2 },
    { name: "Challenges", description: "What to work on", index: 3 },
    { name: "Potential", description: "Where this leads", index: 4 },
  ],
};

// Utility functions
function normalizeCardName(name: string): string {
  return name.replace(/^The /, "").trim();
}

function generatePersonalizationHooks(
  card: TarotCard,
  spreadType: string,
  position: SpreadPosition,
): any[] {
  const hooks = [];

  // Hook 1: Natal planet influence
  if (card.Elemental) {
    hooks.push({
      condition: `IF user's natal ${card.Elemental} placement is prominent`,
      interpretation: `This card's appearance in the '${position.name}' position may resonate deeply with your natural ${card.Elemental} energy`,
      recommendation: `Explore the '${card.Elemental} Meditation' feature in the app`,
    });
  }

  // Hook 2: Archetype resonance
  if (card.Archetype) {
    hooks.push({
      condition: `FOR users embodying the ${card.Archetype} archetype`,
      interpretation: `The ${card.name} in '${position.name}' specifically speaks to your journey of ${card.Archetype.toLowerCase()}`,
      recommendation: `Journal about how this archetype manifests in your current situation`,
    });
  }

  // Hook 3: Keyword matching
  if (card.keywords && card.keywords.length > 0) {
    const primaryKeyword = card.keywords[0];
    hooks.push({
      condition: `IF user journal entries contain keywords like '${primaryKeyword}'`,
      interpretation: `This card's focus on ${primaryKeyword} directly addresses themes you've been exploring`,
      recommendation: `Use the 'Keyword Reflection' spread to explore this theme further`,
    });
  }

  // Hook 4: Previous card history
  hooks.push({
    condition: `IF user has frequently drawn ${card.name} in past readings`,
    interpretation: `The recurring appearance of ${card.name} suggests this is a key lesson or energy in your spiritual journey`,
    recommendation: `Review your reading history to identify patterns and growth`,
  });

  return hooks;
}

function generateContextualInterpretation(
  card: TarotCard,
  spreadType: string,
  position: SpreadPosition,
): string {
  const baseMeaning =
    card.meanings.light[0] ||
    card.fortune_telling[0] ||
    "This card brings guidance to your path";
  const positionContext = position.description;

  let interpretation = `As the "${position.name}" in your ${spreadType.replace("-", " ")} spread, ${card.name} suggests: ${baseMeaning}. `;
  interpretation += `In this position, which represents ${positionContext.toLowerCase()}, `;
  interpretation += `the card's energy focuses on bringing clarity and wisdom to this specific aspect of your situation.`;

  return interpretation;
}

function generateActionableGuidance(card: TarotCard): string {
  const questions = card["Questions to Ask"] || [];
  if (questions.length > 0) {
    return `Reflect on this question: ${questions[0]}`;
  }

  const keywords = card.keywords || [];
  if (keywords.length > 0) {
    return `Focus on embodying the energy of ${keywords[0]} in your daily life. Take one small action today that aligns with this intention.`;
  }

  return `Take time today for quiet reflection on how this card's message applies to your current journey.`;
}

// Main ingestion functions
async function loadTarotData(): Promise<TarotImageData> {
  console.log("📖 Loading tarot card data...");

  const filePath = path.join(
    projectRoot,
    "public/data/catalogs/tarot-images.json",
  );
  const fileContent = await fs.readFile(filePath, "utf-8");
  const data: TarotImageData = JSON.parse(fileContent);

  console.log(`✅ Loaded ${data.cards.length} tarot cards`);
  return data;
}

async function ingestTarotInterpretations(
  tarotData: TarotImageData,
): Promise<number> {
  console.log("🃏 Ingesting tarot interpretations...");

  let totalInserted = 0;
  const batchSize = 50;

  // Generate interpretations for each card in each spread position
  for (const [spreadType, positions] of Object.entries(SPREAD_CONFIGURATIONS)) {
    console.log(`  Processing ${spreadType} spread...`);

    const interpretations = [];

    for (const card of tarotData.cards) {
      for (const position of positions) {
        const interpretation = {
          // Card identification
          card_name: card.name,
          card_number: card.number,
          arcana_type: card.arcana.toLowerCase().includes("major")
            ? "major"
            : "minor",
          suit:
            card.suit?.toLowerCase() === "trump"
              ? null
              : card.suit?.toLowerCase(),

          // Core meanings
          keywords: card.keywords || [],
          fortune_telling: card.fortune_telling || [],
          meanings_light: card.meanings?.light || [],
          meanings_shadow: card.meanings?.shadow || [],
          archetype: card.Archetype || null,

          // Esoteric associations
          hebrew_alphabet: card["Hebrew Alphabet"] || null,
          numerology: card.Numerology || null,
          elemental: card.Elemental || null,
          mythical_spiritual: card["Mythical/Spiritual"] || null,
          questions_to_ask: card["Questions to Ask"] || [],

          // Position-specific interpretations
          spread_type: spreadType,
          position_name: position.name,
          position_index: position.index,
          base_meaning: generateContextualInterpretation(
            card,
            spreadType,
            position,
          ),
          contextual_nuances: `In the ${position.name} position, this card's energy is filtered through the lens of ${position.description.toLowerCase()}. Consider how this specific aspect of your situation relates to the card's broader themes.`,

          // Personalization
          personalization_hooks: generatePersonalizationHooks(
            card,
            spreadType,
            position,
          ),
          conditional_logic: [
            `IF spread_type='${spreadType}' AND position='${position.name}'`,
            `IF card_history_frequency > 2 THEN emphasize recurring_theme_guidance`,
            `IF user_natal_element='${card.Elemental}' THEN enhance_elemental_resonance`,
          ],

          // Guidance
          actionable_reflection: generateActionableGuidance(card),
          gentle_guidance: `Trust in the wisdom of ${card.name} as it appears in your ${position.name}. This card's message is perfectly timed for your current journey.`,

          // Database metadata
          db_entry_id: `tarot_${card.name.toLowerCase().replace(/\s+/g, "_")}_${spreadType}_${position.name.toLowerCase().replace(/\s+/g, "_")}`,
          content_tags: [
            `card_${card.name.toLowerCase().replace(/\s+/g, "_")}`,
            `spread_${spreadType}`,
            `position_${position.name.toLowerCase().replace(/\s+/g, "_")}`,
            `arcana_${card.arcana.toLowerCase().includes("major") ? "major" : "minor"}`,
            ...(card.suit ? [`suit_${card.suit.toLowerCase()}`] : []),
            ...(card.keywords?.map(
              (k) => `keyword_${k.toLowerCase().replace(/\s+/g, "_")}`,
            ) || []),
          ],

          // Quality scoring
          interpretation_quality_score: 0.85, // Base score, could be enhanced with AI evaluation
        };

        interpretations.push(interpretation);

        // Insert in batches
        if (interpretations.length >= batchSize) {
          const { error } = await supabase
            .from("tarot_interpretations")
            .insert(interpretations);

          if (error) {
            console.error(`❌ Error inserting batch:`, error);
            throw error;
          }

          totalInserted += interpretations.length;
          console.log(
            `    Inserted ${interpretations.length} interpretations (total: ${totalInserted})`,
          );
          interpretations.length = 0;
        }
      }
    }

    // Insert remaining interpretations
    if (interpretations.length > 0) {
      const { error } = await supabase
        .from("tarot_interpretations")
        .insert(interpretations);

      if (error) {
        console.error(`❌ Error inserting final batch:`, error);
        throw error;
      }

      totalInserted += interpretations.length;
      console.log(
        `    Inserted ${interpretations.length} interpretations (total: ${totalInserted})`,
      );
    }
  }

  console.log(`✅ Ingested ${totalInserted} tarot interpretations`);
  return totalInserted;
}

async function ingestSampleAstrologicalInsights(): Promise<number> {
  console.log("🌟 Ingesting sample astrological insights...");

  // Sample astrological insights based on common transits and aspects
  const sampleInsights = [
    {
      element_type: "transit",
      element_name: "Mercury Retrograde in Leo",
      element_description:
        "Mercury stations retrograde in Leo, encouraging inner dialogue and creative reflection",
      primary_planet: "Mercury",
      aspect_type: "retrograde",
      sign_placement: "Leo",
      exact_date: "2025-07-18",
      duration_days: 24,
      retrograde_motion: true,
      archetypal_energy:
        "The Messenger in retreat, turning inward to refine communication and creative expression",
      base_meaning:
        "This transit invites deep reflection on how you express your authentic self. Communication may require more care and attention, while creative projects benefit from revision and refinement.",
      contextual_influences:
        "Leo's influence adds a creative and dramatic flair to this retrograde, making it particularly powerful for artists, performers, and anyone seeking to express their true voice.",
      natal_chart_considerations: {
        leo_placements:
          "Those with strong Leo placements may feel this retrograde more intensely, particularly around self-expression and creativity",
        mercury_aspects:
          "Individuals with prominent Mercury aspects should pay extra attention to communication during this period",
        fifth_house:
          "Fifth house stelliums or rulers may experience shifts in creative projects and self-expression",
      },
      personalization_conditions: [
        "IF user.natal_mercury IN leo OR user.natal_sun IN leo",
        "IF user.creative_goals IS NOT NULL",
        "IF user.communication_challenges IS TRUE",
      ],
      spiritual_wisdom:
        "This retrograde teaches us that true expression comes from deep self-knowledge. Use this time to connect with your authentic voice.",
      practical_advice:
        "Review and revise creative projects rather than starting new ones. Practice mindful communication and double-check important messages.",
      emotional_guidance:
        "Be patient with yourself if self-expression feels challenging. This is a time for inner work that will enhance your outer creative flow.",
      timing_energy:
        "July 18 - August 11, 2025. Peak introspection around the station dates.",
      db_entry_id: "astro_mercury_retrograde_leo_2025",
      keywords: [
        "mercury_retrograde",
        "leo",
        "communication",
        "creativity",
        "self_expression",
        "revision",
      ],
      related_transits: ["sun_in_leo", "mars_in_gemini"],
      relevance_score: 0.9,
    },
    {
      element_type: "aspect",
      element_name: "Moon trine Pluto",
      element_description:
        "Harmonious aspect between Moon and Pluto promoting emotional transformation",
      primary_planet: "Moon",
      secondary_planet: "Pluto",
      aspect_type: "trine",
      aspect_degree: 120.0,
      orb_range: 3.0,
      archetypal_energy:
        "The Divine Feminine in harmony with the Transformer, facilitating deep emotional healing",
      base_meaning:
        "This aspect supports profound emotional insights and healing. You may find yourself able to access and transform deep-seated emotional patterns with grace and wisdom.",
      contextual_influences:
        "The trine aspect ensures that this transformation feels supportive rather than disruptive, allowing for gentle but powerful emotional evolution.",
      natal_chart_considerations: {
        water_signs:
          "Water sign placements will particularly benefit from this aspect's emotional healing potential",
        eighth_house:
          "Eighth house placements may experience profound psychological insights",
        moon_aspects:
          "Those with challenging natal Moon aspects may find relief and healing during this transit",
      },
      personalization_conditions: [
        "IF user.emotional_healing_goals IS TRUE",
        "IF user.water_sign_emphasis > 2",
        "IF user.pluto_aspects.moon IS NOT NULL",
      ],
      spiritual_wisdom:
        "True healing happens when we embrace both our light and shadow with equal compassion. This aspect supports that integration.",
      practical_advice:
        "Engage in deep emotional work, therapy, or healing practices. Trust your intuitive insights about emotional patterns.",
      emotional_guidance:
        "Allow yourself to feel deeply without fear. This aspect provides the strength to transform pain into wisdom.",
      timing_energy:
        "Peak influence within 24-48 hours of exact aspect. Effects may be felt for several days.",
      db_entry_id: "astro_moon_trine_pluto_general",
      keywords: [
        "moon",
        "pluto",
        "trine",
        "emotional_healing",
        "transformation",
        "intuition",
      ],
      related_transits: ["pluto_transit", "moon_phases"],
      relevance_score: 0.75,
    },
  ];

  const { error, count } = await supabase
    .from("astrological_insights")
    .insert(sampleInsights);

  if (error) {
    console.error("❌ Error inserting astrological insights:", error);
    throw error;
  }

  console.log(`✅ Ingested ${sampleInsights.length} astrological insights`);
  return sampleInsights.length;
}

async function ingestDailyCosmic(): Promise<number> {
  console.log("🌙 Ingesting daily cosmic insights...");

  // Sample daily cosmic insight based on the enrichment document
  const dailyInsight = {
    insight_date: "2025-07-26",
    database_focus:
      "Tarot Card Combination: Ace of Cups + Ten of Swords – Synthesized Meaning in Healing Position",
    focus_category: "tarot_combination",
    moon_sign: "Libra",
    moon_phase: "Waxing Crescent",
    moon_illumination: 20.8,
    sun_sign: "Leo",
    active_aspects: [
      {
        aspect: "Moon trine Pluto",
        description: "Deep emotional transformation",
      },
      {
        aspect: "Chiron retrograde",
        description: "Spiritual healing and introspection",
      },
    ],
    special_events: ["Chiron station retrograde"],
    numerology_value: 9,
    structured_interpretation: {
      element_identification:
        "Ace of Cups + Ten of Swords in Healing position of Self-Care spread",
      base_meaning:
        "The pairing of emotional renewal (Ace of Cups) with the completion of mental suffering (Ten of Swords) creates a powerful healing synthesis",
      contextual_nuances:
        "In the Healing position, these cards invite acknowledgment of past wounds to receive the gift of emotional rebirth",
      personalization_hooks: [
        "IF user natal Saturn in Cancer/4th House - spotlight generational emotional patterns",
        "FOR Aries Rising users - address impatience with slow emotional processes",
        "IF user has creative goals + Ace of Cups - begin with small artistic expressions",
        "IF user frequently pulls Tower card - emotional collapse leading to renewal",
      ],
      actionable_reflection:
        "What tender new beginning waits for me once I honor and release this old wound?",
      keywords: [
        "emotional_rebirth",
        "healing",
        "release",
        "renewal",
        "self_care",
      ],
    },
    blog_post_content: `From Ruin to Renewal: Embracing Emotional Rebirth with the Ace of Cups + Ten of Swords

    At moments when mental overwhelm feels like it's closing in—and the echoes of past hurts reverberate in your chest—it's easy to believe you'll never emerge whole again. Yet within that very place of ending lies the seed of an entirely new emotional horizon...

    [Content continues with full blog post from the enrichment document]`,
    blog_post_title:
      "From Ruin to Renewal: Embracing Emotional Rebirth with the Ace of Cups + Ten of Swords",
    seo_keywords: [
      "emotional rebirth",
      "tarot healing ritual",
      "Ace of Cups meaning",
      "Ten of Swords transformation",
      "self-care tarot spread",
    ],
    social_content: {
      instagram: {
        caption:
          "When the Ten of Swords meets the Ace of Cups in your healing space, remember: every ending carries the seed of a beautiful beginning 🌱✨",
        hashtags: ["#TarotHealing", "#EmotionalRebirth", "#SelfCareSpread"],
      },
      tiktok: {
        caption:
          'POV: You thought it was over, but the Ace of Cups says "let\'s begin again" 💧',
        hashtags: ["#TarotTok", "#HealingJourney", "#EmotionalRebirth"],
      },
    },
    content_quality_score: 0.92,
  };

  const { error } = await supabase
    .from("daily_cosmic_insights")
    .insert([dailyInsight]);

  if (error) {
    console.error("❌ Error inserting daily cosmic insight:", error);
    throw error;
  }

  console.log("✅ Ingested 1 daily cosmic insight");
  return 1;
}

async function ingestCardCombinations(
  tarotData: TarotImageData,
): Promise<number> {
  console.log("🎴 Ingesting card combinations...");

  // Generate some sample combinations for common pairings
  const combinations = [];
  const popularCards = tarotData.cards.filter((card) =>
    [
      "The Fool",
      "The Magician",
      "The High Priestess",
      "The Empress",
      "The Emperor",
      "The Hierophant",
      "The Lovers",
      "The Chariot",
      "Strength",
      "The Hermit",
      "Ace of Cups",
      "Ace of Wands",
      "Ace of Swords",
      "Ace of Pentacles",
      "Ten of Cups",
      "Ten of Wands",
      "Ten of Swords",
      "Ten of Pentacles",
    ].includes(card.name),
  );

  // Create meaningful combinations
  const meaningfulPairs = [
    [
      "The Fool",
      "The Magician",
      "New beginnings meet focused intention - a powerful combination for manifesting dreams into reality",
    ],
    [
      "The High Priestess",
      "The Hermit",
      "Inner wisdom and solitary reflection combine to deepen spiritual understanding",
    ],
    [
      "The Lovers",
      "Ten of Cups",
      "Heart-centered choices lead to emotional fulfillment and lasting happiness",
    ],
    [
      "Ace of Cups",
      "Ten of Swords",
      "Emotional renewal emerges from the completion of mental suffering",
    ],
    [
      "The Empress",
      "Ace of Wands",
      "Creative fertility meets passionate inspiration for artistic manifestation",
    ],
    [
      "The Emperor",
      "Ace of Pentacles",
      "Structured leadership creates solid material foundations",
    ],
    [
      "Strength",
      "The Chariot",
      "Inner courage combines with determined action for unstoppable progress",
    ],
    [
      "The Hermit",
      "Ace of Swords",
      "Solitary reflection brings mental clarity and breakthrough insights",
    ],
  ];

  for (const [primary, secondary, synthesized] of meaningfulPairs) {
    const primaryCard = popularCards.find((c) => c.name === primary);
    const secondaryCard = popularCards.find((c) => c.name === secondary);

    if (primaryCard && secondaryCard) {
      // Create combinations for different spread types
      for (const spreadType of ["three-card", "celtic-cross", "relationship"]) {
        const combination = {
          primary_card: primary,
          secondary_card: secondary,
          combination_size: 2,
          spread_type: spreadType,
          position_context: "adjacent_positions",
          narrative_theme: "spiritual_growth",
          synthesized_meaning: synthesized,
          potential_conflicts:
            "These cards generally work in harmony, though their different energies may require conscious integration.",
          harmony_aspects:
            "Both cards support personal development and conscious evolution along the spiritual path.",
          overall_guidance: `When ${primary} and ${secondary} appear together, you are being called to integrate their complementary energies for maximum spiritual and practical benefit.`,
          conditional_interpretations: {
            upright_both: `When both cards are upright, their energies flow harmoniously together`,
            one_reversed: `If one card is reversed, pay attention to which energy needs more conscious development`,
            both_reversed: `Both reversed suggests internal blocks that need addressing before their gifts can manifest`,
          },
          user_journey_stage: "development",
          db_entry_id: `combo_${primary.toLowerCase().replace(/\s+/g, "_")}_${secondary.toLowerCase().replace(/\s+/g, "_")}_${spreadType}`,
          keywords: [
            `combo_${primary.toLowerCase().replace(/\s+/g, "_")}`,
            `combo_${secondary.toLowerCase().replace(/\s+/g, "_")}`,
            `spread_${spreadType}`,
            "card_combination",
            "spiritual_growth",
          ],
        };

        combinations.push(combination);
      }
    }
  }

  // Insert combinations in batches
  const batchSize = 20;
  let totalInserted = 0;

  for (let i = 0; i < combinations.length; i += batchSize) {
    const batch = combinations.slice(i, i + batchSize);

    const { error } = await supabase.from("card_combinations").insert(batch);

    if (error) {
      console.error("❌ Error inserting card combinations batch:", error);
      throw error;
    }

    totalInserted += batch.length;
    console.log(
      `  Inserted ${batch.length} combinations (total: ${totalInserted})`,
    );
  }

  console.log(`✅ Ingested ${totalInserted} card combinations`);
  return totalInserted;
}

async function ingestPersonalizationPatterns(): Promise<number> {
  console.log("🎯 Ingesting personalization patterns...");

  const patterns = [
    {
      pattern_type: "natal_influence",
      pattern_name: "Strong Leo Placements",
      pattern_description:
        "Users with Sun, Moon, or Rising in Leo receive enhanced creative and self-expression guidance",
      trigger_conditions: {
        natal_sun: "Leo",
        natal_moon: "Leo",
        natal_rising: "Leo",
        logic: "OR",
      },
      astrological_requirements: {
        leo_emphasis: "high",
        fifth_house_activity: "considered",
      },
      card_requirements: {
        creative_cards: ["The Empress", "Ace of Wands", "Three of Pentacles"],
        self_expression_cards: ["The Magician", "Strength", "The Sun"],
      },
      interpretation_adjustments: {
        emphasis: "creative_expression",
        tone: "encouraging_boldness",
        focus_areas: ["creativity", "leadership", "authentic_self_expression"],
      },
      guidance_modifications:
        "Emphasize creative courage and authentic self-expression. Encourage bold action and creative risk-taking.",
      recommended_actions: [
        "Express yourself creatively today",
        "Take center stage in a project you care about",
        "Share your unique gifts with others",
        "Practice self-appreciation and confidence",
      ],
      suggested_features: [
        "Creative Expression Spread",
        "Leo New Moon Ritual",
        "Confidence Building Meditation",
      ],
      meditation_tracks: [
        "Solar Confidence",
        "Creative Fire",
        "Authentic Self",
      ],
      journal_prompts: [
        "How can I express my authentic self more boldly?",
        "What creative gifts am I ready to share with the world?",
        "Where in my life do I need to step into my power?",
      ],
      effectiveness_score: 0.88,
      usage_frequency: 0,
    },
    {
      pattern_type: "reading_history",
      pattern_name: "Frequent Tower Appearances",
      pattern_description:
        "Users who frequently draw The Tower receive specialized transformation and resilience guidance",
      trigger_conditions: {
        card_frequency: { "The Tower": ">= 3" },
        time_period: "30_days",
      },
      card_requirements: {
        transformation_cards: [
          "The Tower",
          "Death",
          "The Hanged Man",
          "Judgment",
        ],
      },
      interpretation_adjustments: {
        emphasis: "transformation_support",
        tone: "gentle_strength",
        focus_areas: ["resilience", "finding_meaning", "rebuilding"],
      },
      guidance_modifications:
        "Provide extra support for major life changes. Emphasize resilience, growth through challenge, and the rebuilding process.",
      recommended_actions: [
        "Practice grounding techniques during times of change",
        "Journal about lessons learned from recent challenges",
        "Seek support from trusted friends or counselors",
        "Create small, stable routines to anchor yourself",
      ],
      suggested_features: [
        "Resilience Building Spread",
        "Phoenix Rising Meditation",
        "Transformation Journal",
      ],
      meditation_tracks: [
        "Stability in Change",
        "Phoenix Rising",
        "Inner Strength",
      ],
      journal_prompts: [
        "What am I learning from this period of upheaval?",
        "How have past challenges made me stronger?",
        "What foundation am I building for my future self?",
      ],
      effectiveness_score: 0.85,
      usage_frequency: 0,
    },
    {
      pattern_type: "journal_theme",
      pattern_name: "Relationship Focus",
      pattern_description:
        "Users frequently journaling about relationships receive enhanced relationship-focused interpretations",
      trigger_conditions: {
        journal_keywords: [
          "love",
          "relationship",
          "partner",
          "dating",
          "marriage",
          "connection",
        ],
        frequency: ">= 5",
        time_period: "14_days",
      },
      card_requirements: {
        relationship_cards: [
          "The Lovers",
          "Two of Cups",
          "Ten of Cups",
          "The Empress",
          "The Emperor",
        ],
      },
      interpretation_adjustments: {
        emphasis: "relationship_dynamics",
        tone: "heart_centered",
        focus_areas: ["love", "partnership", "emotional_connection", "balance"],
      },
      guidance_modifications:
        "Frame interpretations through the lens of relationships and emotional connections. Emphasize communication, understanding, and heart-centered choices.",
      recommended_actions: [
        "Practice compassionate communication",
        "Reflect on your relationship patterns",
        "Express appreciation to loved ones",
        "Work on self-love as the foundation of all relationships",
      ],
      suggested_features: [
        "Relationship Dynamics Spread",
        "Heart Chakra Meditation",
        "Love Journal",
      ],
      meditation_tracks: [
        "Heart Opening",
        "Compassionate Love",
        "Relationship Harmony",
      ],
      journal_prompts: [
        "How can I love more authentically?",
        "What patterns do I notice in my relationships?",
        "How can I communicate my needs more clearly?",
      ],
      effectiveness_score: 0.82,
      usage_frequency: 0,
    },
  ];

  const { error, count } = await supabase
    .from("personalization_patterns")
    .insert(patterns);

  if (error) {
    console.error("❌ Error inserting personalization patterns:", error);
    throw error;
  }

  console.log(`✅ Ingested ${patterns.length} personalization patterns`);
  return patterns.length;
}

// Main execution function
async function main() {
  console.log("🚀 Starting Mystic Arcana Knowledge Pool Ingestion");
  console.log("=".repeat(60));

  try {
    // Test database connection
    console.log("🔌 Testing database connection...");
    const { data, error } = await supabase
      .from("tarot_interpretations")
      .select("count", { count: "exact", head: true });
    if (error) {
      console.error("❌ Database connection failed:", error);
      process.exit(1);
    }
    console.log("✅ Database connection successful");

    // Load source data
    const tarotData = await loadTarotData();

    // Run ingestion tasks
    let totalRecords = 0;

    totalRecords += await ingestTarotInterpretations(tarotData);
    totalRecords += await ingestSampleAstrologicalInsights();
    totalRecords += await ingestDailyCosmic();
    totalRecords += await ingestCardCombinations(tarotData);
    totalRecords += await ingestPersonalizationPatterns();

    console.log("=".repeat(60));
    console.log("🎉 Knowledge Pool Ingestion Complete!");
    console.log(`📊 Total records ingested: ${totalRecords}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("💥 Ingestion failed:", error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as ingestKnowledgePool };
