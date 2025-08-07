import Firecrawl from 'firecrawl';
import nlp from 'compromise';
import { createHash } from 'crypto';
import Redis from 'ioredis';

// Configuration constants
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const USE_REDIS_CACHE = process.env.USE_REDIS_CACHE === 'true';
const CACHE_TTL_SECONDS = 86400; // 24 hours
const MAX_URLS_BATCH = 10;
const MIN_TOKEN_LENGTH = 2;
const MAX_NOUNS = 15;
const MAX_VERBS = 10;
const MAX_ADJECTIVES = 10;
const SUMMARY_SENTENCE_LIMIT = 4;
const KEYWORD_SCORE_MULTIPLIER = 5;
const ENTITY_SCORE_MULTIPLIER = 3;
const OPTIMAL_SENTENCE_MIN_LENGTH = 50;
const OPTIMAL_SENTENCE_MAX_LENGTH = 200;
const OPTIMAL_SENTENCE_SCORE_BONUS = 2;

// Type definitions
interface LoreLinkerResult {
  summary: string;
  semanticTokens: Record<string, string[]>;
  archetypalTags: string[];
  sourceURL: string;
  sourceTitle?: string;
  processingStatus: 'success' | 'failed' | 'quota_exceeded';
  error?: string;
}

interface LoreLinkerMultiResult extends LoreLinkerResult {
  documentScore: number;
  archetypeFrequencies: Record<string, number>;
}

interface SummarizedLoreProfile {
  metaSummary: string;
  topArchetypes: string[];
  allKeywords: Record<string, string[]>;
  sourceURLs: string[];
  sourceTitles: string[];
  totalDocuments: number;
  successfulDocuments: number;
  failedDocuments: number;
}

interface FirecrawlResponse {
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
  };
}

interface CacheEntry {
  result: LoreLinkerResult;
  timestamp: number;
}

// Use type-safe return object for compromise
type NlpDoc = ReturnType<typeof nlp>;

// Logger interface for consistent logging
interface Logger {
  // eslint-disable-next-line no-unused-vars
  info: (message: string, meta?: any) => void;
  // eslint-disable-next-line no-unused-vars
  warn: (message: string, meta?: any) => void;
  // eslint-disable-next-line no-unused-vars
  error: (message: string, meta?: any) => void;
}

// Default logger implementation
const defaultLogger: Logger = {
  info: (message: string, meta?: any) => console.log(`[LoreLinker INFO] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[LoreLinker WARN] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[LoreLinker ERROR] ${message}`, meta || ''),
};

export class LoreLinkerAgentMulti {
  private crawler: Firecrawl | null = null;
  private redis: Redis | null = null;
  private localCache: Map<string, CacheEntry> = new Map();
  private logger: Logger;
  private languageFilter: string[];
  private archetypeDefinitions: Record<string, string[]>;

  constructor(options?: {
    logger?: Logger;
    languageFilter?: string[];
    useCache?: boolean;
    archetypeDefinitions?: Record<string, string[]>;
  }) {
    this.logger = options?.logger || defaultLogger;
    this.languageFilter = options?.languageFilter || ['en', 'english'];
    
    // Initialize Firecrawl - in test environments, the mock will be injected
    if (FIRECRAWL_API_KEY || process.env.NODE_ENV === 'test') {
      try {
        this.crawler = new Firecrawl({ apiKey: FIRECRAWL_API_KEY || 'test-key' });
      } catch (error) {
        // In test environment, continue even if Firecrawl constructor fails
        if (process.env.NODE_ENV === 'test') {
          this.crawler = new Firecrawl({ apiKey: 'test-key' });
        } else {
          this.logger.warn('Failed to initialize Firecrawl', error);
        }
      }
    } else {
      this.logger.warn('Firecrawl API key not found. Will return stub entries.');
    }

    // Initialize Redis if enabled
    if (USE_REDIS_CACHE || options?.useCache) {
      try {
        this.redis = new Redis(REDIS_URL);
        this.redis.on('error', (err) => {
          this.logger.error('Redis connection error', err);
          this.redis = null;
        });
      } catch (err) {
        this.logger.warn('Failed to initialize Redis cache', err);
      }
    }

    // Default archetype definitions (can be overridden)
    this.archetypeDefinitions = options?.archetypeDefinitions || {
      Hero: ['hero', 'savior', 'quest', 'journey', 'champion', 'courage', 'brave'],
      Shadow: ['shadow', 'darkness', 'monster', 'evil', 'dark', 'sinister'],
      Trickster: ['trickster', 'jester', 'mischief', 'cunning', 'playful', 'deceptive'],
      Mentor: ['mentor', 'sage', 'guide', 'teacher', 'wisdom', 'advisor'],
      Lover: ['lover', 'venus', 'desire', 'passion', 'romance', 'affection'],
      Creator: ['creator', 'artist', 'imagination', 'innovation', 'invention'],
      Ruler: ['ruler', 'king', 'emperor', 'queen', 'leader', 'authority'],
      Magician: ['magician', 'wizard', 'shaman', 'sorcerer', 'mystic', 'magic'],
      Innocent: ['innocent', 'child', 'pure', 'naive', 'simple', 'optimistic'],
      Explorer: ['explorer', 'seeker', 'wanderer', 'adventurer', 'discovery'],
      Caregiver: ['caregiver', 'nurturer', 'healer', 'mother', 'protector'],
      Rebel: ['rebel', 'outlaw', 'anarchist', 'revolutionary', 'maverick'],
      Sage: ['sage', 'philosopher', 'truth', 'knowledge', 'understanding'],
      Jester: ['jester', 'comedian', 'fool', 'humor', 'laughter', 'entertainment'],
      Orphan: ['orphan', 'abandoned', 'helpless', 'vulnerable', 'alone'],
      Warrior: ['warrior', 'fighter', 'soldier', 'battle', 'combat', 'strength'],
    };
  }

  /**
   * Process a single URL (maintains backward compatibility)
   */
  public async processUrl(url: string): Promise<LoreLinkerResult> {
    const results = await this.processMultipleUrls([url]);
    return results[0];
  }

  /**
   * Process multiple URLs with caching, fallback, and error handling
   */
  public async processMultipleUrls(urls: string[]): Promise<LoreLinkerMultiResult[]> {
    if (urls.length > MAX_URLS_BATCH) {
      this.logger.warn(`Processing ${urls.length} URLs in batches of ${MAX_URLS_BATCH}`);
    }

    const results: LoreLinkerMultiResult[] = [];
    
    // Process URLs in batches to avoid overwhelming the API
    for (let i = 0; i < urls.length; i += MAX_URLS_BATCH) {
      const batch = urls.slice(i, i + MAX_URLS_BATCH);
      const batchResults = await Promise.all(
        batch.map(url => this.processSingleUrlWithFallback(url))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Process a single URL with caching and fallback logic
   */
  private async processSingleUrlWithFallback(url: string): Promise<LoreLinkerMultiResult> {
    try {
      // Check cache first
      const cached = await this.getCachedResult(url);
      if (cached) {
        this.logger.info(`Cache hit for URL: ${url}`);
        return this.enhanceResultWithFrequencies(cached);
      }

      // Try to scrape with Firecrawl
      if (!this.crawler) {
        return this.createStubResult(url, 'Firecrawl not configured');
      }

      const scrapedData = await this.scrapeWithRetry(url);
      
      if (!scrapedData || !scrapedData.markdown) {
        return this.createStubResult(url, 'No content retrieved');
      }

      // Check language filter
      if (scrapedData.metadata?.language && 
          !this.languageFilter.some(lang => 
            scrapedData.metadata!.language!.toLowerCase().includes(lang.toLowerCase())
          )) {
        this.logger.warn(`Skipping non-English content from: ${url}`);
        return this.createStubResult(url, 'Non-English content filtered');
      }

      const cleanedText = this.cleanMarkdown(scrapedData.markdown);
      const doc = nlp(cleanedText);

      const result: LoreLinkerResult = {
        summary: this.summarize(doc),
        semanticTokens: this.extractSemanticTokens(doc),
        archetypalTags: this.extractArchetypalTags(doc),
        sourceURL: url,
        sourceTitle: scrapedData.metadata?.title || this.extractTitleFromContent(cleanedText),
        processingStatus: 'success',
      };

      // Cache the result
      await this.cacheResult(url, result);

      return this.enhanceResultWithFrequencies(result);

    } catch (error: any) {
      this.logger.error(`Failed to process URL: ${url}`, error);
      
      
      // Check for quota exceeded error
      if (error.message?.includes('quota') || error.code === 'QUOTA_EXCEEDED' || 
          (typeof error === 'object' && error?.message?.includes('quota'))) {
        return this.createStubResult(url, error.message || 'Quota exceeded', 'quota_exceeded');
      }

      return this.createStubResult(url, error.message || error.toString());
    }
  }

  /**
   * Scrape URL with retry logic
   */
  private async scrapeWithRetry(url: string, retries = 2): Promise<FirecrawlResponse | null> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.crawler!.scrapeUrl(url);
        if (this.isValidFirecrawlResponse(response)) {
          return response as FirecrawlResponse;
        }
        // If response is invalid but no error was thrown, continue to next attempt
        if (attempt === retries) {
          return null; // All attempts exhausted with invalid responses
        }
      } catch (error: any) {
        if (attempt === retries) {
          throw error;
        }
        this.logger.warn(`Retry ${attempt + 1} for URL: ${url}`);
        await this.delay(1000 * (attempt + 1)); // Exponential backoff
      }
    }
    return null;
  }

  /**
   * Validate Firecrawl response
   */
  private isValidFirecrawlResponse(response: any): boolean {
    return (
      response &&
      typeof response === 'object' &&
      'markdown' in response &&
      typeof response.markdown === 'string'
    );
  }

  /**
   * Create a stub result for failed URLs
   */
  private createStubResult(
    url: string, 
    error: string, 
    status: 'failed' | 'quota_exceeded' = 'failed'
  ): LoreLinkerMultiResult {
    return {
      summary: '[unavailable]',
      semanticTokens: { nouns: [], verbs: [], adjectives: [] },
      archetypalTags: ['General Lore'],
      sourceURL: url,
      sourceTitle: 'Failed to retrieve',
      processingStatus: status,
      error,
      documentScore: 0,
      archetypeFrequencies: {},
    };
  }

  /**
   * Enhance result with archetype frequencies
   */
  private enhanceResultWithFrequencies(result: LoreLinkerResult): LoreLinkerMultiResult {
    const frequencies = this.calculateArchetypeFrequencies(result.summary);
    const score = this.calculateDocumentScore(result);
    
    return {
      ...result,
      documentScore: score,
      archetypeFrequencies: frequencies,
    };
  }

  /**
   * Calculate archetype frequencies in text
   */
  private calculateArchetypeFrequencies(text: string): Record<string, number> {
    const frequencies: Record<string, number> = {};
    const lowerText = text.toLowerCase();
    
    for (const [archetype, keywords] of Object.entries(this.archetypeDefinitions)) {
      let count = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        count += matches ? matches.length : 0;
      }
      if (count > 0) {
        frequencies[archetype] = count;
      }
    }
    
    return frequencies;
  }

  /**
   * Calculate document relevance score
   */
  private calculateDocumentScore(result: LoreLinkerResult): number {
    let score = 0;
    
    // Score based on summary length
    score += Math.min(result.summary.length / 100, 10);
    
    // Score based on semantic tokens
    score += result.semanticTokens.nouns.length * 2;
    score += result.semanticTokens.verbs.length;
    score += result.semanticTokens.adjectives.length;
    
    // Score based on archetype matches
    score += result.archetypalTags.length * 5;
    
    return Math.round(score);
  }

  /**
   * Reduce multiple summaries into a meta-summary
   */
  public reduceSummaries(results: LoreLinkerMultiResult[]): SummarizedLoreProfile {
    const successfulResults = results.filter(r => r.processingStatus === 'success');
    const failedResults = results.filter(r => r.processingStatus !== 'success');
    
    // Aggregate archetype frequencies
    const totalFrequencies: Record<string, number> = {};
    for (const result of successfulResults) {
      for (const [archetype, freq] of Object.entries(result.archetypeFrequencies)) {
        totalFrequencies[archetype] = (totalFrequencies[archetype] || 0) + freq;
      }
    }
    
    // Get top 3 archetypes
    const topArchetypes = Object.entries(totalFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([archetype]) => archetype);
    
    // Merge all semantic tokens
    const allKeywords: Record<string, string[]> = {
      nouns: [],
      verbs: [],
      adjectives: [],
    };
    
    const tokenFrequency: Record<string, Record<string, number>> = {
      nouns: {},
      verbs: {},
      adjectives: {},
    };
    
    for (const result of successfulResults) {
      for (const [category, tokens] of Object.entries(result.semanticTokens)) {
        for (const token of tokens) {
          tokenFrequency[category][token] = (tokenFrequency[category][token] || 0) + 1;
        }
      }
    }
    
    // Sort tokens by frequency and take top ones
    for (const category of ['nouns', 'verbs', 'adjectives']) {
      allKeywords[category] = Object.entries(tokenFrequency[category])
        .sort((a, b) => b[1] - a[1])
        .slice(0, category === 'nouns' ? MAX_NOUNS : MAX_VERBS)
        .map(([token]) => token);
    }
    
    // Create meta-summary from top-scoring documents
    const topDocs = successfulResults
      .sort((a, b) => b.documentScore - a.documentScore)
      .slice(0, 3);
    
    const metaSummary = this.createMetaSummary(topDocs);
    
    return {
      metaSummary,
      topArchetypes: topArchetypes.length > 0 ? topArchetypes : ['General Lore'],
      allKeywords,
      sourceURLs: results.map(r => r.sourceURL),
      sourceTitles: results.map(r => r.sourceTitle || 'Unknown'),
      totalDocuments: results.length,
      successfulDocuments: successfulResults.length,
      failedDocuments: failedResults.length,
    };
  }

  /**
   * Create a meta-summary from top documents
   */
  private createMetaSummary(topDocs: LoreLinkerMultiResult[]): string {
    if (topDocs.length === 0) {
      return 'No successful document processing.';
    }
    
    const summaries = topDocs.map(d => d.summary).filter(s => s !== '[unavailable]');
    
    if (summaries.length === 0) {
      return 'Unable to generate summary from processed documents.';
    }
    
    // Combine summaries and extract key sentences
    const combinedText = summaries.join(' ');
    const doc = nlp(combinedText);
    
    return this.summarize(doc);
  }

  /**
   * Clean markdown formatting from text
   */
  private cleanMarkdown(markdown: string): string {
    let cleaned = markdown;

    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // Remove markdown images and links
    cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, '');
    cleaned = cleaned.replace(/\[(.*?)\]\(.*?\)/g, '$1');

    // Remove markdown formatting
    cleaned = cleaned.replace(/^#+\s.*$/gm, '');
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    cleaned = cleaned.replace(/_(.*?)_/g, '$1');
    cleaned = cleaned.replace(/`{3}[\s\S]*?`{3}/g, '');
    cleaned = cleaned.replace(/`(.*?)`/g, '$1');
    cleaned = cleaned.replace(/^[\s]*[-*+]\s/gm, '');

    // Remove HTML entities
    cleaned = cleaned.replace(/&[a-z0-9#]+;/gi, '');

    // Remove URLs
    cleaned = cleaned.replace(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*/g, '');

    // Remove reference patterns
    cleaned = cleaned.replace(/\[\\"(.*?)\\"\]/g, '');
    cleaned = cleaned.replace(/\[\d+\]/g, '');
    cleaned = cleaned.replace(/\\\\?\[\d+\\\\?\]/g, '');
    cleaned = cleaned.replace(/\\\\?\[(.*?)\\\\?\]/g, '');

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * Summarize document with scoring
   */
  private summarize(doc: NlpDoc): string {
    const sentences: string[] = doc.sentences().out('array');
    if (sentences.length <= SUMMARY_SENTENCE_LIMIT) {
      return sentences.join(' ');
    }

    const keywords = [
      'astrology', 'myth', 'god', 'goddess', 'zodiac', 'planet', 'star', 'archetype',
      'celestial', 'cosmos', 'spiritual', 'divination', 'horoscope', 'chart', 'sign', 
      'house', 'aspect', 'tarot', 'oracle', 'mystic', 'sacred', 'ritual', 'magic',
    ];

    const scored = sentences.map((s: string) => {
      let score = 0;
      const sDoc = nlp(s);
      
      score += sDoc.people().length * ENTITY_SCORE_MULTIPLIER;
      score += sDoc.places().length * ENTITY_SCORE_MULTIPLIER;
      score += sDoc.organizations().length * ENTITY_SCORE_MULTIPLIER;

      keywords.forEach(k => {
        if (s.toLowerCase().includes(k)) {
          score += KEYWORD_SCORE_MULTIPLIER;
        }
      });

      if (s.length >= OPTIMAL_SENTENCE_MIN_LENGTH && 
          s.length <= OPTIMAL_SENTENCE_MAX_LENGTH) {
        score += OPTIMAL_SENTENCE_SCORE_BONUS;
      }

      return { sentence: s, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const selected: string[] = [];
    const seenIndices = new Set<number>();

    for (let i = 0; i < scored.length && selected.length < SUMMARY_SENTENCE_LIMIT; i++) {
      const current = scored[i];
      const index = sentences.indexOf(current.sentence);
      if (Array.from(seenIndices).every(idx => Math.abs(index - idx) >= 2)) {
        selected.push(current.sentence);
        seenIndices.add(index);
      }
    }

    return selected.join(' ');
  }

  /**
   * Extract semantic tokens with NLP
   */
  private extractSemanticTokens(doc: NlpDoc): Record<string, string[]> {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
      'to', 'of', 'in', 'on', 'at', 'for', 'with', 'as', 'by', 'from', 'up', 'down', 
      'etc', 'about', 'above', 'after', 'below', 'between', 'more', 'most', 'some', 
      'such', 'not', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 
      'should', 'now', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    ]);

    const cleanTokens = (tokens: string[]): string[] =>
      Array.from(new Set(tokens
        .filter(w => w.length > MIN_TOKEN_LENGTH && !stopWords.has(w.toLowerCase()))
        .map(w => {
          const base = nlp(w);
          return base.verbs().toInfinitive().out('text') ||
                 base.nouns().toSingular().out('text') ||
                 w.toLowerCase();
        })));

    return {
      nouns: cleanTokens(doc.nouns().out('array')).slice(0, MAX_NOUNS),
      verbs: cleanTokens(doc.verbs().out('array')).slice(0, MAX_VERBS),
      adjectives: cleanTokens(doc.adjectives().out('array')).slice(0, MAX_ADJECTIVES),
    };
  }

  /**
   * Extract archetypal tags from document
   */
  private extractArchetypalTags(doc: NlpDoc): string[] {
    const matched = new Set<string>();
    const text = doc.text().toLowerCase();

    for (const [type, keywords] of Object.entries(this.archetypeDefinitions)) {
      const pattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'i');
      if (pattern.test(text)) {
        matched.add(type);
      }
    }

    return matched.size > 0 ? Array.from(matched) : ['General Lore'];
  }

  /**
   * Extract title from content if metadata is not available
   */
  private extractTitleFromContent(text: string): string {
    const sentences = text.split(/[.!?]+/);
    if (sentences.length > 0 && sentences[0].length < 100) {
      return sentences[0].trim();
    }
    return 'Untitled Document';
  }

  // Cache management methods

  /**
   * Get cached result
   */
  private async getCachedResult(url: string): Promise<LoreLinkerResult | null> {
    const key = this.getCacheKey(url);

    // Try Redis first
    if (this.redis) {
      try {
        const cached = await this.redis.get(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (Date.now() - entry.timestamp < CACHE_TTL_SECONDS * 1000) {
            return entry.result;
          }
        }
      } catch (err) {
        this.logger.warn('Redis cache read error', err);
      }
    }

    // Fall back to local cache
    const localEntry = this.localCache.get(key);
    if (localEntry && Date.now() - localEntry.timestamp < CACHE_TTL_SECONDS * 1000) {
      return localEntry.result;
    }

    return null;
  }

  /**
   * Cache result
   */
  private async cacheResult(url: string, result: LoreLinkerResult): Promise<void> {
    const key = this.getCacheKey(url);
    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
    };

    // Cache in Redis
    if (this.redis) {
      try {
        await this.redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(entry));
      } catch (err) {
        this.logger.warn('Redis cache write error', err);
      }
    }

    // Always cache locally as fallback
    this.localCache.set(key, entry);

    // Clean up old local cache entries
    if (this.localCache.size > 100) {
      const sortedEntries = Array.from(this.localCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < 50; i++) {
        this.localCache.delete(sortedEntries[i][0]);
      }
    }
  }

  /**
   * Generate cache key for URL
   */
  private getCacheKey(url: string): string {
    return `lorelinker:${createHash('sha256').update(url).digest('hex')}`;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
    this.localCache.clear();
  }
}

// Export types for external use
export type {
  LoreLinkerResult,
  LoreLinkerMultiResult,
  SummarizedLoreProfile,
  Logger,
};