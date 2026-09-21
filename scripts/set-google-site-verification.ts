/**
 * Sets StoreSettings.googleSiteVerification, which src/app/layout.tsx
 * already renders as <meta name="google-site-verification" content="...">
 * on every page — used for Google Search Console / Merchant Center domain
 * verification. No secret involved — safe to commit/re-run.
 *
 * Usage:
 *   npx tsx scripts/set-google-site-verification.ts <token>
 *
 * <token> is just the content value, not the full <meta> tag — e.g. from
 *   <meta name="google-site-verification" content="abc123..." />
 * pass only "abc123...".
 */
import { db } from "../src/lib/db";
import { getStoreSettings } from "../src/lib/store-settings";

async function main() {
  const token = process.argv[2];
  if (!token) {
    console.error("Usage: npx tsx scripts/set-google-site-verification.ts <token>");
    process.exit(1);
  }
  if (token.includes("<") || token.includes("meta")) {
    console.error(
      '❌ That looks like a full <meta> tag, not just the token. Pass only the content="..." value.'
    );
    process.exit(1);
  }

  const before = await getStoreSettings();
  await db.storeSettings.upsert({
    where: { id: before.id },
    update: { googleSiteVerification: token },
    create: { id: before.id, googleSiteVerification: token },
  });

  console.log("✅ googleSiteVerification set. It'll appear in the <head> on the next page load.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
