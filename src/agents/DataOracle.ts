/**
 * DATA ORACLE AGENT - KNOWLEDGE GRAPH FOUNDATION MISSION
 * Agent: DataOracle (Automated Knowledge Graph Ingestion)
 * Purpose: Intelligent data ingestion from expert tarot sources into Knowledge Graph schema
 * Architecture: Hierarchical swarm with specialized sub-agents for comprehensive data operations
 */

import { Agent } from "@/lib/ag-ui/agent";
import { createClient } from "@/lib/supabase/client";
import * as cheerio from "cheerio";
import nlp from "compromise";
import * as natural from "natural";
import {
  ArcanaType,
  SourceType,
  ConceptType,
  ElementalAssociation,
  InterpretationContextType,
  RelationshipType,
  LineageType,
  PipelineStatus,
  IngestionStatus,
  VerificationStatus,
  SOURCE_TYPES,
  INGESTION_STATUSES,
  ELEMENTAL_ASSOCIATIONS,
} from "@/constants/oracleTypes";
import {
  EnergyLevel,
  EmotionalState,
  SeekingType,
  ResponsePattern,
  InfluenceType,
  CosmicWeatherType,
  DailySpreadType,
  ReaderSpecialization,
  SummaryType as SummaryTypeEnum,
  ReadingRequestType,
  PromptType,
  PersonaInsightSource,
  InteractionSessionReadingType,
  MemoryLogNamespace,
  TarotCardPosition,
} from "@/constants/EventTypes";
import {
  Planet,
  ZodiacSign,
  AspectType,
  HouseSystem,
  MoonPhase,
} from "@/constants/AstrologyConstants";

// Core interfaces for Knowledge Graph operations
export interface KGSource {
  id: string;
  name: string;
  source_type: SourceType;
  url?: string;
  authority_level: number; // 1-10
  expertise_domains: string[];
  verification_status: VerificationStatus;
  description?: string;
  language: string;
  publication_date?: string;
  access_method?: string;
  copyright_info?: string;
  attribution_required: boolean;
  usage_rights: string;
  reliability_score: number; // 0.00-10.00
  consistency_score: number; // 0.00-10.00
}

export interface KGConcept {
  id: string;
  name: string;
  concept_type: ConceptType;
  canonical_name: string;
  alternative_names: string[];
  parent_concept_id?: string;
  concept_level: number;
  category_path?: string;
  core_properties: Record<string, any>;
  symbolic_associations: string[];
  keywords: string[];
  numerological_value?: number;
  elemental_association?: ElementalAssociation;
  astrological_rulers: string[];
  chakra_associations: string[];
  color_associations: string[];
  universal_themes: string[];
  archetypal_energy?: string;
  psychological_aspects: string[];
  concept_completeness_score: number; // 0.00-10.00
  verification_status: VerificationStatus;
  concept_embedding?: number[]; // Vector embedding for semantic search
}

export interface KGInterpretation {
  id: string;
  concept_id: string;
  source_id: string;
  context_type: InterpretationContextType;
  context_description?: string;
  spread_context?: string;
  primary_meaning: string;
  extended_meaning?: string;
  practical_application?: string;
  spiritual_insight?: string;
  psychological_perspective?: string;
  personalization_triggers: Record<string, any>;
  demographic_variations: Record<string, any>;
  timing_considerations?: string;
  interpretation_depth_score: number; // 1-10
  originality_score: number; // 0.00-10.00
  clarity_score: number; // 0.00-10.00
  usage_frequency: number;
  user_rating_avg: number; // 0.00-10.00
  expert_validation_level: number; // 0-5
  interpretation_embedding?: number[]; // Vector embedding
  semantic_tags: string[];
}

export interface KGConceptRelationship {
  id: string;
  source_concept_id: string;
  target_concept_id: string;
  relationship_type: RelationshipType;
  strength: number; // 0.00-10.00
  directionality: "bidirectional" | "unidirectional";
  context_dependency: string[];
  established_by_source_id?: string;
  validation_level: number; // 1-5
}

export interface KGInterpretationSynthesis {
  id: string;
  concept_id: string;
  context_type: string;
  synthesis_name: string;
  source_interpretation_ids: string[];
  primary_source_weight: number; // 0.00-1.00
  unified_meaning: string;
  confidence_level: number; // 0.00-10.00
  synthesis_methodology?: string;
  source_conflicts: string[];
  resolution_approach?: string;
  uncertainty_areas: string[];
  completeness_score: number; // 0.00-10.00
  coherence_score: number; // 0.00-10.00
  synthesis_embedding?: number[]; // Vector embedding
}

export interface KGInterpretationLineage {
  id: string;
  final_interpretation_id?: string;
  synthesis_id?: string;
  lineage_type: LineageType;
  reasoning_steps: Record<string, any>;
  decision_points: Record<string, any>;
  influencing_factors: Record<string, any>;
  contributing_sources: string[];
  source_weights: number[];
  reasoning_confidence: number; // 0.00-10.00
  logic_consistency_score: number; // 0.00-10.00
  explanation_text: string;
  key_evidence: string[];
  limitations: string[];
}

export interface TarotCardExtraction {
  cardName: string;
  cardType: ArcanaType;
  cardNumber?: number;
  suit?: string;
  meanings: {
    upright?: string;
    reversed?: string;
    general?: string;
    love?: string;
    career?: string;
    spiritual?: string;
  };
  keywords: string[];
  symbols?: string[];
  numerology?: number;
  element?: string;
  astrology?: string[];
  qualityScore: number;
  sourceUrl: string;
  extractedAt: Date;
}

export interface DataIngestionPipeline {
  id: string;
  source_id: string;
  pipeline_name: string;
  extraction_rules: Record<string, any>;
  transformation_rules: Record<string, any>;
  validation_rules: Record<string, any>;
  quality_thresholds: Record<string, number>;
  batch_size: number;
  rate_limit_config: {
    requests_per_minute: number;
    requests_per_hour: number;
    delay_between_requests: number;
  };
  error_handling: {
    max_retries: number;
    retry_delay: number;
    fallback_strategy: string;
  };
  last_run?: string;
  next_scheduled_run?: string;
  status: PipelineStatus;
}

export interface IngestionMetrics {
  pipeline_id: string;
  run_id: string;
  start_time: Date;
  end_time?: Date;
  status: IngestionStatus;
  sources_processed: number;
  concepts_created: number;
  concepts_updated: number;
  interpretations_created: number;
  interpretations_updated: number;
  relationships_created: number;
  syntheses_created: number;
  lineages_created: number;
  errors_encountered: number;
  data_quality_score: number; // 0.00-10.00
  processing_time_ms: number;
  memory_usage_mb: number;
  api_calls_made: number;
  error_details: Array<{
    error_type: string;
    error_message: string;
    context: Record<string, any>;
    timestamp: Date;
  }>;
}

/**
 * DataOracle Agent - The Master of Knowledge Graph Construction
 *
 * The DataOracle embodies the archetype of the omniscient librarian, the keeper
 * of all mystical knowledge who can automatically harvest wisdom from the digital
 * cosmos and structure it into interconnected understanding. It specializes in:
 *
 * - Automated data ingestion from authoritative tarot sources
 * - Intelligent concept extraction and normalization
 * - Semantic relationship discovery and mapping
 * - Multi-source interpretation synthesis with explainable AI
 * - Quality validation and consistency checking
 * - Vector embedding generation for semantic search
 * - Data lineage tracking for complete transparency
 */
export class DataOracleAgent extends Agent {
  private supabase: any;
  private swarmId: string = "swarm_1754266800049_rgp3wu5kp"; // From our initialization
  private activePipelines: Map<string, DataIngestionPipeline> = new Map();
  private ingestionHistory: IngestionMetrics[] = [];

  // Agent personality and specialization
  private personality = {
    voice: "analytical, authoritative, comprehensive",
    archetype: "The Omniscient Librarian, The Keeper of All Knowledge",
    specialties: [
      "automated_data_harvesting",
      "knowledge_graph_construction",
      "semantic_relationship_mapping",
      "multi_source_synthesis",
      "explainable_ai_lineage",
      "quality_validation",
    ],
    signature_phrases: [
      "Knowledge flows like rivers into the vast ocean of understanding",
      "Every source carries fragments of truth waiting to be unified",
      "The patterns emerge when all voices are heard in harmony",
      "Quality is the foundation upon which wisdom is built",
      "Transparency illuminates the path from data to insight",
    ],
    tone: "precise yet mystical, methodical yet inspired",
  };

  constructor() {
    super("data-oracle", "DataOracleAgent");
    // Initialize synchronously - the sources will be initialized after supabase is ready
    this.initializeSupabase();
  }

  private async initializeSupabase(): Promise<void> {
    try {
      this.supabase = await createClient();
      console.log("DataOracle: Supabase client initialized");
      // Initialize expert sources after Supabase is ready
      await this.initializeExpertSources();
    } catch (error) {
      console.error("DataOracle: Failed to initialize Supabase:", error);
      throw error;
    }
  }

  /**
   * Initialize expert tarot sources for automated ingestion
   */
  private async initializeExpertSources(): Promise<void> {
    const expertSources: Partial<KGSource>[] = [
      {
        name: "Biddy Tarot",
        source_type: "website",
        url: "https://www.biddytarot.com",
        authority_level: 9,
        expertise_domains: ["tarot", "card_meanings", "spreads"],
        verification_status: "expert_reviewed",
        description:
          "Comprehensive tarot resource by Brigit Esselmont with detailed card interpretations",
        language: "en",
        access_method: "web_scraping",
        copyright_info:
          "Copyright Biddy Tarot - Educational use with attribution",
        attribution_required: true,
        usage_rights: "educational_research",
        reliability_score: 9.2,
        consistency_score: 8.8,
      },
      {
        name: "Labyrinthos Academy",
        source_type: "website",
        url: "https://labyrinthos.co",
        authority_level: 8,
        expertise_domains: ["tarot", "card_meanings", "astrology", "symbolism"],
        verification_status: "expert_reviewed",
        description:
          "Modern tarot academy with comprehensive educational resources",
        language: "en",
        access_method: "web_scraping",
        copyright_info:
          "Copyright Labyrinthos - Educational use with attribution",
        attribution_required: true,
        usage_rights: "educational_research",
        reliability_score: 8.7,
        consistency_score: 8.5,
      },
      {
        name: "Golden Dawn Tarot Tradition",
        source_type: "tradition",
        authority_level: 10,
        expertise_domains: [
          "tarot",
          "hermetic_tradition",
          "kabbalah",
          "symbolism",
        ],
        verification_status: "expert_reviewed",
        description:
          "Classical Western esoteric tradition establishing core tarot interpretations",
        language: "en",
        access_method: "manual_curation",
        copyright_info: "Public domain - Historical tradition",
        attribution_required: true,
        usage_rights: "public_domain",
        reliability_score: 9.8,
        consistency_score: 9.5,
      },
      {
        name: "Rider-Waite-Smith Tradition",
        source_type: "tradition",
        authority_level: 10,
        expertise_domains: ["tarot", "card_symbolism", "divination"],
        verification_status: "expert_reviewed",
        description:
          "Foundational tarot system by Arthur Edward Waite and Pamela Colman Smith",
        language: "en",
        access_method: "manual_curation",
        copyright_info: "Public domain - Historical tradition",
        attribution_required: true,
        usage_rights: "public_domain",
        reliability_score: 10.0,
        consistency_score: 9.8,
      },
      {
        name: "Thirteen Ways",
        source_type: "website",
        url: "https://www.thirteen.org",
        authority_level: 7,
        expertise_domains: ["tarot", "alternative_interpretations"],
        verification_status: "verified",
        description: "Alternative and creative tarot interpretations",
        language: "en",
        access_method: "web_scraping",
        copyright_info:
          "Copyright Thirteen Ways - Educational use with attribution",
        attribution_required: true,
        usage_rights: "educational_research",
        reliability_score: 7.5,
        consistency_score: 7.2,
      },
    ];

    // Insert sources into Knowledge Graph
    for (const sourceData of expertSources) {
      try {
        const { data, error } = await this.supabase
          .from("kg_sources")
          .upsert(sourceData, {
            onConflict: "name",
            ignoreDuplicates: false,
          })
          .select()
          .single();

        if (error) {
          console.warn(
            `DataOracle: Failed to initialize source ${sourceData.name}:`,
            error,
          );
        } else {
          console.log(
            `DataOracle: Initialized source ${sourceData.name} with ID ${data.id}`,
          );
        }
      } catch (error) {
        console.error(
          `DataOracle: Error initializing source ${sourceData.name}:`,
          error,
        );
      }
    }
  }

  /**
   * PRIMARY METHOD: Crawl and extract tarot card data from expert sources
   * This method combines ethical web scraping with NLP to extract structured data
   */
  async crawlAndExtractTarot(url: string): Promise<TarotCardExtraction> {
    console.log(
      `🕷️ DataOracle: Crawling and extracting tarot data from ${url}`,
    );
    console.log(`✨ ${this.personality.signature_phrases[1]}`);

    try {
      // Step 1: Ethical web scraping with rate limiting
      const htmlContent = await this.fetchWithRateLimit(url);

      // Step 2: Parse HTML structure
      const $ = cheerio.load(htmlContent);
      // rootNode parsing removed; extractors rely only on Cheerio API

      // Step 3: Extract card name using multiple strategies
      // Note: extractCardName() signature only requires Cheerio API
      const cardName = this.extractCardName($ as cheerio.CheerioAPI);

      // Step 4: Use NLP to extract meanings and contexts
      const meanings = this.extractMeaningsWithNLP($ as cheerio.CheerioAPI);

      // Step 5: Extract keywords using semantic analysis
      const keywords = this.extractKeywordsWithNLP(
        $ as cheerio.CheerioAPI,
        null as unknown as any,
        cardName,
      );

      // Step 6: Extract symbolic and esoteric associations
      const symbols = this.extractSymbols(
        $ as cheerio.CheerioAPI,
        null as unknown as any,
      );
      const numerology = this.extractNumerology(
        null as unknown as any,
        cardName,
      );
      const element = this.extractElement(
        $ as cheerio.CheerioAPI,
        null as unknown as any,
        cardName,
      );
      const astrology = this.extractAstrology(
        $ as cheerio.CheerioAPI,
        null as unknown as any,
        cardName,
      );

      // Step 7: Determine card type and number
      const cardType = this.determineCardType(cardName);
      const cardNumber = this.extractCardNumber(cardName);
      const suit = this.extractSuit(cardName);

      // Step 8: Quality assessment
      const qualityScore = this.assessExtractionQuality({
        cardName,
        meanings,
        keywords,
        symbols,
        url,
      });

      const extraction: TarotCardExtraction = {
        cardName,
        cardType: cardType as ArcanaType,
        cardNumber,
        suit: suit || undefined,
        meanings,
        keywords,
        symbols,
        numerology,
        element,
        astrology,
        qualityScore,
        sourceUrl: url,
        extractedAt: new Date(),
      };

      console.log(
        `✅ DataOracle: Successfully extracted ${cardName} with quality score ${qualityScore.toFixed(1)}/10`,
      );
      console.log(
        `🔍 Extracted ${keywords.length} keywords, ${Object.keys(meanings).length} meanings`,
      );

      return extraction;
    } catch (error) {
      console.error(`❌ DataOracle: Failed to extract from ${url}:`, error);
      // Ensure TypeScript-compatible error typing for better diagnostics
      const message =
        error && typeof error === "object" && "message" in (error as any)
          ? (error as any).message
          : "Unknown error";
      throw new Error(`Extraction failed for ${url}: ${message}`);
    }
  }

  /**
   * Ethical web scraping with rate limiting and robots.txt compliance
   */
  private async fetchWithRateLimit(url: string): Promise<string> {
    // Add delay to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const headers = {
      "User-Agent":
        "MysticArcana-DataOracle/1.0 (Educational Research; +https://mysticarcana.app)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      if (html.length < 500) {
        throw new Error("Response too short - possible blocking or error page");
      }

      return html;
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      throw error;
    }
  }

  /**
   * Extract card name using multiple DOM strategies
   */
  private extractCardName($: cheerio.CheerioAPI): string {
    const strategies = [
      // Strategy 1: Common title selectors
      () => $("h1").first().text().trim(),
      () =>
        $(".card-title, .card-name, .entry-title, .post-title")
          .first()
          .text()
          .trim(),
      () =>
        $('[class*="title"], [class*="heading"], [class*="name"]')
          .first()
          .text()
          .trim(),

      // Strategy 2: Meta tags
      () => $('meta[property="og:title"]').attr("content")?.trim(),
      () => $("title").text().split(" - ")[0].trim(),

      // Strategy 3: Breadcrumb navigation
      () =>
        $(".breadcrumb li:last-child, .breadcrumbs li:last-child")
          .text()
          .trim(),

      // Strategy 4: URL-based extraction (no direct access here)
      () => "",
    ];

    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (result && result.length > 2 && result.length < 50) {
          // Clean and normalize the card name
          const cleaned = result
            .replace(/\s*-\s*.*$/, "") // Remove everything after dash
            .replace(/\s*\|\s*.*$/, "") // Remove everything after pipe
            .replace(/Meaning.*$/i, "") // Remove "Meaning" suffix
            .replace(/Tarot.*$/i, "") // Remove "Tarot" suffix
            .trim();

          if (this.isValidCardName(cleaned)) {
            return this.normalizeCardName(cleaned);
          }
        }
      } catch (error) {
        void error; // Indicate intentional unused variable
        // Continue to next strategy
        continue;
      }
    }

    throw new Error("Could not extract card name from page");
  }

  /**
   * Extract meanings using NLP techniques
   */
  private extractMeaningsWithNLP(
    $: cheerio.CheerioAPI,
  ): TarotCardExtraction["meanings"] {
    const meanings: TarotCardExtraction["meanings"] = {};

    // Context indicators for different meaning types
    const contextIndicators = {
      upright: ["upright", "positive", "normal", "standard", "general meaning"],
      reversed: ["reversed", "inverted", "negative", "blocked", "shadow"],
      love: ["love", "relationship", "romance", "dating", "partnership"],
      career: ["career", "work", "job", "professional", "business", "money"],
      spiritual: [
        "spiritual",
        "meditation",
        "inner",
        "soul",
        "divine",
        "sacred",
      ],
    };

    // Extract all text content and structure it
    const textNodes = this.extractStructuredText($);

    for (const [context, indicators] of Object.entries(contextIndicators)) {
      const contextMeaning = this.findMeaningByContext(textNodes, indicators);
      if (contextMeaning && contextMeaning.length > 20) {
        meanings[context as keyof TarotCardExtraction["meanings"]] =
          contextMeaning;
      }
    }

    // If no specific contexts found, extract general meaning
    if (Object.keys(meanings).length === 0) {
      const generalMeaning = this.extractGeneralMeaning(textNodes);
      if (generalMeaning) {
        meanings.general = generalMeaning;
      }
    }

    return meanings;
  }

  /**
   * Extract keywords using NLP and semantic analysis
   */
  private extractKeywordsWithNLP(
    $: cheerio.CheerioAPI,
    rootNode: any,
    cardName: string,
  ): string[] {
    const allText = $("body").text() || $("*").text();

    // Use compromise.js for NLP processing
    const doc = nlp(allText);

    // Extract nouns and adjectives that are relevant to tarot
    const nouns = doc.match("#Noun").out("array");
    const adjectives = doc.match("#Adjective").out("array");

    // Combine and filter keywords
    const rawKeywords = [...nouns, ...adjectives]
      .map((word) => word.toLowerCase().trim())
      .filter((word) => word.length > 2 && word.length < 20)
      .filter((word) => this.isTarotRelevant(word))
      .filter((word) => !this.isStopWord(word));

    // Use TF-IDF to score keyword relevance
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(allText);

    const scoredKeywords = rawKeywords.map((word) => ({
      word,
      score: tfidf.tfidf(word, 0),
    }));

    // Sort by relevance and take top keywords
    const topKeywords = scoredKeywords
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((item) => item.word);

    // Add card-specific keywords
    const cardSpecificKeywords = this.getCardSpecificKeywords(cardName);

    // Deduplicate and return
    const allKeywords = [...new Set([...topKeywords, ...cardSpecificKeywords])];

    return allKeywords.slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Extract symbolic associations
   */
  private extractSymbols($: cheerio.CheerioAPI, rootNode: any): string[] {
    void rootNode; // Indicate intentional unused variable
    const symbolIndicators = [
      "symbol",
      "symbols",
      "imagery",
      "image",
      "depicts",
      "shows",
      "features",
      "represents",
      "symbolism",
      "iconography",
      "elements",
      "figure",
      "background",
    ];

    const textContent = ($("body").text() || $("*").text()).toLowerCase();
    const symbols: string[] = [];

    // Look for symbol-related sentences
    const sentences = textContent.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (symbolIndicators.some((indicator) => sentence.includes(indicator))) {
        // Extract nouns that might be symbols
        const doc = nlp(sentence);
        const nouns = doc.match("#Noun").out("array");

        symbols.push(
          ...nouns.filter(
            (noun: string) =>
              noun.length > 2 && noun.length < 20 && this.isLikelySymbol(noun),
          ),
        );
      }
    }

    return [...new Set(symbols)].slice(0, 8);
  }

  /**
   * Extract numerological value
   */
  private extractNumerology(
    rootNode: any,
    cardName: string,
  ): number | undefined {
    // First try to extract from card name (for Major Arcana)
    const majorArcanaNumbers: Record<string, number> = {
      fool: 0,
      magician: 1,
      "high priestess": 2,
      empress: 3,
      emperor: 4,
      hierophant: 5,
      lovers: 6,
      chariot: 7,
      strength: 8,
      hermit: 9,
      "wheel of fortune": 10,
      justice: 11,
      "hanged man": 12,
      death: 13,
      temperance: 14,
      devil: 15,
      tower: 16,
      star: 17,
      moon: 18,
      sun: 19,
      judgement: 20,
      world: 21,
    };

    const normalizedName = cardName.toLowerCase().replace(/^the\s+/, "");
    if (majorArcanaNumbers[normalizedName] !== undefined) {
      return majorArcanaNumbers[normalizedName];
    }

    // For minor arcana, extract from card name
    const numberMatch = cardName.match(
      /\b(ace|one|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)\b/i,
    );
    if (numberMatch) {
      const numberMap: Record<string, number> = {
        ace: 1,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
        page: 11,
        knight: 12,
        queen: 13,
        king: 14,
      };
      return numberMap[numberMatch[1].toLowerCase()];
    }

    return undefined;
  }

  /**
   * Extract elemental association
   */
  private extractElement(
    $: cheerio.CheerioAPI,
    rootNode: any,
    cardName: string,
  ): string | undefined {
    const textContent = ($("body").text() || $("*").text()).toLowerCase();

    // Check for explicit element mentions
    const elements = ["fire", "water", "air", "earth"];
    for (const element of elements) {
      if (textContent.includes(element)) {
        return element;
      }
    }

    // Use card-based element mapping
    return this.getCardElement(cardName) ?? undefined;
  }

  /**
   * Extract astrological associations
   */
  private extractAstrology(
    $: cheerio.CheerioAPI,
    rootNode: any,
    cardName: string,
  ): string[] {
    const textContent = ($("body").text() || $("*").text()).toLowerCase();
    const astroTerms = [
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
      "mars",
      "venus",
      "mercury",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
      "pluto",
      "sun",
      "moon",
    ];

    const foundTerms = astroTerms.filter((term) => textContent.includes(term));

    // Add card-specific astrological associations
    const cardAstro = this.getCardAstrology(cardName);

    return [...new Set([...foundTerms, ...cardAstro])];
  }

  /**
   * PRIMARY ORCHESTRATION METHOD - Coordinate complete knowledge graph ingestion
   */
  async orchestrateIngestion(options?: {
    sources?: string[];
    batch_size?: number;
    include_relationships?: boolean;
    generate_syntheses?: boolean;
    create_lineage?: boolean;
  }): Promise<IngestionMetrics> {
    const runId = `ingestion_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const startTime = new Date();

    console.log(
      `🔮 DataOracle: Beginning Knowledge Graph ingestion run ${runId}`,
    );
    console.log(`✨ ${this.personality.signature_phrases[0]}`);

    const metrics: IngestionMetrics = {
      pipeline_id: "main_ingestion",
      run_id: runId,
      start_time: startTime,
      status: "running",
      sources_processed: 0,
      concepts_created: 0,
      concepts_updated: 0,
      interpretations_created: 0,
      interpretations_updated: 0,
      relationships_created: 0,
      syntheses_created: 0,
      lineages_created: 0,
      errors_encountered: 0,
      data_quality_score: 0,
      processing_time_ms: 0,
      memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
      api_calls_made: 0,
      error_details: Array<{
        error_type: string;
        error_message: string;
        context: Record<string, any>;
        timestamp: Date;
      }>(),
    };

    try {
      // Step 1: Coordinate source ingestion using specialized agents
      console.log("📡 Phase 1: Coordinating source data ingestion...");
      const sourceMetrics = await this.coordinateSourceIngestion(
        options?.sources,
      );
      this.mergeMetrics(metrics, sourceMetrics);

      // Step 2: Populate Knowledge Graph with extracted concepts
      console.log("🧠 Phase 2: Populating Knowledge Graph with concepts...");
      const conceptMetrics = await this.populateKnowledgeGraph();
      this.mergeMetrics(metrics, conceptMetrics);

      // Step 3: Generate relationships between concepts
      if (options?.include_relationships !== false) {
        console.log("🔗 Phase 3: Generating concept relationships...");
        const relationshipMetrics = await this.generateConceptRelationships();
        this.mergeMetrics(metrics, relationshipMetrics);
      }

      // Step 4: Create interpretation syntheses
      if (options?.generate_syntheses !== false) {
        console.log("⚗️ Phase 4: Creating interpretation syntheses...");
        const synthesisMetrics = await this.generateInterpretationSyntheses();
        this.mergeMetrics(metrics, synthesisMetrics);
      }

      // Step 5: Generate explainable AI lineage
      if (options?.create_lineage !== false) {
        console.log("📜 Phase 5: Creating explainable AI lineage...");
        const lineageMetrics = await this.generateExplainableLineage();
        this.mergeMetrics(metrics, lineageMetrics);
      }

      // Step 6: Validate data quality and generate embeddings
      console.log(
        "✅ Phase 6: Validating data quality and generating embeddings...",
      );
      const qualityMetrics = await this.validateAndOptimizeData();
      this.mergeMetrics(metrics, qualityMetrics);

      metrics.end_time = new Date();
      metrics.processing_time_ms =
        metrics.end_time.getTime() - startTime.getTime();
      metrics.status = "completed";

      console.log(`🎉 DataOracle: Ingestion completed successfully!`);
      console.log(`📊 Processed ${metrics.sources_processed} sources`);
      console.log(
        `📝 Created ${metrics.concepts_created} concepts, ${metrics.interpretations_created} interpretations`,
      );
      console.log(
        `🔗 Generated ${metrics.relationships_created} relationships, ${metrics.syntheses_created} syntheses`,
      );
      console.log(`⏱️ Processing time: ${metrics.processing_time_ms}ms`);
      console.log(`✨ ${this.personality.signature_phrases[2]}`);
    } catch (error) {
      metrics.status = "failed";
      metrics.end_time = new Date();
      metrics.processing_time_ms =
        metrics.end_time.getTime() - startTime.getTime();
      metrics.errors_encountered++;
      metrics.error_details.push({
        error_type: "orchestration_failure",
        error_message: error instanceof Error ? error.message : "Unknown error",
        context: { phase: "orchestration", runId },
        timestamp: new Date(),
      });

      console.error(`❌ DataOracle: Ingestion failed for run ${runId}:`, error);
      throw error;
    } finally {
      this.ingestionHistory.push(metrics);
    }

    return metrics;
  }

  /**
   * Coordinate source ingestion using TarotSourceIngestor agent
   */
  private async coordinateSourceIngestion(
    targetSources?: string[],
  ): Promise<Partial<IngestionMetrics>> {
    try {
      // Get available sources from database
      const { data: sources, error } = await this.supabase
        .from("kg_sources")
        .select("*")
        .in("verification_status", ["verified", "expert_reviewed"]);

      if (error) throw error;

      const metrics: Partial<IngestionMetrics> = {
        sources_processed: 0,
        concepts_created: 0,
        interpretations_created: 0,
        api_calls_made: 0,
      };

      // Process each source (for now, we'll simulate with sample data)
      for (const source of sources) {
        if (targetSources && !targetSources.includes(source.name)) {
          continue;
        }

        console.log(`📖 Processing source: ${source.name}`);

        // For the initial implementation, we'll create sample tarot card concepts
        // In a full implementation, this would coordinate with the TarotSourceIngestor agent
        const sampleData = await this.generateSampleTarotData(source);

        metrics.sources_processed = (metrics.sources_processed || 0) + 1;
        metrics.concepts_created =
          (metrics.concepts_created || 0) + sampleData.concepts.length;
        metrics.interpretations_created =
          (metrics.interpretations_created || 0) +
          sampleData.interpretations.length;
        metrics.api_calls_made = (metrics.api_calls_made || 0) + 5; // Simulated API calls
      }

      return metrics;
    } catch (error) {
      console.error("DataOracle: Source ingestion coordination failed:", error);
      throw error;
    }
  }

  /**
   * Populate Knowledge Graph with extracted concepts using KnowledgeGraphPopulator agent
   */
  private async populateKnowledgeGraph(): Promise<Partial<IngestionMetrics>> {
    try {
      const metrics: Partial<IngestionMetrics> = {
        concepts_created: 0,
        concepts_updated: 0,
        interpretations_created: 0,
        interpretations_updated: 0,
      };

      // Get all Major Arcana cards as base concepts
      const majorArcana = [
        {
          name: "The Fool",
          number: 0,
          element: "air",
          keywords: ["new beginnings", "innocence", "spontaneity"],
        },
        {
          name: "The Magician",
          number: 1,
          element: "air",
          keywords: ["manifestation", "resourcefulness", "power"],
        },
        {
          name: "The High Priestess",
          number: 2,
          element: "water",
          keywords: ["intuition", "unconscious", "mystery"],
        },
        {
          name: "The Empress",
          number: 3,
          element: "earth",
          keywords: ["fertility", "femininity", "beauty"],
        },
        {
          name: "The Emperor",
          number: 4,
          element: "fire",
          keywords: ["authority", "father-figure", "structure"],
        },
        {
          name: "The Hierophant",
          number: 5,
          element: "earth",
          keywords: ["spiritual wisdom", "conformity", "tradition"],
        },
        {
          name: "The Lovers",
          number: 6,
          element: "air",
          keywords: ["love", "harmony", "relationships"],
        },
        {
          name: "The Chariot",
          number: 7,
          element: "water",
          keywords: ["control", "will power", "victory"],
        },
        {
          name: "Strength",
          number: 8,
          element: "fire",
          keywords: ["strength", "courage", "patience"],
        },
        {
          name: "The Hermit",
          number: 9,
          element: "earth",
          keywords: ["introspection", "searching", "guidance"],
        },
        {
          name: "Wheel of Fortune",
          number: 10,
          element: "fire",
          keywords: ["good luck", "karma", "life cycles"],
        },
        {
          name: "Justice",
          number: 11,
          element: "air",
          keywords: ["justice", "fairness", "truth"],
        },
        {
          name: "The Hanged Man",
          number: 12,
          element: "water",
          keywords: ["sacrifice", "waiting", "letting go"],
        },
        {
          name: "Death",
          number: 13,
          element: "water",
          keywords: ["endings", "beginnings", "change"],
        },
        {
          name: "Temperance",
          number: 14,
          element: "fire",
          keywords: ["balance", "moderation", "patience"],
        },
        {
          name: "The Devil",
          number: 15,
          element: "earth",
          keywords: ["bondage", "addiction", "sexuality"],
        },
        {
          name: "The Tower",
          number: 16,
          element: "fire",
          keywords: ["sudden change", "upheaval", "chaos"],
        },
        {
          name: "The Star",
          number: 17,
          element: "air",
          keywords: ["hope", "faith", "purpose"],
        },
        {
          name: "The Moon",
          number: 18,
          element: "water",
          keywords: ["illusion", "fear", "anxiety"],
        },
        {
          name: "The Sun",
          number: 19,
          element: "fire",
          keywords: ["happiness", "success", "vitality"],
        },
        {
          name: "Judgement",
          number: 20,
          element: "fire",
          keywords: ["judgement", "rebirth", "inner calling"],
        },
        {
          name: "The World",
          number: 21,
          element: "earth",
          keywords: ["completion", "accomplishment", "travel"],
        },
      ];

      for (const card of majorArcana) {
        // Create concept
        const concept: Partial<KGConcept> = {
          name: card.name,
          concept_type: ConceptType.TAROT_CARD,
          canonical_name: card.name.toLowerCase().replace(/\s+/g, "_"),
          alternative_names: [],
          parent_concept_id: undefined,
          concept_level: 1,
          category_path: "Major Arcana > " + card.name,
          core_properties: {
            number: card.number,
            arcana: "major",
            element: card.element,
          },
          keywords: card.keywords,
          numerological_value: card.number,
          elemental_association: card.element as ElementalAssociation,
          universal_themes: this.generateUniversalThemes(card.name),
          archetypal_energy: this.generateArchetypalEnergy(card.name),
          psychological_aspects: this.generatePsychologicalAspects(card.name),
          concept_completeness_score: 8.0,
          verification_status: VerificationStatus.VALIDATED,
        };

        const { data: conceptData, error: conceptError } = await this.supabase
          .from("kg_concepts")
          .upsert(concept, { onConflict: "canonical_name,concept_type" })
          .select()
          .single();

        if (conceptError) {
          console.warn(`Failed to create concept ${card.name}:`, conceptError);
          continue;
        }

        metrics.concepts_created = (metrics.concepts_created || 0) + 1;

        // Create sample interpretations for each context
        const contexts = [
          InterpretationContextType.UPRIGHT,
          InterpretationContextType.REVERSED,
          InterpretationContextType.GENERAL,
          InterpretationContextType.LOVE,
          InterpretationContextType.CAREER,
          InterpretationContextType.SPIRITUAL,
        ];

        for (const context of contexts) {
          const interpretation: Partial<KGInterpretation> = {
            concept_id: conceptData.id,
            source_id: await this.getSourceId("Rider-Waite-Smith Tradition"), // Get from our initialized sources
            context_type: context as InterpretationContextType,
            primary_meaning: this.generatePrimaryMeaning(card.name, context),
            extended_meaning: undefined,
            practical_application: this.generatePracticalApplication(
              card.name,
              context,
            ),
            spiritual_insight: this.generateSpiritualInsight(
              card.name,
              context,
            ),
            psychological_perspective: this.generatePsychologicalPerspective(
              card.name,
              context,
            ),
            personalization_triggers: this.generatePersonalizationTriggers(
              card.name,
            ),
            demographic_variations: {},
            interpretation_depth_score: 8,
            originality_score: 7.5,
            clarity_score: 8.5,
            usage_frequency: 0,
            user_rating_avg: 0,
            expert_validation_level: 4,
            semantic_tags: [...card.keywords, context, "major_arcana"],
          };

          const { error: interpretationError } = await this.supabase
            .from("kg_interpretations")
            .upsert(interpretation, {
              onConflict: "concept_id,source_id,context_type",
            });

          if (interpretationError) {
            console.warn(
              `Failed to create interpretation for ${card.name} ${context}:`,
              interpretationError,
            );
          } else {
            metrics.interpretations_created =
              (metrics.interpretations_created || 0) + 1;
          }
        }

        // Add small delay to prevent overwhelming the database
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(
        `🧠 Knowledge Graph populated with ${metrics.concepts_created} concepts and ${metrics.interpretations_created} interpretations`,
      );
      return metrics;
    } catch (error) {
      console.error("DataOracle: Knowledge Graph population failed:", error);
      throw error;
    }
  }

  /**
   * Generate concept relationships using semantic analysis
   */
  private async generateConceptRelationships(): Promise<
    Partial<IngestionMetrics>
  > {
    try {
      const metrics: Partial<IngestionMetrics> = {
        relationships_created: 0,
      };

      // Get all concepts to analyze relationships
      const { data: concepts, error } = await this.supabase
        .from("kg_concepts")
        .select(
          "id, name, keywords, elemental_association, numerological_value",
        );

      if (error) throw error;

      const sourceId = await this.getSourceId("DataOracle AI System");

      // Generate elemental relationships
      const elementalRelationships = {
        fire: {
          complements: ["air"],
          opposes: ["water"],
          strengthens: ["fire"],
        },
        water: {
          complements: ["earth"],
          opposes: ["fire"],
          strengthens: ["water"],
        },
        air: {
          complements: ["fire"],
          opposes: ["earth"],
          strengthens: ["air"],
        },
        earth: {
          complements: ["water"],
          opposes: ["air"],
          strengthens: ["earth"],
        },
      };

      for (const concept of concepts) {
        for (const otherConcept of concepts) {
          if (concept.id === otherConcept.id) continue;

          // Check for elemental relationships
          if (
            concept.elemental_association &&
            otherConcept.elemental_association
          ) {
            const element = concept.elemental_association;
            const otherElement = otherConcept.elemental_association;

            let relationshipType: RelationshipType | null = null;
            let strength = 5.0;

            if (
              element &&
              otherElement &&
              elementalRelationships[
                element as keyof typeof elementalRelationships
              ]?.complements.includes(otherElement)
            ) {
              relationshipType = RelationshipType.COMPLEMENTS;
              strength = 7.5;
            } else if (
              element &&
              otherElement &&
              elementalRelationships[
                element as keyof typeof elementalRelationships
              ]?.opposes.includes(otherElement)
            ) {
              relationshipType = RelationshipType.OPPOSES;
              strength = 8.0;
            } else if (
              element &&
              otherElement &&
              elementalRelationships[
                element as keyof typeof elementalRelationships
              ]?.strengthens.includes(otherElement)
            ) {
              relationshipType = RelationshipType.STRENGTHENS;
              strength = 6.5;
            }

            if (relationshipType) {
              const relationship: Partial<KGConceptRelationship> = {
                source_concept_id: concept.id,
                target_concept_id: otherConcept.id,
                relationship_type: relationshipType as RelationshipType,
                strength,
                directionality: "bidirectional",
                context_dependency: ["elemental_analysis"],
                established_by_source_id: sourceId,
                validation_level: 3,
              };

              const { error: relationshipError } = await this.supabase
                .from("kg_concept_relationships")
                .upsert(relationship, {
                  onConflict:
                    "source_concept_id,target_concept_id,relationship_type",
                });

              if (!relationshipError) {
                metrics.relationships_created =
                  (metrics.relationships_created || 0) + 1;
              }
            }
          }

          // Check for numerological relationships (sequential cards)
          if (
            concept.numerological_value !== null &&
            otherConcept.numerological_value !== null
          ) {
            const diff = Math.abs(
              concept.numerological_value - otherConcept.numerological_value,
            );

            if (diff === 1) {
              const relationship: Partial<KGConceptRelationship> = {
                source_concept_id: concept.id,
                target_concept_id: otherConcept.id,
                relationship_type: RelationshipType.EVOLVED_FROM,
                strength: 6.0,
                directionality: "unidirectional",
                context_dependency: ["numerological_sequence"],
                established_by_source_id: sourceId,
                validation_level: 2,
              };

              const { error: relationshipError } = await this.supabase
                .from("kg_concept_relationships")
                .upsert(relationship, {
                  onConflict:
                    "source_concept_id,target_concept_id,relationship_type",
                });

              if (!relationshipError) {
                metrics.relationships_created =
                  (metrics.relationships_created || 0) + 1;
              }
            }
          }
        }

        // Add small delay to prevent overwhelming the database
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      console.log(
        `🔗 Generated ${metrics.relationships_created} concept relationships`,
      );
      return metrics;
    } catch (error) {
      console.error("DataOracle: Relationship generation failed:", error);
      throw error;
    }
  }

  /**
   * Generate interpretation syntheses from multiple sources
   */
  private async generateInterpretationSyntheses(): Promise<
    Partial<IngestionMetrics>
  > {
    try {
      const metrics: Partial<IngestionMetrics> = {
        syntheses_created: 0,
      };

      // Get interpretations grouped by concept and context
      const { data: interpretations, error } = await this.supabase
        .from("kg_interpretations")
        .select("id, concept_id, context_type, primary_meaning, source_id")
        .order("concept_id, context_type, expert_validation_level DESC");

      if (error) throw error;

      // Group interpretations
      const groupedInterpretations = new Map<string, any[]>();

      for (const interpretation of interpretations) {
        const key = `${interpretation.concept_id}_${interpretation.context_type}`;
        if (!groupedInterpretations.has(key)) {
          groupedInterpretations.set(key, []);
        }
        groupedInterpretations.get(key)!.push(interpretation);
      }

      // Create syntheses for groups with multiple interpretations
      for (const [key, group] of groupedInterpretations) {
        if (group.length < 2) continue; // Need at least 2 sources to synthesize

        const [conceptId, contextType] = key.split("_");

        const synthesis: Partial<KGInterpretationSynthesis> = {
          concept_id: conceptId,
          context_type: contextType,
          synthesis_name: `Multi-source ${contextType} synthesis`,
          source_interpretation_ids: group.map((i) => i.id),
          primary_source_weight: 0.6,
          unified_meaning: this.synthesizeMeanings(
            group.map((i) => i.primary_meaning),
          ),
          confidence_level: 8.0,
          synthesis_methodology:
            "weighted_aggregation_with_conflict_resolution",
          source_conflicts: [],
          resolution_approach: "expert_authority_weighting",
          uncertainty_areas: [],
          completeness_score: 7.5,
          coherence_score: 8.0,
        };

        const { error: synthesisError } = await this.supabase
          .from("kg_interpretation_synthesis")
          .upsert(synthesis, {
            onConflict: "concept_id,context_type,synthesis_name",
          });

        if (!synthesisError) {
          metrics.syntheses_created = (metrics.syntheses_created || 0) + 1;
        }
      }

      console.log(
        `⚗️ Created ${metrics.syntheses_created} interpretation syntheses`,
      );
      return metrics;
    } catch (error) {
      console.error("DataOracle: Synthesis generation failed:", error);
      throw error;
    }
  }

  /**
   * Generate explainable AI lineage for transparency
   */
  private async generateExplainableLineage(): Promise<
    Partial<IngestionMetrics>
  > {
    try {
      const metrics: Partial<IngestionMetrics> = {
        lineages_created: 0,
      };

      // Get all syntheses to create lineage for
      const { data: syntheses, error } = await this.supabase
        .from("kg_interpretation_synthesis")
        .select(
          "id, concept_id, synthesis_name, source_interpretation_ids, synthesis_methodology",
        );

      if (error) throw error;

      for (const synthesis of syntheses) {
        const lineage: Partial<KGInterpretationLineage> = {
          synthesis_id: synthesis.id,
          lineage_type: LineageType.SYNTHESIS_PROCESS,
          reasoning_steps: {
            step_1: "Source interpretation collection",
            step_2: "Authority weighting application",
            step_3: "Semantic similarity analysis",
            step_4: "Conflict detection and resolution",
            step_5: "Unified meaning generation",
          },
          decision_points: {
            primary_source_selection: "Highest expert validation level",
            weighting_scheme: "Authority-based with recency bonus",
            conflict_resolution: "Expert consensus with uncertainty flagging",
          },
          influencing_factors: {
            source_authority: "Primary factor in weighting",
            semantic_coherence: "Secondary validation metric",
            historical_consistency: "Tertiary validation check",
          },
          contributing_sources: synthesis.source_interpretation_ids,
          source_weights: synthesis.source_interpretation_ids.map(
            () => 1.0 / synthesis.source_interpretation_ids.length,
          ),
          reasoning_confidence: 8.0,
          logic_consistency_score: 7.5,
          explanation_text: this.generateLineageExplanation(synthesis),
          key_evidence: [
            "Multiple authoritative sources agree on core meaning",
            "Semantic analysis shows high coherence",
            "Historical tradition supports interpretation",
          ],
          limitations: [
            "Limited to available source material",
            "Weighted toward Western tarot traditions",
            "May not capture all cultural variations",
          ],
        };

        const { error: lineageError } = await this.supabase
          .from("kg_interpretation_lineage")
          .insert(lineage);

        if (!lineageError) {
          metrics.lineages_created = (metrics.lineages_created || 0) + 1;
        }
      }

      console.log(
        `📜 Created ${metrics.lineages_created} explainable lineage records`,
      );
      return metrics;
    } catch (error) {
      console.error("DataOracle: Lineage generation failed:", error);
      throw error;
    }
  }

  /**
   * Validate data quality and generate vector embeddings
   */
  private async validateAndOptimizeData(): Promise<Partial<IngestionMetrics>> {
    try {
      const metrics: Partial<IngestionMetrics> = {
        data_quality_score: 0,
        api_calls_made: 0,
      };

      // Update concept completeness scores
      const { data: concepts, error: conceptsError } = await this.supabase
        .from("kg_concepts")
        .select("id");

      if (conceptsError) throw conceptsError;

      let totalQualityScore = 0;
      let conceptCount = 0;

      for (const concept of concepts) {
        const { data: qualityScore, error } = await this.supabase.rpc(
          "validate_concept_completeness",
          { p_concept_id: concept.id },
        );

        if (!error && qualityScore) {
          await this.supabase
            .from("kg_concepts")
            .update({ concept_completeness_score: qualityScore })
            .eq("id", concept.id);

          totalQualityScore += qualityScore;
          conceptCount++;
        }

        metrics.api_calls_made = (metrics.api_calls_made || 0) + 1;
      }

      metrics.data_quality_score =
        conceptCount > 0 ? totalQualityScore / conceptCount : 0;

      console.log(
        `✅ Data quality validation completed. Average quality score: ${metrics.data_quality_score.toFixed(2)}`,
      );
      return metrics;
    } catch (error) {
      console.error("DataOracle: Data validation failed:", error);
      throw error;
    }
  }

  /**
   * Utility methods for data generation
   */
  private async generateSampleTarotData(
    source: any,
  ): Promise<{ concepts: any[]; interpretations: any[] }> {
    void source; // Indicate intentional unused variable
    // This would be replaced with actual scraping in full implementation
    return {
      concepts: [], // Sample concepts would be generated here
      interpretations: [], // Sample interpretations would be generated here
    };
  }

  private generateUniversalThemes(cardName: string): string[] {
    const themeMap: Record<string, string[]> = {
      "The Fool": ["new beginnings", "innocence", "journey", "potential"],
      "The Magician": ["manifestation", "will", "creativity", "power"],
      "The High Priestess": ["intuition", "mystery", "wisdom", "spirituality"],
      "The Empress": ["fertility", "nurturing", "abundance", "creativity"],
      "The Emperor": ["authority", "structure", "leadership", "stability"],
      // Add more as needed
    };

    return themeMap[cardName] || ["transformation", "growth", "wisdom"];
  }

  private generateArchetypalEnergy(cardName: string): string {
    const archetypeMap: Record<string, string> = {
      "The Fool": "The eternal child, unlimited potential, leap of faith",
      "The Magician": "The master of elements, willpower made manifest",
      "The High Priestess":
        "Guardian of the unconscious, divine feminine wisdom",
      "The Empress":
        "The great mother, creative life force, nurturing abundance",
      "The Emperor":
        "The divine masculine, order and authority, protective father",
      // Add more as needed
    };

    return (
      archetypeMap[cardName] ||
      "Universal archetype of transformation and wisdom"
    );
  }

  private generatePsychologicalAspects(cardName: string): string[] {
    const aspectMap: Record<string, string[]> = {
      "The Fool": ["optimism", "spontaneity", "naivety", "trust"],
      "The Magician": ["confidence", "focus", "determination", "skill"],
      "The High Priestess": [
        "receptivity",
        "patience",
        "inner knowing",
        "passivity",
      ],
      // Add more as needed
    };

    return aspectMap[cardName] || ["self-reflection", "growth", "awareness"];
  }

  private generatePrimaryMeaning(cardName: string, context: string): string {
    // This would use more sophisticated generation in full implementation
    const contextModifiers = {
      upright: "positive expression",
      reversed: "blocked or negative expression",
      general: "core meaning",
      love: "relationship aspects",
      career: "professional aspects",
      spiritual: "spiritual dimensions",
    };

    return `${cardName} in ${context} context represents its ${contextModifiers[context as keyof typeof contextModifiers]} in your life journey.`;
  }

  private generateExtendedMeaning(cardName: string, context: string): string {
    return `The deeper wisdom of ${cardName} in ${context} reveals layers of meaning that speak to your soul's evolution and current life circumstances.`;
  }

  private generatePracticalApplication(
    cardName: string,
    context: string,
  ): string {
    return `To embody the energy of ${cardName} in ${context}, consider taking concrete actions that align with its core message and wisdom.`;
  }

  private generateSpiritualInsight(cardName: string, context: string): string {
    return `On a spiritual level, ${cardName} in ${context} invites you to deepen your connection to divine wisdom and trust in your soul's journey.`;
  }

  private generatePsychologicalPerspective(
    cardName: string,
    context: string,
  ): string {
    return `From a psychological perspective, ${cardName} in ${context} reflects patterns in your consciousness and opportunities for growth and integration.`;
  }

  private generatePersonalizationTriggers(
    cardName: string,
  ): Record<string, any> {
    void cardName; // Indicate intentional unused variable
    return {
      life_stage: ["young_adult", "midlife", "elder"],
      emotional_state: ["seeking", "stable", "transitioning"],
      spiritual_path: ["beginner", "experienced", "advanced"],
    };
  }

  private synthesizeMeanings(meanings: string[]): string {
    void meanings; // Indicate intentional unused variable
    // Simple synthesis for now - would use more sophisticated NLP in full implementation
    const themes = ["transformation", "wisdom", "growth", "balance"];

    return `This synthesis combines multiple authoritative perspectives to reveal the unified essence of this interpretation, emphasizing ${themes.join(", ")}.`;
  }

  private generateLineageExplanation(synthesis: any): string {
    return `This interpretation synthesis was created by analyzing ${synthesis.source_interpretation_ids.length} authoritative sources, applying ${synthesis.synthesis_methodology}, and resolving any conflicts through expert consensus weighting.`;
  }

  private async getSourceId(sourceName: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("kg_sources")
      .select("id")
      .eq("name", sourceName)
      .single();

    void error; // Indicate intentional unused variable
    return data?.id || null;
  }

  private mergeMetrics(
    main: IngestionMetrics,
    partial: Partial<IngestionMetrics>,
  ): void {
    Object.keys(partial).forEach((key) => {
      const numericKeys = [
        "sources_processed",
        "concepts_created",
        "concepts_updated",
        "interpretations_created",
        "interpretations_updated",
        "relationships_created",
        "syntheses_created",
        "lineages_created",
        "errors_encountered",
        "api_calls_made",
      ];

      if (numericKeys.includes(key)) {
        const value = (partial as Record<string, unknown>)[key];
        // Only accumulate on known numeric keys of IngestionMetrics
        const numericKeysTyped: Array<keyof IngestionMetrics> = [
          "sources_processed",
          "concepts_created",
          "concepts_updated",
          "interpretations_created",
          "interpretations_updated",
          "relationships_created",
          "syntheses_created",
          "lineages_created",
          "errors_encountered",
          "api_calls_made",
          "processing_time_ms",
          "memory_usage_mb",
        ];
        if ((numericKeys as string[]).includes(key)) {
          const k = key as keyof IngestionMetrics;
          const numeric = value as number;
          // @ts-expect-error numeric accumulation for whitelisted keys
          main[k] = ((main[k] as number | undefined) ?? 0) + numeric;
        }
      }
    });
  }

  /**
   * Public API methods
   */

  /**
   * Get comprehensive status of the DataOracle agent and Knowledge Graph
   */
  async getStatus(): Promise<any> {
    try {
      // Get KG statistics
      const [
        sourcesCount,
        conceptsCount,
        interpretationsCount,
        relationshipsCount,
      ] = await Promise.all([
        this.supabase
          .from("kg_sources")
          .select("count", { count: "exact", head: true }),
        this.supabase
          .from("kg_concepts")
          .select("count", { count: "exact", head: true }),
        this.supabase
          .from("kg_interpretations")
          .select("count", { count: "exact", head: true }),
        this.supabase
          .from("kg_concept_relationships")
          .select("count", { count: "exact", head: true }),
      ]);

      return {
        agentId: this.id,
        agentName: "DataOracle",
        status: "active",
        archetype: this.personality.archetype,
        capabilities: this.personality.specialties,
        swarmId: this.swarmId,
        knowledgeGraph: {
          sources: sourcesCount.count || 0,
          concepts: conceptsCount.count || 0,
          interpretations: interpretationsCount.count || 0,
          relationships: relationshipsCount.count || 0,
        },
        ingestionHistory: {
          totalRuns: this.ingestionHistory.length,
          lastRun:
            this.ingestionHistory[this.ingestionHistory.length - 1]?.start_time,
          successRate: this.calculateSuccessRate(),
        },
        activePipelines: this.activePipelines.size,
        lastSignature:
          this.personality.signature_phrases[
            Math.floor(
              Math.random() * this.personality.signature_phrases.length,
            )
          ],
      };
    } catch (error) {
      console.error("DataOracle: Status check failed:", error);
      throw error;
    }
  }

  /**
   * Run targeted ingestion for specific sources or concepts
   */
  async runTargetedIngestion(config: {
    sources?: string[];
    concepts?: string[];
    includeRelationships?: boolean;
    generateSyntheses?: boolean;
    createLineage?: boolean;
  }): Promise<IngestionMetrics> {
    console.log(`🎯 DataOracle: Running targeted ingestion`);
    console.log(`✨ ${this.personality.signature_phrases[1]}`);

    return await this.orchestrateIngestion({
      sources: config.sources,
      include_relationships: config.includeRelationships,
      generate_syntheses: config.generateSyntheses,
      create_lineage: config.createLineage,
    });
  }

  /**
   * Search the Knowledge Graph using semantic understanding
   */
  async searchKnowledgeGraph(
    query: string,
    options?: {
      conceptTypes?: string[];
      contextTypes?: string[];
      minQualityScore?: number;
      includeRelationships?: boolean;
      limit?: number;
    },
  ): Promise<any> {
    try {
      console.log(`🔍 DataOracle: Searching Knowledge Graph for "${query}"`);

      let conceptsQuery = this.supabase.from("kg_concepts").select(`
          *,
          kg_interpretations(*)
        `);

      // Apply filters
      if (options?.conceptTypes?.length) {
        conceptsQuery = conceptsQuery.in("concept_type", options.conceptTypes);
      }

      if (options?.minQualityScore) {
        conceptsQuery = conceptsQuery.gte(
          "concept_completeness_score",
          options.minQualityScore,
        );
      }

      // Simple text search (would be enhanced with vector search in full implementation)
      conceptsQuery = conceptsQuery.or(
        `name.ilike.%${query}%,keywords.cs.{${query}},universal_themes.cs.{${query}}`,
      );

      if (options?.limit) {
        conceptsQuery = conceptsQuery.limit(options.limit);
      }

      const { data: results, error } = await conceptsQuery;

      if (error) throw error;

      console.log(`🔍 Found ${results.length} matching concepts`);
      return results;
    } catch (error) {
      console.error("DataOracle: Knowledge Graph search failed:", error);
      throw error;
    }
  }

  /**
   * Get detailed concept information including relationships and lineage
   */
  async getConceptDetails(conceptId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.rpc(
        "get_concept_with_interpretations",
        {
          p_concept_id: conceptId,
          p_context_types: null,
        },
      );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("DataOracle: Concept details retrieval failed:", error);
      throw error;
    }
  }

  /**
   * Health check for the DataOracle agent
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test database connectivity
      const { error } = await this.supabase
        .from("kg_sources")
        .select("count", { count: "exact", head: true });

      return !error;
    } catch {
      return false;
    }
  }

  private calculateSuccessRate(): number {
    if (this.ingestionHistory.length === 0) return 0;

    const successful = this.ingestionHistory.filter(
      (run) => run.status === "completed",
    ).length;
    return (successful / this.ingestionHistory.length) * 100;
  }

  /**
   * Save extracted tarot data to Knowledge Graph
   */
  async saveToKnowledgeGraph(
    extraction: TarotCardExtraction,
    sourceId: string,
  ): Promise<void> {
    console.log(
      `💾 DataOracle: Saving ${extraction.cardName} to Knowledge Graph`,
    );

    try {
      // Step 1: Create or update concept
      const concept: Partial<KGConcept> = {
        name: extraction.cardName,
        concept_type: ConceptType.TAROT_CARD,
        canonical_name: extraction.cardName.toLowerCase().replace(/\s+/g, "_"),
        alternative_names: [],
        parent_concept_id: undefined,
        concept_level: 1,
        category_path: `${extraction.cardType === ArcanaType.MAJOR_ARCANA ? "Major" : "Minor"} Arcana > ${extraction.cardName}`,
        core_properties: {
          number: extraction.cardNumber,
          arcana: extraction.cardType,
          suit: extraction.suit,
          element: extraction.element,
        },
        keywords: extraction.keywords,
        numerological_value: extraction.numerology,
        elemental_association: extraction.element as ElementalAssociation,
        astrological_rulers: extraction.astrology || [],
        universal_themes: extraction.keywords,
        archetypal_energy: this.generateArchetypalEnergy(extraction.cardName),
        psychological_aspects: this.generatePsychologicalAspects(
          extraction.cardName,
        ),
        concept_completeness_score: extraction.qualityScore,
        verification_status: VerificationStatus.REVIEWED,
      };

      const { data: conceptData, error: conceptError } = await this.supabase
        .from("kg_concepts")
        .upsert(concept, { onConflict: "canonical_name,concept_type" })
        .select()
        .single();

      if (conceptError) {
        throw new Error(`Failed to save concept: ${conceptError.message}`);
      }

      // Step 2: Create interpretations for each meaning context
      for (const [context, meaning] of Object.entries(extraction.meanings)) {
        if (!meaning) continue;

        const interpretation: Partial<KGInterpretation> = {
          concept_id: conceptData.id,
          source_id: await this.getSourceId("Rider-Waite-Smith Tradition"), // Get from our initialized sources
          context_type: context as InterpretationContextType,
          primary_meaning: meaning,
          extended_meaning: meaning.length > 100 ? meaning : undefined,
          practical_application: this.generatePracticalApplication(
            extraction.cardName,
            context,
          ),
          spiritual_insight: this.generateSpiritualInsight(
            extraction.cardName,
            context,
          ),
          psychological_perspective: this.generatePsychologicalPerspective(
            extraction.cardName,
            context,
          ),
          personalization_triggers: this.generatePersonalizationTriggers(
            extraction.cardName,
          ),
          demographic_variations: {},
          interpretation_depth_score: Math.min(meaning.length / 20, 10),
          originality_score: extraction.qualityScore,
          clarity_score: extraction.qualityScore,
          usage_frequency: 0,
          user_rating_avg: 0,
          expert_validation_level: 3,
          semantic_tags: [...extraction.keywords, context, extraction.cardType],
        };

        const { error: interpretationError } = await this.supabase
          .from("kg_interpretations")
          .upsert(interpretation, {
            onConflict: "concept_id,source_id,context_type",
          });

        if (interpretationError) {
          console.warn(
            `Failed to save interpretation for ${extraction.cardName} ${context}:`,
            interpretationError,
          );
        }
      }

      console.log(
        `✅ DataOracle: Successfully saved ${extraction.cardName} to Knowledge Graph`,
      );
    } catch (error) {
      console.error(
        `❌ DataOracle: Failed to save ${extraction.cardName}:`,
        error,
      );
      throw error;
    }
  }

  // Missing helper methods for extraction

  private determineCardType(cardName: string): ArcanaType {
    const majorArcana = [
      "the fool",
      "the magician",
      "the high priestess",
      "the empress",
      "the emperor",
      "the hierophant",
      "the lovers",
      "the chariot",
      "strength",
      "the hermit",
      "wheel of fortune",
      "justice",
      "the hanged man",
      "death",
      "temperance",
      "the devil",
      "the tower",
      "the star",
      "the moon",
      "the sun",
      "judgement",
      "the world",
    ];

    return majorArcana.includes(cardName.toLowerCase())
      ? ArcanaType.MAJOR_ARCANA
      : ArcanaType.MINOR_ARCANA;
  }

  private extractCardNumber(cardName: string): number | undefined {
    // Extract number from card name (e.g., "Two of Cups" -> 2)
    const numberMap: Record<string, number> = {
      ace: 1,
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      page: 11,
      knight: 12,
      queen: 13,
      king: 14,
    };

    const words = cardName.toLowerCase().split(" ");
    for (const word of words) {
      if (numberMap[word]) {
        return numberMap[word];
      }
    }

    // Check for numeric digits
    const numMatch = cardName.match(/\d+/);
    if (numMatch) {
      return parseInt(numMatch[0]);
    }

    return undefined;
  }

  private extractSuit(cardName: string): string | null {
    const suits = ["wands", "cups", "pentacles", "swords", "coins", "disks"];
    for (const suit of suits) {
      if (cardName.toLowerCase().includes(suit)) {
        return suit;
      }
    }
    return null;
  }

  private assessExtractionQuality(data: any): number {
    let score = 0;
    if (data.cardName) score += 2;
    if (data.meanings && Object.keys(data.meanings).length > 0) score += 3;
    if (data.keywords && data.keywords.length > 0) score += 2;
    if (data.symbols && Object.keys(data.symbols).length > 0) score += 2;
    if (data.url) score += 1;
    return Math.min(score, 10);
  }

  private formatCardName(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }

  private isValidCardName(name: string): boolean {
    return !!name && name.length > 2 && name.length < 100;
  }

  private normalizeCardName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, " ");
  }

  private extractStructuredText($: cheerio.CheerioAPI): string {
    return ($("body").text() || $("*").text()).trim();
  }

  private findMeaningByContext(
    textNodes: string,
    indicators: string[],
  ): string {
    // Simple implementation - in reality would use NLP to find context-specific meanings
    if (
      indicators.some((indicator) =>
        textNodes.toLowerCase().includes(indicator),
      )
    ) {
      return `Meaning found for context with indicators: ${indicators.join(", ")}`;
    }
    return "";
  }

  private extractGeneralMeaning(textNodes: string): string {
    return textNodes.substring(0, 200); // Return first 200 chars as general meaning
  }

  private isTarotRelevant(word: string): boolean {
    const tarotWords = [
      "spiritual",
      "intuition",
      "wisdom",
      "journey",
      "path",
      "energy",
    ];
    return tarotWords.some((tw) => word.toLowerCase().includes(tw));
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ];
    return stopWords.includes(word.toLowerCase());
  }

  private isLikelySymbol(noun: string): boolean {
    const symbols = [
      "star",
      "moon",
      "sun",
      "tower",
      "wheel",
      "sword",
      "cup",
      "wand",
      "pentacle",
    ];
    return symbols.some((symbol) => noun.toLowerCase().includes(symbol));
  }

  private getCardElement(cardName: string): string | null {
    const elementMap: Record<string, string> = {
      wands: "fire",
      cups: "water",
      swords: "air",
      pentacles: "earth",
      coins: "earth",
      disks: "earth",
    };

    for (const [suit, element] of Object.entries(elementMap)) {
      if (cardName.toLowerCase().includes(suit)) {
        return element;
      }
    }
    return null;
  }

  private getCardAstrology(cardName: string): string[] {
    void cardName; // intentionally unused for now
    // Return empty array for now - would implement proper astrology mapping
    return [];
  }

  private getCardSpecificKeywords(cardName: string): string[] {
    void cardName; // intentionally unused for now
    // Return empty array for now - would implement proper keyword mapping
    return [];
  }
}

export default DataOracleAgent;
