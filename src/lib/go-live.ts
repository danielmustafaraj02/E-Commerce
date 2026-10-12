/**
 * Admin > Settings > Go live: the readiness checks, as pure functions of facts
 * gathered on the server (src/app/admin/settings/go-live/facts.ts). Nothing here
 * reads a secret's value: keys arrive as "present, test or live, and from
 * where", never as the key.
 */

export type KeySource = "settings" | "environment";
export type KeyInfo = { present: boolean; mode: "test" | "live" | null; source: KeySource | null };

export type SiteStatus =
  | { kind: "ok"; httpStatus: number }
  | { kind: "disabled"; httpStatus: number }
  | { kind: "error"; httpStatus: number }
  | { kind: "unreachable"; detail: string }
  | { kind: "unknown" };

export type ReadinessFacts = {
  store: {
    name: string;
    placeholderName: boolean;
    contactEmail: string;
    currency: string;
    companyLegalName: boolean;
    companyAddress: boolean;
  };
  shipping: { zones: number; zonesWithActiveMethod: number };
  taxRules: number;
  legalSlugs: string[];
  products: { listed: number; withImages: number; inStock: number };
  site: { url: string | null; status: SiteStatus; https: boolean; hsts: boolean };
  vercel: { linked: boolean; projectName: string | null };
  git: {
    available: boolean;
    branch: string | null;
    uncommitted: number;
    unpushed: number | null;
    lastCommit: string | null;
  };
  stripe: { secret: KeyInfo; publishable: KeyInfo; webhook: boolean; succeededPayments: number };
  paypal: { configured: boolean };
  env: {
    authSecretStrong: boolean;
    cronSecret: boolean;
    rateLimit: boolean;
    turnstile: boolean;
    email: boolean;
    databaseTls: boolean;
  };
  admins: { total: number; withoutMfa: number };
  seo: {
    metaDescription: boolean;
    ogImage: boolean;
    siteVerification: boolean;
    unconvertedImages: number;
  };
  content: { drafts: number };
  nextVersion: string;
};

export type CheckStatus = "pass" | "warn" | "block" | "info";
export type Check = {
  id: string;
  title: string;
  status: CheckStatus;
  detail: string;
  /** What to do about it, in plain words. */
  fix?: string;
  /** Where in admin to do it. */
  href?: string;
};
export type ReadinessStep = { id: string; title: string; summary: string; checks: Check[] };

export const REQUIRED_LEGAL_PAGES = ["terms", "privacy", "returns", "cookies"] as const;

/** test / live from a Stripe key's prefix; null for anything else. */
export function stripeKeyMode(key: string | null | undefined): "test" | "live" | null {
  if (!key) return null;
  if (/^(sk|pk|rk)_test_/.test(key)) return "test";
  if (/^(sk|pk|rk)_live_/.test(key)) return "live";
  return null;
}

/** The first version is at least the second (plain x.y.z). */
export function versionAtLeast(version: string, minimum: string): boolean {
  const a = version.split(/[.-]/).map(Number);
  const b = minimum.split(/[.-]/).map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
  }
  return true;
}

/** Next.js 16.3.8 fixes the image optimizer SSRF and the other 16.x advisories. */
export const MIN_SAFE_NEXT = "16.3.8";

const check = (
  id: string,
  title: string,
  ok: boolean,
  failStatus: Exclude<CheckStatus, "pass">,
  detail: [pass: string, fail: string],
  fix?: string,
  href?: string
): Check => ({
  id,
  title,
  status: ok ? "pass" : failStatus,
  detail: ok ? detail[0] : detail[1],
  ...(ok ? {} : { fix, href }),
});

export function evaluateReadiness(f: ReadinessFacts): ReadinessStep[] {
  const missingLegal = REQUIRED_LEGAL_PAGES.filter((slug) => !f.legalSlugs.includes(slug));
  const { secret, publishable } = f.stripe;
  const stripeModesMatch = !secret.mode || !publishable.mode || secret.mode === publishable.mode;

  const store: Check[] = [
    check(
      "store-name",
      "Store name",
      !!f.store.name.trim() && !f.store.placeholderName,
      "block",
      [`“${f.store.name}”.`, "The store still has a placeholder name."],
      "Set the real name in Store settings.",
      "/admin/settings"
    ),
    check(
      "contact",
      "Contact email",
      /.+@.+\..+/.test(f.store.contactEmail),
      "block",
      [f.store.contactEmail, "Customers have no address to write to."],
      "Add the shop's email in Store settings.",
      "/admin/settings"
    ),
    check(
      "company",
      "Legal name and address",
      f.store.companyLegalName && f.store.companyAddress,
      "warn",
      [
        "Shown on invoices and the legal pages.",
        "EU law expects the seller's legal name and address on the shop.",
      ],
      "Fill them in Store settings.",
      "/admin/settings"
    ),
    { id: "currency", title: "Currency", status: "info", detail: f.store.currency },
    check(
      "shipping",
      "Shipping",
      f.shipping.zonesWithActiveMethod > 0,
      "block",
      [
        `${f.shipping.zonesWithActiveMethod} of ${f.shipping.zones} zones have an active method.`,
        "No destination can be shipped to, so checkout can't be completed.",
      ],
      "Add a zone with an active method in Shipping.",
      "/admin/shipping"
    ),
    check(
      "tax",
      "Tax",
      f.taxRules > 0,
      "block",
      [`${f.taxRules} tax rules.`, "Without a tax rule, VAT is not charged on any order."],
      "Add the rates for the countries you sell to in Tax rules.",
      "/admin/tax-rules"
    ),
    check(
      "legal",
      "Policy pages",
      missingLegal.length === 0,
      "block",
      [
        "Terms, privacy, returns and cookies are published.",
        `Missing: ${missingLegal.join(", ")}.`,
      ],
      "Write them in Legal pages.",
      "/admin/legal-pages"
    ),
    check(
      "products",
      "Products on sale",
      f.products.listed > 0 && f.products.inStock > 0,
      "block",
      [
        `${f.products.listed} listed, ${f.products.inStock} in stock, ${f.products.withImages} with photos.`,
        f.products.listed === 0 ? "No product is listed." : "Nothing listed is in stock.",
      ],
      "List products and set their stock in Products.",
      "/admin/products"
    ),
  ];

  const siteUrl = f.site.url;
  const siteCheck: Check = !siteUrl
    ? {
        id: "site",
        title: "Live site",
        status: "block",
        detail: "No site address is set, so links in emails and search results can't be built.",
        fix: "Set the site address (https://…) in Store settings.",
        href: "/admin/settings",
      }
    : f.site.status.kind === "ok"
      ? { id: "site", title: "Live site", status: "pass", detail: `${siteUrl} answers.` }
      : f.site.status.kind === "disabled"
        ? {
            id: "site",
            title: "Live site",
            status: "block",
            detail: `${siteUrl} answers ${f.site.status.httpStatus}: Vercel has disabled the deployment, so every visitor sees an error page.`,
            fix: "Open the Vercel dashboard (Usage and Settings > Billing). This usually means the account went over its plan's limits; the Hobby plan is for non-commercial projects only, and a shop needs Pro. New pushes don't deploy until it is resolved.",
          }
        : f.site.status.kind === "error"
          ? {
              id: "site",
              title: "Live site",
              status: "block",
              detail: `${siteUrl} answers ${f.site.status.httpStatus}.`,
              fix: "Check the latest deployment's logs in Vercel.",
            }
          : f.site.status.kind === "unreachable"
            ? {
                id: "site",
                title: "Live site",
                status: "warn",
                detail: `${siteUrl} could not be reached (${f.site.status.detail}).`,
                fix: "Check the domain's DNS records in Vercel > Settings > Domains.",
              }
            : { id: "site", title: "Live site", status: "info", detail: "Not checked." };

  const vercel: Check[] = [
    check(
      "vercel-link",
      "Vercel project",
      f.vercel.linked,
      "warn",
      [
        `Linked to “${f.vercel.projectName}”. Pushing to the main branch deploys it.`,
        "This folder isn't linked to a Vercel project.",
      ],
      "Run `vercel link` once in this folder (back up .env.local first)."
    ),
    siteCheck,
    check(
      "https",
      "HTTPS",
      f.site.https && (f.site.status.kind !== "ok" || f.site.hsts),
      "warn",
      ["Served over HTTPS with HSTS.", "The address isn't https://, or HSTS isn't sent."],
      "Use the https:// address in Store settings; Vercel issues the certificate."
    ),
  ];

  const stripe: Check[] = [
    check(
      "stripe-secret",
      "Secret key",
      secret.present,
      "block",
      [
        `Set (${secret.mode ?? "unknown"} mode, from ${secret.source === "settings" ? "Payments settings" : "the environment"}). The value is never shown here.`,
        "Card payments can't start without it.",
      ],
      "Add it in Payments settings, or as STRIPE_SECRET_KEY in Vercel > Settings > Environment Variables.",
      "/admin/settings/payments"
    ),
    check(
      "stripe-publishable",
      "Publishable key",
      publishable.present,
      "warn",
      [
        `Set (${publishable.mode ?? "unknown"} mode).`,
        "Express checkout (Apple Pay, Google Pay) stays hidden.",
      ],
      "Add it in Payments settings.",
      "/admin/settings/payments"
    ),
    check(
      "stripe-match",
      "Keys from the same mode",
      stripeModesMatch,
      "block",
      [
        "Both keys are in the same mode.",
        "One key is test and the other live: payments will fail.",
      ],
      "Use a test pair or a live pair, never one of each.",
      "/admin/settings/payments"
    ),
    check(
      "stripe-webhook",
      "Webhook signing secret",
      f.stripe.webhook,
      "block",
      [
        "Set: payment events are verified before an order is marked paid.",
        "Without it, paid orders stay pending (the webhook is refused).",
      ],
      "In Stripe > Developers > Webhooks, add https://<your domain>/api/webhooks/stripe and copy its signing secret to Payments settings.",
      "/admin/settings/payments"
    ),
    {
      id: "stripe-test",
      title: "Test checkout",
      status: f.stripe.succeededPayments > 0 ? "pass" : "warn",
      detail:
        f.stripe.succeededPayments > 0
          ? `${f.stripe.succeededPayments} card payments completed and recorded.`
          : "No card payment has completed yet.",
      ...(f.stripe.succeededPayments > 0
        ? {}
        : {
            fix: "With test keys, buy something on the site with card 4242 4242 4242 4242 and check the order turns paid.",
          }),
    },
    {
      id: "stripe-live",
      title: "Live payments",
      status: secret.mode === "live" ? "pass" : "info",
      detail:
        secret.mode === "live"
          ? "Live keys are in use: real cards are charged."
          : "Test mode: no real money moves. Switching to live keys is a decision only you should make.",
    },
  ];

  const security: Check[] = [
    check(
      "next-version",
      "Framework security fixes",
      versionAtLeast(f.nextVersion, MIN_SAFE_NEXT),
      "block",
      [`Next.js ${f.nextVersion}.`, `Next.js ${f.nextVersion} has published vulnerabilities.`],
      `Upgrade to ${MIN_SAFE_NEXT} or later.`
    ),
    check(
      "admin-mfa",
      "Two-factor sign-in for staff",
      f.admins.withoutMfa === 0,
      "warn",
      [
        `All ${f.admins.total} staff accounts use it.`,
        `${f.admins.withoutMfa} of ${f.admins.total} staff accounts don't.`,
      ],
      "Ask them to turn it on under Account > Security.",
      "/admin/team"
    ),
    check(
      "auth-secret",
      "Session signing secret",
      f.env.authSecretStrong,
      "block",
      [
        "AUTH_SECRET is set and long enough.",
        "AUTH_SECRET is missing or shorter than 32 characters.",
      ],
      "Generate one (openssl rand -base64 32) and add it in Vercel > Environment Variables."
    ),
    check(
      "cron",
      "Scheduled jobs protected",
      f.env.cronSecret,
      "warn",
      ["CRON_SECRET is set.", "CRON_SECRET is missing: anyone could trigger the order-expiry job."],
      "Add CRON_SECRET in Vercel > Environment Variables."
    ),
    check(
      "rate-limit",
      "Rate limiting",
      f.env.rateLimit,
      "warn",
      ["Shared limits (Upstash) are configured.", "Limits only count per server instance."],
      "Connect Upstash Redis in Integrations.",
      "/admin/settings/integrations"
    ),
    check(
      "captcha",
      "Bot protection on checkout",
      f.env.turnstile,
      "warn",
      ["Turnstile is configured.", "Checkout and forms have no captcha."],
      "Add the Turnstile keys in Integrations.",
      "/admin/settings/integrations"
    ),
    check(
      "database-tls",
      "Encrypted database connection",
      f.env.databaseTls,
      "block",
      ["The database connection requires TLS.", "The database connection doesn't require TLS."],
      "Use the provider's connection string with sslmode=require."
    ),
    {
      id: "backups",
      title: "Backups",
      status: "info",
      detail:
        "Neon keeps point-in-time history of the database (how far back depends on the plan). Photos and uploads are in the repository and Vercel Blob.",
    },
    {
      id: "env-note",
      title: "Where these were checked",
      status: "info",
      detail:
        "Environment values are read from this computer's environment (.env.local, pulled from Vercel). Production uses the values stored in Vercel.",
    },
  ];

  const seo: Check[] = [
    {
      id: "sitemap",
      title: "Sitemap and robots",
      status: "pass",
      detail: "/sitemap.xml and /robots.txt are generated from the catalog.",
    },
    check(
      "meta",
      "Search description",
      f.seo.metaDescription,
      "warn",
      ["Set.", "Search engines will pick their own snippet."],
      "Write one in Store settings.",
      "/admin/settings"
    ),
    check(
      "og",
      "Link preview picture",
      f.seo.ogImage,
      "warn",
      ["Set.", "Shared links show no picture."],
      "Choose one in Store settings.",
      "/admin/settings"
    ),
    check(
      "verification",
      "Google Search Console",
      f.seo.siteVerification,
      "warn",
      ["Verified.", "Not connected: you can't see how Google indexes the shop."],
      "Paste the verification code in SEO & Indexing.",
      "/admin/seo"
    ),
    check(
      "images",
      "Photos optimized",
      f.seo.unconvertedImages === 0,
      "warn",
      ["Every bundled photo is WebP.", `${f.seo.unconvertedImages} photos are still JPG/PNG.`],
      "Run `npm run images:webp`; the build also converts them."
    ),
    {
      id: "structured-data",
      title: "Structured data",
      status: "pass",
      detail: "Products, the organization and articles carry schema.org data.",
    },
  ];

  const blocking = [...store, ...vercel, ...stripe, ...security, ...seo].filter(
    (c) => c.status === "block"
  );
  const publish: Check[] = [
    {
      id: "blocking",
      title: "Ready to sell",
      status: blocking.length ? "block" : "pass",
      detail: blocking.length
        ? `${blocking.length} ${blocking.length === 1 ? "problem stops" : "problems stop"} the launch: ${blocking.map((c) => c.title).join(", ")}.`
        : "Nothing blocks the launch.",
    },
    {
      id: "content",
      title: "Design changes",
      status: f.content.drafts > 0 ? "warn" : "pass",
      detail:
        f.content.drafts > 0
          ? `${f.content.drafts} ${f.content.drafts === 1 ? "section has" : "sections have"} a draft that isn't on the site yet.`
          : "Every section's design is published.",
      ...(f.content.drafts > 0
        ? {
            fix: "Open each section marked Draft and publish it.",
            href: "/admin/settings/page-layout",
          }
        : {}),
    },
    {
      id: "code",
      title: "Code changes",
      status: !f.git.available
        ? "info"
        : f.git.uncommitted > 0 || (f.git.unpushed ?? 0) > 0
          ? "warn"
          : "pass",
      detail: !f.git.available
        ? "Git isn't available here."
        : `On ${f.git.branch}${f.git.lastCommit ? `, last commit ${f.git.lastCommit}` : ""}. ${f.git.uncommitted} changed ${f.git.uncommitted === 1 ? "file" : "files"} not committed${f.git.unpushed ? `, ${f.git.unpushed} ${f.git.unpushed === 1 ? "commit" : "commits"} not pushed` : ""}.`,
      ...(f.git.available && (f.git.uncommitted > 0 || (f.git.unpushed ?? 0) > 0)
        ? {
            fix: "Commit everything (git add -A, then git commit) and git push to main. Vercel builds it, applies database migrations, and publishes it.",
          }
        : {}),
    },
  ];

  return [
    {
      id: "store",
      title: "Store",
      summary: "What customers and the law need to see.",
      checks: store,
    },
    {
      id: "domain",
      title: "Domain and Vercel",
      summary: "Where the shop lives and how it is published.",
      checks: vercel,
    },
    {
      id: "stripe",
      title: "Payments",
      summary: "Stripe keys and the webhook that confirms payments.",
      checks: stripe,
    },
    {
      id: "security",
      title: "Security",
      summary: "Sign-in, secrets and protections.",
      checks: security,
    },
    {
      id: "seo",
      title: "Search and speed",
      summary: "How the shop shows up and loads.",
      checks: seo,
    },
    {
      id: "publish",
      title: "Publish",
      summary: "Design changes and code changes go live separately.",
      checks: publish,
    },
  ];
}

/** The worst status in a step: block, then warn, then pass. */
export function stepStatus(step: ReadinessStep): Exclude<CheckStatus, "info"> {
  if (step.checks.some((c) => c.status === "block")) return "block";
  if (step.checks.some((c) => c.status === "warn")) return "warn";
  return "pass";
}
