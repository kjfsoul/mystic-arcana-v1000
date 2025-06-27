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
  code: 'NO_RESULTS' | 'NETWORK_ERROR' | 'INVALID_INPUT' | 'API_ERROR';
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function geocodeLocation(query: string): Promise<LocationResult | GeocodingError> {
  if (!query || query.trim().length < 2) {
    return {
      message: 'Please enter a location (city, state, country, or ZIP code)',
      code: 'INVALID_INPUT'
    };
  }

  

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { message: 'Network response was not ok.', code: 'NETWORK_ERROR' };
    }
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = parseGoogleMapsResult(result);
      
      // Get timezone
      if (location) {
        const timezone = await getTimezone(location.latitude, location.longitude);
        location.timezone = timezone;
      }
      
      return location || { message: `Location "${query}" not found.`, code: 'NO_RESULTS' };
    } else {
      return { message: `Location "${query}" not found. Please try a different search.`, code: 'NO_RESULTS' };
    }
  } catch (error) {
    return { message: 'An error occurred while fetching location data.', code: 'NETWORK_ERROR' };
  }
}

export async function getSuggestions(query: string): Promise<LocationResult[]> {
  if (!query || query.length < 2) return [];

  

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();

    if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
      const suggestions = await Promise.all(data.predictions.map(async (prediction: any) => {
        const geocoded = await geocodeLocation(prediction.description);
        if ('latitude' in geocoded) {
          return geocoded;
        }
        return null;
      }));
      return suggestions.filter((s): s is LocationResult => s !== null);
    }

    return [];
  } catch (error) {
    return [];
  }
}

async function getTimezone(lat: number, lng: number): Promise<string | undefined> {
  
  
  const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK') {
      return data.timeZoneId;
    }
  } catch (error) {
    console.error('Error fetching timezone:', error);
  }
  return undefined;
}

function parseGoogleMapsResult(result: any): LocationResult | null {
  if (!result.geometry || !result.geometry.location) {
    return null;
  }

  const location: Partial<LocationResult> = {
    name: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
  };

  result.address_components.forEach((component: any) => {
    if (component.types.includes('country')) {
      location.country = component.long_name;
    }
    if (component.types.includes('administrative_area_level_1')) {
      location.state = component.long_name;
    }
    if (component.types.includes('locality')) {
      location.city = component.long_name;
    }
  });

  if (location.name && location.latitude && location.longitude && location.country) {
    return location as LocationResult;
  }

  return null;
}

export function getPopularLocations(): LocationResult[] {
  return [
    { name: 'New York, NY, USA', latitude: 40.7128, longitude: -74.0060, country: 'USA', state: 'NY', city: 'New York', timezone: 'America/New_York' },
    { name: 'Los Angeles, CA, USA', latitude: 34.0522, longitude: -118.2437, country: 'USA', state: 'CA', city: 'Los Angeles', timezone: 'America/Los_Angeles' },
    { name: 'London, UK', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', city: 'London', timezone: 'Europe/London' },
    { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, country: 'Japan', city: 'Tokyo', timezone: 'Asia/Tokyo' },
  ];
}