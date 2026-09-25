import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Point an external uptime monitor (UptimeRobot, BetterStack, etc.) at this
// route — see README §Monitoring. A broken checkout nobody notices for days
// is the most common way small stores quietly lose money (build spec §11.2).
//
// Public and unauthenticated by necessity (that's what lets an outside
// monitor call it), but every hit still runs a DB query — same shape as the
// other public, DB-touching routes (looks, shipping/methods, the Google feed),
// so it gets the same per-IP throttle. 120/min per IP is far above what even
// a multi-region uptime monitor needs (they poll on the order of once a
// minute), so legitimate monitoring never notices.
export async function GET(request: Request) {
  const { success } = await rateLimit(`health:${clientIp(request)}`, 120, 60_000);
  if (!success) return NextResponse.json({ status: "error" }, { status: 429 });

  try {
    await db.storeSettings.findFirst({ select: { id: true } });
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
