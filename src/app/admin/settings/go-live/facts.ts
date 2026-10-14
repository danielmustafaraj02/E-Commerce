import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { isPlaceholderCompany } from "@/lib/json-ld";
import { PHOTO_DIRS } from "@/lib/public-image";
import { DRAFT_KEY_PREFIX } from "@/lib/section-drafts";
import { stripeKeyMode, type KeyInfo, type ReadinessFacts, type SiteStatus } from "@/lib/go-live";

const run = promisify(execFile);

/** A key's presence, mode and origin: never the key itself. */
function keyInfo(fromSettings: string | null | undefined, fromEnv: string | undefined): KeyInfo {
  const key = fromSettings || fromEnv || null;
  return {
    present: !!key,
    mode: stripeKeyMode(key),
    source: fromSettings ? "settings" : fromEnv ? "environment" : null,
  };
}

/** The live site, as a visitor gets it. Fixed address from settings, admin only. */
async function siteStatus(url: string | null): Promise<{ status: SiteStatus; hsts: boolean }> {
  if (!url) return { status: { kind: "unknown" }, hsts: false };
  try {
    const res = await fetch(url, {
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const hsts = !!res.headers.get("strict-transport-security");
    if (res.status === 402 || res.headers.get("x-vercel-error") === "DEPLOYMENT_DISABLED")
      return { status: { kind: "disabled", httpStatus: res.status }, hsts };
    if (res.status >= 400) return { status: { kind: "error", httpStatus: res.status }, hsts };
    return { status: { kind: "ok", httpStatus: res.status }, hsts };
  } catch (error) {
    const detail = error instanceof Error ? error.name : "network error";
    return { status: { kind: "unreachable", detail }, hsts: false };
  }
}

async function gitFacts(): Promise<ReadinessFacts["git"]> {
  const git = (...args: string[]) =>
    run("git", args, { cwd: process.cwd(), timeout: 4000 }).then((r) => r.stdout.trim());
  try {
    const [branch, status, lastCommit] = await Promise.all([
      git("rev-parse", "--abbrev-ref", "HEAD"),
      git("status", "--porcelain"),
      git("log", "-1", "--format=%h “%s”, %cr"),
    ]);
    const unpushed = await git("rev-list", "--count", "@{u}..HEAD")
      .then(Number)
      .catch(() => null);
    return {
      available: true,
      branch,
      uncommitted: status ? status.split("\n").length : 0,
      unpushed,
      lastCommit,
    };
  } catch {
    return { available: false, branch: null, uncommitted: 0, unpushed: null, lastCommit: null };
  }
}

/** Bundled photos still waiting to be converted (scripts/optimize-images.mjs). */
async function unconvertedPhotos(): Promise<number> {
  const walk = async (dir: string): Promise<string[]> => {
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    const nested = await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]
      )
    );
    return nested.flat();
  };
  const files = (
    await Promise.all(PHOTO_DIRS.map((dir) => walk(path.join(process.cwd(), "public", dir))))
  ).flat();
  return files.filter(
    (file) => /\.(jpe?g|png)$/i.test(file) && !existsSync(file.replace(/\.[^.]+$/, ".webp"))
  ).length;
}

async function vercelFacts(): Promise<ReadinessFacts["vercel"]> {
  try {
    const project = JSON.parse(
      await readFile(path.join(process.cwd(), ".vercel/project.json"), "utf8")
    ) as { projectName?: string };
    return { linked: true, projectName: project.projectName ?? null };
  } catch {
    return { linked: false, projectName: null };
  }
}

async function nextVersion(): Promise<string> {
  try {
    const pkg = JSON.parse(
      await readFile(path.join(process.cwd(), "node_modules/next/package.json"), "utf8")
    ) as { version: string };
    return pkg.version;
  } catch {
    return "0.0.0";
  }
}

/** Everything the Go-live checks look at, gathered on the server. */
export async function gatherReadinessFacts(): Promise<ReadinessFacts> {
  const settings = await getStoreSettings();
  const env = process.env;
  const [
    zones,
    taxRules,
    legal,
    listed,
    withImages,
    inStock,
    succeededPayments,
    staff,
    staffWithoutMfa,
    drafts,
    site,
    git,
    vercel,
    unconverted,
    version,
  ] = await Promise.all([
    db.shippingZone.findMany({ select: { methods: { select: { method: { select: { active: true } } } } } }),
    db.taxRule.count(),
    db.legalPage.findMany({ select: { slug: true } }),
    db.product.count({ where: { active: true, unlisted: false } }),
    db.product.count({ where: { active: true, unlisted: false, images: { some: {} } } }),
    db.product.count({
      where: { active: true, unlisted: false, OR: [{ trackInventory: false }, { stockQty: { gt: 0 } }] },
    }),
    db.payment.count({ where: { provider: "stripe", status: "succeeded" } }),
    db.user.count({ where: { role: { in: ["admin", "staff"] } } }),
    db.user.count({ where: { role: { in: ["admin", "staff"] }, mfaEnabled: false } }),
    db.pageLayout.count({ where: { target: { startsWith: DRAFT_KEY_PREFIX } } }).catch(() => 0),
    siteStatus(settings.siteUrl ?? null),
    gitFacts(),
    vercelFacts(),
    unconvertedPhotos(),
    nextVersion(),
  ]);

  const databaseUrl = env.DATABASE_URL ?? "";
  return {
    store: {
      name: settings.storeName,
      placeholderName: isPlaceholderCompany(settings.storeName),
      contactEmail: settings.contactEmail,
      currency: settings.defaultCurrency,
      companyLegalName: !!settings.companyLegalName?.trim(),
      companyAddress: !!settings.companyAddress?.trim(),
    },
    shipping: {
      zones: zones.length,
      zonesWithActiveMethod: zones.filter((zone) => zone.methods.some((link) => link.method.active))
        .length,
    },
    taxRules,
    legalSlugs: legal.map((page) => page.slug),
    products: { listed, withImages, inStock },
    site: {
      url: settings.siteUrl ?? null,
      status: site.status,
      https: !!settings.siteUrl?.startsWith("https://"),
      hsts: site.hsts,
    },
    vercel,
    git,
    stripe: {
      secret: keyInfo(settings.stripeSecretKey, env.STRIPE_SECRET_KEY),
      publishable: keyInfo(settings.stripePublishableKey, env.STRIPE_PUBLISHABLE_KEY),
      webhook: !!(settings.stripeWebhookSecret || env.STRIPE_WEBHOOK_SECRET),
      succeededPayments,
    },
    paypal: {
      configured: !!(
        (settings.paypalClientId || env.PAYPAL_CLIENT_ID) &&
        (settings.paypalClientSecret || env.PAYPAL_CLIENT_SECRET)
      ),
    },
    env: {
      authSecretStrong: (env.AUTH_SECRET ?? "").length >= 32,
      cronSecret: !!env.CRON_SECRET,
      rateLimit: !!(
        (settings.upstashRedisUrl && settings.upstashRedisToken) ||
        env.UPSTASH_REDIS_REST_URL ||
        env.KV_REST_API_URL
      ),
      turnstile: !!(settings.turnstileSecretKey || env.TURNSTILE_SECRET_KEY),
      email: !!(settings.resendApiKey || env.RESEND_API_KEY),
      // Neon only accepts encrypted connections.
      databaseTls:
        /sslmode=(require|verify-ca|verify-full)/.test(databaseUrl) ||
        /\.neon\.tech[:/]/.test(databaseUrl),
    },
    admins: { total: staff, withoutMfa: staffWithoutMfa },
    seo: {
      metaDescription: !!settings.metaDescription?.trim(),
      ogImage: !!(settings.ogImageUrl || settings.logoUrl),
      siteVerification: !!settings.googleSiteVerification?.trim(),
      unconvertedImages: unconverted,
    },
    content: { drafts },
    nextVersion: version,
  };
}
