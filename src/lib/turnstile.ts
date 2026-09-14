import { getStoreSettings } from "@/lib/store-settings";

// Same graceful-degradation pattern as Stripe/PayPal/Resend: without a real
// secret key this skips verification (logs once) instead of locking
// everyone out, so dev/testing isn't blocked before real keys are added.
// Checks the DB (Admin > Settings > Integrations) first, falling back to env
// vars of the same name.
let warned = false;

export async function verifyTurnstile(token: string | null, remoteIp?: string) {
  const settings = await getStoreSettings();
  const secretKey = settings.turnstileSecretKey || process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    if (!warned) {
      console.warn("[turnstile] Not configured — skipping bot-check verification.");
      warned = true;
    }
    return true;
  }

  if (!token) return false;

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    }),
  });
  if (!res.ok) return false;

  const data = await res.json();
  return data.success === true;
}

export async function turnstileSiteKey() {
  const settings = await getStoreSettings();
  return settings.turnstileSiteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null;
}
