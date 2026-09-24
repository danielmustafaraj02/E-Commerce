import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hreflangAlternates } from "@/lib/hreflang";
import { localizedName, productImageAlt } from "@/lib/product-i18n";
import { getLooksForProducts } from "@/lib/look-data";
import { deriveProductType } from "@/lib/gift-finder";
import { homeFontClasses } from "@/app/home-fonts";
import { GiftFinderFlow, type GiftFinderCandidate } from "./gift-finder-flow";
import "../home.css";
import "../shop.css";
import "./gift-finder.css";

// The Gift Finder stylist flow — see src/lib/gift-finder.ts for the scoring
// this page's candidate list feeds into (all scoring runs client-side; this
// page's only job is to load the real, currently-available catalog once).
export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale).giftFinder;
  const canonical = "/gift-finder";
  const image = ogImage(settings);

  return {
    title: dict.metaTitle,
    description: dict.metaDescription,
    alternates: { canonical, languages: hreflangAlternates(canonical) },
    openGraph: {
      title: dict.metaTitle,
      description: dict.metaDescription,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function GiftFinderPage() {
  const uiLocale = await getLocale();
  const dict = getDictionary(uiLocale);

  const products = await db.product.findMany({
    where: { active: true },
    select: {
      id: true,
      slug: true,
      name: true,
      nameEn: true,
      nameFr: true,
      nameDe: true,
      nameAr: true,
      nameZh: true,
      nameRu: true,
      nameEs: true,
      namePt: true,
      nameHi: true,
      nameJa: true,
      price: true,
      currency: true,
      active: true,
      trackInventory: true,
      stockQty: true,
      giftStyles: true,
      giftOccasions: true,
      giftRecipients: true,
      lookId: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { name: true, nameEn: true, slug: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Only the looks these products actually belong to — getLooksForProducts
  // already computes `available` (every piece active + in stock), which is
  // exactly "the piece's look is complete" for the Preference step's
  // completeSet scoring (lib/gift-finder.ts).
  const lookProductIds = products.filter((p) => p.lookId).map((p) => p.id);
  const looks = lookProductIds.length > 0 ? await getLooksForProducts(lookProductIds, uiLocale) : [];
  const lookCompleteByProductId = new Map<string, boolean>();
  for (const look of looks) {
    for (const piece of look.pieces) lookCompleteByProductId.set(piece.productId, look.available);
  }

  const candidates: GiftFinderCandidate[] = products.map((product) => {
    const name = localizedName(product, uiLocale);
    return {
      id: product.id,
      slug: product.slug,
      name,
      price: product.price,
      currency: product.currency,
      imageUrl: product.images[0]?.url ?? null,
      imageAlt: productImageAlt(name, uiLocale),
      active: product.active,
      trackInventory: product.trackInventory,
      stockQty: product.stockQty,
      giftStyles: product.giftStyles,
      giftOccasions: product.giftOccasions,
      giftRecipients: product.giftRecipients,
      productType: deriveProductType(product.category),
      lookId: product.lookId,
      lookComplete: product.lookId ? (lookCompleteByProductId.get(product.id) ?? false) : false,
    };
  });

  return (
    <main className={`shelf flex flex-1 flex-col ${homeFontClasses}`}>
      <GiftFinderFlow
        candidates={candidates}
        looks={looks}
        dict={dict.giftFinder}
        lookDict={dict.look}
        locale={uiLocale}
        outOfStockLabel={dict.product.outOfStock}
      />
    </main>
  );
}
