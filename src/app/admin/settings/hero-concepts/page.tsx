import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { getStoreSettings, headerLogoSrc } from "@/lib/store-settings";
import { CUTOUTS, HERO_CONCEPTS_DRAFT_KEY, parseHeroConcepts } from "@/lib/hero-concepts/config";
import { heroCopy } from "@/lib/hero-concepts/copy";
import { getLiveHeroConcept } from "@/lib/hero-concepts/live";
import { heroProducts } from "@/lib/hero-concepts/products";
import type { HeroConceptsDraft } from "./actions";
import { HeroConceptsWorkbench } from "./workbench";

// Admin > Settings > Hero concepts: three alternative home-page heroes, side
// by side on a computer and a phone, with their settings. Private (admin
// only). Settings are a draft until "Use as live hero" publishes one design.
export default async function HeroConceptsPage() {
  await requireAdmin();
  const [settings, row, products, live] = await Promise.all([
    getStoreSettings(),
    db.pageLayout
      .findUnique({ where: { target: HERO_CONCEPTS_DRAFT_KEY }, select: { layout: true } })
      .catch(() => null),
    db.product.findMany({
      where: { slug: { in: CUTOUTS.map((cutout) => cutout.slug) } },
      select: { slug: true, name: true },
    }),
    getLiveHeroConcept(),
  ]);
  const draft = row?.layout as HeroConceptsDraft | null | undefined;
  // Cards for every cut-out, so any piece chosen in the preview has one.
  const slugs = CUTOUTS.map((cutout) => cutout.slug);
  const [productsEn, productsIt] = await Promise.all([
    heroProducts(slugs, "en", settings.defaultLocale),
    heroProducts(slugs, "it", settings.defaultLocale),
  ]);
  const names = Object.fromEntries(products.map((product) => [product.slug, product.name]));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Hero concepts</h1>
      <p className="mb-6 max-w-3xl text-sm text-neutral-600">
        Three alternative designs for the top of the home page, using the current hero&apos;s blue,
        type, wording and button. Compare them on a computer and a phone, adjust each one, and
        save your settings and favourite as a draft. &ldquo;Use as live hero&rdquo; puts the chosen
        design on the home page; &ldquo;Restore the original hero&rdquo; brings the current one back.
      </p>
      <HeroConceptsWorkbench
        initial={parseHeroConcepts(draft?.config)}
        savedAt={typeof draft?.at === "string" ? draft.at : null}
        copy={{
          en: heroCopy("en", settings.storeName, settings.homeCopy),
          it: heroCopy("it", settings.storeName, settings.homeCopy),
        }}
        names={names}
        logoSrc={headerLogoSrc(settings.logoUrl)}
        live={live ? { concept: live.concept, at: live.at } : null}
        products={{ en: productsEn, it: productsIt }}
      />
    </div>
  );
}
