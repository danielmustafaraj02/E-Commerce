// Finds where a delivery address is on the map, with OpenStreetMap's free
// geocoder (Nominatim). No API key. Its usage policy asks for: an identifying
// User-Agent, at most about one request a second, and cached results. So requests
// go through our own server (never straight from the browser), are rate-limited
// there, and identical lookups are cached for a day. Set GEOCODER_URL to point at
// another Nominatim-compatible service (or your own) without changing the code.

export type GeocodeQuery = { street: string; city: string; postalCode: string; country: string };

export type GeocodeResult = {
  lat: number;
  lng: number;
  /** The place as OpenStreetMap describes it, for the customer to confirm. */
  label: string;
  /** How exact the match is: the building, the street, or only the town/area. */
  precision: "building" | "street" | "area";
};

/** The geocoder didn't answer (timeout, 5xx, 429). Different from "no such address". */
export class GeocodeUnavailable extends Error {}

const DEFAULT_BASE = "https://nominatim.openstreetmap.org";
const ONE_DAY_SECONDS = 24 * 60 * 60;

export function searchUrl(query: GeocodeQuery, base = process.env.GEOCODER_URL || DEFAULT_BASE) {
  const url = new URL("/search", base);
  // Free-form rather than the structured street/city fields: those expect the
  // house number *before* the street, and "Via Roma 1" puts it after.
  url.searchParams.set("q", `${query.street}, ${query.postalCode} ${query.city}`);
  url.searchParams.set("countrycodes", query.country.toLowerCase());
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "en");
  return url;
}

// Nominatim's place_rank: 30 a building or address point, 26–27 a street, lower
// is a suburb, town or region (a postcode centre is about 21–25).
function precisionOf(placeRank: unknown): GeocodeResult["precision"] {
  const rank = typeof placeRank === "number" ? placeRank : 0;
  if (rank >= 28) return "building";
  if (rank >= 26) return "street";
  return "area";
}

/** Reads Nominatim's JSON. Returns null for no match or anything malformed. */
export function parseNominatim(payload: unknown): GeocodeResult | null {
  if (!Array.isArray(payload) || payload.length === 0) return null;
  const hit = payload[0] as Record<string, unknown> | null;
  if (!hit || typeof hit !== "object") return null;

  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  const inRange = Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !inRange) return null;

  const label = typeof hit.display_name === "string" ? hit.display_name.slice(0, 240) : "";
  return { lat, lng, label, precision: precisionOf(hit.place_rank) };
}

export async function geocodeAddress(
  query: GeocodeQuery,
  options: { userAgent: string; fetchImpl?: typeof fetch; base?: string }
): Promise<GeocodeResult | null> {
  const clean: GeocodeQuery = {
    street: query.street.trim(),
    city: query.city.trim(),
    postalCode: query.postalCode.trim(),
    country: query.country.trim(),
  };
  if (!clean.street || !clean.city || clean.country.length !== 2) return null;

  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(searchUrl(clean, options.base), {
      headers: { "User-Agent": options.userAgent, "Accept-Language": "en" },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: ONE_DAY_SECONDS },
    });
  } catch {
    throw new GeocodeUnavailable("The geocoder did not respond");
  }
  if (!response.ok) throw new GeocodeUnavailable(`The geocoder answered ${response.status}`);

  try {
    return parseNominatim(await response.json());
  } catch {
    throw new GeocodeUnavailable("The geocoder sent something unreadable");
  }
}
