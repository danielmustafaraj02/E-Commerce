"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { sendEmail } from "@/lib/email";
import { getStoreSettings } from "@/lib/store-settings";

const campaignSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(10000),
});

type CampaignState = { error: string | null; sent?: number; failed?: number };

// Sends sequentially in small batches rather than all at once — Resend (and
// the Vercel function running this action) both have limits a several-
// hundred-subscriber list could hit if fired in a single Promise.all.
const SEND_BATCH_SIZE = 10;

export async function sendNewsletterCampaign(
  _prevState: CampaignState,
  formData: FormData
): Promise<CampaignState> {
  const session = await requireAdmin();

  const parsed = campaignSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const subscribers = await db.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    select: { email: true },
  });
  if (subscribers.length === 0) {
    return { error: "There are no active subscribers to send to." };
  }

  const settings = await getStoreSettings();
  const base = settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < subscribers.length; i += SEND_BATCH_SIZE) {
    const batch = subscribers.slice(i, i + SEND_BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((subscriber) =>
        sendEmail({
          to: subscriber.email,
          subject: parsed.data.subject,
          text: `${parsed.data.message}\n\n---\nYou're receiving this because you subscribed to the ${settings.storeName} newsletter.\nUnsubscribe: ${base}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
        })
      )
    );
    for (const result of results) {
      if (result.status === "fulfilled") sent++;
      else failed++;
    }
  }

  await writeAuditLog({
    userId: session!.user.id,
    action: "newsletter.send",
    entityType: "NewsletterCampaign",
    after: { subject: parsed.data.subject, message: parsed.data.message, recipients: subscribers.length, sent, failed },
  });

  return { error: null, sent, failed };
}
