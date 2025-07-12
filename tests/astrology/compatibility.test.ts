import { calculateCompatibility } from '@/lib/astrology/SynastryCalculator';
import { BirthData } from '@/lib/astrology/AstronomicalCalculator';

// Mock fetch globally
global.fetch = jest.fn();

describe('Astrology Compatibility Integration', () => {
  const mockPerson1: BirthData = {
    name: 'Alice',
    date: new Date('1990-06-15T14:30:00Z'),
    city: 'New York',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York'
  };

  const mockPerson2: BirthData = {
    name: 'Bob',
    date: new Date('1985-03-20T10:00:00Z'),
    city: 'Los Angeles',
    country: 'USA',
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: 'America/Los_Angeles'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully call Python backend and return compatibility data', async () => {
    const mockApiResponse = {
      success: true,
      data: {
        love: {
          rating: 4,
          description: 'Strong romantic potential with natural attraction and emotional understanding.'
        },
        friendship: {
          rating: 5,
          description: 'Exceptional friendship potential! You understand each other intuitively.'
        },
        teamwork: {
          rating: 3,
          description: 'Good teamwork potential with some areas to navigate.'
        },
        overall: {
          summary: 'Your cosmic connection is truly exceptional! The stars have aligned to create a harmonious relationship.',
          keyAspects: [
            'Venus-Mars conjunction creating powerful romantic energy',
            'Sun-Moon trine bringing natural harmony and emotional flow',
            'Mercury-Jupiter sextile offering opportunities for intellectual growth'
          ]
        }
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const result = await calculateCompatibility(mockPerson1, mockPerson2);

    expect(fetch).toHaveBeenCalledWith('/api/astrology/compatibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        person1: {
          name: 'Alice',
          date: mockPerson1.date,
          city: 'New York',
          country: 'USA',
          lat: 40.7128,
          lng: -74.0060,
          timezone: 'America/New_York'
        },
        person2: {
          name: 'Bob',
          date: mockPerson2.date,
          city: 'Los Angeles',
          country: 'USA',
          lat: 34.0522,
          lng: -118.2437,
          timezone: 'America/Los_Angeles'
        }
      })
    });

    expect(result).toEqual({
      love: {
        rating: 4,
        description: 'Strong romantic potential with natural attraction and emotional understanding.'
      },
      friendship: {
        rating: 5,
        description: 'Exceptional friendship potential! You understand each other intuitively.'
      },
      teamwork: {
        rating: 3,
        description: 'Good teamwork potential with some areas to navigate.'
      },
      overall: {
        summary: 'Your cosmic connection is truly exceptional! The stars have aligned to create a harmonious relationship.',
        keyAspects: [
          'Venus-Mars conjunction creating powerful romantic energy',
          'Sun-Moon trine bringing natural harmony and emotional flow',
          'Mercury-Jupiter sextile offering opportunities for intellectual growth'
        ]
      }
    });
  });

  it('should handle API failure and return fallback data', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await calculateCompatibility(mockPerson1, mockPerson2);

    expect(result.love.rating).toBe(0);
    expect(result.love.description).toContain('temporarily unavailable');
    expect(result.overall.summary).toContain('unable to access');
    expect(result.overall.keyAspects).toContain('Service temporarily unavailable - please try again later');
  });

  it('should handle API returning unavailable status', async () => {
    const mockApiResponse = {
      success: true,
      data: {
        love: { rating: 0, description: 'Compatibility data temporarily unavailable.' },
        friendship: { rating: 0, description: 'Compatibility data temporarily unavailable.' },
        teamwork: { rating: 0, description: 'Compatibility data temporarily unavailable.' },
        overall: {
          summary: 'Service temporarily unavailable',
          keyAspects: ['Service temporarily unavailable']
        },
        isUnavailable: true
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const result = await calculateCompatibility(mockPerson1, mockPerson2);

    expect(result.love.rating).toBe(0);
    expect(result.love.description).toContain('temporarily unavailable');
  });

  it('should handle HTTP error responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' })
    });

    const result = await calculateCompatibility(mockPerson1, mockPerson2);

    expect(result.love.rating).toBe(0);
    expect(result.love.description).toContain('temporarily unavailable');
  });

  it('should handle missing person names gracefully', async () => {
    const person1WithoutName = { ...mockPerson1, name: undefined };
    const person2WithoutName = { ...mockPerson2, name: undefined };

    const mockApiResponse = {
      success: true,
      data: {
        love: { rating: 3, description: 'Good compatibility' },
        friendship: { rating: 3, description: 'Good friendship' },
        teamwork: { rating: 3, description: 'Good teamwork' },
        overall: { summary: 'Good overall', keyAspects: ['Test aspect'] }
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    await calculateCompatibility(person1WithoutName, person2WithoutName);

    expect(fetch).toHaveBeenCalledWith('/api/astrology/compatibility', 
      expect.objectContaining({
        body: expect.stringContaining('"name":"Person 1"')
      })
    );
  });
});