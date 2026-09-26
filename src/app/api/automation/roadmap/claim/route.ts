import { NextResponse } from "next/server";
import { captureError } from "@/lib/monitoring";
import { isValidBearerToken } from "@/lib/bearer-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { claimNextClaudeTask } from "@/lib/roadmap-claude";

// The nightly "Roadmap tasks for Claude" routine calls this first: it hands
// back the most important task flagged "for Claude" on Admin > Roadmap and
// marks it claimed so the other runs that night skip it. 204 = nothing to do.
export async function POST(request: Request) {
  // Same per-IP cap as the sibling roadmap routes — bounds the damage if the
  // service token ever leaked (each hit does a claiming DB write).
  const { success } = await rateLimit(`automation-roadmap-claim:${clientIp(request)}`, 20, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isValidBearerToken(request, process.env.AUTOMATION_ROADMAP_TOKEN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const task = await claimNextClaudeTask();
    if (!task) return new NextResponse(null, { status: 204 });
    return NextResponse.json(task);
  } catch (error) {
    captureError(error, { scope: "automation-roadmap-claim" });
    return NextResponse.json({ error: "Failed to claim task" }, { status: 500 });
  }
}
