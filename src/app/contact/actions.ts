"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email";
import { getStoreSettings } from "@/lib/store-settings";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});

export async function sendContactMessage(_prevState: unknown, formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimit(`contact:${ip}`, 5, 60_000);
  if (!success) return { error: "Too many messages. Try again later.", success: false };

  const captchaOk = await verifyTurnstile(
    formData.get("cf-turnstile-response") as string | null,
    ip
  );
  if (!captchaOk) return { error: "Verification failed. Please try again.", success: false };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", success: false };
  }

  const settings = await getStoreSettings();
  await sendEmail({
    to: settings.contactEmail,
    subject: `Contact form: ${parsed.data.name}`,
    text: `From: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
  });

  return { error: null, success: true };
}
