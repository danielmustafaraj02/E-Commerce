import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const COUNTRY_CODE = /^[A-Z]{2}$/;

export async function GET(request: Request) {
  const { success } = await rateLimit(`shipping-methods:${clientIp(request)}`, 30, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const country = new URL(request.url).searchParams.get("country")?.toUpperCase();
  if (!country || !COUNTRY_CODE.test(country)) {
    return NextResponse.json({ error: "Missing country" }, { status: 400 });
  }

  const zone = await db.shippingZone.findFirst({
    where: { countries: { some: { country } } },
    include: { methods: { include: { method: true } } },
  });

  const methods = (zone?.methods ?? [])
    .map((link) => link.method)
    .filter((method) => method.active);

  return NextResponse.json({ methods });
}
