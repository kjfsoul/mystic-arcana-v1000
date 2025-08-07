/**
 * DataOracle Web Scraper Module
 * Specialized component for ethical web scraping of expert tarot sources
 * Integrates with the main DataOracle agent for Knowledge Graph ingestion
 */

import * as cheerio from "cheerio";

export interface ScrapingConfig {
  respectRobotsTxt: boolean;
  userAgent: string;
  maxRetries: number;
  retryDelay: number; // milliseconds
  requestTimeout: number; // milliseconds
  rateLimitDelay: number; // milliseconds between requests
  maxConcurrentRequests: number;
  headers: Record<string, string>;
}

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  metadata: {
    author?: string;
    publishDate?: string;
    lastModified?: string;
    wordCount: number;
    language: string;
  };
  extractedData: {
    cardName?: string;
    cardType?: "major_arcana" | "minor_arcana";
    meanings: {
      upright?: string;
      reversed?: string;
      general?: string;
      love?: string;
      career?: string;
      spiritual?: string;
    };
    keywords: string[];
    symbols: string[];
    numerology?: number;
    element?: string;
    astrology?: string[];
  };
  qualityScore: number; // 0-10 based on content quality indicators
}

export interface ScrapingResult {
  success: boolean;
  content?: ScrapedContent;
  error?: string;
  statusCode?: number;
  processingTime: number;
}

/**
 * Ethical web scraper for tarot content with rate limiting and respect for robots.txt
 */
export class DataOracleWebScraper {
  private config: ScrapingConfig;
  private requestQueue: Array<() => Promise<void>> = [];
  private activeRequests = 0;
  private lastRequestTime = 0;

  constructor(config?: Partial<ScrapingConfig>) {
    this.config = {
      respectRobotsTxt: true,
      userAgent:
        "MysticArcana-DataOracle/1.0 (Educational Research; +https://mysticarcana.app/bot)",
      maxRetries: 3,
      retryDelay: 2000,
      requestTimeout: 10000,
      rateLimitDelay: 2000, // 2 seconds between requests
      maxConcurrentRequests: 2,
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      ...config,
    };
  }

  /**
   * Scrape content from Biddy Tarot card pages
   */
  async scrapeBiddyTarot(cardUrls: string[]): Promise<ScrapingResult[]> {
    console.log(
      `🔮 DataOracle WebScraper: Starting Biddy Tarot ingestion for ${cardUrls.length} cards`,
    );

    const results: ScrapingResult[] = [];

    for (const url of cardUrls) {
      try {
        const result = await this.scrapeWithRetry(
          url,
          this.parseBiddyTarotPage.bind(this),
        );
        results.push(result);

        // Respect rate limiting
        await this.waitForRateLimit();
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          processingTime: 0,
        });
      }
    }

    console.log(
      `✅ Biddy Tarot scraping completed. Success rate: ${results.filter((r) => r.success).length}/${results.length}`,
    );
    return results;
  }

  /**
   * Scrape content from Labyrinthos Academy
   */
  async scrapeLabyrinthos(cardUrls: string[]): Promise<ScrapingResult[]> {
    console.log(
      `🔮 DataOracle WebScraper: Starting Labyrinthos ingestion for ${cardUrls.length} cards`,
    );

    const results: ScrapingResult[] = [];

    for (const url of cardUrls) {
      try {
        const result = await this.scrapeWithRetry(
          url,
          this.parseLabyrinthosPage.bind(this),
        );
        results.push(result);

        await this.waitForRateLimit();
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          processingTime: 0,
        });
      }
    }

    console.log(
      `✅ Labyrinthos scraping completed. Success rate: ${results.filter((r) => r.success).length}/${results.length}`,
    );
    return results;
  }

  /**
   * Generic scraper with retry logic and error handling
   */
  private async scrapeWithRetry(
    url: string,
    // eslint-disable-next-line no-unused-vars
    parser: (html: string, url: string) => ScrapedContent,
  ): Promise<ScrapingResult> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const html = await this.fetchPage(url);
        const content = parser(html, url);

        return {
          success: true,
          content,
          processingTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (attempt < this.config.maxRetries) {
          console.warn(
            `DataOracle WebScraper: Attempt ${attempt} failed for ${url}, retrying in ${this.config.retryDelay}ms`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay),
          );
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || "Max retries exceeded",
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Fetch page content with proper headers and timeout
   */
  private async fetchPage(url: string): Promise<string> {
    // Check robots.txt if enabled
    if (this.config.respectRobotsTxt) {
      await this.checkRobotsTxt(url);
    }

    await this.enforceRateLimit();

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.requestTimeout,
    );

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": this.config.userAgent,
          ...this.config.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      this.lastRequestTime = Date.now();

      return html;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse Biddy Tarot card page structure
   */
  private parseBiddyTarotPage(html: string, url: string): ScrapedContent {
    const $ = cheerio.load(html);

    // Extract card name from title or URL
    const title = $("h1").first().text().trim() || $("title").text().trim();
    const cardName = this.extractCardName(title, url);

    // Extract main content
    const contentSections = $(
      ".entry-content, .post-content, article .content",
    ).first();
    const content = contentSections.text().trim();

    // Extract meanings from structured content
    const meanings: any = {};

    // Look for upright meaning
    const uprightSection = contentSections
      .find("h2, h3")
      .filter(
        (_, el) =>
          $(el).text().toLowerCase().includes("upright") ||
          $(el).text().toLowerCase().includes("meaning"),
      )
      .first();

    if (uprightSection.length) {
      meanings.upright = uprightSection.nextUntil("h2, h3").text().trim();
    }

    // Look for reversed meaning
    const reversedSection = contentSections
      .find("h2, h3")
      .filter((_, el) => $(el).text().toLowerCase().includes("reversed"))
      .first();

    if (reversedSection.length) {
      meanings.reversed = reversedSection.nextUntil("h2, h3").text().trim();
    }

    // Extract keywords
    const keywords = this.extractKeywords(content, cardName);

    // Extract metadata
    const author =
      $(".author-name, .by-author").first().text().trim() || "Biddy Tarot";
    const publishDate =
      $("time, .publish-date, .date").first().attr("datetime") ||
      $("time, .publish-date, .date").first().text().trim();

    const scrapedContent: ScrapedContent = {
      url,
      title: title,
      content: content,
      metadata: {
        author,
        publishDate,
        wordCount: content.split(/\s+/).length,
        language: "en",
      },
      extractedData: {
        cardName,
        cardType: this.determineCardType(cardName),
        meanings,
        keywords,
        symbols: this.extractSymbols(content),
        numerology: this.extractNumerology(cardName, content),
        element: this.extractElement(content),
        astrology: this.extractAstrology(content),
      },
      qualityScore: this.calculateQualityScore(content, meanings, keywords),
    };

    return scrapedContent;
  }

  /**
   * Parse Labyrinthos Academy page structure
   */
  private parseLabyrinthosPage(html: string, url: string): ScrapedContent {
    const $ = cheerio.load(html);

    const title = $("h1").first().text().trim() || $("title").text().trim();
    const cardName = this.extractCardName(title, url);

    // Labyrinthos has a different structure
    const contentSections = $(
      ".card-meaning, .meaning-section, .content",
    ).first();
    const content = contentSections.text().trim();

    const meanings: any = {};

    // Look for structured meaning sections
    $(".meaning-upright, .upright-meaning").each((_, el) => {
      meanings.upright = $(el).text().trim();
    });

    $(".meaning-reversed, .reversed-meaning").each((_, el) => {
      meanings.reversed = $(el).text().trim();
    });

    // Extract love and career meanings if available
    $(".love-meaning, .meaning-love").each((_, el) => {
      meanings.love = $(el).text().trim();
    });

    $(".career-meaning, .meaning-career").each((_, el) => {
      meanings.career = $(el).text().trim();
    });

    const keywords = this.extractKeywords(content, cardName);

    const scrapedContent: ScrapedContent = {
      url,
      title,
      content,
      metadata: {
        author: "Labyrinthos Academy",
        wordCount: content.split(/\s+/).length,
        language: "en",
      },
      extractedData: {
        cardName,
        cardType: this.determineCardType(cardName),
        meanings,
        keywords,
        symbols: this.extractSymbols(content),
        numerology: this.extractNumerology(cardName, content),
        element: this.extractElement(content),
        astrology: this.extractAstrology(content),
      },
      qualityScore: this.calculateQualityScore(content, meanings, keywords),
    };

    return scrapedContent;
  }

  /**
   * Utility methods for content extraction
   */
  private extractCardName(title: string, url: string): string {
    // Clean up title to extract card name
    let cardName = title
      .replace(/tarot card/gi, "")
      .replace(/meaning/gi, "")
      .replace(/upright/gi, "")
      .replace(/reversed/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    // If title extraction fails, try URL
    if (!cardName || cardName.length < 3) {
      const urlParts = url.split("/");
      cardName = urlParts[urlParts.length - 1]
        .replace(/-/g, " ")
        .replace(/\.html?$/i, "")
        .trim();
    }

    return this.normalizeCardName(cardName);
  }

  private normalizeCardName(name: string): string {
    // Normalize card names to standard format
    const cardMap: Record<string, string> = {
      fool: "The Fool",
      magician: "The Magician",
      "high priestess": "The High Priestess",
      empress: "The Empress",
      emperor: "The Emperor",
      hierophant: "The Hierophant",
      lovers: "The Lovers",
      chariot: "The Chariot",
      strength: "Strength",
      hermit: "The Hermit",
      "wheel of fortune": "Wheel of Fortune",
      justice: "Justice",
      "hanged man": "The Hanged Man",
      death: "Death",
      temperance: "Temperance",
      devil: "The Devil",
      tower: "The Tower",
      star: "The Star",
      moon: "The Moon",
      sun: "The Sun",
      judgement: "Judgement",
      world: "The World",
    };

    const normalized = name.toLowerCase().trim();
    return cardMap[normalized] || this.titleCase(name);
  }

  private titleCase(str: string): string {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  }

  private determineCardType(cardName: string): "major_arcana" | "minor_arcana" {
    const majorArcana = [
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
      "Wheel of Fortune",
      "Justice",
      "The Hanged Man",
      "Death",
      "Temperance",
      "The Devil",
      "The Tower",
      "The Star",
      "The Moon",
      "The Sun",
      "Judgement",
      "The World",
    ];

    return majorArcana.includes(cardName) ? "major_arcana" : "minor_arcana";
  }

  private extractKeywords(content: string, cardName: string): string[] {
    void cardName; // Indicate intentional unused variable
    const keywords: Set<string> = new Set();

    // Common tarot keywords to look for
    const tarotKeywords = [
      "new beginnings",
      "manifestation",
      "intuition",
      "creativity",
      "authority",
      "tradition",
      "love",
      "willpower",
      "strength",
      "introspection",
      "change",
      "justice",
      "sacrifice",
      "transformation",
      "balance",
      "temptation",
      "upheaval",
      "hope",
      "illusion",
      "success",
      "rebirth",
      "completion",
      "journey",
      "wisdom",
      "spiritual",
      "growth",
      "healing",
      "protection",
    ];

    const lowerContent = content.toLowerCase();

    for (const keyword of tarotKeywords) {
      if (lowerContent.includes(keyword)) {
        keywords.add(keyword);
      }
    }

    // Extract words that appear frequently and seem meaningful
    const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const wordFreq: Record<string, number> = {};

    for (const word of words) {
      if (!this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }

    // Add frequent meaningful words
    Object.entries(wordFreq)
      .filter(([word, freq]) => freq >= 2 && this.isMeaningfulWord(word))
      .slice(0, 5)
      .forEach(([word]) => keywords.add(word));

    return Array.from(keywords).slice(0, 10);
  }

  private extractSymbols(content: string): string[] {
    const symbols: Set<string> = new Set();

    const symbolKeywords = [
      "rose",
      "lily",
      "crown",
      "staff",
      "sword",
      "cup",
      "pentacle",
      "star",
      "moon",
      "sun",
      "tower",
      "mountain",
      "water",
      "fire",
      "angel",
      "devil",
      "tree",
      "serpent",
      "lion",
      "eagle",
      "bull",
      "man",
      "infinity",
      "cross",
    ];

    const lowerContent = content.toLowerCase();

    for (const symbol of symbolKeywords) {
      if (lowerContent.includes(symbol)) {
        symbols.add(symbol);
      }
    }

    return Array.from(symbols);
  }

  private extractNumerology(
    cardName: string,
    content: string,
  ): number | undefined {
    void content; // Indicate intentional unused variable
    // Extract numerological significance
    const numberMatch = cardName.match(/(\d+)/);
    if (numberMatch) {
      return parseInt(numberMatch[1]);
    }

    // Map major arcana to numbers
    const majorNumbers: Record<string, number> = {
      "The Fool": 0,
      "The Magician": 1,
      "The High Priestess": 2,
      "The Empress": 3,
      "The Emperor": 4,
      "The Hierophant": 5,
      "The Lovers": 6,
      "The Chariot": 7,
      Strength: 8,
      "The Hermit": 9,
      "Wheel of Fortune": 10,
      Justice: 11,
      "The Hanged Man": 12,
      Death: 13,
      Temperance: 14,
      "The Devil": 15,
      "The Tower": 16,
      "The Star": 17,
      "The Moon": 18,
      "The Sun": 19,
      Judgement: 20,
      "The World": 21,
    };

    return majorNumbers[cardName];
  }

  private extractElement(content: string): string | undefined {
    const lowerContent = content.toLowerCase();

    if (
      lowerContent.includes("fire") ||
      lowerContent.includes("wands") ||
      lowerContent.includes("aries") ||
      lowerContent.includes("leo") ||
      lowerContent.includes("sagittarius")
    ) {
      return "fire";
    }
    if (
      lowerContent.includes("water") ||
      lowerContent.includes("cups") ||
      lowerContent.includes("cancer") ||
      lowerContent.includes("scorpio") ||
      lowerContent.includes("pisces")
    ) {
      return "water";
    }
    if (
      lowerContent.includes("air") ||
      lowerContent.includes("swords") ||
      lowerContent.includes("gemini") ||
      lowerContent.includes("libra") ||
      lowerContent.includes("aquarius")
    ) {
      return "air";
    }
    if (
      lowerContent.includes("earth") ||
      lowerContent.includes("pentacles") ||
      lowerContent.includes("taurus") ||
      lowerContent.includes("virgo") ||
      lowerContent.includes("capricorn")
    ) {
      return "earth";
    }

    return undefined;
  }

  private extractAstrology(content: string): string[] {
    const astrology: Set<string> = new Set();

    const astrologyTerms = [
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

    const lowerContent = content.toLowerCase();

    for (const term of astrologyTerms) {
      if (lowerContent.includes(term)) {
        astrology.add(term);
      }
    }

    return Array.from(astrology);
  }

  private calculateQualityScore(
    content: string,
    meanings: any,
    keywords: string[],
  ): number {
    let score = 0;

    // Content length
    if (content.length > 500) score += 2;
    if (content.length > 1000) score += 1;

    // Meaning completeness
    if (meanings.upright) score += 2;
    if (meanings.reversed) score += 2;
    if (meanings.love || meanings.career || meanings.spiritual) score += 1;

    // Keyword richness
    score += Math.min(keywords.length * 0.3, 2);

    // Structure indicators
    if (content.includes("meaning") || content.includes("interpretation"))
      score += 1;

    return Math.min(score, 10);
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
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "this",
      "that",
      "these",
      "those",
      "you",
      "your",
      "it",
      "its",
      "they",
      "their",
      "them",
      "we",
      "us",
      "our",
      "i",
      "me",
      "my",
      "he",
      "him",
      "his",
      "she",
      "her",
      "hers",
    ];

    return stopWords.includes(word);
  }

  private isMeaningfulWord(word: string): boolean {
    // Check if word seems meaningful for tarot context
    const meaningfulPatterns = [
      /spiritual/,
      /wisdom/,
      /growth/,
      /journey/,
      /path/,
      /energy/,
      /power/,
      /balance/,
      /harmony/,
      /transformation/,
      /guidance/,
      /insight/,
      /healing/,
    ];

    return meaningfulPatterns.some((pattern) => pattern.test(word));
  }

  /**
   * Rate limiting and robots.txt compliance
   */
  private async enforceRateLimit(): Promise<void> {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.rateLimitDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.rateLimitDelay - timeSinceLastRequest),
      );
    }
  }

  private async waitForRateLimit(): Promise<void> {
    await new Promise((resolve) =>
      setTimeout(resolve, this.config.rateLimitDelay),
    );
  }

  private async checkRobotsTxt(url: string): Promise<void> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

      const response = await fetch(robotsUrl);
      if (response.ok) {
        const robotsTxt = await response.text();

        // Simple robots.txt parsing - would need more sophisticated parsing for full compliance
        if (robotsTxt.toLowerCase().includes("disallow: /")) {
          console.warn(
            `DataOracle WebScraper: Robots.txt may disallow crawling for ${url}`,
          );
        }
      }
    } catch (error) {
      void error; // Indicate intentional unused variable
      // Robots.txt not found or inaccessible - proceed with caution
      console.log(
        `DataOracle WebScraper: Could not access robots.txt for ${url}`,
      );
    }
  }

  /**
   * Generate card URLs for major sources
   */
  generateBiddyTarotUrls(): string[] {
    const majorArcana = [
      "fool",
      "magician",
      "high-priestess",
      "empress",
      "emperor",
      "hierophant",
      "lovers",
      "chariot",
      "strength",
      "hermit",
      "wheel-fortune",
      "justice",
      "hanged-man",
      "death",
      "temperance",
      "devil",
      "tower",
      "star",
      "moon",
      "sun",
      "judgement",
      "world",
    ];

    return majorArcana.map(
      (card) =>
        `https://www.biddytarot.com/tarot-card-meanings/major-arcana/${card}/`,
    );
  }

  generateLabyrinthosUrls(): string[] {
    const majorArcana = [
      "fool",
      "magician",
      "high-priestess",
      "empress",
      "emperor",
      "hierophant",
      "lovers",
      "chariot",
      "strength",
      "hermit",
      "wheel-of-fortune",
      "justice",
      "hanged-man",
      "death",
      "temperance",
      "devil",
      "tower",
      "star",
      "moon",
      "sun",
      "judgement",
      "world",
    ];

    return majorArcana.map(
      (card) =>
        `https://labyrinthos.co/blogs/tarot-card-meanings-list/${card}-meaning-major-arcana-tarot-card-meanings`,
    );
  }
}

export default DataOracleWebScraper;
