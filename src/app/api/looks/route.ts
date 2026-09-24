import { NextResponse } from "next/server";
import { getLooksForProducts } from "@/lib/look-data";
import { getLocale } from "@/lib/i18n/locale";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// The cart lives in the browser, so the cart page asks here which looks its
// products belong to (for the "complete the look" upsell and saving estimate).
const MAX_IDS = 50;

export async function GET(request: Request) {
  const { success } = await rateLimit(`looks:${clientIp(request)}`, 60, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const ids = (new URL(request.url).searchParams.get("productIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_IDS);
  if (ids.length === 0) return NextResponse.json({ looks: [] });

  const looks = await getLooksForProducts(ids, await getLocale());
  return NextResponse.json({ looks });
}
