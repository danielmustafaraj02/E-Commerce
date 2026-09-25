import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n/locale";
import { getStoreSettings } from "@/lib/store-settings";
import { localizedName, productImageAlt } from "@/lib/product-i18n";
import { formatMoney } from "@/lib/format";
import { deriveProductType } from "@/lib/gift-finder";
import { JOURNEY_MAX, pickRelated } from "@/lib/journey";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// "Your Murano Journey" (components/murano-journey.tsx) keeps its pieces in
// the browser; this refreshes them in one request: current name (in the
// visitor's language), price and photo for the ones still on sale (the rest
// are forgotten client-side), and, with ?related=1, pieces that go with them.

const RELATED_TAKE = 4;
const PRODUCT_INCLUDE = {
  images: { take: 1, orderBy: { position: "asc" as const } },
  category: { select: { name: true, nameEn: true, slug: true } },
};

export type JourneyCard = {
  id: string;
  slug: string;
  name: string;
  priceLabel: string;
  image: string | null;
  imageAlt: string;
};

export async function GET(request: Request) {
  const { success } = await rateLimit(`journey:${clientIp(request)}`, 60, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const params = new URL(request.url).searchParams;
  const ids = (params.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[a-z0-9]{1,40}$/i.test(id))
    .slice(0, JOURNEY_MAX);
  if (ids.length === 0) return NextResponse.json({ products: [], related: [] });

  const [locale, settings] = await Promise.all([getLocale(), getStoreSettings()]);
  const toCard = (product: {
    id: string;
    slug: string;
    price: number;
    currency: string;
    images: { url: string }[];
  } & Parameters<typeof localizedName>[0]): JourneyCard => {
    const name = localizedName(product, locale);
    return {
      id: product.id,
      slug: product.slug,
      name,
      priceLabel: formatMoney(product.price, product.currency, settings.defaultLocale),
      image: product.images[0]?.url ?? null,
      imageAlt: productImageAlt(name, locale),
    };
  };

  const viewed = await db.product.findMany({
    where: { id: { in: ids }, active: true },
    include: PRODUCT_INCLUDE,
  });

  let related: JourneyCard[] = [];
  if (params.get("related") === "1" && viewed.length > 0) {
    const colors = viewed.map((p) => p.color).filter((c): c is string => Boolean(c));
    const lookIds = viewed.map((p) => p.lookId).filter((l): l is string => Boolean(l));
    const candidates = await db.product.findMany({
      where: {
        active: true,
        id: { notIn: ids },
        OR: [{ stockQty: { gt: 0 } }, { trackInventory: false }],
        AND: [{ OR: [{ color: { in: colors } }, { lookId: { in: lookIds } }] }],
      },
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    const relatable = <T extends (typeof viewed)[number]>(p: T) => ({
      ...p,
      kind: deriveProductType(p.category),
    });
    related = pickRelated(candidates.map(relatable), viewed.map(relatable), RELATED_TAKE).map(toCard);
  }

  return NextResponse.json(
    { products: viewed.map(toCard), related },
    // Per visitor (language cookie) and short-lived: prices can change.
    { headers: { "Cache-Control": "private, max-age=300" } }
  );
}
