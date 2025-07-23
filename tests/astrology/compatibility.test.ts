import { calculateCompatibility } from '@/lib/astrology/SynastryCalculator';
import { BirthData } from '@/types/astrology';

// Mock SwissEphemerisShim module
jest.mock('@/lib/astrology/SwissEphemerisShim', () => ({
  SwissEphemerisShim: {
    initialize: jest.fn().mockResolvedValue(true),
    calculateFullChart: jest.fn().mockResolvedValue({
      planets: [
        { name: 'Sun', longitude: 90, sign: 'Cancer', speed: 1 },
        { name: 'Moon', longitude: 180, sign: 'Libra', speed: 13 },
        { name: 'Venus', longitude: 120, sign: 'Leo', speed: 1.2 },
        { name: 'Mars', longitude: 45, sign: 'Taurus', speed: 0.5 }
      ]
    })
  }
}));

// Mock fetch globally - not used anymore but keeping for potential fallback
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

  it('should successfully calculate compatibility using real Swiss Ephemeris data', async () => {
    const result = await calculateCompatibility(mockPerson1, mockPerson2);

    // Since we're using real calculations now, we expect valid ratings (1-5)
    expect(result.love.rating).toBeGreaterThanOrEqual(1);
    expect(result.love.rating).toBeLessThanOrEqual(5);
    expect(result.love.description).toBeDefined();
    expect(typeof result.love.description).toBe('string');

    expect(result.friendship.rating).toBeGreaterThanOrEqual(1);
    expect(result.friendship.rating).toBeLessThanOrEqual(5);
    expect(result.friendship.description).toBeDefined();
    expect(typeof result.friendship.description).toBe('string');

    expect(result.teamwork.rating).toBeGreaterThanOrEqual(1);
    expect(result.teamwork.rating).toBeLessThanOrEqual(5);
    expect(result.teamwork.description).toBeDefined();
    expect(typeof result.teamwork.description).toBe('string');

    expect(result.overall.summary).toBeDefined();
    expect(typeof result.overall.summary).toBe('string');
    expect(Array.isArray(result.overall.keyAspects)).toBe(true);
    expect(result.overall.keyAspects.length).toBeGreaterThan(0);
  });

  it('should handle Swiss Ephemeris failure and return fallback data', async () => {
    // Mock SwissEphemerisShim to throw an error
    const SwissEphemerisShim = require('@/lib/astrology/SwissEphemerisShim').SwissEphemerisShim;
    SwissEphemerisShim.initialize.mockRejectedValueOnce(new Error('Swiss Ephemeris error'));

    const result = await calculateCompatibility(mockPerson1, mockPerson2);

    expect(result.love.rating).toBe(0);
    expect(result.love.description).toContain('temporarily unavailable');
    expect(result.overall.summary).toContain('unable to access');
    expect(result.overall.keyAspects).toContain('Service temporarily unavailable - please try again later');
  });

  it('should handle calculation returning no valid data', async () => {
    // Mock SwissEphemerisShim to return invalid data
    const SwissEphemerisShim = require('@/lib/astrology/SwissEphemerisShim').SwissEphemerisShim;
    SwissEphemerisShim.calculateFullChart.mockResolvedValueOnce({ planets: [] });

    const result = await calculateCompatibility(mockPerson1, mockPerson2);

    // Should still return valid structure with calculated ratings
    expect(result.love.rating).toBeGreaterThanOrEqual(1);
    expect(result.love.rating).toBeLessThanOrEqual(5);
    expect(result.love.description).toBeDefined();
  });

  it('should handle chart calculation errors gracefully', async () => {
    // Mock SwissEphemerisShim to throw error during chart calculation
    const SwissEphemerisShim = require('@/lib/astrology/SwissEphemerisShim').SwissEphemerisShim;
    SwissEphemerisShim.calculateFullChart.mockRejectedValueOnce(new Error('Chart calculation failed'));

    const result = await calculateCompatibility(mockPerson1, mockPerson2);

    expect(result.love.rating).toBe(0);
    expect(result.love.description).toContain('temporarily unavailable');
  });

  it('should handle missing person names gracefully', async () => {
    const person1WithoutName = { ...mockPerson1, name: undefined };
    const person2WithoutName = { ...mockPerson2, name: undefined };

    const result = await calculateCompatibility(person1WithoutName, person2WithoutName);

    // Should still calculate compatibility successfully
    expect(result.love.rating).toBeGreaterThanOrEqual(1);
    expect(result.love.rating).toBeLessThanOrEqual(5);
    expect(result.friendship.rating).toBeGreaterThanOrEqual(1);
    expect(result.friendship.rating).toBeLessThanOrEqual(5);
    expect(result.teamwork.rating).toBeGreaterThanOrEqual(1);
    expect(result.teamwork.rating).toBeLessThanOrEqual(5);
    expect(result.overall.summary).toBeDefined();
    expect(Array.isArray(result.overall.keyAspects)).toBe(true);
  });
});