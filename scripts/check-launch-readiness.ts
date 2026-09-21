/**
 * Read-only check for the config-level items on the top-10 launch list
 * (see scripts/add-top10-priorities.ts) that can actually be verified
 * programmatically: Turnstile, Upstash, and Sentry configuration presence.
 * Never prints secret values — only booleans.
 *
 * Does NOT check: admin password reset status, Stripe webhook delivery
 * history, a real test payment, or admin/staff MFA coverage — those need a
 * human to check the Stripe/PayPal dashboards, Admin > Team & roles, and to
 * actually place a test order. Pair with check-payment-readiness.ts for the
 * Stripe/PayPal/bank-transfer side.
 *
 * Usage:
 *   npx tsx scripts/check-launch-readiness.ts
 */
import { getStoreSettings } from "../src/lib/store-settings";

function ok(label: string, pass: boolean, hint?: string) {
  console.log(`${pass ? "✅" : "❌"} ${label}${!pass && hint ? `\n   -> ${hint}` : ""}`);
}

async function main() {
  const settings = await getStoreSettings();

  console.log("Turnstile (captcha)\n" + "-".repeat(40));
  const turnstileSite = settings.turnstileSiteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileSecret = settings.turnstileSecretKey || process.env.TURNSTILE_SECRET_KEY;
  ok("Site key configured", Boolean(turnstileSite));
  ok(
    "Secret key configured",
    Boolean(turnstileSecret),
    "Without both, login/register/checkout/contact forms have no real captcha."
  );

  console.log("\nUpstash Redis (shared rate limiting)\n" + "-".repeat(40));
  const upstashUrl = settings.upstashRedisUrl || process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = settings.upstashRedisToken || process.env.UPSTASH_REDIS_REST_TOKEN;
  ok("URL configured", Boolean(upstashUrl));
  ok(
    "Token configured",
    Boolean(upstashToken),
    "Without both, rate limiting falls back to a weak per-instance in-memory counter."
  );

  console.log("\nSentry (error monitoring)\n" + "-".repeat(40));
  ok(
    "SENTRY_DSN set",
    Boolean(process.env.SENTRY_DSN),
    "This is a Vercel env var, not an Admin Settings field — set it in the Vercel dashboard."
  );

  console.log(
    "\nNot checked here (needs a human, not a script):\n" +
      "  - Whether the admin password was ever left at the old seeded default\n" +
      "  - Stripe/PayPal webhook delivery history (check their dashboards)\n" +
      "  - A real end-to-end test payment\n" +
      "  - Whether every admin/staff account actually has MFA on (Admin > Team & roles)"
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
