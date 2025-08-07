import axios from "axios";
import fs from "fs/promises";
import path from "path";

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";
const API_BASE_URL = "https://api.nasa.gov";

interface ApodData {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: "image" | "video";
  title: string;
  url: string;
}

interface NeoData {
  links: {
    next: string;
    previous: string;
    self: string;
  };
  element_count: number;
  near_earth_objects: Record<string, any[]>;
}

interface DonkiData {
  // Define the structure for DONKI data
  [key: string]: any;
}

class NasaApiClient {
  public async getApod(): Promise<ApodData> {
    const response = await axios.get(`${API_BASE_URL}/planetary/apod`, {
      params: { api_key: NASA_API_KEY },
    });
    return response.data;
  }

  public async getNeoFeed(
    startDate: string,
    endDate: string,
  ): Promise<NeoData> {
    const response = await axios.get(`${API_BASE_URL}/neo/rest/v1/feed`, {
      params: {
        start_date: startDate,
        end_date: endDate,
        api_key: NASA_API_KEY,
      },
    });
    return response.data;
  }

  public async getSolarWeather(): Promise<DonkiData[]> {
    const response = await axios.get(`${API_BASE_URL}/DONKI/notifications`, {
      params: {
        api_key: NASA_API_KEY,
        type: "all",
      },
    });
    return response.data;
  }

  public async fetchAndCacheData() {
    try {
      const apod = await this.getApod();
      const today = new Date().toISOString().split("T")[0];
      const neoFeed = await this.getNeoFeed(today, today);
      const solarWeather = await this.getSolarWeather();

      const cacheData = {
        apod,
        neoFeed,
        solarWeather,
        lastUpdated: new Date().toISOString(),
      };

      const cachePath = new URL("nasaCache.json", import.meta.url).pathname;
      await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2));
      console.log(`Successfully cached NASA data to ${cachePath}`);
    } catch (error) {
      console.error("Failed to fetch or cache NASA data:", error);
    }
  }
}

if (
  import.meta.url.startsWith("file://") &&
  process.argv[1] === new URL(import.meta.url).pathname
) {
  const client = new NasaApiClient();
  client.fetchAndCacheData();
}

export default NasaApiClient;
