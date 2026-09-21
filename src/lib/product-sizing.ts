import { googleProductCategory } from "@/lib/merchant-feed";

// Typical sizing per category, shown on the product page as a general guide
// (not a per-SKU measurement — individual hand-blown pieces vary slightly,
// see the "no two pieces are ever the same" note elsewhere on the site).
// Reuses googleProductCategory's Italian/English name matching rather than
// duplicating it.
export type SizeDictKey = "sizeBracelet" | "sizeNecklace" | "sizeEarrings";

export function productSizeDictKey(
  category: { name: string; nameEn?: string | null } | null
): SizeDictKey | null {
  switch (googleProductCategory(category)) {
    case "Apparel & Accessories > Jewelry > Bracelets":
      return "sizeBracelet";
    case "Apparel & Accessories > Jewelry > Necklaces":
      return "sizeNecklace";
    case "Apparel & Accessories > Jewelry > Earrings":
      return "sizeEarrings";
    default:
      return null;
  }
}
