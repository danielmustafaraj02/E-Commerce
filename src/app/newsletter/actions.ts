"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function subscribeToNewsletter(_prevState: unknown, formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: withinLimit } = await rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!withinLimit) return { error: "generic" as const, success: false };

  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "invalidEmail" as const, success: false };
  const email = parsed.data.email.toLowerCase();

  // Opt-in, not opt-out — the same GDPR posture as the cookie-consent
  // banner. Upserting rather than erroring on a duplicate lets someone who
  // previously unsubscribed sign up again without a confusing "already
  // subscribed" message, and re-clears unsubscribedAt if they do.
  await db.newsletterSubscriber.upsert({
    where: { email },
    update: { unsubscribedAt: null },
    create: { email },
  });

  const session = await auth();
  await db.consentLog.create({
    data: {
      userId: session?.user?.id,
      consentType: "marketing",
      granted: true,
    },
  });

  return { error: null, success: true };
}
