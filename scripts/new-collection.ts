import { z } from "zod";
import { isProductColorKey } from "../src/lib/product-colors";
import { deriveProductType, type ProductType } from "../src/lib/gift-finder";

/** Copy an actual existing price for each category; ties use the lower price. */
export function pricesLikeExisting(
  products: {
    price: number;
    category: { name?: string | null; nameEn?: string | null; slug?: string | null } | null;
  }[]
): Record<ProductType, number> {
  const result = {} as Record<ProductType, number>;
  for (const kind of ["necklace", "bracelet", "earrings"] as const) {
    const counts = new Map<number, number>();
    for (const product of products) {
      if (
        deriveProductType(product.category) === kind &&
        Number.isSafeInteger(product.price) &&
        product.price > 0
      ) {
        counts.set(product.price, (counts.get(product.price) ?? 0) + 1);
      }
    }
    const price = [...counts].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];
    if (!price) throw new Error(`No existing ${kind} price to copy.`);
    result[kind] = price;
  }
  return result;
}

const productSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sku: z.string().regex(/^PMG-OCT26-\d{3}$/),
  kind: z.enum(["necklace", "bracelet", "earrings"]),
  categorySlug: z.string().min(1),
  color: z.string().refine(isProductColorKey),
  description: z.string().min(1),
  descriptionEn: z.string().min(1),
  story: z.string().min(1),
  storyEn: z.string().min(1),
  price: z.number().int().positive().nullable(),
  stockQty: z.number().int().nonnegative().nullable(),
  currency: z.literal("EUR"),
  lookKey: z.string().nullable(),
  images: z
    .array(
      z.object({
        source: z.string().regex(/^new\/[^/]+\.jpeg$/),
        url: z.string().regex(/^\/products\/new-2026-10\/[a-z0-9-]+\.jpg$/),
        altText: z.string().min(1),
        position: z.number().int().nonnegative(),
        isLifestyle: z.literal(false),
      })
    )
    .min(1),
});
const collectionSchema = z.object({
  id: z.literal("new-2026-10"),
  name: z.string().min(1),
  nameEn: z.string().min(1),
  sourceFolder: z.literal("new"),
  currency: z.literal("EUR"),
  status: z.literal("draft"),
  products: z.array(productSchema).min(1),
  looks: z.array(
    z.object({
      id: z.string().regex(/^look-oct26-[a-z0-9-]+$/),
      name: z.string().min(1),
      productSlugs: z.array(z.string()).length(3),
      discountPercent: z.number().int().min(0).max(100),
    })
  ),
});
export type NewCollection = z.infer<typeof collectionSchema>;
export type NewCollectionProduct = NewCollection["products"][number];

export function validateCollection(value: unknown, publish = false): NewCollection {
  const collection = collectionSchema.parse(value);
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}.`);
  };
  unique(
    collection.products.map((p) => p.slug),
    "product slug"
  );
  unique(
    collection.products.map((p) => p.sku),
    "SKU"
  );
  unique(
    collection.products.flatMap((p) => p.images.map((i) => i.source)),
    "source image"
  );
  unique(
    collection.products.flatMap((p) => p.images.map((i) => i.url)),
    "image URL"
  );
  unique(
    collection.looks.map((look) => look.id),
    "look ID"
  );
  const assigned = new Set<string>();
  for (const look of collection.looks) {
    const members = look.productSlugs.map((slug) =>
      collection.products.find((p) => p.slug === slug)
    );
    if (members.some((p) => !p) || new Set(members.map((p) => p?.kind)).size !== 3) {
      throw new Error(`Look ${look.id} needs one necklace, one bracelet and one pair of earrings.`);
    }
    for (const slug of look.productSlugs) {
      if (assigned.has(slug)) throw new Error(`Product ${slug} belongs to more than one look.`);
      assigned.add(slug);
    }
  }
  for (const p of collection.products) {
    if (p.images.some((image, index) => image.position !== index)) {
      throw new Error(`Image positions are out of order for ${p.sku}.`);
    }
    if (publish && (p.price === null || p.stockQty === null)) {
      throw new Error(`Set an approved price and stock quantity for ${p.sku} before publishing.`);
    }
  }
  return collection;
}

/** The editable worksheet uses euros, while Product stores integer cents. */
export function applyPricingCsv(collection: NewCollection, csv: string): NewCollection {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines
    .shift()
    ?.replace(/^\uFEFF/, "")
    .split(",");
  if (header?.join(",") !== "sku,name,kind,price_eur,stock_qty") {
    throw new Error("Use the pricing.csv worksheet with its original column headings.");
  }
  const result = structuredClone(collection);
  const seen = new Set<string>();
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = line.split(",");
    if (cells.length !== 5)
      throw new Error("Use a decimal point for prices and keep the worksheet's five columns.");
    const [sku, , , euros, stock] = cells.map((cell) => cell.trim());
    const product = result.products.find((p) => p.sku === sku);
    if (!product || seen.has(sku)) throw new Error(`Unknown or duplicate worksheet SKU: ${sku}.`);
    seen.add(sku);
    if (euros) {
      if (!/^\d+(?:\.\d{1,2})?$/.test(euros) || Number(euros) <= 0) {
        throw new Error(`Enter a positive euro price with at most two decimals for ${sku}.`);
      }
      product.price = Math.round(Number(euros) * 100);
    }
    if (stock) {
      if (!/^\d+$/.test(stock))
        throw new Error(`Enter a nonnegative whole stock quantity for ${sku}.`);
      product.stockQty = Number(stock);
    }
  }
  return result;
}
