import { DailyHoroscope } from '@/types/horoscope';

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
}