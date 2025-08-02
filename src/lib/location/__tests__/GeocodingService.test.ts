import { geocodeLocation, getSuggestions, getPopularLocations } from '@/lib/location/GeocodingService';
global.fetch = jest.fn();
describe('GeocodingService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });
  describe('geocodeLocation', () => {
    it('should return a location result for a valid query', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'OK', results: [{ formatted_address: 'New York, NY, USA', geometry: { location: { lat: 40.7128, lng: -74.0060 } }, address_components: [{ types: ['country'], long_name: 'USA' }, { types: ['administrative_area_level_1'], long_name: 'NY' }, { types: ['locality'], long_name: 'New York' }] }] }),
      });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'OK', timeZoneId: 'America/New_York' }),
      });
      const result = await geocodeLocation('New York');
      expect(result).toHaveProperty('name', 'New York, NY, USA');
    });
    it('should return an error for an invalid query', async () => {
      const result = await geocodeLocation('');
      expect(result).toHaveProperty('code', 'INVALID_INPUT');
    });
  });
  describe('getSuggestions', () => {
    it('should return a list of suggestions for a valid query', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'OK', predictions: [{ description: 'New York, NY, USA' }] }),
      });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'OK', results: [{ formatted_address: 'New York, NY, USA', geometry: { location: { lat: 40.7128, lng: -74.0060 } }, address_components: [{ types: ['country'], long_name: 'USA' }, { types: ['administrative_area_level_1'], long_name: 'NY' }, { types: ['locality'], long_name: 'New York' }] }] }),
      });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'OK', timeZoneId: 'America/New_York' }),
      });
      const result = await getSuggestions('New York');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('name', 'New York, NY, USA');
    });
  });
  describe('getPopularLocations', () => {
    it('should return a list of popular locations', () => {
      const result = getPopularLocations();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
