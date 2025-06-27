import { DailyHoroscope, ZodiacSign } from '@/types/horoscope';
import { zodiacService } from '@/services/zodiacService';

export class DailyHoroscopeService {
  private static instance: DailyHoroscopeService;

  private constructor() {}

  static getInstance(): DailyHoroscopeService {
    if (!DailyHoroscopeService.instance) {
      DailyHoroscopeService.instance = new DailyHoroscopeService();
    }
    return DailyHoroscopeService.instance;
  }

  /**
   * Generate a general daily horoscope for all users
   * In production, this would fetch from an API or database
   */
  getGeneralDailyHoroscope(): DailyHoroscope {
    const today = new Date().toISOString().split('T')[0];
    
    // Mock data - in production, this would be fetched from a service
    const generalHoroscopes = [
      {
        overview: "Today's cosmic energy encourages introspection and spiritual growth. The universe is aligning to bring clarity to your deepest questions.",
        energy: 'high' as const,
        mood: 'contemplative',
        luckyNumbers: [3, 7, 21, 33],
        luckyColor: 'purple'
      },
      {
        overview: "A day of transformation awaits. The stars suggest embracing change and trusting your intuition as new opportunities emerge.",
        energy: 'medium' as const,
        mood: 'optimistic',
        luckyNumbers: [5, 14, 28, 42],
        luckyColor: 'blue'
      },
      {
        overview: "Celestial harmony brings balance to your endeavors. Focus on relationships and creative pursuits for maximum cosmic support.",
        energy: 'high' as const,
        mood: 'harmonious',
        luckyNumbers: [2, 11, 19, 36],
        luckyColor: 'gold'
      },
      {
        overview: "The mystic veil is thin today. Pay attention to synchronicities and dreams as the universe sends important messages.",
        energy: 'medium' as const,
        mood: 'mysterious',
        luckyNumbers: [8, 13, 27, 44],
        luckyColor: 'indigo'
      },
      {
        overview: "Grounding energy prevails. Take practical steps toward your goals while maintaining connection to your spiritual essence.",
        energy: 'low' as const,
        mood: 'grounded',
        luckyNumbers: [1, 9, 22, 31],
        luckyColor: 'green'
      }
    ];

    // Use date to consistently pick a horoscope for the day
    const dayIndex = new Date().getDate() % generalHoroscopes.length;
    
    return {
      date: today,
      general: generalHoroscopes[dayIndex]
    };
  }

  /**
   * Get the current moon phase description
   * Simplified version - in production would use astronomical calculations
   */
  getCurrentMoonPhase(): string {
    const phases = [
      "New Moon - Time for new beginnings",
      "Waxing Crescent - Set your intentions", 
      "First Quarter - Take decisive action",
      "Waxing Gibbous - Refine and adjust",
      "Full Moon - Culmination and release",
      "Waning Gibbous - Express gratitude",
      "Last Quarter - Release and forgive",
      "Waning Crescent - Rest and reflect"
    ];
    
    // Simple calculation based on day of month
    const day = new Date().getDate();
    const phaseIndex = Math.floor((day / 30) * phases.length) % phases.length;
    
    return phases[phaseIndex];
  }

  /**
   * Get cosmic event of the day
   */
  getCosmicEvent(): string {
    const events = [
      "Mercury enters retrograde shadow period",
      "Venus forms a harmonious trine with Jupiter",
      "Mars energizes your ambition sector",
      "Saturn teaches patience and discipline",
      "Jupiter expands opportunities for growth",
      "Neptune heightens intuition and dreams",
      "Uranus sparks unexpected changes",
      "Pluto deepens transformation"
    ];
    
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const eventIndex = dayOfYear % events.length;
    
    return events[eventIndex];
  }

  /**
   * Generate personalized horoscope for user's zodiac sign
   */
  getPersonalizedHoroscope(birthDate: string): DailyHoroscope | null {
    const zodiacSign = zodiacService.getZodiacSign(birthDate);
    if (!zodiacSign) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const general = this.getGeneralDailyHoroscope().general;

    // Generate personalized insight using zodiac service
    const insight = zodiacService.generateDailyHoroscope(zodiacSign);

    // Generate personalized advice based on sign traits
    const advice = this.generatePersonalizedAdvice(zodiacSign.name.toLowerCase() as ZodiacSign);
    
    // Focus area based on element and ruling planet
    const focus = this.generateFocusArea(zodiacSign);

    // Compatible signs for the day
    const compatibility = this.getCompatibleSigns(zodiacSign.name.toLowerCase() as ZodiacSign);

    return {
      date: today,
      general,
      personalized: {
        sign: zodiacSign.name.toLowerCase() as ZodiacSign,
        insight,
        advice,
        focus,
        compatibility
      }
    };
  }

  private generatePersonalizedAdvice(sign: ZodiacSign): string {
    const advice = {
      aries: "Channel your natural leadership today. Take initiative in projects that matter to you.",
      taurus: "Focus on building lasting foundations. Your patience will yield beautiful results.",
      gemini: "Communicate your ideas clearly. Network and share knowledge with others.",
      cancer: "Trust your emotional intelligence. Nurture yourself and your relationships.",
      leo: "Let your creativity shine. Express yourself authentically and inspire others.",
      virgo: "Pay attention to details. Your analytical nature reveals important insights.",
      libra: "Seek balance in all areas. Harmony and diplomacy open new doors.",
      scorpio: "Embrace transformation. Your intensity creates powerful positive change.",
      sagittarius: "Explore new horizons. Your optimism attracts exciting opportunities.",
      capricorn: "Stay disciplined and focused. Your determination builds lasting success.",
      aquarius: "Think outside the box. Your innovative ideas lead to breakthroughs.",
      pisces: "Listen to your intuition. Your compassion creates meaningful connections."
    };

    return advice[sign] || advice.aries;
  }

  private generateFocusArea(zodiacSign: { element: string; rulingPlanet: string }): string {
    const elementFocus = {
      fire: "Energy and passion",
      earth: "Stability and growth", 
      air: "Communication and ideas",
      water: "Emotions and intuition"
    };

    const planetFocus = {
      'Mars': 'action and courage',
      'Venus': 'love and beauty',
      'Mercury': 'learning and communication',
      'Moon': 'emotions and home',
      'Sun': 'creativity and self-expression',
      'Jupiter': 'expansion and wisdom',
      'Saturn': 'discipline and structure',
      'Uranus': 'innovation and freedom',
      'Neptune': 'spirituality and dreams',
      'Pluto': 'transformation and rebirth'
    };

    const element = elementFocus[zodiacSign.element as keyof typeof elementFocus] || 'balance';
    const planet = planetFocus[zodiacSign.rulingPlanet as keyof typeof planetFocus] || 'growth';
    
    return `${element} guided by ${planet}`;
  }

  private getCompatibleSigns(sign: ZodiacSign): ZodiacSign[] {
    const compatibility: Record<ZodiacSign, ZodiacSign[]> = {
      aries: ['leo', 'sagittarius', 'gemini'],
      taurus: ['virgo', 'capricorn', 'cancer'],
      gemini: ['libra', 'aquarius', 'aries'],
      cancer: ['scorpio', 'pisces', 'taurus'],
      leo: ['aries', 'sagittarius', 'libra'],
      virgo: ['taurus', 'capricorn', 'scorpio'],
      libra: ['gemini', 'aquarius', 'leo'],
      scorpio: ['cancer', 'pisces', 'virgo'],
      sagittarius: ['aries', 'leo', 'aquarius'],
      capricorn: ['taurus', 'virgo', 'pisces'],
      aquarius: ['gemini', 'libra', 'sagittarius'],
      pisces: ['cancer', 'scorpio', 'capricorn']
    };

    return compatibility[sign] || [];
  }
}