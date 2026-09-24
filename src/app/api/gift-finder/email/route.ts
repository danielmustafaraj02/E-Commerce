import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getStoreSettings } from "@/lib/store-settings";
import { siteBaseUrl } from "@/lib/site-url";
import { localizedName } from "@/lib/product-i18n";
import { formatMoney } from "@/lib/format";

// "Email my picks" on the Gift Finder result screen (/gift-finder). The only
// free text a shopper supplies is their own email address — the message body
// is always rebuilt here from productIds looked up fresh in the database, so
// it can only ever contain real product names/prices/links, never anything
// the client sent as text.
const MAX_PICKS = 3;

const schema = z.object({
  email: z.string().email().max(200),
  productIds: z.array(z.string().min(1).max(100)).min(1).max(MAX_PICKS),
});

export async function POST(request: Request) {
  const { success } = await rateLimit(`gift-finder-email:${clientIp(request)}`, 5, 60_000);
  if (!success) return NextResponse.json({ ok: false }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);
  const base = siteBaseUrl(settings);

  const products = await db.product.findMany({
    where: { id: { in: parsed.data.productIds }, active: true },
    select: {
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
    },
  });
  if (products.length === 0) return NextResponse.json({ ok: false }, { status: 400 });

  const picks = products.map((product) => ({
    name: localizedName(product, locale),
    url: `${base}/products/${product.slug}`,
    price: formatMoney(product.price, product.currency, locale),
  }));

  const text = [
    dict.giftFinder.resultsTitle,
    "",
    ...picks.map((pick) => `${pick.name} — ${pick.price}\n${pick.url}`),
  ].join("\n");
  const html = `<p>${dict.giftFinder.resultsTitle}</p><ul>${picks
    .map((pick) => `<li><a href="${pick.url}">${pick.name}</a> — ${pick.price}</li>`)
    .join("")}</ul>`;

  await sendEmail({ to: parsed.data.email, subject: dict.giftFinder.emailTitle, text, html });

  return NextResponse.json({ ok: true });
}
