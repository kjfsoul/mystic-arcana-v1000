import { ReaderSpecialization, SummaryType as SummaryTypeEnum, ReadingRequestType } from '@/constants/EventTypes';

export interface ReaderPersona {
  id: string;
  name: string;
  title: string;
  specialization: ReaderSpecialization;
  avatar: string;
  description: string;
  tone: ReaderTone;
  introMessages: string[];
  summaryTypes: SummaryTypeEnum[];
  expertise: ReaderExpertise;
  conversationalStyles: ConversationalStyle[];
}

export interface ReaderTone {
  primary: string; // e.g., "mentor", "mystical", "empathetic"
  secondary: string; // e.g., "honest", "gentle", "direct"
  voice: string; // e.g., "calm and insightful", "warm and nurturing"
  communication: string; // e.g., "tactically honest", "encouraging"
}

export interface SummaryType {
  type: SummaryTypeEnum;
  template: string;
  focusAreas: string[];
}

export interface ReaderExpertise {
  primaryFocus: string[];
  techniques: string[];
  strengths: string[];
  astrology?: AstrologyExpertise;
  tarot?: TarotExpertise;
}

export interface AstrologyExpertise {
  houses: number[]; // Primary house focus (e.g., [10, 6, 2] for career)
  planets: string[]; // Key planets (e.g., ["Saturn", "Jupiter", "MC"])
  aspects: string[]; // Important aspects
  transitTypes: string[]; // Types of transits to emphasize
  specializations: string[]; // e.g., ["career", "purpose", "timing"]
}

export interface TarotExpertise {
  preferredSpreads: string[];
  cardAffinities: string[]; // Cards reader connects with most
  interpretationStyle: 'traditional' | 'modern' | 'intuitive' | 'psychological';
  specializations: string[];
}

export interface ConversationalStyle {
  trigger: string; // When to use this style
  phrases: string[];
  tone: string;
}

export interface ReadingRequest {
  userId?: string;
  readerId: string;
  type: ReadingRequestType;
  focus?: string[]; // e.g., ["career", "purpose", "timing"]
  birthData?: {
    date: string;
    time: string;
    location: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  spreadType?: string;
  questions?: string[];
}

export interface ReadingResponse {
  readerId: string;
  sessionId: string;
  interpretation: {
    primary: string;
    secondary?: string;
    insights: string[];
    guidance: string[];
    timing?: string;
  };
  confidence: number;
  followUpQuestions?: string[];
  nextSteps?: string[];
}
