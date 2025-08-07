import { ZodiacSign } from '@/constants/AstrologyConstants';
import { EnergyLevel } from '@/constants/EventTypes';

export interface ZodiacInfo {
  sign: ZodiacSign;
  name: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  quality: 'cardinal' | 'fixed' | 'mutable';
  rulingPlanet: string;
  dateRange: string;
  emoji: string;
}
export interface DailyHoroscope {
  date: string;
  general: {
    overview: string;
    energy: EnergyLevel;
    mood: string;
    luckyNumbers: number[];
    luckyColor: string;
  };
  personalized?: {
    sign: ZodiacSign;
    insight: string;
    advice: string;
    focus: string;
    compatibility: ZodiacSign[];
  };
}
export interface UserBirthData {
  birthDate: string; // ISO date string
  birthTime?: string; // Optional time (HH:MM format)
  zodiacSign: ZodiacSign;
}