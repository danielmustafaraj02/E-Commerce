/**
 * Sets StoreSettings.logoUrl to /logo.png (the file in /public), so the
 * header actually renders it — it's currently null, so no logo shows at
 * all regardless of what's in /public/logo.png (see src/components/header.tsx).
 *
 * No secret involved — safe to commit/re-run.
 *
 * Usage:
 *   npx tsx scripts/set-logo.ts
 */
import { db } from "../src/lib/db";
import { getStoreSettings } from "../src/lib/store-settings";

async function main() {
  const before = await getStoreSettings();
  console.log(`Current logoUrl: ${before.logoUrl ?? "(not set)"}`);

  await db.storeSettings.upsert({
    where: { id: before.id },
    update: { logoUrl: "/logo.png" },
    create: { id: before.id, logoUrl: "/logo.png" },
  });

  console.log("✅ logoUrl set to /logo.png");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
