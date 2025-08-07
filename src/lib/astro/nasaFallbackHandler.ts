import fs from "fs/promises";
import path from "path";
import NasaApiClient from "./nasaClient";

interface FallbackAstrologyData {
  source: "NASA_API_FALLBACK";
  timestamp: string;
  apod: any;
  solarWeather: any;
  neo: any;
  interpretation: {
    title: string;
    message: string;
    keywords: string[];
  };
}

export class NasaFallbackHandler {
  private nasaClient: NasaApiClient;

  constructor() {
    this.nasaClient = new NasaApiClient();
  }

  public async getFallbackData(): Promise<FallbackAstrologyData> {
    console.log("Executing Swiss Ephemeris fallback to NASA data...");
    try {
      const cachePath = new URL("nasaCache.json", import.meta.url).pathname;
      const cachedData = JSON.parse(await fs.readFile(cachePath, "utf-8"));

      if (!cachedData || !cachedData.apod) {
        throw new Error("NASA cache is empty or invalid.");
      }

      return this.transformNasaData(cachedData);
    } catch (error) {
      console.error(
        "Could not read from NASA cache, fetching live data...",
        error,
      );
      // If cache is unavailable, fetch live data
      await this.nasaClient.fetchAndCacheData();
      const cachePath = new URL("nasaCache.json", import.meta.url).pathname;
      const cachedData = JSON.parse(await fs.readFile(cachePath, "utf-8"));
      return this.transformNasaData(cachedData);
    }
  }

  private transformNasaData(nasaData: any): FallbackAstrologyData {
    const { apod, solarWeather, neoFeed } = nasaData;

    const interpretation = {
      title: `Cosmic Influence: ${apod.title}`,
      message: `Today's celestial portrait, the ${apod.title}, suggests a theme of ${this.generateThemeFromTitle(apod.title)}. ${apod.explanation}`,
      keywords: this.generateKeywords(apod.title, solarWeather),
    };

    return {
      source: "NASA_API_FALLBACK",
      timestamp: new Date().toISOString(),
      apod,
      solarWeather: solarWeather?.[0], // Get the most recent event
      neo: {
        count: neoFeed.element_count,
        closest_approach_today: this.findClosestNeo(neoFeed.near_earth_objects),
      },
      interpretation,
    };
  }

  private generateThemeFromTitle(title: string): string {
    if (title.toLowerCase().includes("nebula"))
      return "creation and cosmic mystery";
    if (title.toLowerCase().includes("galaxy"))
      return "expansion and interconnectedness";
    if (title.toLowerCase().includes("cluster"))
      return "community and shared brilliance";
    if (title.toLowerCase().includes("moon"))
      return "intuition and inner cycles";
    if (title.toLowerCase().includes("mars"))
      return "action and assertive energy";
    return "wonder and cosmic perspective";
  }

  private generateKeywords(title: string, solarWeather: any[]): string[] {
    const keywords = title.toLowerCase().split(" ").slice(0, 3);
    if (solarWeather && solarWeather.length > 0) {
      keywords.push(solarWeather[0].messageType.toLowerCase());
    }
    keywords.push("cosmic-fallback");
    return keywords;
  }

  private findClosestNeo(
    near_earth_objects: Record<string, any[]>,
  ): any | null {
    const today = new Date().toISOString().split("T")[0];
    const todayNeos = near_earth_objects[today];

    if (!todayNeos || todayNeos.length === 0) {
      return null;
    }

    return todayNeos.reduce((closest, current) => {
      const closestDist = parseFloat(
        closest.close_approach_data[0].miss_distance.kilometers,
      );
      const currentDist = parseFloat(
        current.close_approach_data[0].miss_distance.kilometers,
      );
      return currentDist < closestDist ? current : closest;
    });
  }
}
