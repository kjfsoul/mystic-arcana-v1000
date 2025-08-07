import {
  MemoryLogEntry,
  UserResponse,
  PersonaInsight,
  InteractionSession,
} from "@/types/UserInteraction";
import {
  PersonaInsightSource,
  MemoryLogNamespace,
} from "@/constants/EventTypes";

export class MemoryLogger {
  private static instance: MemoryLogger;
  private memoryStore: Map<string, MemoryLogEntry>;
  private pendingWrites: MemoryLogEntry[];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.memoryStore = new Map();
    this.pendingWrites = [];
    this.startFlushInterval();
  }

  static getInstance(): MemoryLogger {
    if (!MemoryLogger.instance) {
      MemoryLogger.instance = new MemoryLogger();
    }
    return MemoryLogger.instance;
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flushToAMem();
    }, 5000);
  }

  async logInteraction(response: UserResponse): Promise<void> {
    const key = `interaction:${response.userId}:${response.sessionId}:${response.promptId}`;
    const entry: MemoryLogEntry = {
      key,
      value: response,
      namespace: MemoryLogNamespace.USER_INTERACTION,
      userId: response.userId,
      sessionId: response.sessionId,
      timestamp: new Date().toISOString(),
      ttl: 60 * 60 * 24 * 30,
    };

    await this.store(entry);
    await this.analyzeAndExtract(response);
  }

  async logInsight(
    insight: PersonaInsight,
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const key = `insight:${userId}:${insight.trait}:${Date.now()}`;
    const entry: MemoryLogEntry = {
      key,
      value: insight,
      namespace: MemoryLogNamespace.PERSONA_LEARNING,
      userId,
      sessionId,
      timestamp: insight.timestamp,
      ttl: 60 * 60 * 24 * 90,
    };

    await this.store(entry);
  }

  async logSession(session: InteractionSession): Promise<void> {
    const key = `session:${session.userId}:${session.sessionId}`;
    const entry: MemoryLogEntry = {
      key,
      value: session,
      namespace: MemoryLogNamespace.READING_CONTEXT,
      userId: session.userId,
      sessionId: session.sessionId,
      timestamp: session.startTime,
      ttl: 60 * 60 * 24 * 180,
    };

    await this.store(entry);
  }

  private async store(entry: MemoryLogEntry): Promise<void> {
    this.memoryStore.set(entry.key, entry);
    this.pendingWrites.push(entry);

    if (this.pendingWrites.length >= 10) {
      await this.flushToAMem();
    }
  }

  private async analyzeAndExtract(response: UserResponse): Promise<void> {
    const responseTime = response.responseTime;
    const insights: PersonaInsight[] = [];

    if (responseTime < 2000) {
      insights.push({
        trait: "quick-responder",
        confidence: 0.7,
        source: PersonaInsightSource.READING_RESPONSE,
        timestamp: new Date().toISOString(),
        context: "Responds quickly to prompts",
      });
    } else if (responseTime > 10000) {
      insights.push({
        trait: "thoughtful-responder",
        confidence: 0.8,
        source: PersonaInsightSource.READING_RESPONSE,
        timestamp: new Date().toISOString(),
        context: "Takes time to consider responses",
      });
    }

    if (
      typeof response.response === "string" &&
      response.response.length > 100
    ) {
      insights.push({
        trait: "expressive",
        confidence: 0.75,
        source: PersonaInsightSource.READING_RESPONSE,
        timestamp: new Date().toISOString(),
        context: "Provides detailed responses",
      });
    }

    for (const insight of insights) {
      await this.logInsight(insight, response.userId, response.sessionId);
    }
  }

  private async flushToAMem(): Promise<void> {
    if (this.pendingWrites.length === 0) return;

    const writes = [...this.pendingWrites];
    this.pendingWrites = [];

    try {
      if (typeof window !== "undefined") {
        const response = await fetch("/api/mem/batch-write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: writes }),
        });

        if (!response.ok) {
          console.error("Failed to flush to a-mem:", response.statusText);
          this.pendingWrites.unshift(...writes);
        }
      } else {
        console.log(
          "[MemoryLogger] Server-side flush:",
          writes.length,
          "entries",
        );
      }
    } catch (error) {
      console.error("Error flushing to a-mem:", error);
      this.pendingWrites.unshift(...writes);
    }
  }

  async getUserInsights(
    userId: string,
    limit: number = 10,
  ): Promise<PersonaInsight[]> {
    const insights: PersonaInsight[] = [];

    for (const [_key, entry] of this.memoryStore.entries()) {
      if (
        entry.namespace === MemoryLogNamespace.PERSONA_LEARNING &&
        entry.userId === userId
      ) {
        insights.push(entry.value as PersonaInsight);
      }
    }

    return insights
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  async getSessionResponses(sessionId: string): Promise<UserResponse[]> {
    const responses: UserResponse[] = [];

    for (const [key, entry] of this.memoryStore.entries()) {
      if (
        entry.namespace === MemoryLogNamespace.USER_INTERACTION &&
        entry.sessionId === sessionId
      ) {
        responses.push(entry.value as UserResponse);
      }
    }

    return responses.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  async analyzeEngagement(
    userId: string,
    sessionId: string,
  ): Promise<{
    engagementScore: number;
    responseRate: number;
    averageResponseTime: number;
    dominantTraits: string[];
  }> {
    const responses = await this.getSessionResponses(sessionId);
    const insights = await this.getUserInsights(userId, 50);

    const responseRate = responses.length > 0 ? 1 : 0;
    const avgResponseTime =
      responses.length > 0
        ? responses.reduce((sum, r) => sum + r.responseTime, 0) /
          responses.length
        : 0;

    const traitCounts = new Map<string, number>();
    insights.forEach((insight) => {
      traitCounts.set(insight.trait, (traitCounts.get(insight.trait) || 0) + 1);
    });

    const dominantTraits = Array.from(traitCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trait]) => trait);

    const engagementScore = Math.min(
      100,
      responseRate * 40 +
        Math.min(avgResponseTime / 5000, 1) * 30 +
        dominantTraits.length * 10,
    );

    return {
      engagementScore,
      responseRate,
      averageResponseTime: avgResponseTime,
      dominantTraits,
    };
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushToAMem();
  }
}

export const memoryLogger = MemoryLogger.getInstance();
