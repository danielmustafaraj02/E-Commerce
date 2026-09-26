// The launch checklist imported into Admin > Roadmap (see
// src/app/admin/roadmap/import-actions.ts): the README's "What to do next" plus
// everything found while reviewing the code and the live site.
//
// `done` means verified on 2026-09-20, either against the live site
// (https://perlamuranoglass.com — headers, HTTP responses, page source, DNS) or
// in the deployed code. The detail says which. Anything that can only be seen
// from inside Vercel, Stripe, PayPal, Neon or Search Console is deliberately
// left open with a note, rather than assumed done.
export const CHECKLIST_CHECKED_ON = "2026-09-20";

export type Priority = "high" | "medium" | "low";
export type ChecklistItem = {
  area: string;
  priority: Priority;
  done: boolean;
  title: string;
  detail: string;
};

const item = (
  area: string,
  priority: Priority,
  done: boolean,
  title: string,
  detail: string
): ChecklistItem => ({ area, priority, done, title, detail });

export const LAUNCH_CHECKLIST: ChecklistItem[] = [
  // ── Security & accounts ────────────────────────────────────────────────
  item(
    "Security",
    "high",
    true,
    "Bind the PayPal return to the order it was created for",
    "Checked live: a forged PayPal return (fake token) is redirected home and marks nothing paid. Amount and currency are verified too."
  ),
  item(
    "Security",
    "high",
    true,
    "Verify the paid amount and currency in the Stripe and PayPal webhooks",
    "Late or mismatched payments are recorded and raised for manual review instead of silently dropped. Checked live: an unsigned Stripe webhook is rejected (400)."
  ),
  item(
    "Security",
    "high",
    true,
    "Stop treating PayPal 'approved' as paid",
    "In the deployed code: only PAYMENT.CAPTURE.COMPLETED marks an order paid, because a buyer approving is not the same as the money being captured."
  ),
  item(
    "Security",
    "medium",
    true,
    "Fix Stripe 'pay again' failing after a cancelled attempt",
    "In the deployed code: reuses a still-open session or starts a fresh attempt when it expired. Covered by tests but not yet tried with real Stripe — see the Stripe test item."
  ),
  item(
    "Security",
    "high",
    true,
    "Make the login captcha impossible to skip",
    "In the deployed code: sending a dummy authenticator code no longer bypasses Turnstile. Note: Turnstile itself isn't configured yet (see below), so this only matters once it is."
  ),
  item(
    "Security",
    "medium",
    true,
    "Enforce account lockout on every login path",
    "In the deployed code: the MFA pre-check honors locks, and failed attempts are counted atomically so parallel guesses can't dodge the lock."
  ),
  item(
    "Security",
    "high",
    true,
    "Block Google sign-in for MFA and admin/staff accounts",
    "In the deployed code: Google sign-in never asked for an authenticator code, so it could have bypassed MFA."
  ),
  item(
    "Security",
    "high",
    true,
    "Re-check the user's role in the database on every session",
    "In the deployed code: a demoted user loses access immediately, a deleted user is signed out, and a password change ends older sessions."
  ),
  item(
    "Security",
    "high",
    true,
    "Password reset ('Forgot password?')",
    "Checked live: /forgot-password and /reset-password respond and the login page links to them. Single-use 1-hour links; the response never reveals whether an account exists."
  ),
  item(
    "Security",
    "medium",
    true,
    "Security headers on every response",
    "Checked live: HSTS, Content-Security-Policy with per-request nonces, X-Frame-Options DENY, X-Content-Type-Options and Referrer-Policy."
  ),
  item(
    "Security",
    "medium",
    true,
    "Admin, cron and webhook endpoints reject anonymous access",
    "Checked live: /admin redirects to sign-in, the cron returns 401 without its secret, and the Stripe webhook rejects unsigned calls."
  ),
  item(
    "Security",
    "high",
    true,
    "Stop /_next/image acting as an open image proxy",
    "Checked live: an image from a foreign host is refused (400) while your own images still load."
  ),
  item(
    "Security",
    "high",
    false,
    "Reset the admin password if production was ever seeded with the old default",
    "The old seed created an admin with a published password (ChangeMe123!). If it was ever run against the live database, sign in and change it now. The new seed refuses to run in production."
  ),
  item(
    "Security",
    "high",
    false,
    "Confirm every admin/staff account has MFA and remove unused staff",
    "Admin > Team & roles. MFA is required at sign-in for admin and staff, but check who still has access."
  ),
  item(
    "Security",
    "high",
    false,
    "Configure Turnstile (captcha)",
    "Checked live: the login page shows no captcha widget, so bots are only slowed by rate limits. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY."
  ),
  item(
    "Security",
    "high",
    false,
    "Configure Upstash Redis for shared rate limiting",
    "Without UPSTASH_REDIS_REST_URL and _TOKEN the limiter is per server instance and resets on every deploy. Can't be checked from outside — look at the Vercel environment variables."
  ),
  item(
    "Security",
    "high",
    false,
    "Set SENTRY_DSN so payment 'needs manual review' errors reach you",
    "Without it those errors only go to the host logs. Can't be checked from outside — look at the Vercel environment variables."
  ),
  item(
    "Security",
    "medium",
    false,
    "Add /.well-known/security.txt",
    "Checked live: returns 404. A contact address for vulnerability reports is standard practice."
  ),
  item(
    "Security",
    "low",
    false,
    "Step-up MFA for Google sign-in",
    "Only needed if admins should be allowed to sign in with Google."
  ),
  item(
    "Security",
    "high",
    false,
    "Deploy this session's security fixes",
    "Fixed in code (commit c7c3f81) but not yet pushed to main, so not live: rate limiting on /api/checkout/quote (was letting anyone brute-force discount codes for free) and on the PayPal payment-init route, removal of a dead /api/auth/register route that bypassed the Turnstile check the real registration form enforces, and hashing email-verification tokens at rest (password-reset tokens already were). Push to main to deploy."
  ),
  item(
    "Security",
    "high",
    false,
    "Fix silently-swallowed email send failures",
    "src/lib/email.ts#sendEmail awaits resend.emails.send() but never checks the response for an error — a bad API key, unverified sending domain, or any Resend-side rejection is silently treated as success everywhere (order confirmations, password resets, shipping updates). Found while testing: a send with an unverified 'from' domain returned a 403 from Resend but the app logged success. Should check the response and surface/log failures so a misconfigured sender doesn't fail silently in production."
  ),
  item(
    "Security",
    "medium",
    false,
    "Enforce completed MFA inside requireStaff/requireAdmin, not just at the page layer",
    "src/lib/require-admin.ts: an admin/staff account with valid credentials but no completed MFA enrollment can still invoke every requireStaff()/requireAdmin()-gated Server Action — the role check alone is sufficient. src/proxy.ts only nudges them toward /account/mfa when browsing pages; it doesn't block the action itself. Documented, deliberate tradeoff in the code, not an oversight — but a real gap if 'admin = must have 2FA on' was assumed to be a hard rule."
  ),
  item(
    "Payments",
    "high",
    false,
    "Verify the Stripe account itself, not just that a key is set",
    "A valid secret key can still belong to an account that hasn't finished business verification or added a payout method — charges would work but payouts wouldn't. Run scripts/check-payment-readiness.ts (see its --live check of stripe.accounts.retrieveCurrent(): details_submitted, charges_enabled, payouts_enabled)."
  ),
  item(
    "SEO",
    "medium",
    false,
    "Set the store's site URL in Admin > Settings",
    "The setting is empty on production. Canonical URLs, the sitemap and emails currently work only through the NEXTAUTH_URL fallback; set it explicitly so nothing depends on that fallback."
  ),

  // ── Payments & orders ──────────────────────────────────────────────────
  item(
    "Payments",
    "high",
    true,
    "Shorter stock reservations",
    "In the deployed code: unpaid card/PayPal orders release stock after 2 hours (was 48), bank-transfer orders after 5 days, and checkout releases expired holds on demand."
  ),
  item(
    "Payments",
    "medium",
    true,
    "Stripe sessions expire together with the order",
    "In the deployed code: prevents paying for an order that has already been cancelled."
  ),
  item(
    "Payments",
    "high",
    false,
    "Test a real card payment end to end",
    "Place a small real order (or use Stripe test mode on a preview deploy), confirm the webhook marks it paid and the confirmation email arrives."
  ),
  item(
    "Payments",
    "high",
    false,
    "Register the Stripe webhook and check its deliveries",
    "Endpoint /api/webhooks/stripe with checkout.session.completed and checkout.session.async_payment_succeeded; confirm successful deliveries in the Stripe dashboard."
  ),
  item(
    "Payments",
    "high",
    false,
    "Register the PayPal webhook and set PAYPAL_WEBHOOK_ID",
    "Endpoint /api/webhooks/paypal, event PAYMENT.CAPTURE.COMPLETED."
  ),
  item(
    "Payments",
    "high",
    false,
    "Test PayPal end to end",
    "Approve and capture a payment, and also an approval that is never captured (the order must stay pending)."
  ),
  item(
    "Payments",
    "medium",
    false,
    "Test cancel-then-retry on Stripe",
    "The fix has unit tests but hasn't been tried against real Stripe."
  ),
  item(
    "Payments",
    "medium",
    false,
    "Test a delayed payment method (SEPA) if it is enabled",
    "The order must stay pending until checkout.session.async_payment_succeeded arrives."
  ),
  item(
    "Payments",
    "high",
    false,
    "Build a reinstate-or-refund flow for payments that arrive after cancellation",
    "Today they are recorded and raised for manual review, then handled by hand."
  ),
  item(
    "Payments",
    "medium",
    false,
    "Handle checkout.session.expired",
    "Mark the pending Stripe payment as failed when its session expires."
  ),
  item(
    "Payments",
    "medium",
    false,
    "Show payments and 'needs review' on the admin order page",
    "Staff can't currently see per-order payment status or amounts without querying the database."
  ),
  item(
    "Payments",
    "medium",
    false,
    "Set the bank transfer details",
    "Admin > Payments: IBAN, BIC and account holder, if bank transfer is offered."
  ),
  item(
    "Payments",
    "medium",
    false,
    "Decide on cash on delivery and its fee",
    "Enable it and set the fee, or keep it off."
  ),
  item(
    "Payments",
    "medium",
    false,
    "Send a test order through every status",
    "paid, shipped, delivered, cancelled, refunded — check that each customer email renders and arrives."
  ),
  item(
    "Payments",
    "low",
    false,
    "Re-check discount limits inside the order transaction",
    "Two simultaneous orders can exceed a code's maximum uses."
  ),
  item(
    "Payments",
    "low",
    false,
    "Make discount codes case-insensitive",
    "WELCOME10 and welcome10 are currently different codes."
  ),
  item(
    "Payments",
    "low",
    false,
    "Reject carts that mix currencies",
    "The order currency is taken from the first line only."
  ),

  // ── Catalog & content ──────────────────────────────────────────────────
  item(
    "Catalog",
    "high",
    false,
    "Set real stock levels",
    "Checked live: all 45 products are Out of stock — on the page, in the structured data and in the Merchant feed — so nothing can be bought and search results will say out of stock."
  ),
  item(
    "Catalog",
    "high",
    false,
    "Load the new translations into production",
    "Checked live: only French and German product names are translated — in Spanish, Portuguese, Japanese, Hindi, Arabic, Chinese and Russian the page falls back to English. Run scripts/update-product-descriptions.ts (with --dry-run first) against production."
  ),
  item(
    "Catalog",
    "medium",
    false,
    "Fix Italian pages showing English product names",
    "Product.name on production holds English text, so /it shows 'Sage & Gold Wrap Bracelet'. Running update-product-descriptions restores the Italian names."
  ),
  item(
    "Catalog",
    "high",
    false,
    "Have native speakers proofread the translations",
    "Especially Hindi, Japanese, Arabic, Chinese and Russian. Automated checks can't judge tone or naturalness."
  ),
  item(
    "Catalog",
    "medium",
    false,
    "Replace the placeholder company legal name",
    "Checked live: structured data published 'Demo Store S.r.l.'. Set the real legal name, VAT number and address in Admin > Settings."
  ),
  item(
    "Catalog",
    "medium",
    false,
    "Add category descriptions",
    "Needs a translated description field on categories plus admin editing; draft copy is in reports/seo-audit.md."
  ),
  item(
    "Catalog",
    "high",
    false,
    "Have the legal pages reviewed",
    "Terms, Privacy, Returns and Cookies exist (about 1,000 words each) but should be checked by a lawyer against how the shop really works."
  ),
  item(
    "Catalog",
    "medium",
    false,
    "Check product claims against your real supply chain",
    "Copy says hand-blown in Murano, Italy. Make sure that's true for every product, and never imply the protected 'Vetro Artistico® Murano' mark unless it is."
  ),
  item(
    "Catalog",
    "medium",
    false,
    "Add social profile links",
    "Checked live: no sameAs links in the structured data. Add Instagram/Facebook/etc. in Admin > Settings."
  ),
  item(
    "Catalog",
    "low",
    false,
    "Review the About page content",
    "Confirm the story, contact details and claims are accurate and current."
  ),
  item(
    "Catalog",
    "medium",
    true,
    "Homepage testimonials use only real reviews",
    "In the deployed code: only written customer reviews are shown (none exist yet, so none appear)."
  ),
  item(
    "Catalog",
    "low",
    true,
    "OpenGraph share image is set",
    "Checked live: og:image is present on the homepage."
  ),
  item(
    "Catalog",
    "medium",
    false,
    "Add at least three photos per product",
    "Checked live: every product has exactly one photo. Add detail, worn/scale and lifestyle shots. The Merchant feed exports the extras automatically as additional_image_link. Format is not the problem: the image optimizer already serves them as WebP at about 11 KB."
  ),

  // ── Tax, shipping & legal ──────────────────────────────────────────────
  item(
    "Legal",
    "high",
    false,
    "Fix VAT: add tax rules for every country you ship to, or restrict shipping",
    "Only Italy had a tax rule when last checked, while the site says prices include VAT. Check Admin > Tax rules."
  ),
  item(
    "Legal",
    "medium",
    false,
    "Get accountant advice on EU OSS / VAT registration",
    "Cross-border EU sales to consumers have their own VAT rules."
  ),
  item(
    "Legal",
    "medium",
    false,
    "Verify shipping zones, prices and delivery times",
    "Shipping details are published for all 45 products; confirm each zone and method matches what you actually charge."
  ),
  item(
    "Legal",
    "medium",
    true,
    "Right-of-withdrawal notice at checkout in 11 languages",
    "In place (14-day EU right of withdrawal, wording reviewed this round)."
  ),
  item(
    "Legal",
    "medium",
    true,
    "Data export and account deletion for customers",
    "Self-service under Account."
  ),
  item(
    "Legal",
    "medium",
    true,
    "Cookie banner controls analytics",
    "Checked live: no Vercel Analytics/Speed Insights script loads before the visitor accepts."
  ),
  item(
    "Legal",
    "medium",
    false,
    "Make the cookie policy list the real cookies and processors",
    "Vercel Analytics, Stripe, PayPal, Cloudflare Turnstile once enabled, etc."
  ),
  item(
    "Legal",
    "medium",
    false,
    "Show company details in the footer or an imprint page",
    "Checked live: legal name, VAT number and address don't appear anywhere visible."
  ),
  item(
    "Legal",
    "medium",
    false,
    "Complete the GDPR paperwork",
    "Data processing agreements with Vercel, Neon, Resend, Stripe and Upstash, and a record of processing."
  ),
  item(
    "Legal",
    "low",
    false,
    "Run an accessibility audit (WCAG)",
    "Run axe/Lighthouse on home, product, cart and checkout, in at least one right-to-left language (Arabic)."
  ),

  // ── SEO & GEO ──────────────────────────────────────────────────────────
  item(
    "SEO",
    "high",
    true,
    "Sitemap where every page returns 200",
    "Checked live: 57 URLs, all 200, correct host."
  ),
  item(
    "SEO",
    "medium",
    true,
    "robots.txt blocks private areas and allows the Merchant feed",
    "Checked live."
  ),
  item(
    "SEO",
    "high",
    true,
    "Fix wrong canonicals on /contact and /legal/*",
    "Checked live: each now points at itself (they used to point at the homepage)."
  ),
  item(
    "SEO",
    "medium",
    true,
    "noindex on private and utility pages",
    "Checked live: /login is noindex."
  ),
  item(
    "SEO",
    "medium",
    true,
    "Shipping and return details in product structured data",
    "Checked live: present on all 45 products."
  ),
  item("SEO", "medium", true, "/llms.txt for AI assistants", "Checked live: 200."),
  item(
    "SEO",
    "medium",
    true,
    "Structured data for products, categories, the guide (FAQ, HowTo, Article) and breadcrumbs",
    "Checked live on product, category and guide pages."
  ),
  item(
    "SEO",
    "medium",
    true,
    "Google Search Console property verified",
    "Checked in DNS: the Google verification record is present."
  ),
  item(
    "SEO",
    "high",
    false,
    "Redirect www to the bare domain with a permanent 308",
    "Checked live: it's a temporary 307. Vercel > Project > Settings > Domains > www.perlamuranoglass.com > Edit > redirect to perlamuranoglass.com, status 308."
  ),
  item(
    "SEO",
    "high",
    false,
    "Add locale-prefixed URLs (/it, /de, ...)",
    "All 11 languages share one URL, so Google only indexes English and hreflang points at the same URL. This is the biggest SEO gap."
  ),
  item(
    "SEO",
    "medium",
    false,
    "Deploy absolute image and logo URLs in structured data",
    "Checked live: product, offer, image and breadcrumb URLs in the structured data are relative ('/products/...'). Cause: four pages built URLs from the Admin site-URL setting alone, and it is empty on production. Fixed in the code (siteBaseUrl falls back to NEXTAUTH_URL) and waiting for the next deploy; afterwards re-check offers.url in a product page's JSON-LD. It also fixes the abandoned-cart email, whose link had no domain."
  ),
  item(
    "SEO",
    "high",
    false,
    "Submit the sitemap in Search Console and review the Pages report",
    "Search Console > Sitemaps > add sitemap.xml, then read the indexing report."
  ),
  item(
    "SEO",
    "medium",
    false,
    "Review the 'Page with redirect' examples in Search Console",
    "Expected: http, www, trailing-slash and /account URLs. Investigate only if a real page you want indexed is listed."
  ),
  item(
    "SEO",
    "medium",
    false,
    "Get real reviews to unlock star ratings",
    "Checked live: no product has ratings. Add a review-request email after delivery; never seed fake reviews."
  ),
  item(
    "SEO",
    "medium",
    false,
    "Submit the product feed to Google Merchant Center",
    "The feed responds (200) at /api/feeds/google-merchant. The code now also exports Google's Jewelry category, extra photos, richer titles and the material once deployed. Add it as a scheduled fetch and fix any disapprovals. Every item currently says out of stock."
  ),
  item(
    "SEO",
    "medium",
    false,
    "Add Bing Webmaster Tools and submit the sitemap",
    "Also feeds several other search and AI answer engines."
  ),
  item(
    "SEO",
    "medium",
    false,
    "Write a guide/blog hub for informational searches",
    "How Murano glass is made, how to tell it's real, care and history — linking down to the categories."
  ),
  item(
    "SEO",
    "low",
    false,
    "Tidy the product title pattern",
    "Checked live: 43 of 45 product titles were over 60 characters and got cut off in results. Fixed in the code (every title now fits, 39 of 45 keep the Murano Glass keyword) and waiting for the next deploy. Meta descriptions now end with the price and a call to action too."
  ),
  item(
    "SEO",
    "medium",
    false,
    "Measure Core Web Vitals",
    "Run PageSpeed Insights now, and Search Console's report once there is traffic."
  ),
  item(
    "SEO",
    "medium",
    false,
    "Cache the public catalog pages",
    "Checked live: pages are served no-store, so every visit hits the server and the database."
  ),

  // ── Reliability & operations ───────────────────────────────────────────
  item(
    "Operations",
    "medium",
    true,
    "Database indexes on foreign keys and hot columns",
    "32 indexes shipped in a migration that the deploy's build step applies (the site's new pages are live, so the build passed — check the Vercel build log to confirm)."
  ),
  item("Operations", "medium", true, "Health endpoint", "Checked live: /api/health returns ok."),
  item("Operations", "low", true, "Unknown URLs return a real 404", "Checked live."),
  item(
    "Operations",
    "high",
    false,
    "Point an uptime monitor at /api/health",
    "UptimeRobot, Better Stack or similar, with alerts to your phone."
  ),
  item(
    "Operations",
    "high",
    false,
    "Confirm database backups and test a restore",
    "Neon point-in-time restore — a backup you have never restored isn't a backup."
  ),
  item(
    "Operations",
    "medium",
    false,
    "Check database connection pooling and cold starts",
    "Watch the first request after idle; use the pooled Neon connection string."
  ),
  item(
    "Operations",
    "medium",
    false,
    "Set up alerts for server errors",
    "Vercel alerts or a log drain for 5xx responses."
  ),
  item(
    "Catalog",
    "medium",
    false,
    "Lengthen product descriptions and add a specs table",
    "Checked live: descriptions are 28-58 words (a product page usually needs 200 or more to compete) and no product has a specs table. Add materials, dimensions, clasp, length and care in your own words — not padding."
  ),

  // ── Email ──────────────────────────────────────────────────────────────
  item(
    "Email",
    "medium",
    true,
    "Sending domain is authenticated",
    "Checked in DNS: DKIM, SPF (on the send. subdomain) and the bounce MX for Resend are present."
  ),
  item(
    "Email",
    "medium",
    false,
    "Add a DMARC record",
    "Checked in DNS: none. Add a _dmarc TXT record such as 'v=DMARC1; p=none; rua=mailto:you@...' and tighten it later."
  ),
  item(
    "Email",
    "medium",
    false,
    "Localize the transactional emails",
    "Order, verification and password-reset emails are English only."
  ),
  item(
    "Email",
    "low",
    false,
    "Add a List-Unsubscribe header to newsletter campaigns",
    "Improves deliverability and is expected by Gmail/Yahoo bulk-sender rules."
  ),
  item(
    "Email",
    "medium",
    false,
    "Send test emails to Gmail and Outlook and check spam placement",
    "Verification, password reset and order confirmation."
  ),
  item(
    "Email",
    "low",
    false,
    "Watch the Resend daily cap",
    "The app stops at 80 emails/day so the free plan isn't exceeded; extra emails are skipped silently. Upgrade or monitor."
  ),

  // ── Engineering & quality ──────────────────────────────────────────────
  item(
    "Engineering",
    "medium",
    true,
    "Admin navigation: top bar with a sidebar per section",
    "Deployed; not visually checked in a browser yet."
  ),
  item(
    "Engineering",
    "medium",
    true,
    "Typecheck, lint and 268+ tests all pass",
    "Zero lint errors or warnings."
  ),
  item(
    "Engineering",
    "low",
    true,
    "README reorganized with configuration, deploy and to-do sections",
    "Also commits the .env.example template that was accidentally ignored before."
  ),
  item(
    "Engineering",
    "medium",
    false,
    "Add CI that runs typecheck, lint and tests on every push",
    "Checked: there is no .github folder, so nothing runs automatically before a deploy."
  ),
  item(
    "Engineering",
    "medium",
    false,
    "Add browser end-to-end tests for checkout and the admin",
    "Nothing tests rendering or real payment flows today."
  ),
  item(
    "Engineering",
    "low",
    false,
    "Automate dependency updates",
    "Dependabot or Renovate, so security patches don't wait for a manual check."
  ),
];

// How an item appears on the roadmap: the area in brackets keeps a flat list of
// 104 tasks scannable and sortable by eye.
export const taskTitle = (entry: ChecklistItem) => `[${entry.area}] ${entry.title}`;

export type TaskRow = {
  title: string;
  description: string;
  priority: Priority;
  status: "open" | "done";
  createdAt: Date;
  completedAt: Date | null;
};

// Items whose task isn't on the roadmap yet (matched by exact title). Existing
// tasks are never touched, so re-importing can't overwrite staff edits, ticks or
// deletions of things they've since changed.
export function missingChecklistItems(existingTitles: Iterable<string>): ChecklistItem[] {
  const have = new Set(existingTitles);
  return LAUNCH_CHECKLIST.filter((entry) => !have.has(taskTitle(entry)));
}

// The roadmap lists open tasks newest-first within a priority, so give item 0
// the newest timestamp to keep the checklist in its written order.
export function toTaskRows(items: ChecklistItem[], now = new Date()): TaskRow[] {
  return items.map((entry, index) => ({
    title: taskTitle(entry),
    description: entry.detail,
    priority: entry.priority,
    status: entry.done ? "done" : "open",
    createdAt: new Date(now.getTime() - index * 1000),
    completedAt: entry.done ? now : null,
  }));
}
