// Pure scoring for the Gift Finder stylist flow (/gift-finder). No DB, no
// i18n — the server page (src/app/gift-finder/page.tsx) loads candidate
// products (already shaped into GiftCandidateProduct) and calls
// scoreGiftCandidates; the client flow renders the "why it matches" copy by
// mapping the returned `matched` criteria through the dictionary via
// buildWhyItMatches. Kept dependency-free, same philosophy as lib/looks.ts.

export const GIFT_STYLES = ["elegant", "colorful", "minimal", "romantic", "bold"] as const;
export type GiftStyle = (typeof GIFT_STYLES)[number];

export const GIFT_OCCASIONS = [
  "birthday",
  "anniversary",
  "christmas",
  "valentines",
  "thankyou",
  "justbecause",
] as const;
export type GiftOccasion = (typeof GIFT_OCCASIONS)[number];

export const GIFT_RECIPIENTS = ["partner", "mother", "friend", "daughter", "myself"] as const;
export type GiftRecipient = (typeof GIFT_RECIPIENTS)[number];

// Cent boundaries: <€50, €50–100, €100–150, €150+.
export const GIFT_BUDGETS = ["under50", "50to100", "100to150", "over150"] as const;
export type GiftBudget = (typeof GIFT_BUDGETS)[number];

export const PRODUCT_TYPES = ["necklace", "bracelet", "earrings"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

// The 5th step's answer: a specific piece type, or one of the two catch-alls
// that score every product type the same on the type criterion (see
// typeScore below).
export type FinderPreference = ProductType | "notSure" | "completeSet";

export type GiftFinderAnswers = {
  // Collected in step 1 for copy personalization only — deliberately not
  // scored (the weights below already sum to 100 without it).
  recipient: GiftRecipient | null;
  occasion: GiftOccasion;
  style: GiftStyle;
  budget: GiftBudget;
  preference: FinderPreference;
};

export type GiftCandidateProduct = {
  id: string;
  slug: string;
  name: string;
  price: number; // cents
  currency: string;
  imageUrl: string | null;
  active: boolean;
  trackInventory: boolean;
  stockQty: number;
  giftStyles: string[];
  giftOccasions: string[];
  giftRecipients: string[];
  // Derived from the product's category with deriveProductType below — there
  // is no productType column (CLAUDE.md: "derive productType from category
  // slug/name, don't add a type column").
  productType: ProductType | null;
  lookId: string | null;
  // Whether every piece of this product's look (see lib/looks.ts) is active
  // and in stock — precomputed by the caller, which already has to fetch
  // Look data for the "Complete the look" step.
  lookComplete: boolean;
};

export type MatchCriterion = "style" | "occasion" | "budget" | "type";

export type GiftFinderMatch = {
  product: GiftCandidateProduct;
  score: number; // 0-100
  matched: MatchCriterion[];
};

const WEIGHTS: Record<MatchCriterion, number> = { style: 40, occasion: 20, budget: 20, type: 20 };

const MAX_RESULTS = 3;

// Same exclusion rule as look-data.ts's `available`: a dropshipped item
// (trackInventory: false) is never excluded for stock, since the supplier's
// real availability isn't tracked here — staff zero out stockQty by hand to
// pull it instead.
export function isProductAvailable(
  product: Pick<GiftCandidateProduct, "active" | "trackInventory" | "stockQty">
): boolean {
  if (!product.active) return false;
  if (product.trackInventory && product.stockQty <= 0) return false;
  return true;
}

export function priceInBudget(price: number, budget: GiftBudget): boolean {
  switch (budget) {
    case "under50":
      return price < 5000;
    case "50to100":
      return price >= 5000 && price < 10000;
    case "100to150":
      return price >= 10000 && price < 15000;
    case "over150":
      return price >= 15000;
  }
}

// "Not sure" gives full marks to every piece type, since the shopper has no
// preference. "Complete set" also doesn't discriminate by piece type, but
// only pays out when the piece's look is actually buyable as a set — that's
// the "favour products whose look is complete" rule.
function typeScore(product: GiftCandidateProduct, preference: FinderPreference): number {
  if (preference === "notSure") return WEIGHTS.type;
  if (preference === "completeSet") return product.lookComplete ? WEIGHTS.type : 0;
  return product.productType === preference ? WEIGHTS.type : 0;
}

// Scores every available candidate against the shopper's answers and returns
// the top 3 (or fewer), highest score first. Ties break alphabetically by
// name for a stable, testable order.
export function scoreGiftCandidates(
  candidates: GiftCandidateProduct[],
  answers: GiftFinderAnswers,
  maxResults = MAX_RESULTS
): GiftFinderMatch[] {
  return candidates
    .filter(isProductAvailable)
    .map((product) => {
      const matched: MatchCriterion[] = [];
      let score = 0;

      if (product.giftStyles.includes(answers.style)) {
        score += WEIGHTS.style;
        matched.push("style");
      }
      if (product.giftOccasions.includes(answers.occasion)) {
        score += WEIGHTS.occasion;
        matched.push("occasion");
      }
      if (priceInBudget(product.price, answers.budget)) {
        score += WEIGHTS.budget;
        matched.push("budget");
      }
      if (typeScore(product, answers.preference) > 0) {
        score += WEIGHTS.type;
        matched.push("type");
      }

      return { product, score, matched };
    })
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, maxResults);
}

// Category name/slug -> piece type, Italian (source language) and English,
// same pattern as googleProductCategory in lib/merchant-feed.ts. A category
// this store hasn't added yet just yields no type (no criterion scored)
// instead of a wrong guess.
const PRODUCT_TYPE_NAMES: { names: string[]; type: ProductType }[] = [
  { names: ["bracciali", "bracelet", "bracelets"], type: "bracelet" },
  { names: ["collane", "necklace", "necklaces"], type: "necklace" },
  { names: ["orecchini", "earring", "earrings"], type: "earrings" },
];

export function deriveProductType(
  category: { name?: string | null; nameEn?: string | null; slug?: string | null } | null
): ProductType | null {
  if (!category) return null;
  const candidates = [category.name, category.nameEn, category.slug]
    .filter((v): v is string => Boolean(v))
    .map((v) => v.trim().toLowerCase());
  for (const entry of PRODUCT_TYPE_NAMES) {
    if (entry.names.some((name) => candidates.some((c) => c === name || c.includes(name)))) {
      return entry.type;
    }
  }
  return null;
}

// Fixed priority (highest-weighted criterion first), capped so the shown
// reason stays a short phrase rather than a list of every match.
const REASON_ORDER: MatchCriterion[] = ["style", "occasion", "type", "budget"];

export function buildWhyItMatches(
  matched: MatchCriterion[],
  reasons: Record<MatchCriterion, string>,
  fallback: string,
  max = 2
): string {
  if (matched.length === 0) return fallback;
  return REASON_ORDER.filter((c) => matched.includes(c))
    .slice(0, max)
    .map((c) => reasons[c])
    .join(" · ");
}
