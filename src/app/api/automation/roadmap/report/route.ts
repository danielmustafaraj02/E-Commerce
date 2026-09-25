import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { captureError } from "@/lib/monitoring";
import { isValidBearerToken } from "@/lib/bearer-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { CLAUDE_REPORT_MAX } from "@/lib/roadmap-claude";

// Where a nightly run posts what it changed and what the owner should check
// (shown on the Bacheca in Admin > Roadmap). The task stays open: the owner
// marks it done after checking the PR, or asks Claude to try again.
export async function POST(request: Request) {
  // Same per-IP cap as the sibling roadmap routes — bounds the damage if the
  // service token ever leaked (each hit does a DB write).
  const { success } = await rateLimit(`automation-roadmap-report:${clientIp(request)}`, 20, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isValidBearerToken(request, process.env.AUTOMATION_ROADMAP_TOKEN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { id, report } = body as Record<string, unknown>;

  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  if (typeof report !== "string" || report.trim().length === 0) {
    return NextResponse.json({ error: "report is required" }, { status: 400 });
  }
  if (report.length > CLAUDE_REPORT_MAX) {
    return NextResponse.json(
      { error: `report must be at most ${CLAUDE_REPORT_MAX} characters` },
      { status: 400 }
    );
  }

  try {
    const { count } = await db.improvementTask.updateMany({
      where: { id, forClaude: true },
      data: { claudeReport: report.trim(), claudeReportAt: new Date() },
    });
    if (count === 0) {
      return NextResponse.json({ error: "No task for Claude with that id" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    captureError(error, { scope: "automation-roadmap-report" });
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}
