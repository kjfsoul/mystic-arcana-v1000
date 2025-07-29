/**
 * Daily Oracle type definitions
 */

import { BirthData } from './astrology';

export interface DailyOracleRequest {
  birthData: BirthData;
  userId?: string;
}

export interface TarotCardOracleData {
  id: string;
  name: string;
  suit?: string;
  arcana_type: string;
  card_number: number;
  image_url: string;
  meaning_upright: string;
  meaning_reversed: string;
  keywords: string[];
  position: string;
  isReversed: boolean;
  description: string;
  elemental_association?: string;
  astrological_association?: string;
}

export interface HoroscopeOracleData {
  sign: string;
  degrees: number;
  daily: string;
  element?: string;
  quality?: string;
  rulingPlanet?: string;
}

export interface CosmicFocusData {
  moonPhase: string;
  moonSign: string;
  dominantPlanet: string;
  keyAspects: string[];
  energyTheme: string;
  recommendation: string;
}

export interface DailySpreadCard {
  card: TarotCardOracleData;
  interpretation: string;
  personalizedMessage: string;
}

export interface DailySpread {
  type: 'daily_guidance';
  theme: string;
  cards: {
    morning: DailySpreadCard;
    afternoon: DailySpreadCard;
    evening: DailySpreadCard;
  };
  overallGuidance: string;
  practicalAdvice: string;
}

export interface CompatibilityInsight {
  bestMatchSign: string;
  challengingSign: string;
  relationshipAdvice: string;
  communicationTips: string;
}

export interface DailyOracleData {
  id: string;
  userId?: string;
  date: string;
  timestamp: string;
  
  // Core components
  dailySpread: DailySpread;
  horoscope: HoroscopeOracleData;
  cosmicFocus: CosmicFocusData;
  compatibility: CompatibilityInsight;
  
  // Summary and guidance
  overallTheme: string;
  keyMessage: string;
  actionableAdvice: string[];
  affirmation: string;
  
  // Metadata
  generatedFromBirthChart: boolean;
  isUnavailable?: boolean;
  errorDetails?: string;
}

export interface DailyOracleResponse {
  success: boolean;
  data?: DailyOracleData;
  error?: string;
  cached?: boolean;
  generationTimeMs?: number;
}