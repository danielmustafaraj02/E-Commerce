/**
 * Sets the storefront's social media links (rendered in the footer — see
 * src/components/footer.tsx). No secrets involved — safe to commit/re-run.
 *
 * Usage:
 *   npx tsx scripts/set-social-links.ts
 */
import { db } from "../src/lib/db";
import { getStoreSettings } from "../src/lib/store-settings";

const LINKS = {
  facebookUrl: "https://www.facebook.com/venetianmuranoglass",
  instagramUrl: "https://www.instagram.com/venetianmuranoglass/",
  tiktokUrl: "https://www.tiktok.com/@venetian.murano.g",
  youtubeUrl: "https://www.youtube.com/@venetianmuranoglass",
  linkedinUrl: "https://www.linkedin.com/company/venetian-murano-glass",
};

async function main() {
  const before = await getStoreSettings();
  await db.storeSettings.upsert({
    where: { id: before.id },
    update: LINKS,
    create: { id: before.id, ...LINKS },
  });

  console.log("✅ Social links set:");
  for (const [key, url] of Object.entries(LINKS)) console.log(`   ${key}: ${url}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
