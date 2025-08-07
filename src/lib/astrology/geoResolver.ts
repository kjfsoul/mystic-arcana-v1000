/**
 * Geographic location resolver for birth chart calculations
 */
export interface GeoLocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Resolve geographic location from city name
 * This is a basic implementation - in production would use a proper geocoding service
 */
export async function resolveGeoLocation(location: string): Promise<GeoLocationData | null> {
  if (!location || location.trim().length === 0) {
    console.warn('Empty location provided to geoResolver');
    return null;
  }

  console.warn('GeoResolver using fallback data for:', location);

  // Basic fallback coordinates for major cities
  const fallbackLocations: Record<string, GeoLocationData> = {
    'new york': {
      city: 'New York',
      country: 'United States',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    },
    'london': {
      city: 'London',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London'
    },
    'paris': {
      city: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: 'Europe/Paris'
    },
    'tokyo': {
      city: 'Tokyo',
      country: 'Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 'Asia/Tokyo'
    },
    'sydney': {
      city: 'Sydney',
      country: 'Australia',
      latitude: -33.8688,
      longitude: 151.2093,
      timezone: 'Australia/Sydney'
    },
    'los angeles': {
      city: 'Los Angeles',
      country: 'United States',
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: 'America/Los_Angeles'
    }
  };

  // Try exact match first
  const exactMatch = fallbackLocations[location.toLowerCase()];
  if (exactMatch) {
    return exactMatch;
  }

  // Try partial match
  const locationLower = location.toLowerCase();
  for (const [key, data] of Object.entries(fallbackLocations)) {
    if (locationLower.includes(key) || key.includes(locationLower)) {
      console.info(`Found partial match for "${location}": ${data.city}`);
      return data;
    }
  }

  // Default fallback to UTC coordinates
  console.warn(`No match found for "${location}", using default coordinates`);
  return {
    city: location,
    country: 'Unknown',
    latitude: 0,
    longitude: 0,
    timezone: 'UTC'
  };
}