import { jest } from '@jest/globals';
import { LoreLinkerAgentMulti } from './LoreLinkerAgentMulti';
import type { 
  LoreLinkerResult, 
  LoreLinkerMultiResult, 
  SummarizedLoreProfile,
  Logger 
} from './LoreLinkerAgentMulti';

// Mock Firecrawl
jest.mock('firecrawl', () => {
  return jest.fn().mockImplementation(() => ({
    scrapeUrl: jest.fn(),
  }));
});

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    setex: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  }));
});

// Mock logger for testing
const mockLogger: Logger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Sample mock data
const mockFirecrawlResponses = {
  success: {
    markdown: `
      # The Hero's Journey in Ancient Mythology
      
      The hero archetype appears throughout ancient myths and legends. From the Greek hero Perseus 
      to the Norse warrior Thor, these champions embark on epic quests to save their people.
      
      ## The Shadow and the Light
      
      Every hero must face their shadow, the dark aspects of their personality. This battle between 
      light and darkness is central to the mythological narrative. The magician Merlin guided King 
      Arthur through such trials.
      
      ## The Trickster's Role
      
      The trickster brings chaos and change. Loki in Norse mythology and Hermes in Greek tales 
      serve as divine jesters, using mischief to reveal truth.
    `,
    metadata: {
      title: "Hero's Journey in Mythology",
      description: 'An exploration of archetypal patterns in ancient myths',
      language: 'en',
    },
  },
  astrology: {
    markdown: `
      # Astrology and the Zodiac
      
      The zodiac signs represent twelve archetypal energies. Aries the warrior leads with courage,
      while Pisces the mystic seeks spiritual truth. Each planet governs specific aspects of our
      celestial chart.
      
      ## Venus and the Lover
      
      Venus governs love, desire, and artistic creation. In the horoscope, Venus reveals our
      approach to romance and beauty. The lover archetype manifests through Venusian influence.
    `,
    metadata: {
      title: 'Astrology and Archetypes',
      language: 'en',
    },
  },
  nonEnglish: {
    markdown: 'Ceci est un texte en français sur la mythologie.',
    metadata: {
      title: 'Mythologie Française',
      language: 'fr',
    },
  },
  quotaExceeded: null,
};

describe('LoreLinkerAgentMulti', () => {
  let agent: LoreLinkerAgentMulti;
  let mockScrapeUrl: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Setup Firecrawl mock
    const Firecrawl = require('firecrawl');
    mockScrapeUrl = jest.fn();
    Firecrawl.mockImplementation(() => ({
      scrapeUrl: mockScrapeUrl,
    }));

    agent = new LoreLinkerAgentMulti({
      logger: mockLogger,
      useCache: false, // Disable cache for testing
    });
  });

  afterEach(async () => {
    await agent.cleanup();
  });

  describe('processUrl (backward compatibility)', () => {
    it('should process a single URL and return LoreLinkerResult', async () => {
      mockScrapeUrl.mockResolvedValueOnce(mockFirecrawlResponses.success);

      const result = await agent.processUrl('https://example.com/mythology');

      expect(result).toBeDefined();
      expect(result.sourceURL).toBe('https://example.com/mythology');
      expect(result.sourceTitle).toBe("Hero's Journey in Mythology");
      expect(result.processingStatus).toBe('success');
      expect(result.archetypalTags).toContain('Hero');
      expect(result.semanticTokens.nouns).toBeInstanceOf(Array);
    });

    it('should handle failed URL with stub result', async () => {
      mockScrapeUrl.mockRejectedValue(new Error('Network error'));

      const result = await agent.processUrl('https://example.com/failed');

      expect(result.processingStatus).toBe('failed');
      expect(result.summary).toBe('[unavailable]');
      expect(result.error).toBe('Network error');
    });
  });

  describe('processMultipleUrls', () => {
    it('should process multiple URLs successfully', async () => {
      mockScrapeUrl
        .mockResolvedValueOnce(mockFirecrawlResponses.success)
        .mockResolvedValueOnce(mockFirecrawlResponses.astrology);

      const urls = [
        'https://example.com/mythology',
        'https://example.com/astrology',
      ];

      const results = await agent.processMultipleUrls(urls);

      expect(results).toHaveLength(2);
      expect(results[0].processingStatus).toBe('success');
      expect(results[1].processingStatus).toBe('success');
      expect(results[0].archetypeFrequencies).toBeDefined();
      expect(results[0].documentScore).toBeGreaterThan(0);
    });

    it('should handle quota exceeded gracefully', async () => {
      const quotaError = new Error('API quota exceeded');
      quotaError.code = 'QUOTA_EXCEEDED';
      mockScrapeUrl.mockRejectedValue(quotaError);

      const results = await agent.processMultipleUrls(['https://example.com/quota']);

      expect(results[0].processingStatus).toBe('quota_exceeded');
      expect(results[0].summary).toBe('[unavailable]');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should filter non-English content', async () => {
      mockScrapeUrl.mockResolvedValueOnce(mockFirecrawlResponses.nonEnglish);

      const results = await agent.processMultipleUrls(['https://example.com/french']);

      expect(results[0].processingStatus).toBe('failed');
      expect(results[0].error).toContain('Non-English content filtered');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Skipping non-English content')
      );
    });

    it('should handle mixed success and failure', async () => {
      mockScrapeUrl
        .mockResolvedValueOnce(mockFirecrawlResponses.success)
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce(mockFirecrawlResponses.astrology);

      const urls = [
        'https://example.com/success1',
        'https://example.com/failed',
        'https://example.com/success2',
      ];

      const results = await agent.processMultipleUrls(urls);

      expect(results).toHaveLength(3);
      expect(results[0].processingStatus).toBe('success');
      expect(results[1].processingStatus).toBe('failed');
      expect(results[2].processingStatus).toBe('success');
    });
  });

  describe('reduceSummaries', () => {
    it('should create meta-summary from multiple results', async () => {
      mockScrapeUrl
        .mockResolvedValueOnce(mockFirecrawlResponses.success)
        .mockResolvedValueOnce(mockFirecrawlResponses.astrology);

      const urls = [
        'https://example.com/mythology',
        'https://example.com/astrology',
      ];

      const results = await agent.processMultipleUrls(urls);
      const summary = agent.reduceSummaries(results);

      expect(summary.totalDocuments).toBe(2);
      expect(summary.successfulDocuments).toBe(2);
      expect(summary.failedDocuments).toBe(0);
      expect(summary.topArchetypes).toBeInstanceOf(Array);
      expect(summary.topArchetypes.length).toBeLessThanOrEqual(3);
      expect(summary.metaSummary).toBeTruthy();
      expect(summary.allKeywords.nouns).toBeInstanceOf(Array);
      expect(summary.sourceURLs).toEqual(urls);
    });

    it('should handle all failed results gracefully', async () => {
      const failedResults: LoreLinkerMultiResult[] = [
        {
          summary: '[unavailable]',
          semanticTokens: { nouns: [], verbs: [], adjectives: [] },
          archetypalTags: ['Unknown'],
          sourceURL: 'https://example.com/failed1',
          processingStatus: 'failed',
          error: 'Network error',
          documentScore: 0,
          archetypeFrequencies: {},
        },
        {
          summary: '[unavailable]',
          semanticTokens: { nouns: [], verbs: [], adjectives: [] },
          archetypalTags: ['Unknown'],
          sourceURL: 'https://example.com/failed2',
          processingStatus: 'quota_exceeded',
          error: 'Quota exceeded',
          documentScore: 0,
          archetypeFrequencies: {},
        },
      ];

      const summary = agent.reduceSummaries(failedResults);

      expect(summary.totalDocuments).toBe(2);
      expect(summary.successfulDocuments).toBe(0);
      expect(summary.failedDocuments).toBe(2);
      expect(summary.metaSummary).toBe('No successful document processing.');
      expect(summary.topArchetypes).toEqual(['General Lore']);
    });

    it('should rank archetypes by frequency', async () => {
      // Create mock results with specific archetype frequencies
      const mockResults: LoreLinkerMultiResult[] = [
        {
          summary: 'Hero and warrior story',
          semanticTokens: { nouns: ['hero', 'warrior'], verbs: [], adjectives: [] },
          archetypalTags: ['Hero', 'Warrior'],
          sourceURL: 'https://example.com/1',
          processingStatus: 'success',
          documentScore: 10,
          archetypeFrequencies: { Hero: 5, Warrior: 3, Magician: 1 },
        },
        {
          summary: 'Magician and hero tale',
          semanticTokens: { nouns: ['magician'], verbs: [], adjectives: [] },
          archetypalTags: ['Magician', 'Hero'],
          sourceURL: 'https://example.com/2',
          processingStatus: 'success',
          documentScore: 8,
          archetypeFrequencies: { Magician: 4, Hero: 2, Sage: 1 },
        },
      ];

      const summary = agent.reduceSummaries(mockResults);

      expect(summary.topArchetypes[0]).toBe('Hero'); // Total: 7
      expect(summary.topArchetypes[1]).toBe('Magician'); // Total: 5
      expect(summary.topArchetypes[2]).toBe('Warrior'); // Total: 3
    });
  });

  describe('extractArchetypalTags (batch mode)', () => {
    it('should extract multiple archetype tags from rich content', async () => {
      mockScrapeUrl.mockResolvedValueOnce(mockFirecrawlResponses.success);

      const result = await agent.processUrl('https://example.com/mythology');

      expect(result.archetypalTags).toContain('Hero');
      expect(result.archetypalTags).toContain('Shadow');
      expect(result.archetypalTags).toContain('Trickster');
      expect(result.archetypalTags).toContain('Magician');
    });

    it('should return General Lore for content with no archetypes', async () => {
      mockScrapeUrl.mockResolvedValueOnce({
        markdown: 'This document contains basic information about weather patterns.',
        metadata: { language: 'en' },
      });

      const result = await agent.processUrl('https://example.com/generic');

      expect(result.archetypalTags).toEqual(['General Lore']);
    });
  });

  describe('Caching', () => {
    it('should cache and retrieve results', async () => {
      const agentWithCache = new LoreLinkerAgentMulti({
        logger: mockLogger,
        useCache: true,
      });

      mockScrapeUrl.mockResolvedValueOnce(mockFirecrawlResponses.success);

      // First call - should scrape
      const result1 = await agentWithCache.processUrl('https://example.com/cached');
      expect(mockScrapeUrl).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await agentWithCache.processUrl('https://example.com/cached');
      expect(mockScrapeUrl).toHaveBeenCalledTimes(1); // Still 1, not called again

      expect(result1.summary).toBe(result2.summary);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Cache hit')
      );

      await agentWithCache.cleanup();
    });
  });

  describe('Error handling and retries', () => {
    it('should retry on transient failures', async () => {
      mockScrapeUrl
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(mockFirecrawlResponses.success);

      const result = await agent.processUrl('https://example.com/retry');

      expect(result.processingStatus).toBe('success');
      expect(mockScrapeUrl).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Retry 1')
      );
    });

    it('should fail after max retries', async () => {
      mockScrapeUrl.mockRejectedValue(new Error('Persistent failure'));

      const result = await agent.processUrl('https://example.com/fail');

      expect(result.processingStatus).toBe('failed');
      expect(result.error).toBe('Persistent failure');
      expect(mockScrapeUrl).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Configuration options', () => {
    it('should use custom archetype definitions', async () => {
      const customAgent = new LoreLinkerAgentMulti({
        logger: mockLogger,
        archetypeDefinitions: {
          CustomHero: ['champion', 'savior'],
          CustomVillain: ['evil', 'darkness'],
        },
      });

      mockScrapeUrl.mockResolvedValueOnce({
        markdown: 'The champion faces the evil darkness.',
        metadata: { language: 'en' },
      });

      const result = await customAgent.processUrl('https://example.com/custom');

      expect(result.archetypalTags).toContain('CustomHero');
      expect(result.archetypalTags).toContain('CustomVillain');

      await customAgent.cleanup();
    });

    it('should apply language filter', async () => {
      const strictAgent = new LoreLinkerAgentMulti({
        logger: mockLogger,
        languageFilter: ['en', 'english'],
      });

      mockScrapeUrl
        .mockResolvedValueOnce({
          markdown: 'Contenido en español',
          metadata: { language: 'es' },
        });

      const result = await strictAgent.processUrl('https://example.com/spanish');

      expect(result.processingStatus).toBe('failed');
      expect(result.error).toContain('Non-English content filtered');

      await strictAgent.cleanup();
    });
  });

  describe('Document scoring', () => {
    it('should calculate document scores based on content richness', async () => {
      mockScrapeUrl
        .mockResolvedValueOnce(mockFirecrawlResponses.success)
        .mockResolvedValueOnce({
          markdown: 'Short text.',
          metadata: { language: 'en' },
        });

      const results = await agent.processMultipleUrls([
        'https://example.com/rich',
        'https://example.com/poor',
      ]);

      expect(results[0].documentScore).toBeGreaterThan(results[1].documentScore);
    });
  });

  describe('Batch processing', () => {
    it('should process URLs in batches when exceeding MAX_URLS_BATCH', async () => {
      const urls = Array(15).fill(null).map((_, i) => `https://example.com/page${i}`);
      
      mockScrapeUrl.mockResolvedValue(mockFirecrawlResponses.success);

      const results = await agent.processMultipleUrls(urls);

      expect(results).toHaveLength(15);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Processing 15 URLs in batches')
      );
    });
  });
});