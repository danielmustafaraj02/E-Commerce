import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { captureError } from "@/lib/monitoring";
import { isValidBearerToken } from "@/lib/bearer-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { TASK_DETAILS_MAX } from "@/lib/roadmap-claude";

const PRIORITIES = new Set(["low", "medium", "high"]);

// Lets the scheduled content/security/SEO/etc. automations (see the
// "E-Commerce: *" routines at claude.ai/code/routines) file something onto
// Admin > Roadmap when a run hits a decision only a human can make, instead
// of silently skipping it or burying it in a PR description. Bearer-token
// gated the same way api/cron/abandoned-orders is — this is a service
// credential, not a user session, and proxy.ts does not run for /api.
export async function POST(request: Request) {
  // Same per-IP cap as the site's other DB-writing public routes — cheap
  // insurance if this long-lived token ever leaked, since a valid bearer
  // alone would otherwise let it write unlimited rows.
  const { success } = await rateLimit(`automation-roadmap:${clientIp(request)}`, 20, 60_000);
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
  const { title, description, priority } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0 || title.length > 200) {
    return NextResponse.json({ error: "title is required (max 200 chars)" }, { status: 400 });
  }
  if (description !== undefined && typeof description !== "string") {
    return NextResponse.json({ error: "description must be a string" }, { status: 400 });
  }
  if (typeof description === "string" && description.length > TASK_DETAILS_MAX) {
    return NextResponse.json(
      { error: `description must be at most ${TASK_DETAILS_MAX} characters` },
      { status: 400 }
    );
  }
  if (priority !== undefined && (typeof priority !== "string" || !PRIORITIES.has(priority))) {
    return NextResponse.json({ error: "priority must be low, medium, or high" }, { status: 400 });
  }

  try {
    const task = await db.improvementTask.create({
      data: {
        title: title.trim(),
        description: typeof description === "string" ? description : null,
        priority: priority ?? "medium",
      },
      select: { id: true },
    });
    return NextResponse.json({ id: task.id }, { status: 201 });
  } catch (error) {
    captureError(error, { scope: "automation-roadmap" });
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
