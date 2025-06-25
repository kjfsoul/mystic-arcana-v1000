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

// Mock geocoding data for common locations (in production, use a real geocoding service)
const MOCK_LOCATIONS: Record<string, LocationResult> = {
  // Major US Cities
  'new york, ny': { name: 'New York, NY, USA', latitude: 40.7128, longitude: -74.0060, country: 'USA', state: 'NY', city: 'New York', timezone: 'America/New_York' },
  'los angeles, ca': { name: 'Los Angeles, CA, USA', latitude: 34.0522, longitude: -118.2437, country: 'USA', state: 'CA', city: 'Los Angeles', timezone: 'America/Los_Angeles' },
  'chicago, il': { name: 'Chicago, IL, USA', latitude: 41.8781, longitude: -87.6298, country: 'USA', state: 'IL', city: 'Chicago', timezone: 'America/Chicago' },
  'houston, tx': { name: 'Houston, TX, USA', latitude: 29.7604, longitude: -95.3698, country: 'USA', state: 'TX', city: 'Houston', timezone: 'America/Chicago' },
  'phoenix, az': { name: 'Phoenix, AZ, USA', latitude: 33.4484, longitude: -112.0740, country: 'USA', state: 'AZ', city: 'Phoenix', timezone: 'America/Phoenix' },
  'philadelphia, pa': { name: 'Philadelphia, PA, USA', latitude: 39.9526, longitude: -75.1652, country: 'USA', state: 'PA', city: 'Philadelphia', timezone: 'America/New_York' },
  'san antonio, tx': { name: 'San Antonio, TX, USA', latitude: 29.4241, longitude: -98.4936, country: 'USA', state: 'TX', city: 'San Antonio', timezone: 'America/Chicago' },
  'san diego, ca': { name: 'San Diego, CA, USA', latitude: 32.7157, longitude: -117.1611, country: 'USA', state: 'CA', city: 'San Diego', timezone: 'America/Los_Angeles' },
  'dallas, tx': { name: 'Dallas, TX, USA', latitude: 32.7767, longitude: -96.7970, country: 'USA', state: 'TX', city: 'Dallas', timezone: 'America/Chicago' },
  'san jose, ca': { name: 'San Jose, CA, USA', latitude: 37.3382, longitude: -121.8863, country: 'USA', state: 'CA', city: 'San Jose', timezone: 'America/Los_Angeles' },
  'austin, tx': { name: 'Austin, TX, USA', latitude: 30.2672, longitude: -97.7431, country: 'USA', state: 'TX', city: 'Austin', timezone: 'America/Chicago' },
  'san francisco, ca': { name: 'San Francisco, CA, USA', latitude: 37.7749, longitude: -122.4194, country: 'USA', state: 'CA', city: 'San Francisco', timezone: 'America/Los_Angeles' },
  'denver, co': { name: 'Denver, CO, USA', latitude: 39.7392, longitude: -104.9903, country: 'USA', state: 'CO', city: 'Denver', timezone: 'America/Denver' },
  'seattle, wa': { name: 'Seattle, WA, USA', latitude: 47.6062, longitude: -122.3321, country: 'USA', state: 'WA', city: 'Seattle', timezone: 'America/Los_Angeles' },
  'boston, ma': { name: 'Boston, MA, USA', latitude: 42.3601, longitude: -71.0589, country: 'USA', state: 'MA', city: 'Boston', timezone: 'America/New_York' },
  'miami, fl': { name: 'Miami, FL, USA', latitude: 25.7617, longitude: -80.1918, country: 'USA', state: 'FL', city: 'Miami', timezone: 'America/New_York' },
  'atlanta, ga': { name: 'Atlanta, GA, USA', latitude: 33.7490, longitude: -84.3880, country: 'USA', state: 'GA', city: 'Atlanta', timezone: 'America/New_York' },
  'las vegas, nv': { name: 'Las Vegas, NV, USA', latitude: 36.1699, longitude: -115.1398, country: 'USA', state: 'NV', city: 'Las Vegas', timezone: 'America/Los_Angeles' },
  
  // International Cities
  'london, uk': { name: 'London, UK', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', city: 'London', timezone: 'Europe/London' },
  'paris, france': { name: 'Paris, France', latitude: 48.8566, longitude: 2.3522, country: 'France', city: 'Paris', timezone: 'Europe/Paris' },
  'tokyo, japan': { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, country: 'Japan', city: 'Tokyo', timezone: 'Asia/Tokyo' },
  'sydney, australia': { name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093, country: 'Australia', city: 'Sydney', timezone: 'Australia/Sydney' },
  'toronto, canada': { name: 'Toronto, Canada', latitude: 43.6532, longitude: -79.3832, country: 'Canada', city: 'Toronto', timezone: 'America/Toronto' },
  'berlin, germany': { name: 'Berlin, Germany', latitude: 52.5200, longitude: 13.4050, country: 'Germany', city: 'Berlin', timezone: 'Europe/Berlin' },
  'rome, italy': { name: 'Rome, Italy', latitude: 41.9028, longitude: 12.4964, country: 'Italy', city: 'Rome', timezone: 'Europe/Rome' },
  'madrid, spain': { name: 'Madrid, Spain', latitude: 40.4168, longitude: -3.7038, country: 'Spain', city: 'Madrid', timezone: 'Europe/Madrid' },
  'amsterdam, netherlands': { name: 'Amsterdam, Netherlands', latitude: 52.3676, longitude: 4.9041, country: 'Netherlands', city: 'Amsterdam', timezone: 'Europe/Amsterdam' },
  'mexico city, mexico': { name: 'Mexico City, Mexico', latitude: 19.4326, longitude: -99.1332, country: 'Mexico', city: 'Mexico City', timezone: 'America/Mexico_City' },
  'mumbai, india': { name: 'Mumbai, India', latitude: 19.0760, longitude: 72.8777, country: 'India', city: 'Mumbai', timezone: 'Asia/Kolkata' },
  'singapore': { name: 'Singapore', latitude: 1.3521, longitude: 103.8198, country: 'Singapore', city: 'Singapore', timezone: 'Asia/Singapore' },
  
  // US States (for broader searches)
  'california': { name: 'California, USA', latitude: 36.7783, longitude: -119.4179, country: 'USA', state: 'CA', timezone: 'America/Los_Angeles' },
  'texas': { name: 'Texas, USA', latitude: 31.9686, longitude: -99.9018, country: 'USA', state: 'TX', timezone: 'America/Chicago' },
  'florida': { name: 'Florida, USA', latitude: 27.7663, longitude: -82.6404, country: 'USA', state: 'FL', timezone: 'America/New_York' },
  'new york': { name: 'New York, USA', latitude: 42.1657, longitude: -74.9481, country: 'USA', state: 'NY', timezone: 'America/New_York' }
};

// Common US ZIP codes to city mappings (subset for demo)
const ZIP_TO_LOCATION: Record<string, LocationResult> = {
  '10001': { name: 'New York, NY 10001, USA', latitude: 40.7505, longitude: -73.9934, country: 'USA', state: 'NY', city: 'New York', timezone: 'America/New_York' },
  '90210': { name: 'Beverly Hills, CA 90210, USA', latitude: 34.0901, longitude: -118.4065, country: 'USA', state: 'CA', city: 'Beverly Hills', timezone: 'America/Los_Angeles' },
  '60601': { name: 'Chicago, IL 60601, USA', latitude: 41.8825, longitude: -87.6441, country: 'USA', state: 'IL', city: 'Chicago', timezone: 'America/Chicago' },
  '77001': { name: 'Houston, TX 77001, USA', latitude: 29.7342, longitude: -95.3960, country: 'USA', state: 'TX', city: 'Houston', timezone: 'America/Chicago' },
  '33101': { name: 'Miami, FL 33101, USA', latitude: 25.7839, longitude: -80.2102, country: 'USA', state: 'FL', city: 'Miami', timezone: 'America/New_York' },
  '02101': { name: 'Boston, MA 02101, USA', latitude: 42.3584, longitude: -71.0598, country: 'USA', state: 'MA', city: 'Boston', timezone: 'America/New_York' },
  '94102': { name: 'San Francisco, CA 94102, USA', latitude: 37.7849, longitude: -122.4094, country: 'USA', state: 'CA', city: 'San Francisco', timezone: 'America/Los_Angeles' },
  '98101': { name: 'Seattle, WA 98101, USA', latitude: 47.6097, longitude: -122.3331, country: 'USA', state: 'WA', city: 'Seattle', timezone: 'America/Los_Angeles' }
};

function normalizeQuery(query: string): string {
  return query.toLowerCase()
    .trim()
    .replace(/[^\w\s,]/g, '') // Remove special characters except commas
    .replace(/\s+/g, ' '); // Normalize whitespace
}

function isZipCode(query: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(query.trim());
}

export async function geocodeLocation(query: string): Promise<LocationResult | GeocodingError> {
  if (!query || query.trim().length < 2) {
    return {
      message: 'Please enter a location (city, state, country, or ZIP code)',
      code: 'INVALID_INPUT'
    };
  }

  const normalizedQuery = normalizeQuery(query);
  
  try {
    // Check if it's a ZIP code
    if (isZipCode(normalizedQuery)) {
      const zipResult = ZIP_TO_LOCATION[normalizedQuery.split('-')[0]];
      if (zipResult) {
        return zipResult;
      }
    }

    // Check exact matches first
    if (MOCK_LOCATIONS[normalizedQuery]) {
      return MOCK_LOCATIONS[normalizedQuery];
    }

    // Check partial matches (for flexible city searches)
    const partialMatches = Object.entries(MOCK_LOCATIONS).filter(([key]) => 
      key.includes(normalizedQuery) || normalizedQuery.includes(key.split(',')[0])
    );

    if (partialMatches.length > 0) {
      return partialMatches[0][1];
    }

    // In a real implementation, you would call an actual geocoding API here
    // For demo purposes, return a "not found" error
    return {
      message: `Location "${query}" not found. Try a major city like "New York, NY" or "Los Angeles, CA"`,
      code: 'NO_RESULTS'
    };

  } catch {
    return {
      message: 'Unable to search for location. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }
}

export function getPopularLocations(): LocationResult[] {
  return [
    MOCK_LOCATIONS['new york, ny'],
    MOCK_LOCATIONS['los angeles, ca'],
    MOCK_LOCATIONS['chicago, il'],
    MOCK_LOCATIONS['london, uk'],
    MOCK_LOCATIONS['paris, france'],
    MOCK_LOCATIONS['tokyo, japan'],
    MOCK_LOCATIONS['sydney, australia'],
    MOCK_LOCATIONS['toronto, canada']
  ];
}

export function getSuggestions(query: string): LocationResult[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = normalizeQuery(query);
  
  return Object.entries(MOCK_LOCATIONS)
    .filter(([key, location]) => 
      key.startsWith(normalizedQuery) || 
      location.name.toLowerCase().includes(normalizedQuery) ||
      (location.city && location.city.toLowerCase().includes(normalizedQuery))
    )
    .slice(0, 8) // Limit to 8 suggestions
    .map(([, location]) => location);
}