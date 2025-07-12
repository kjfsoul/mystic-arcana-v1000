import { BirthData } from './AstronomicalCalculator';

interface CompatibilityAPIResponse {
  success: boolean;
  data?: {
    love: CompatibilityRating;
    friendship: CompatibilityRating;
    teamwork: CompatibilityRating;
    overall: {
      summary: string;
      keyAspects: string[];
    };
    rawSynastryData?: unknown;
    isUnavailable?: boolean;
  };
  error?: string;
}

export interface CompatibilityRating {
  rating: number; // 1-5 scale
  description: string;
}

export interface CompatibilityResult {
  love: CompatibilityRating;
  friendship: CompatibilityRating;
  teamwork: CompatibilityRating;
  overall: {
    summary: string;
    keyAspects: string[];
  };
}

// Call the Python backend for real astrological calculations
async function callCompatibilityAPI(person1Data: BirthData, person2Data: BirthData): Promise<CompatibilityAPIResponse> {
  try {
    const response = await fetch('/api/astrology/compatibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        person1: {
          name: person1Data.name || 'Person 1',
          date: person1Data.date,
          city: person1Data.city,
          country: person1Data.country,
          lat: person1Data.lat || person1Data.latitude,
          lng: person1Data.lng || person1Data.longitude,
          timezone: person1Data.timezone
        },
        person2: {
          name: person2Data.name || 'Person 2',
          date: person2Data.date,
          city: person2Data.city,
          country: person2Data.country,
          lat: person2Data.lat || person2Data.latitude,
          lng: person2Data.lng || person2Data.longitude,
          timezone: person2Data.timezone
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to call compatibility API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fallback function for when API is unavailable
function getFallbackCompatibility(): CompatibilityResult {
  return {
    love: {
      rating: 0,
      description: "Compatibility data temporarily unavailable. Our astrological calculation service is currently offline. Please try again later."
    },
    friendship: {
      rating: 0,
      description: "Compatibility data temporarily unavailable. Our astrological calculation service is currently offline. Please try again later."
    },
    teamwork: {
      rating: 0,
      description: "Compatibility data temporarily unavailable. Our astrological calculation service is currently offline. Please try again later."
    },
    overall: {
      summary: "We're currently unable to access our astronomical calculation service. This feature requires real-time planetary position calculations using Swiss Ephemeris data. Please try again in a few moments.",
      keyAspects: [
        "Service temporarily unavailable - please try again later",
        "We use authentic astronomical calculations, not random data",
        "Your compatibility analysis will be based on real planetary positions when service is restored"
      ]
    }
  };
}


export async function calculateCompatibility(
  person1Data: BirthData, 
  person2Data: BirthData
): Promise<CompatibilityResult> {
  try {
    // Call the Python backend for real astrological calculations
    const apiResponse = await callCompatibilityAPI(person1Data, person2Data);
    
    if (!apiResponse.success || !apiResponse.data) {
      console.warn('Compatibility API failed, using fallback:', apiResponse.error);
      return getFallbackCompatibility();
    }

    // Check if service is temporarily unavailable
    if (apiResponse.data.isUnavailable) {
      return getFallbackCompatibility();
    }

    // Return the real compatibility data from Python backend
    return {
      love: apiResponse.data.love,
      friendship: apiResponse.data.friendship,
      teamwork: apiResponse.data.teamwork,
      overall: apiResponse.data.overall
    };
  } catch (error) {
    console.error('Error in calculateCompatibility:', error);
    return getFallbackCompatibility();
  }
}

// Legacy compatibility calculation functions removed
// All calculations now handled by Python backend with real astronomical data