import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const schema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
  anonymousId: z.string().optional(),
});

export async function POST(request: Request) {
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
