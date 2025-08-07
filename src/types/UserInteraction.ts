import { PromptType, PersonaInsightSource, InteractionSessionReadingType, MemoryLogNamespace, EmotionalState, SeekingType, ResponsePattern } from '@/constants/EventTypes';

export interface InteractionPrompt {
  id: string;
  type: PromptType;
  question: string;
  context?: string;
  options?: Array<{
    value: string;
    label: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }>;
  minValue?: number;
  maxValue?: number;
  labels?: {
    min?: string;
    max?: string;
  };
  metadata?: {
    cardPosition?: string;
    cardName?: string;
    spreadType?: string;
    transitAspect?: string;
    readerPersona?: string;
  };
}

export interface UserResponse {
  promptId: string;
  userId: string;
  sessionId: string;
  readerId: string;
  response: string | number | boolean;
  responseTime: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PersonaInsight {
  trait: string;
  confidence: number;
  source: PersonaInsightSource;
  timestamp: string;
  context?: string;
}

export interface InteractionSession {
  sessionId: string;
  userId: string;
  readerId: string;
  readingType: InteractionSessionReadingType;
  startTime: string;
  endTime?: string;
  prompts: InteractionPrompt[];
  responses: UserResponse[];
  insights: PersonaInsight[];
  memoryKeys: string[];
}

export interface MemoryLogEntry {
  key: string;
  value: any;
  namespace: MemoryLogNamespace;
  userId: string;
  sessionId: string;
  timestamp: string;
  ttl?: number;
}

export type ResponseAnalysis = {
  emotionalState: EmotionalState;
  seekingType: SeekingType;
  responsePattern: ResponsePattern;
  engagementLevel: number;
};