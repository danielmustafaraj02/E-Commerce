"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { requestPasswordReset } from "@/lib/password-reset";
import { captureError } from "@/lib/monitoring";

export type ForgotPasswordState = {
  status: "idle" | "sent" | "error";
  error: "generic" | null;
};

export async function requestReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimit(`forgot:${ip}`, 5, 60_000);
  if (!success) return { status: "error", error: "generic" };

  const captchaOk = await verifyTurnstile(
    formData.get("cf-turnstile-response") as string | null,
    ip
  );
  if (!captchaOk) return { status: "error", error: "generic" };

  const parsed = z
    .string()
    .email()
    .safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { status: "error", error: "generic" };
  const email = parsed.data;

  // Per-address cap so nobody can use this form to flood one person's inbox.
  // Over the cap it still says "sent": answering differently would tell an
  // attacker which addresses have been requested before.
  const { success: withinEmailLimit } = await rateLimit(
    `forgot-email:${email.toLowerCase()}`,
    3,
    60 * 60_000
  );

  // Everything account-dependent runs after the response, so the reply takes
  // the same time — and says the same thing — whether or not the address has
  // an account (no way to enumerate registered emails by timing or wording).
  if (withinEmailLimit) {
    after(async () => {
      try {
        await requestPasswordReset(email);
      } catch (error) {
        captureError(error, { scope: "password-reset-request" });
      }
    });
  }

  return { status: "sent", error: null };
}
