/**
 * Sets StoreSettings.siteUrl — the actual fix for broken image/link URLs in
 * emails (and canonicals, sitemap, JSON-LD, the Google Merchant feed, etc.),
 * all of which build absolute URLs from this field first, falling back to
 * NEXTAUTH_URL, then localhost (see src/lib/site-url.ts). An empty siteUrl
 * in production silently produces localhost URLs nothing outside your own
 * machine can reach.
 *
 * No secret involved — safe to commit/re-run.
 *
 * Usage:
 *   npx tsx scripts/set-site-url.ts https://perlamuranoglass.com
 */
import { db } from "../src/lib/db";
import { getStoreSettings } from "../src/lib/store-settings";

async function main() {
  const url = process.argv[2];
  if (!url || !/^https:\/\/.+/.test(url)) {
    console.error("Usage: npx tsx scripts/set-site-url.ts https://your-domain.com");
    process.exit(1);
  }
  const normalized = url.replace(/\/+$/, "");

  const before = await getStoreSettings();
  console.log(`Current siteUrl: ${before.siteUrl ?? "(not set)"}`);

  await db.storeSettings.upsert({
    where: { id: before.id },
    update: { siteUrl: normalized },
    create: { id: before.id, siteUrl: normalized },
  });

  console.log(`✅ siteUrl set to ${normalized}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
