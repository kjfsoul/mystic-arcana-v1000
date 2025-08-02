export type ZodiacSign = 
  | 'aries' 
  | 'taurus' 
  | 'gemini' 
  | 'cancer' 
  | 'leo' 
  | 'virgo' 
  | 'libra' 
  | 'scorpio' 
  | 'sagittarius' 
  | 'capricorn' 
  | 'aquarius' 
  | 'pisces';
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
    energy: 'high' | 'medium' | 'low';
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
