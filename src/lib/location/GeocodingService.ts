export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
  city?: string;
  timezone?: string;
}

export interface GeocodingError {
  message: string;
  code: 'NO_RESULTS' | 'NETWORK_ERROR' | 'INVALID_INPUT';
}

export async function geocodeLocation(query: string): Promise<LocationResult | GeocodingError> {
  if (!query || query.trim().length < 2) {
    return {
      message: 'Please enter a location (city, state, country, or ZIP code)',
      code: 'INVALID_INPUT'
    };
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'MysticArcana/1.0' } });
    if (!response.ok) {
      return { message: 'Network response was not ok.', code: 'NETWORK_ERROR' };
    }
    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        name: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        country: result.address.country,
        state: result.address.state,
        city: result.address.city || result.address.town || result.address.village,
      };
    }

    return { message: `Location "${query}" not found. Please try a different search.`, code: 'NO_RESULTS' };
  } catch (error) {
    return { message: 'An error occurred while fetching location data.', code: 'NETWORK_ERROR' };
  }
}

export async function getSuggestions(query: string): Promise<LocationResult[]> {
  if (!query || query.length < 2) return [];

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'MysticArcana/1.0' } });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();

    if (data && data.length > 0) {
      return data.map((result: any) => ({
        name: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        country: result.address.country,
        state: result.address.state,
        city: result.address.city || result.address.town || result.address.village,
      }));
    }

    return [];
  } catch (error) {
    return [];
  }
}

export function getPopularLocations(): LocationResult[] {
  return [
    { name: 'New York, NY, USA', latitude: 40.7128, longitude: -74.0060, country: 'USA', state: 'NY', city: 'New York', timezone: 'America/New_York' },
    { name: 'Los Angeles, CA, USA', latitude: 34.0522, longitude: -118.2437, country: 'USA', state: 'CA', city: 'Los Angeles', timezone: 'America/Los_Angeles' },
    { name: 'London, UK', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', city: 'London', timezone: 'Europe/London' },
    { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, country: 'Japan', city: 'Tokyo', timezone: 'Asia/Tokyo' },
  ];
}
