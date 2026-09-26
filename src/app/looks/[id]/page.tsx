import type { Metadata } from "next";
import { Link } from "@/components/localized-link";
import { notFound } from "next/navigation";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLookPageCopy } from "@/lib/i18n/look-page-copy";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { getLookById, getLookPieceDetails } from "@/lib/look-data";
import { COMPOSED_LOOK_DISCOUNT_PERCENT, PAIR_DISCOUNT_PERCENT } from "@/lib/looks";
import { buildLookFaq } from "@/lib/faq";
import { getShippingFacts } from "@/lib/shipping-banner";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead } from "@/components/shelf-page";
import { CompleteTheLook } from "@/components/complete-the-look";
import { FaqSection } from "@/components/faq-section";
import { LookLearnMore, LookPieces, LookWhy } from "@/components/look-page-sections";

export async function generateMetadata({ params }: PageProps<"/looks/[id]">): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  const look = await getLookById(id, locale);
  if (!look) return {};
  const dict = getDictionary(locale).looks;
  const image = look.imageUrl ?? look.pieces.find((p) => p.imageUrl)?.imageUrl;
  const description = `${look.pieces.map((p) => p.name).join(", ")}. ${dict.metaDescription}`;
  const canonical = `/looks/${look.id}`;
  return {
    title: look.name,
    description,
    alternates: {
      canonical: localizedCanonical(locale, canonical),
      languages: hreflangAlternates(canonical),
    },
    openGraph: {
      title: look.name,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function LookPage({ params }: PageProps<"/looks/[id]">) {
  const [{ id }, settings, locale] = await Promise.all([params, getStoreSettings(), getLocale()]);
  const look = await getLookById(id, locale);
  if (!look) notFound();
  const dict = getDictionary(locale);
  const copy = getLookPageCopy(locale);
  const [details, shippingFacts] = await Promise.all([
    getLookPieceDetails(
      look.pieces.map((p) => p.productId),
      locale
    ),
    getShippingFacts(settings.defaultCurrency, settings.defaultLocale),
  ]);
  // The same percentages checkout applies (lib/looks.ts).
  const percents = {
    set: look.discountPercent,
    pair: Math.min(PAIR_DISCOUNT_PERCENT, look.discountPercent),
    composed: COMPOSED_LOOK_DISCOUNT_PERCENT,
  };
  const faq = buildLookFaq(dict, copy, shippingFacts, settings.contactEmail, percents);

  return (
    <ShelfMain>
      <ShelfHead title={look.name} width="full">
        <p className="shop-lede">{dict.looks.subtitle}</p>
        <Link href="/looks" className="look-back">
          <span aria-hidden="true">←</span> {dict.looks.backToLooks}
        </Link>
      </ShelfHead>
      {/* No piece is "this piece" here: the look itself is the page. */}
      <CompleteTheLook
        look={look}
        currentProductId=""
        locale={settings.defaultLocale}
        dict={dict.look}
        outOfStockLabel={dict.product.outOfStock}
      />
      <LookPieces
        look={look}
        details={details}
        copy={copy}
        dict={dict}
        moneyLocale={settings.defaultLocale}
      />
      <LookWhy copy={copy} percents={percents} />
      <section className="shelf-section">
        <div className="shelf-wrap">
          {/* Only the look's own questions are marked up; the store-wide ones
              already are, on the homepage. */}
          <FaqSection
            items={faq}
            dict={dict}
            structuredItems={faq.filter((item) => item.id.startsWith("look-"))}
          />
        </div>
      </section>
      <LookLearnMore copy={copy} dict={dict} composedPercent={percents.composed} />
    </ShelfMain>
  );
}
