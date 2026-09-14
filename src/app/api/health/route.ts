import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Point an external uptime monitor (UptimeRobot, BetterStack, etc.) at this
// route — see README §Monitoring. A broken checkout nobody notices for days
// is the most common way small stores quietly lose money (build spec §11.2).
export async function GET() {
  try {
    await db.storeSettings.findFirst({ select: { id: true } });
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
