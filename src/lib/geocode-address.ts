import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { GeocodeUnavailable, geocodeAddress, type GeocodeResult } from "@/lib/geocode";

// Nominatim's policy asks for a User-Agent that says who is calling and how to
// reach them, so a misbehaving client can be contacted instead of blocked.
export async function geocoderUserAgent() {
  const settings = await getStoreSettings();
  return `${settings.storeName} shop (${settings.contactEmail})`;
}

export type StoredGeocode = "found" | "not-found" | "unavailable" | "missing";

/**
 * Looks up an order address and saves where it is, so the admin can see the place
 * on a map. Runs after the response (never delays checkout) and never throws: a
 * geocoder that is down just leaves the address without a pin, and staff can press
 * "Find on map" later. `geocodedAt` stays empty in that case, so it isn't mistaken
 * for "looked up and not found".
 */
export async function geocodeAndStoreAddress(addressId: string): Promise<StoredGeocode> {
  const address = await db.address.findUnique({ where: { id: addressId } });
  if (!address) return "missing";

  let result: GeocodeResult | null;
  try {
    result = await geocodeAddress(address, { userAgent: await geocoderUserAgent() });
  } catch (error) {
    if (error instanceof GeocodeUnavailable) return "unavailable";
    throw error;
  }

  await db.address.update({
    where: { id: addressId },
    data: {
      lat: result?.lat ?? null,
      lng: result?.lng ?? null,
      geocodeLabel: result?.label ?? null,
      geocodedAt: new Date(),
    },
  });
  return result ? "found" : "not-found";
}
