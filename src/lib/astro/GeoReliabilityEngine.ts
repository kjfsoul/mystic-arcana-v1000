interface GeoLocationInput {
  city?: string;
  region?: string;
  country?: string;
  lat: number;
  lon: number;
}

interface GeoResolutionResult {
  location: {
    city?: string;
    region?: string;
    country?: string;
    lat: number;
    lon: number;
  };
  confidenceScore: number;
  source: "manual" | "ipGeo" | "nasaFallback" | "unknown";
  notes?: string;
}

function GeoReliabilityEngine({
  manualLocation,
  ipGeoLocation,
  nasaFallbackLocation,
}: {
  manualLocation?: GeoLocationInput;
  ipGeoLocation?: GeoLocationInput;
  nasaFallbackLocation?: GeoLocationInput;
}): GeoResolutionResult {
  if (manualLocation) {
    return {
      location: manualLocation,
      confidenceScore: 1.0,
      source: "manual",
    };
  } else if (ipGeoLocation) {
    return {
      location: ipGeoLocation,
      confidenceScore: 0.8,
      source: "ipGeo",
    };
  } else if (nasaFallbackLocation) {
    return {
      location: nasaFallbackLocation,
      confidenceScore: 0.6,
      source: "nasaFallback",
    };
  } else {
    return {
      location: { lat: 0, lon: 0 },
      confidenceScore: 0.0,
      source: "unknown",
      notes: "No location data available",
    };
  }
}

export default GeoReliabilityEngine;
