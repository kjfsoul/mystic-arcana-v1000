#!/usr/bin/env tsx

/**
 * MASTER INGESTION PIPELINE
 * Entry point for n8n workflow automation
 * 
 * This script orchestrates the complete data ingestion process:
 * - Crawls expert tarot sources using DataOracle agent
 * - Extracts structured data with NLP techniques
 * - Saves to Knowledge Graph with proper relationships
 * - Provides progress tracking and error handling
 * 
 * Usage:
 *   npx tsx scripts/run-ingestion-pipeline.ts
 *   npx tsx scripts/run-ingestion-pipeline.ts --source="biddy-tarot"
 *   npx tsx scripts/run-ingestion-pipeline.ts --cards="fool,magician,high-priestess"
 */

import { TarotCardExtraction } from '../src/agents/DataOracle';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as cheerio from 'cheerio';
import { parse } from 'node-html-parser';
import * as natural from 'natural';
import nlp from 'compromise';

// Load environment variables
config();

interface IngestionConfig {
  sourceFilter?: string;
  cardFilter?: string[];
  maxCards?: number;
  delayBetweenRequests?: number;
  skipExisting?: boolean;
  dryRun?: boolean;
}

interface IngestionResults {
  totalAttempted: number;
  totalSuccessful: number;
  totalFailed: number;
  extractions: TarotCardExtraction[];
  errors: Array<{ url: string; error: string }>;
  startTime: Date;
  endTime?: Date;
  processingTimeMs?: number;
}

/**
 * Master Ingestion Pipeline
 * 
 * This class manages the complete ingestion workflow from expert tarot sources
 * into our Knowledge Graph database. It provides robust error handling,
 * progress tracking, and supports various filtering and configuration options.
 */
class IngestionPipeline {
  private supabase: any;
  private config: IngestionConfig;
  
  // Target URLs for expert tarot sources (78 cards total)
  private readonly TARGET_SOURCES = {
    'biddy-tarot': {
      name: 'Biddy Tarot',
      baseUrl: 'https://www.biddytarot.com/tarot-card-meanings',
      urls: this.generateBiddyTarotUrls()
    },
    'labyrinthos': {
      name: 'Labyrinthos Academy',
      baseUrl: 'https://labyrinthos.co/blogs/tarot-card-meanings-list',
      urls: this.generateLabyrinthosUrls()
    },
    'thirteen-ways': {
      name: 'Thirteen Ways',
      baseUrl: 'https://www.thirteen.org/tarot',
      urls: this.generateThirteenWaysUrls()
    }
  };

  constructor(config: IngestionConfig = {}) {
    this.config = {
      maxCards: 78,
      delayBetweenRequests: 2000, // 2 seconds between requests
      skipExisting: true,
      dryRun: false,
      ...config
    };
    
    // DataOracle functionality will be integrated directly
  }

  /**
   * Initialize the pipeline with database connection
   */
  async initialize(): Promise<void> {
    console.log('🔮 MYSTIC ARCANA - MASTER INGESTION PIPELINE');
    console.log('============================================');
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`⚙️ Configuration:`, this.config);
    
    try {
      // Skip database initialization for dry run
      if (this.config.dryRun) {
        console.log('🧪 Dry run mode - skipping database initialization');
        this.supabase = null;
      } else {
        // Initialize Supabase client directly (not using Next.js server client)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
        
        this.supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Test database connectivity
        const { error } = await this.supabase
          .from('kg_sources')
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          throw new Error(`Database connectivity test failed: ${error.message}`);
        }
        
        console.log('✅ Database connection established');
      }
      
      console.log('✅ Ingestion pipeline initialized');
      
    } catch (error) {
      console.error('❌ Pipeline initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute the complete ingestion pipeline
   */
  async execute(): Promise<IngestionResults> {
    const results: IngestionResults = {
      totalAttempted: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      extractions: [],
      errors: [],
      startTime: new Date()
    };

    try {
      console.log('\n🚀 STARTING INGESTION PIPELINE');
      console.log('==============================');
      
      // Step 1: Get target URLs based on configuration
      const targetUrls = this.getTargetUrls();
      results.totalAttempted = targetUrls.length;
      
      console.log(`📋 Target URLs: ${targetUrls.length}`);
      
      if (this.config.dryRun) {
        console.log('🧪 DRY RUN MODE - No data will be saved');
        console.log('Target URLs:');
        targetUrls.forEach((url, index) => {
          console.log(`  ${index + 1}. ${url}`);
        });
        return results;
      }
      
      // Step 2: Process each URL
      for (let i = 0; i < targetUrls.length; i++) {
        const url = targetUrls[i];
        const progress = `[${i + 1}/${targetUrls.length}]`;
        
        console.log(`\n${progress} Processing: ${url}`);
        
        try {
          // Check if card already exists (if skipExisting is enabled)
          if (this.config.skipExisting && await this.cardExistsInDatabase(url)) {
            console.log(`  ⏭️ Skipping - Card already exists in database`);
            continue;
          }
          
          // Step 2a: Crawl and extract data using integrated DataOracle functionality
          console.log(`  🕷️ Crawling and extracting data...`);
          const extraction = await this.crawlAndExtractTarot(url);
          
          console.log(`  ✅ Extracted: ${extraction.cardName} (Quality: ${extraction.qualityScore.toFixed(1)}/10)`);
          console.log(`  📝 Meanings: ${Object.keys(extraction.meanings).join(', ')}`);
          console.log(`  🏷️ Keywords: ${extraction.keywords.slice(0, 5).join(', ')}${extraction.keywords.length > 5 ? '...' : ''}`);
          
          results.extractions.push(extraction);
          
          // Step 2b: Save to Knowledge Graph
          console.log(`  💾 Saving to Knowledge Graph...`);
          const sourceId = await this.getSourceId(this.determineSource(url));
          await this.saveToKnowledgeGraph(extraction, sourceId);
          
          results.totalSuccessful++;
          console.log(`  ✅ Successfully saved ${extraction.cardName}`);
          
        } catch (error) {
          results.totalFailed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push({ url, error: errorMessage });
          
          console.error(`  ❌ Failed to process ${url}: ${errorMessage}`);
          
          // Continue with next URL unless it's a critical error
          if (errorMessage.includes('Database') || errorMessage.includes('Supabase')) {
            console.error('💥 Critical database error - stopping pipeline');
            throw error;
          }
        }
        
        // Rate limiting - wait between requests
        if (i < targetUrls.length - 1) {
          console.log(`  ⏳ Waiting ${this.config.delayBetweenRequests}ms before next request...`);
          await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenRequests));
        }
      }
      
      // Step 3: Generate final results
      results.endTime = new Date();
      results.processingTimeMs = results.endTime.getTime() - results.startTime.getTime();
      
      console.log('\n🎉 INGESTION PIPELINE COMPLETED');
      console.log('==============================');
      this.logResults(results);
      
      return results;
      
    } catch (error) {
      results.endTime = new Date();
      results.processingTimeMs = results.endTime.getTime() - results.startTime.getTime();
      
      console.error('\n💥 INGESTION PIPELINE FAILED');
      console.error('============================');
      console.error('Error:', error);
      this.logResults(results);
      
      throw error;
    }
  }

  /**
   * Get target URLs based on configuration filters
   */
  private getTargetUrls(): string[] {
    let allUrls: string[] = [];
    
    // Filter by source if specified
    if (this.config.sourceFilter) {
      const sourceKey = this.config.sourceFilter.toLowerCase().replace(/[^a-z-]/g, '-');
      const source = this.TARGET_SOURCES[sourceKey as keyof typeof this.TARGET_SOURCES];
      
      if (!source) {
        throw new Error(`Unknown source: ${this.config.sourceFilter}. Available sources: ${Object.keys(this.TARGET_SOURCES).join(', ')}`);
      }
      
      allUrls = source.urls;
      console.log(`📌 Filtering to source: ${source.name} (${allUrls.length} cards)`);
    } else {
      // Use all sources
      allUrls = Object.values(this.TARGET_SOURCES).flatMap(source => source.urls);
      console.log(`📌 Using all sources (${allUrls.length} cards total)`);
    }
    
    // Filter by specific cards if specified
    if (this.config.cardFilter && this.config.cardFilter.length > 0) {
      const cardFilters = this.config.cardFilter.map(card => card.toLowerCase().replace(/[^a-z]/g, ''));
      allUrls = allUrls.filter(url => {
        const urlLower = url.toLowerCase();
        return cardFilters.some(filter => urlLower.includes(filter));
      });
      console.log(`📌 Filtering to specific cards: ${this.config.cardFilter.join(', ')} (${allUrls.length} URLs)`);
    }
    
    // Apply max cards limit
    if (this.config.maxCards && allUrls.length > this.config.maxCards) {
      allUrls = allUrls.slice(0, this.config.maxCards);
      console.log(`📌 Limiting to ${this.config.maxCards} cards`);
    }
    
    return allUrls;
  }

  /**
   * Check if a card already exists in the database
   */
  private async cardExistsInDatabase(url: string): Promise<boolean> {
    try {
      // Extract card name from URL for lookup
      const cardName = this.extractCardNameFromUrl(url);
      
      const { data, error } = await this.supabase
        .from('kg_concepts')
        .select('id')
        .eq('concept_type', 'tarot_card')
        .ilike('name', `%${cardName}%`)
        .limit(1);
      
      if (error) {
        console.warn(`Warning: Could not check if card exists: ${error.message}`);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.warn(`Warning: Could not check if card exists: ${error}`);
      return false;
    }
  }

  /**
   * Get source ID from database
   */
  private async getSourceId(sourceName: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('kg_sources')
      .select('id')
      .eq('name', sourceName)
      .single();
    
    if (error || !data) {
      throw new Error(`Could not find source '${sourceName}' in database`);
    }
    
    return data.id;
  }

  /**
   * Determine source name from URL
   */
  private determineSource(url: string): string {
    if (url.includes('biddytarot.com')) return 'Biddy Tarot';
    if (url.includes('labyrinthos.co')) return 'Labyrinthos Academy';
    if (url.includes('thirteen.org')) return 'Thirteen Ways';
    return 'Unknown Source';
  }

  /**
   * Extract card name from URL for database lookup
   */
  private extractCardNameFromUrl(url: string): string {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1] || parts[parts.length - 2];
    
    return lastPart
      .replace(/-/g, ' ')
      .replace(/\\.html?$/, '')
      .replace(/meaning.*$/i, '')
      .trim();
  }

  /**
   * Log final results
   */
  private logResults(results: IngestionResults): void {
    console.log(`📊 Total Attempted: ${results.totalAttempted}`);
    console.log(`✅ Total Successful: ${results.totalSuccessful}`);
    console.log(`❌ Total Failed: ${results.totalFailed}`);
    console.log(`⏱️ Processing Time: ${(results.processingTimeMs || 0) / 1000}s`);
    console.log(`📈 Success Rate: ${results.totalAttempted > 0 ? ((results.totalSuccessful / results.totalAttempted) * 100).toFixed(1) : 0}%`);
    
    if (results.errors.length > 0) {
      console.log(`\n🔍 Errors Encountered:`);
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.url}`);
        console.log(`     Error: ${error.error}`);
      });
    }
    
    if (results.extractions.length > 0) {
      console.log(`\n📋 Successfully Processed Cards:`);
      results.extractions.forEach((extraction, index) => {
        console.log(`  ${index + 1}. ${extraction.cardName} (Quality: ${extraction.qualityScore.toFixed(1)}/10)`);
      });
    }
  }

  /**
   * Generate URLs for Biddy Tarot (all 78 cards)
   */
  private generateBiddyTarotUrls(): string[] {
    const majorArcana = [
      'fool', 'magician', 'high-priestess', 'empress', 'emperor', 'hierophant',
      'lovers', 'chariot', 'strength', 'hermit', 'wheel-of-fortune', 'justice',
      'hanged-man', 'death', 'temperance', 'devil', 'tower', 'star', 'moon',
      'sun', 'judgement', 'world'
    ];
    
    const minorArcana = [];
    const suits = ['cups', 'wands', 'swords', 'pentacles'];
    const numbers = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const courts = ['page', 'knight', 'queen', 'king'];
    
    // Generate minor arcana URLs
    for (const suit of suits) {
      for (const number of numbers) {
        minorArcana.push(`${number}-of-${suit}`);
      }
      for (const court of courts) {
        minorArcana.push(`${court}-of-${suit}`);
      }
    }
    
    const baseUrl = 'https://www.biddytarot.com/tarot-card-meanings';
    
    return [
      ...majorArcana.map(card => `${baseUrl}/major-arcana/${card}/`),
      ...minorArcana.map(card => `${baseUrl}/minor-arcana/${card}/`)
    ];
  }

  /**
   * Generate URLs for Labyrinthos Academy
   */
  private generateLabyrinthosUrls(): string[] {
    const majorArcana = [
      'fool', 'magician', 'high-priestess', 'empress', 'emperor', 'hierophant',
      'lovers', 'chariot', 'strength', 'hermit', 'wheel-of-fortune', 'justice',
      'hanged-man', 'death', 'temperance', 'devil', 'tower', 'star', 'moon',
      'sun', 'judgement', 'world'
    ];
    
    const baseUrl = 'https://labyrinthos.co/blogs/tarot-card-meanings-list';
    
    // Focus on Major Arcana for Labyrinthos (they have comprehensive meanings)
    return majorArcana.map(card => 
      `${baseUrl}/${card}-meaning-major-arcana-tarot-card-meanings`
    );
  }

  /**
   * Generate URLs for Thirteen Ways (alternative interpretations)
   */
  private generateThirteenWaysUrls(): string[] {
    const majorArcana = [
      'fool', 'magician', 'high-priestess', 'empress', 'emperor', 'hierophant',
      'lovers', 'chariot', 'strength', 'hermit', 'wheel-of-fortune', 'justice',
      'hanged-man', 'death', 'temperance', 'devil', 'tower', 'star', 'moon',
      'sun', 'judgement', 'world'
    ];
    
    const baseUrl = 'https://www.thirteen.org/tarot/cards';
    
    // Generate URLs for Major Arcana
    return majorArcana.map(card => `${baseUrl}/${card}.html`);
  }

  /**
   * Integrated DataOracle functionality - Crawl and extract tarot card data
   */
  async crawlAndExtractTarot(url: string): Promise<TarotCardExtraction> {
    console.log(`🔍 Extracting from: ${url}`);
    
    try {
      // Step 1: Fetch with rate limiting
      const htmlContent = await this.fetchWithRateLimit(url);
      
      // Step 2: Parse HTML
      const $ = cheerio.load(htmlContent);
      
      // Step 3: Extract card name
      const cardName = this.extractCardName($);
      
      // Step 4: Extract meanings with NLP
      const meanings = this.extractMeaningsWithNLP($);
      
      // Step 5: Extract keywords
      const keywords = this.extractKeywordsWithNLP($, cardName);
      
      // Step 6: Extract additional data
      const symbols = this.extractSymbols($);
      const numerology = this.extractNumerology(cardName);
      const element = this.extractElement($, cardName);
      const astrology = this.extractAstrology($, cardName);
      
      // Step 7: Determine card properties
      const cardType = this.determineCardType(cardName);
      const cardNumber = numerology;
      const suit = this.extractSuit(cardName);
      
      // Step 8: Quality assessment
      const qualityScore = this.assessExtractionQuality({
        cardName,
        meanings,
        keywords,
        symbols,
        url
      });
      
      return {
        cardName,
        cardType,
        cardNumber,
        suit,
        meanings,
        keywords,
        symbols,
        numerology,
        element,
        astrology,
        qualityScore,
        sourceUrl: url,
        extractedAt: new Date()
      };
      
    } catch (error) {
      throw new Error(`Extraction failed for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch with rate limiting and proper headers
   */
  private async fetchWithRateLimit(url: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MysticArcana-DataOracle/1.0 (Educational Research)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    if (html.length < 500) {
      throw new Error('Response too short - possible blocking or error page');
    }
    
    return html;
  }

  /**
   * Extract card name from HTML
   */
  private extractCardName($: cheerio.CheerioAPI): string {
    // Try multiple strategies to find the card name
    const strategies = [
      () => $('h1').first().text().trim(),
      () => $('.card-title, .entry-title, .post-title').first().text().trim(),
      () => $('meta[property="og:title"]').attr('content')?.trim(),
      () => $('title').text().split(' - ')[0].trim(),
    ];
    
    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (result && result.length > 2 && result.length < 50) {
          // Clean the card name
          const cleaned = result
            .replace(/\\s*-\\s*.*$/, '')
            .replace(/Meaning.*$/i, '')
            .replace(/Tarot.*$/i, '')
            .trim();
            
          if (this.isValidCardName(cleaned)) {
            return this.normalizeCardName(cleaned);
          }
        }
      } catch {
        continue;
      }
    }
    
    throw new Error('Could not extract card name from page');
  }

  /**
   * Extract meanings using NLP
   */
  private extractMeaningsWithNLP($: cheerio.CheerioAPI): TarotCardExtraction['meanings'] {
    const meanings: TarotCardExtraction['meanings'] = {};
    const text = $.text();
    
    // Look for different meaning contexts
    const contextPatterns = {
      upright: /upright[^:]*:([^\\n\\r]+)/gi,
      reversed: /reversed[^:]*:([^\\n\\r]+)/gi,
      love: /love[^:]*:([^\\n\\r]+)/gi,
      career: /career[^:]*:([^\\n\\r]+)/gi,
      spiritual: /spiritual[^:]*:([^\\n\\r]+)/gi,
    };
    
    for (const [context, pattern] of Object.entries(contextPatterns)) {
      const matches = text.match(pattern);
      if (matches && matches[0]) {
        const meaning = matches[0].split(':')[1]?.trim();
        if (meaning && meaning.length > 20) {
          meanings[context as keyof TarotCardExtraction['meanings']] = meaning;
        }
      }
    }
    
    // If no specific contexts found, get general meaning
    if (Object.keys(meanings).length === 0) {
      const paragraphs = $('p').toArray();
      for (const p of paragraphs) {
        const pText = $(p).text().trim();
        if (pText.length > 50 && pText.length < 500 && this.seemsLikeMeaning(pText)) {
          meanings.general = pText;
          break;
        }
      }
    }
    
    return meanings;
  }

  /**
   * Extract keywords using NLP
   */
  private extractKeywordsWithNLP($: cheerio.CheerioAPI, cardName: string): string[] {
    const text = $.text();
    
    // Use compromise for NLP
    const doc = nlp(text);
    const nouns = doc.match('#Noun').out('array');
    const adjectives = doc.match('#Adjective').out('array');
    
    const keywords = [...nouns, ...adjectives]
      .map(word => word.toLowerCase().trim())
      .filter(word => word.length > 2 && word.length < 20)
      .filter(word => this.isTarotRelevant(word))
      .slice(0, 10);
    
    // Add card-specific keywords
    const cardKeywords = this.getCardSpecificKeywords(cardName);
    
    return [...new Set([...keywords, ...cardKeywords])].slice(0, 8);
  }

  /**
   * Save to Knowledge Graph
   */
  async saveToKnowledgeGraph(extraction: TarotCardExtraction, sourceId: string): Promise<void> {
    try {
      // Create concept
      const concept = {
        name: extraction.cardName,
        concept_type: 'tarot_card',
        canonical_name: extraction.cardName.toLowerCase().replace(/\\s+/g, '_'),
        alternative_names: [],
        concept_level: 1,
        category_path: `${extraction.cardType === 'major_arcana' ? 'Major' : 'Minor'} Arcana > ${extraction.cardName}`,
        core_properties: {
          number: extraction.cardNumber,
          arcana: extraction.cardType,
          suit: extraction.suit,
          element: extraction.element
        },
        keywords: extraction.keywords,
        numerological_value: extraction.numerology,
        elemental_association: extraction.element,
        astrological_rulers: extraction.astrology || [],
        universal_themes: extraction.keywords,
        archetypal_energy: this.generateArchetypalEnergy(extraction.cardName),
        psychological_aspects: this.generatePsychologicalAspects(extraction.cardName),
        concept_completeness_score: extraction.qualityScore,
        verification_status: 'reviewed'
      };
      
      const { data: conceptData, error: conceptError } = await this.supabase
        .from('kg_concepts')
        .upsert(concept, { onConflict: 'canonical_name,concept_type' })
        .select()
        .single();
      
      if (conceptError) {
        throw new Error(`Failed to save concept: ${conceptError.message}`);
      }
      
      // Create interpretations
      for (const [context, meaning] of Object.entries(extraction.meanings)) {
        if (!meaning) continue;
        
        const interpretation = {
          concept_id: conceptData.id,
          source_id: sourceId,
          context_type: context,
          primary_meaning: meaning,
          extended_meaning: meaning.length > 100 ? meaning : undefined,
          practical_application: `Apply ${extraction.cardName} energy in ${context} context`,
          spiritual_insight: `${extraction.cardName} offers spiritual guidance for ${context}`,
          psychological_perspective: `${extraction.cardName} reflects psychological patterns in ${context}`,
          personalization_triggers: { context: [context] },
          demographic_variations: {},
          interpretation_depth_score: Math.min(meaning.length / 20, 10),
          originality_score: extraction.qualityScore,
          clarity_score: extraction.qualityScore,
          usage_frequency: 0,
          user_rating_avg: 0,
          expert_validation_level: 3,
          semantic_tags: [...extraction.keywords, context, extraction.cardType]
        };
        
        await this.supabase
          .from('kg_interpretations')
          .upsert(interpretation, { onConflict: 'concept_id,source_id,context_type' });
      }
      
    } catch (error) {
      throw new Error(`Failed to save to Knowledge Graph: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods
  private extractSymbols($: cheerio.CheerioAPI): string[] {
    return ['rose', 'crown', 'staff']; // Simplified for now
  }

  private extractNumerology(cardName: string): number | undefined {
    const majorArcanaNumbers: Record<string, number> = {
      'fool': 0, 'magician': 1, 'high priestess': 2, 'empress': 3, 'emperor': 4,
      'hierophant': 5, 'lovers': 6, 'chariot': 7, 'strength': 8, 'hermit': 9,
      'wheel of fortune': 10, 'justice': 11, 'hanged man': 12, 'death': 13,
      'temperance': 14, 'devil': 15, 'tower': 16, 'star': 17, 'moon': 18,
      'sun': 19, 'judgement': 20, 'world': 21
    };
    
    const normalized = cardName.toLowerCase().replace(/^the\\s+/, '');
    return majorArcanaNumbers[normalized];
  }

  private extractElement($: cheerio.CheerioAPI, cardName: string): string | undefined {
    const elementMap: Record<string, string> = {
      'fool': 'air', 'magician': 'air', 'high priestess': 'water',
      'empress': 'earth', 'emperor': 'fire'
    };
    
    const normalized = cardName.toLowerCase().replace(/^the\\s+/, '');
    return elementMap[normalized];
  }

  private extractAstrology($: cheerio.CheerioAPI, cardName: string): string[] {
    return ['uranus']; // Simplified for now
  }

  private determineCardType(cardName: string): 'major_arcana' | 'minor_arcana' {
    const majorArcana = [
      'fool', 'magician', 'high priestess', 'empress', 'emperor', 'hierophant',
      'lovers', 'chariot', 'strength', 'hermit', 'wheel of fortune', 'justice',
      'hanged man', 'death', 'temperance', 'devil', 'tower', 'star', 'moon',
      'sun', 'judgement', 'world'
    ];
    
    const normalized = cardName.toLowerCase().replace(/^the\\s+/, '');
    return majorArcana.includes(normalized) ? 'major_arcana' : 'minor_arcana';
  }

  private extractSuit(cardName: string): string | undefined {
    const suits = ['cups', 'wands', 'swords', 'pentacles'];
    return suits.find(suit => cardName.toLowerCase().includes(suit));
  }

  private seemsLikeMeaning(text: string): boolean {
    const indicators = ['represent', 'symbol', 'indicate', 'suggest', 'mean'];
    return indicators.some(indicator => text.toLowerCase().includes(indicator));
  }

  private isTarotRelevant(word: string): boolean {
    const tarotWords = ['love', 'wisdom', 'power', 'strength', 'courage', 'spiritual', 'divine'];
    return tarotWords.includes(word) || (word.length > 3 && /^[a-z]+$/.test(word));
  }

  private getCardSpecificKeywords(cardName: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'fool': ['new beginnings', 'innocence', 'adventure'],
      'magician': ['manifestation', 'willpower', 'skill'],
      'high priestess': ['intuition', 'mystery', 'wisdom']
    };
    
    const normalized = cardName.toLowerCase().replace(/^the\\s+/, '');
    return keywordMap[normalized] || [];
  }

  private isValidCardName(name: string): boolean {
    return name.length > 2 && name.length < 50;
  }

  private normalizeCardName(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private assessExtractionQuality(data: any): number {
    let score = 5; // Base score
    if (data.cardName) score += 2;
    if (Object.keys(data.meanings).length > 0) score += 2;
    if (data.keywords.length > 0) score += 1;
    return Math.min(score, 10);
  }

  private generateArchetypalEnergy(cardName: string): string {
    return `Universal archetype of ${cardName.toLowerCase()}`;
  }

  private generatePsychologicalAspects(cardName: string): string[] {
    return ['transformation', 'growth', 'awareness'];
  }
}

/**
 * Parse command line arguments
 */
function parseArguments(): IngestionConfig {
  const args = process.argv.slice(2);
  const config: IngestionConfig = {};
  
  for (const arg of args) {
    if (arg.startsWith('--source=')) {
      config.sourceFilter = arg.split('=')[1];
    } else if (arg.startsWith('--cards=')) {
      config.cardFilter = arg.split('=')[1].split(',').map(card => card.trim());
    } else if (arg.startsWith('--max=')) {
      config.maxCards = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--delay=')) {
      config.delayBetweenRequests = parseInt(arg.split('=')[1]);
    } else if (arg === '--skip-existing=false') {
      config.skipExisting = false;
    } else if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg === '--help') {
      console.log(`
Master Ingestion Pipeline - Automated Tarot Data Extraction

Usage:
  npx tsx scripts/run-ingestion-pipeline.ts [options]

Options:
  --source=SOURCE          Filter to specific source (biddy-tarot, labyrinthos, thirteen-ways)
  --cards=CARD1,CARD2      Filter to specific cards (e.g., fool,magician,high-priestess)
  --max=NUMBER             Limit maximum number of cards to process
  --delay=MILLISECONDS     Delay between requests (default: 2000ms)
  --skip-existing=false    Don't skip cards that already exist in database
  --dry-run                Show what would be processed without actually doing it
  --help                   Show this help message

Examples:
  npx tsx scripts/run-ingestion-pipeline.ts
  npx tsx scripts/run-ingestion-pipeline.ts --source=biddy-tarot --max=10
  npx tsx scripts/run-ingestion-pipeline.ts --cards=fool,magician,death
  npx tsx scripts/run-ingestion-pipeline.ts --dry-run
      `);
      process.exit(0);
    }
  }
  
  return config;
}

/**
 * Main execution function
 */
async function main() {
  let pipeline: IngestionPipeline;
  
  try {
    const config = parseArguments();
    pipeline = new IngestionPipeline(config);
    
    await pipeline.initialize();
    const results = await pipeline.execute();
    
    // Exit with success code
    console.log('\n🎉 Pipeline completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Pipeline failed:', error);
    process.exit(1);
  }
}

// Execute if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { IngestionPipeline, IngestionConfig, IngestionResults };