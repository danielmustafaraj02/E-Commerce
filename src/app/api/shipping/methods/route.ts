import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const country = new URL(request.url).searchParams.get("country")?.toUpperCase();
  if (!country) {
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
