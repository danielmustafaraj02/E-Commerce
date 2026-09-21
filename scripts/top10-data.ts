/**
 * The curated top-10 launch-critical roadmap items — shared data, no side
 * effects, safe to import from both add-top10-priorities.ts and
 * keep-only-top10.ts.
 */
export const TOP_10: { title: string; description: string }[] = [
  {
    title: "Reset the admin password if production was ever seeded with the old default",
    description:
      "The old seed created an admin with a published password (ChangeMe123!). If it was ever run against the live database, sign in and change it now.",
  },
  {
    title: "Verify the Stripe account itself, not just that a key is set",
    description:
      "A valid secret key can belong to an account that hasn't finished business verification or added a payout method. Run scripts/check-payment-readiness.ts and confirm charges_enabled and payouts_enabled are both true.",
  },
  {
    title: "Register the Stripe webhook and check its deliveries",
    description:
      "Endpoint /api/checkout/pay/stripe → /api/webhooks/stripe with checkout.session.completed. Without a working webhook, paid orders never get marked paid.",
  },
  {
    title: "Test a real card payment end to end",
    description:
      "Place a small real order, confirm the webhook marks it paid and the confirmation email arrives correctly.",
  },
  {
    title: "Set SENTRY_DSN so payment 'needs manual review' errors reach you",
    description:
      "Amount/currency-mismatched or late payments are flagged for manual review internally — without this, those flags only sit in logs nobody watches.",
  },
  {
    title: "Configure Turnstile (captcha)",
    description:
      "Set the site/secret keys in Admin > Settings > Integrations. Without it, login/register/checkout/contact forms are only slowed by rate limits, not stopped by a captcha.",
  },
  {
    title: "Configure Upstash Redis for shared rate limiting",
    description:
      "Without it, rate limiting falls back to an in-memory counter that's per server instance and resets on every deploy — much weaker in practice on serverless.",
  },
  {
    title: "Confirm every admin/staff account has MFA and remove unused staff",
    description: "Admin > Team & roles. Check who still has access and that 2FA is actually on.",
  },
  {
    title: "Enforce completed MFA inside requireStaff/requireAdmin, not just at the page layer",
    description:
      "An admin/staff account with valid credentials but no completed MFA enrollment can currently still invoke admin Server Actions — the role check alone is sufficient today.",
  },
  {
    title: "Fix silently-swallowed email send failures",
    description:
      "src/lib/email.ts#sendEmail doesn't check the Resend API response for an error, so a failed send (bad key, unverified domain, anything) is currently treated as success everywhere, including order confirmations and password resets.",
  },
];
