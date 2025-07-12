import { getPersonalizedHoroscope, formatZodiacSign, getZodiacEmoji, isHoroscopeAvailable } from '@/lib/astrology/HoroscopeService';
import { BirthData } from '@/lib/astrology/AstronomicalCalculator';

// Mock fetch globally
global.fetch = jest.fn();

describe('Horoscope Integration', () => {
  const mockBirthData: BirthData = {
    name: 'John Doe',
    date: new Date('1990-07-15T14:30:00Z'),
    city: 'New York',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully call Python backend and return horoscope data', async () => {
    const mockApiResponse = {
      success: true,
      data: {
        sign: 'cancer',
        degrees: 23.5,
        daily: 'Today you are feeling deeply intuitive and emotionally wise. Trust your inner voice to guide you toward nurturing relationships and meaningful connections.'
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const result = await getPersonalizedHoroscope(mockBirthData);

    expect(fetch).toHaveBeenCalledWith('/api/astrology/horoscope', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        birthData: {
          name: 'John Doe',
          date: mockBirthData.date,
          city: 'New York',
          country: 'USA',
          lat: 40.7128,
          lng: -74.0060,
          timezone: 'America/New_York'
        }
      })
    });

    expect(result).toEqual({
      sign: 'cancer',
      degrees: 23.5,
      daily: 'Today you are feeling deeply intuitive and emotionally wise. Trust your inner voice to guide you toward nurturing relationships and meaningful connections.'
    });
  });

  it('should handle API failure and return fallback data', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await getPersonalizedHoroscope(mockBirthData);

    expect(result.sign).toBe('Horoscope temporarily unavailable');
    expect(result.degrees).toBe(0);
    expect(result.daily).toContain('currently offline');
    expect(result.isUnavailable).toBe(true);
  });

  it('should handle API returning unavailable status', async () => {
    const mockApiResponse = {
      success: true,
      data: {
        sign: 'Horoscope temporarily unavailable',
        degrees: 0,
        daily: 'Our astrological calculation service is currently offline.',
        isUnavailable: true
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const result = await getPersonalizedHoroscope(mockBirthData);

    expect(result.sign).toBe('Horoscope temporarily unavailable');
    expect(result.degrees).toBe(0);
    expect(result.isUnavailable).toBe(true);
  });

  it('should handle HTTP error responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' })
    });

    const result = await getPersonalizedHoroscope(mockBirthData);

    expect(result.sign).toBe('Horoscope temporarily unavailable');
    expect(result.degrees).toBe(0);
    expect(result.isUnavailable).toBe(true);
  });

  describe('formatZodiacSign helper', () => {
    it('should format zodiac signs correctly', () => {
      expect(formatZodiacSign('aries')).toBe('Aries');
      expect(formatZodiacSign('CANCER')).toBe('Cancer');
      expect(formatZodiacSign('SaGiTtArIuS')).toBe('Sagittarius');
    });

    it('should handle unavailable message correctly', () => {
      expect(formatZodiacSign('Horoscope temporarily unavailable')).toBe('Horoscope temporarily unavailable');
    });
  });

  describe('getZodiacEmoji helper', () => {
    const zodiacEmojis = [
      { sign: 'aries', emoji: '♈' },
      { sign: 'taurus', emoji: '♉' },
      { sign: 'gemini', emoji: '♊' },
      { sign: 'cancer', emoji: '♋' },
      { sign: 'leo', emoji: '♌' },
      { sign: 'virgo', emoji: '♍' },
      { sign: 'libra', emoji: '♎' },
      { sign: 'scorpio', emoji: '♏' },
      { sign: 'sagittarius', emoji: '♐' },
      { sign: 'capricorn', emoji: '♑' },
      { sign: 'aquarius', emoji: '♒' },
      { sign: 'pisces', emoji: '♓' }
    ];

    zodiacEmojis.forEach(({ sign, emoji }) => {
      it(`should return correct emoji for ${sign}`, () => {
        expect(getZodiacEmoji(sign)).toBe(emoji);
        expect(getZodiacEmoji(sign.toUpperCase())).toBe(emoji);
      });
    });

    it('should return default emoji for unknown signs', () => {
      expect(getZodiacEmoji('unknown')).toBe('✨');
      expect(getZodiacEmoji('')).toBe('✨');
    });
  });

  describe('isHoroscopeAvailable helper', () => {
    it('should correctly identify available horoscope', () => {
      const availableHoroscope = {
        sign: 'leo',
        degrees: 15.2,
        daily: 'Today is a great day for creativity.',
        isUnavailable: false
      };

      expect(isHoroscopeAvailable(availableHoroscope)).toBe(true);
    });

    it('should correctly identify unavailable horoscope by flag', () => {
      const unavailableHoroscope = {
        sign: 'leo',
        degrees: 15.2,
        daily: 'Today is a great day for creativity.',
        isUnavailable: true
      };

      expect(isHoroscopeAvailable(unavailableHoroscope)).toBe(false);
    });

    it('should correctly identify unavailable horoscope by sign message', () => {
      const unavailableHoroscope = {
        sign: 'Horoscope temporarily unavailable',
        degrees: 0,
        daily: 'Service unavailable'
      };

      expect(isHoroscopeAvailable(unavailableHoroscope)).toBe(false);
    });
  });

  describe('Different zodiac signs and interpretations', () => {
    const zodiacSigns = [
      'aries', 'taurus', 'gemini', 'cancer', 
      'leo', 'virgo', 'libra', 'scorpio', 
      'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];

    zodiacSigns.forEach((sign) => {
      it(`should handle ${sign} horoscope correctly`, async () => {
        const mockApiResponse = {
          success: true,
          data: {
            sign,
            degrees: Math.random() * 30,
            daily: `Today you are feeling the energy of ${sign}.`
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse
        });

        const result = await getPersonalizedHoroscope(mockBirthData);

        expect(result.sign).toBe(sign);
        expect(result.daily).toContain(sign);
        expect(result.degrees).toBeGreaterThanOrEqual(0);
        expect(result.degrees).toBeLessThan(30);
      });
    });
  });

  describe('Birth data edge cases', () => {
    it('should handle missing optional fields gracefully', async () => {
      const minimalBirthData = {
        date: new Date('1990-07-15T14:30:00Z'),
        city: 'New York',
        latitude: 40.7128,
        longitude: -74.0060
      };

      const mockApiResponse = {
        success: true,
        data: {
          sign: 'cancer',
          degrees: 23.5,
          daily: 'Today is a good day.'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      await getPersonalizedHoroscope(minimalBirthData);

      expect(fetch).toHaveBeenCalledWith('/api/astrology/horoscope', 
        expect.objectContaining({
          body: expect.stringContaining('"name":"User"')
        })
      );
    });

    it('should handle different date formats', async () => {
      const birthDataWithStringDate = {
        ...mockBirthData,
        date: new Date('1985-12-25T09:00:00Z')
      };

      const mockApiResponse = {
        success: true,
        data: {
          sign: 'capricorn',
          degrees: 3.1,
          daily: 'Capricorn energy today.'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const result = await getPersonalizedHoroscope(birthDataWithStringDate);

      expect(result.sign).toBe('capricorn');
      expect(result.degrees).toBe(3.1);
    });
  });
});