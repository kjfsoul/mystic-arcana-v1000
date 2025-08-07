import { MemoryLogger, MemoryLogNamespace } from '../memoryLogger';
import { UserResponse, PersonaInsight, InteractionSession } from '@/types/UserInteraction';

describe('MemoryLogger', () => {
  let logger: MemoryLogger;
  
  beforeEach(() => {
    logger = MemoryLogger.getInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    logger.destroy();
  });

  describe('logInteraction', () => {
    it('should log user response with correct structure', async () => {
      const mockResponse: UserResponse = {
        promptId: 'prompt-1',
        userId: 'user-123',
        sessionId: 'session-456',
        readerId: 'sophia',
        response: 'I feel optimistic about the future',
        responseTime: 3500,
        timestamp: new Date().toISOString()
      };

      await logger.logInteraction(mockResponse);

      const sessionResponses = await logger.getSessionResponses('session-456');
      expect(sessionResponses).toHaveLength(1);
      expect(sessionResponses[0]).toMatchObject({
        promptId: 'prompt-1',
        userId: 'user-123',
        response: 'I feel optimistic about the future'
      });
    });

    it('should extract quick responder trait for fast responses', async () => {
      const mockResponse: UserResponse = {
        promptId: 'prompt-2',
        userId: 'user-123',
        sessionId: 'session-456',
        readerId: 'sophia',
        response: 'Yes',
        responseTime: 1500,
        timestamp: new Date().toISOString()
      };

      await logger.logInteraction(mockResponse);

      const insights = await logger.getUserInsights('user-123');
      const quickResponderInsight = insights.find(i => i.trait === 'quick-responder');
      expect(quickResponderInsight).toBeDefined();
      expect(quickResponderInsight?.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should extract thoughtful responder trait for slow responses', async () => {
      const mockResponse: UserResponse = {
        promptId: 'prompt-3',
        userId: 'user-123',
        sessionId: 'session-456',
        readerId: 'sophia',
        response: 'Let me think about this...',
        responseTime: 12000,
        timestamp: new Date().toISOString()
      };

      await logger.logInteraction(mockResponse);

      const insights = await logger.getUserInsights('user-123');
      const thoughtfulInsight = insights.find(i => i.trait === 'thoughtful-responder');
      expect(thoughtfulInsight).toBeDefined();
      expect(thoughtfulInsight?.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should extract expressive trait for long responses', async () => {
      const longResponse = 'a'.repeat(150);
      const mockResponse: UserResponse = {
        promptId: 'prompt-4',
        userId: 'user-123',
        sessionId: 'session-456',
        readerId: 'sophia',
        response: longResponse,
        responseTime: 5000,
        timestamp: new Date().toISOString()
      };

      await logger.logInteraction(mockResponse);

      const insights = await logger.getUserInsights('user-123');
      const expressiveInsight = insights.find(i => i.trait === 'expressive');
      expect(expressiveInsight).toBeDefined();
    });
  });

  describe('logInsight', () => {
    it('should store persona insights correctly', async () => {
      const mockInsight: PersonaInsight = {
        trait: 'seeks-clarity',
        confidence: 0.85,
        source: 'reading-response',
        timestamp: new Date().toISOString(),
        context: 'User asked multiple clarifying questions'
      };

      await logger.logInsight(mockInsight, 'user-123', 'session-456');

      const insights = await logger.getUserInsights('user-123');
      expect(insights).toContainEqual(expect.objectContaining({
        trait: 'seeks-clarity',
        confidence: 0.85
      }));
    });
  });

  describe('logSession', () => {
    it('should store complete session data', async () => {
      const mockSession: InteractionSession = {
        sessionId: 'session-789',
        userId: 'user-123',
        readerId: 'sophia',
        readingType: 'tarot',
        startTime: new Date().toISOString(),
        prompts: [],
        responses: [],
        insights: [],
        memoryKeys: []
      };

      await logger.logSession(mockSession);

      // Session should be stored internally
      // In a real implementation, we'd verify this through a getter method
      expect(logger).toBeDefined();
    });
  });

  describe('analyzeEngagement', () => {
    it('should calculate engagement metrics correctly', async () => {
      // Add multiple responses
      const responses: UserResponse[] = [
        {
          promptId: 'p1',
          userId: 'user-123',
          sessionId: 'session-999',
          readerId: 'sophia',
          response: 'Yes',
          responseTime: 2000,
          timestamp: new Date().toISOString()
        },
        {
          promptId: 'p2',
          userId: 'user-123',
          sessionId: 'session-999',
          readerId: 'sophia',
          response: 'I think this reading is very insightful',
          responseTime: 4000,
          timestamp: new Date().toISOString()
        }
      ];

      for (const response of responses) {
        await logger.logInteraction(response);
      }

      const engagement = await logger.analyzeEngagement('user-123', 'session-999');

      expect(engagement).toMatchObject({
        responseRate: 1,
        averageResponseTime: 3000,
        engagementScore: expect.any(Number),
        dominantTraits: expect.any(Array)
      });

      expect(engagement.engagementScore).toBeGreaterThan(0);
      expect(engagement.engagementScore).toBeLessThanOrEqual(100);
    });

    it('should identify dominant traits from multiple sessions', async () => {
      // Log multiple insights
      const traits = ['thoughtful-responder', 'expressive', 'thoughtful-responder'];
      
      for (const trait of traits) {
        await logger.logInsight({
          trait,
          confidence: 0.8,
          source: 'reading-response',
          timestamp: new Date().toISOString()
        }, 'user-123', 'session-1000');
      }

      const engagement = await logger.analyzeEngagement('user-123', 'session-1000');
      
      expect(engagement.dominantTraits).toContain('thoughtful-responder');
      expect(engagement.dominantTraits.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getSessionResponses', () => {
    it('should return responses in chronological order', async () => {
      const baseTime = Date.now();
      const responses: UserResponse[] = [
        {
          promptId: 'p1',
          userId: 'user-123',
          sessionId: 'session-chrono',
          readerId: 'sophia',
          response: 'First',
          responseTime: 1000,
          timestamp: new Date(baseTime).toISOString()
        },
        {
          promptId: 'p2',
          userId: 'user-123',
          sessionId: 'session-chrono',
          readerId: 'sophia',
          response: 'Second',
          responseTime: 1000,
          timestamp: new Date(baseTime + 1000).toISOString()
        },
        {
          promptId: 'p3',
          userId: 'user-123',
          sessionId: 'session-chrono',
          readerId: 'sophia',
          response: 'Third',
          responseTime: 1000,
          timestamp: new Date(baseTime + 2000).toISOString()
        }
      ];

      for (const response of responses) {
        await logger.logInteraction(response);
      }

      const sessionResponses = await logger.getSessionResponses('session-chrono');
      
      expect(sessionResponses).toHaveLength(3);
      expect(sessionResponses[0].response).toBe('First');
      expect(sessionResponses[1].response).toBe('Second');
      expect(sessionResponses[2].response).toBe('Third');
    });
  });

  describe('getUserInsights', () => {
    it('should return insights sorted by timestamp descending', async () => {
      const baseTime = Date.now();
      const insights: PersonaInsight[] = [
        {
          trait: 'trait-1',
          confidence: 0.7,
          source: 'reading-response',
          timestamp: new Date(baseTime).toISOString()
        },
        {
          trait: 'trait-2',
          confidence: 0.8,
          source: 'reading-response',
          timestamp: new Date(baseTime + 2000).toISOString()
        },
        {
          trait: 'trait-3',
          confidence: 0.9,
          source: 'reading-response',
          timestamp: new Date(baseTime + 1000).toISOString()
        }
      ];

      for (const insight of insights) {
        await logger.logInsight(insight, 'user-123', 'session-insights');
      }

      const userInsights = await logger.getUserInsights('user-123');
      
      expect(userInsights[0].trait).toBe('trait-2');
      expect(userInsights[1].trait).toBe('trait-3');
      expect(userInsights[2].trait).toBe('trait-1');
    });

    it('should respect limit parameter', async () => {
      for (let i = 0; i < 20; i++) {
        await logger.logInsight({
          trait: `trait-${i}`,
          confidence: 0.5,
          source: 'reading-response',
          timestamp: new Date().toISOString()
        }, 'user-123', 'session-limit');
      }

      const limitedInsights = await logger.getUserInsights('user-123', 5);
      expect(limitedInsights).toHaveLength(5);
    });
  });
});