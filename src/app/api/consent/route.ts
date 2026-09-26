import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
  anonymousId: z.string().trim().max(100).optional(),
});

// Public, unauthenticated, and writes 3 rows per call — same abuse shape as
// geocode/client-error, so it gets the same per-visitor throttle.
export async function POST(request: Request) {
  const { success } = await rateLimit(`consent:${clientIp(request)}`, 20, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const session = await auth();
  const anonymousId = session?.user ? undefined : (parsed.data.anonymousId ?? randomUUID());

  await db.consentLog.createMany({
    data: [
      { userId: session?.user?.id, anonymousId, consentType: "functional", granted: true },
      {
        userId: session?.user?.id,
        anonymousId,
        consentType: "analytics",
        granted: parsed.data.analytics,
      },
      {
        userId: session?.user?.id,
        anonymousId,
        consentType: "marketing",
        granted: parsed.data.marketing,
      },
    ],
  });

  const response = NextResponse.json({ anonymousId });
  if (anonymousId) {
    response.cookies.set("anonymous_id", anonymousId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}
