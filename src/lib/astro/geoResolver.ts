import axios from "axios";

const IPGEOLOCATION_API_KEY = process.env.IPGEOLOCATION_API_KEY;

interface GeoLocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
}

export class GeoResolver {
  public async resolve(): Promise<GeoLocationData | null> {
    if (!IPGEOLOCATION_API_KEY) {
      console.warn("IPGeolocation API key not found. Skipping geo-resolution.");
      return null;
    }

    try {
      const response = await axios.get(
        `https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_API_KEY}`,
      );
      const { latitude, longitude, time_zone, city } = response.data;
      return {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timezone: time_zone.name,
        city,
      };
    } catch (error) {
      console.error("Failed to resolve geolocation:", error);
      return null;
    }
  }
}
