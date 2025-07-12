import { getMoonPhase, isFullMoon, formatNextPhaseDate } from '@/lib/astrology/MoonPhase';

// Mock fetch globally
global.fetch = jest.fn();

describe('Moon Phase Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully call Python backend and return moon phase data', async () => {
    const mockApiResponse = {
      success: true,
      data: {
        phase: 'Waning Gibbous',
        illumination: 82,
        emoji: '🌖',
        nextFullMoon: '2025-01-15T10:30:00Z',
        nextNewMoon: '2025-01-30T15:45:00Z'
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const result = await getMoonPhase();

    expect(fetch).toHaveBeenCalledWith('/api/astrology/moon-phase', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(result).toEqual({
      phase: 'Waning Gibbous',
      illumination: 82,
      emoji: '🌖',
      nextFullMoon: '2025-01-15T10:30:00Z',
      nextNewMoon: '2025-01-30T15:45:00Z'
    });
  });

  it('should handle API failure and return fallback data', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await getMoonPhase();

    expect(result.phase).toBe('Moon phase temporarily unavailable');
    expect(result.illumination).toBe(0);
    expect(result.emoji).toBe('🌙');
    expect(result.isUnavailable).toBe(true);
    expect(result.nextFullMoon).toBeDefined();
    expect(result.nextNewMoon).toBeDefined();
  });

  it('should handle API returning unavailable status', async () => {
    const mockApiResponse = {
      success: true,
      data: {
        phase: 'Moon phase temporarily unavailable',
        illumination: 0,
        emoji: '🌙',
        nextFullMoon: '2025-01-15T10:30:00Z',
        nextNewMoon: '2025-01-30T15:45:00Z',
        isUnavailable: true
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const result = await getMoonPhase();

    expect(result.phase).toBe('Moon phase temporarily unavailable');
    expect(result.illumination).toBe(0);
    expect(result.isUnavailable).toBe(true);
  });

  it('should handle HTTP error responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' })
    });

    const result = await getMoonPhase();

    expect(result.phase).toBe('Moon phase temporarily unavailable');
    expect(result.illumination).toBe(0);
    expect(result.isUnavailable).toBe(true);
  });

  describe('isFullMoon helper', () => {
    it('should correctly identify full moon', () => {
      const fullMoonData = {
        phase: 'Full Moon',
        illumination: 98,
        emoji: '🌕',
        nextFullMoon: '2025-02-15T10:30:00Z',
        nextNewMoon: '2025-01-30T15:45:00Z'
      };

      expect(isFullMoon(fullMoonData)).toBe(true);
    });

    it('should correctly identify non-full moon', () => {
      const crescentMoonData = {
        phase: 'Waxing Crescent',
        illumination: 25,
        emoji: '🌒',
        nextFullMoon: '2025-02-15T10:30:00Z',
        nextNewMoon: '2025-01-30T15:45:00Z'
      };

      expect(isFullMoon(crescentMoonData)).toBe(false);
    });

    it('should handle edge case with high illumination but not full phase name', () => {
      const almostFullMoonData = {
        phase: 'Waxing Gibbous',
        illumination: 97,
        emoji: '🌔',
        nextFullMoon: '2025-02-15T10:30:00Z',
        nextNewMoon: '2025-01-30T15:45:00Z'
      };

      expect(isFullMoon(almostFullMoonData)).toBe(false);
    });
  });

  describe('formatNextPhaseDate helper', () => {
    it('should format valid ISO date correctly', () => {
      const isoDate = '2025-01-15T10:30:00Z';
      const formatted = formatNextPhaseDate(isoDate);
      
      // Should contain month name and time
      expect(formatted).toMatch(/January/);
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/:/);
    });

    it('should handle invalid date gracefully', () => {
      const invalidDate = 'not-a-date';
      const formatted = formatNextPhaseDate(invalidDate);
      
      expect(formatted).toBe('Date unavailable');
    });

    it('should handle empty string', () => {
      const emptyDate = '';
      const formatted = formatNextPhaseDate(emptyDate);
      
      expect(formatted).toBe('Date unavailable');
    });
  });

  describe('Different moon phases and emojis', () => {
    const moonPhases = [
      { phase: 'New Moon', illumination: 0, expectedEmoji: '🌑' },
      { phase: 'Waxing Crescent', illumination: 25, expectedEmoji: '🌒' },
      { phase: 'First Quarter', illumination: 50, expectedEmoji: '🌓' },
      { phase: 'Waxing Gibbous', illumination: 75, expectedEmoji: '🌔' },
      { phase: 'Full Moon', illumination: 100, expectedEmoji: '🌕' },
      { phase: 'Waning Gibbous', illumination: 75, expectedEmoji: '🌖' },
      { phase: 'Last Quarter', illumination: 50, expectedEmoji: '🌗' },
      { phase: 'Waning Crescent', illumination: 25, expectedEmoji: '🌘' }
    ];

    moonPhases.forEach(({ phase, illumination, expectedEmoji }) => {
      it(`should handle ${phase} correctly`, async () => {
        const mockApiResponse = {
          success: true,
          data: {
            phase,
            illumination,
            emoji: expectedEmoji,
            nextFullMoon: '2025-01-15T10:30:00Z',
            nextNewMoon: '2025-01-30T15:45:00Z'
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse
        });

        const result = await getMoonPhase();

        expect(result.phase).toBe(phase);
        expect(result.illumination).toBe(illumination);
        expect(result.emoji).toBe(expectedEmoji);
      });
    });
  });
});