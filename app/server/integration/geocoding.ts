import { config } from "../config.js";

export type Coordinates = { lat: number; lng: number };

type GeocodingResponse = {
  status: string;
  results: Array<{
    geometry: {
      location: { lat: number; lng: number };
    };
  }>;
};

const ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";

export async function geocode(
  city: string,
  country: string,
): Promise<Coordinates | null> {
  const apiKey = config.google.geocodingApiKey;
  if (!apiKey) {
    console.warn("GOOGLE_GEOCODING_API_KEY is not set; skipping geocoding.");
    return null;
  }

  const url = new URL(ENDPOINT);
  url.searchParams.set("address", `${city}, ${country}`);
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Geocoding HTTP ${res.status} for "${city}, ${country}"`);
      return null;
    }
    const data = (await res.json()) as GeocodingResponse;
    if (data.status !== "OK" || data.results.length === 0) {
      console.warn(
        `Geocoding status "${data.status}" for "${city}, ${country}"`,
      );
      return null;
    }
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } catch (error) {
    console.warn(`Geocoding failed for "${city}, ${country}":`, error);
    return null;
  }
}
