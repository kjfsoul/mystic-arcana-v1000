import { BirthData } from './AstronomicalCalculator';
export interface HoroscopeData {
  sign: string;
  degrees: number;
  daily: string;
  isUnavailable?: boolean;
}
interface HoroscopeAPIResponse {
  success: boolean;
  data?: HoroscopeData & {
    isUnavailable?: boolean;
    error?: string;
  };
  error?: string;
}
async function callHoroscopeAPI(birthData: BirthData): Promise<HoroscopeAPIResponse> {
  try {
    const response = await fetch('/api/astrology/horoscope', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthData: {
          name: birthData.name || 'User',
          date: birthData.date,
          city: birthData.city,
          country: birthData.country,
          lat: birthData.lat || birthData.latitude,
          lng: birthData.lng || birthData.longitude,
          timezone: birthData.timezone
        }
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to call horoscope API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
function getFallbackHoroscope(): HoroscopeData {
  return {
    sign: "Horoscope temporarily unavailable",
    degrees: 0,
    daily: "Our astrological calculation service is currently offline. We use authentic astronomical calculations with Swiss Ephemeris data to determine your real sun sign and provide personalized insights. Please try again in a few moments.",
    isUnavailable: true
  };
}
export async function getPersonalizedHoroscope(birthData: BirthData): Promise<HoroscopeData> {
  try {
    // Call the Python backend for real horoscope calculations
    const apiResponse = await callHoroscopeAPI(birthData);
    
    if (!apiResponse.success || !apiResponse.data) {
      console.warn('Horoscope API failed, using fallback:', apiResponse.error);
      return getFallbackHoroscope();
    }
    // Check if service is temporarily unavailable
    if (apiResponse.data.isUnavailable) {
      return getFallbackHoroscope();
    }
    // Return the real horoscope data from Python backend
    return {
      sign: apiResponse.data.sign,
      degrees: apiResponse.data.degrees,
      daily: apiResponse.data.daily
    };
  } catch (error) {
    console.error('Error in getPersonalizedHoroscope:', error);
    return getFallbackHoroscope();
  }
}
// Helper function to get zodiac sign name in proper format
export function formatZodiacSign(sign: string): string {
  if (sign === "Horoscope temporarily unavailable") {
    return sign;
  }
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}
// Helper function to get zodiac emoji
export function getZodiacEmoji(sign: string): string {
  const emojiMap: Record<string, string> = {
    aries: '♈',
    taurus: '♉', 
    gemini: '♊',
    cancer: '♋',
    leo: '♌',
    virgo: '♍',
    libra: '♎',
    scorpio: '♏',
    sagittarius: '♐',
    capricorn: '♑',
    aquarius: '♒',
    pisces: '♓'
  };
  
  return emojiMap[sign.toLowerCase()] || '✨';
}
// Helper function to check if horoscope is available
export function isHoroscopeAvailable(horoscope: HoroscopeData): boolean {
  return !horoscope.isUnavailable && horoscope.sign !== "Horoscope temporarily unavailable";
}
