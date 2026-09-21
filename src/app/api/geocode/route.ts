import { NextResponse } from "next/server";
import { z } from "zod";
import { GeocodeUnavailable, geocodeAddress } from "@/lib/geocode";
import { geocoderUserAgent } from "@/lib/geocode-address";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Checkout asks this route where the typed address is, rather than calling
// OpenStreetMap from the browser: the page's CSP only allows same-origin
// requests, and OpenStreetMap's free geocoder wants an identifying User-Agent
// and roughly one request a second from us, which only a server can promise.
const schema = z.object({
  street: z.string().trim().min(3).max(200),
  city: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().max(20),
  country: z.string().trim().length(2),
});

// Best-effort: the map is a courtesy, never a reason to stop someone paying.
export async function POST(request: Request) {
  const [perVisitor, overall] = await Promise.all([
    rateLimit(`geocode:${clientIp(request)}`, 15, 60_000),
    rateLimit("geocode:all", 40, 60_000),
  ]);
  if (!perVisitor.success || !overall.success) {
    return NextResponse.json({ status: "unavailable" }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ status: "not-found" }, { status: 400 });

  try {
    const result = await geocodeAddress(parsed.data, { userAgent: await geocoderUserAgent() });
    if (!result) return NextResponse.json({ status: "not-found" });
    return NextResponse.json({ status: "found", ...result });
  } catch (error) {
    if (error instanceof GeocodeUnavailable) {
      return NextResponse.json({ status: "unavailable" });
    }
    throw error;
  }
}
