import type { Metadata } from "next";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { getAllLooks } from "@/lib/look-data";
import { getLookPageCopy } from "@/lib/i18n/look-page-copy";
import { applyTemplate } from "@/lib/i18n/format";
import { COMPOSED_LOOK_DISCOUNT_PERCENT } from "@/lib/looks";
import type { FaqItem } from "@/lib/faq";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { LookCard } from "@/components/look-card";
import { ComposePromo } from "@/components/compose-promo";
import { FaqSection } from "@/components/faq-section";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale).looks;
  const image = ogImage(settings);
  return {
    title: dict.title,
    description: dict.metaDescription,
    alternates: {
      canonical: localizedCanonical(locale, "/looks"),
      languages: hreflangAlternates("/looks"),
    },
    openGraph: {
      title: dict.title,
      description: dict.metaDescription,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function LooksPage() {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);
  const looks = await getAllLooks(locale);
  const copy = getLookPageCopy(locale);
  const faqItems: FaqItem[] = copy.listingFaq.map((item) => ({
    ...item,
    answer: applyTemplate(item.answer, { composed: COMPOSED_LOOK_DISCOUNT_PERCENT }),
  }));

  return (
    <ShelfMain>
      <ShelfHead title={dict.looks.title} width="full">
        <p className="shop-lede">{dict.looks.subtitle}</p>
      </ShelfHead>
      <ShelfBody width="full">
        <ComposePromo
          labels={{
            kicker: dict.looks.composeKicker,
            title: dict.looks.composeTitle,
            subtitle: dict.looks.composeSubtitle,
            cta: dict.looks.composeCta,
          }}
        />
        {looks.length === 0 ? (
          <p className="look-grid-empty">{dict.looks.empty}</p>
        ) : (
          <div className="look-cards">
            {looks.map((look, i) => (
              <LookCard
                key={look.id}
                look={look}
                locale={settings.defaultLocale}
                priority={i < 3}
                labels={{
                  view: dict.looks.viewLook,
                  save: dict.look.save,
                  pieces: dict.looks.pieces,
                }}
              />
            ))}
          </div>
        )}
        {looks.length > 0 && (
          <>
            <section className="looks-page-reasons" aria-labelledby="looks-page-reasons-title">
              <div className="looks-page-reasons-intro">
                <p className="look-kicker">{dict.looks.composeKicker}</p>
                <h2 id="looks-page-reasons-title">{copy.listingWhyTitle}</h2>
                <p>{copy.listingWhyIntro}</p>
              </div>
              <div className="looks-page-reasons-grid">
                {copy.listingWhy.map((reason, index) => (
                  <article className="looks-page-reason" key={reason.title}>
                    <span className="looks-page-reason-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{reason.title}</h3>
                    <p>{reason.body}</p>
                  </article>
                ))}
              </div>
            </section>
            <div className="looks-page-faq">
              <FaqSection items={faqItems} dict={dict} />
            </div>
          </>
        )}
      </ShelfBody>
    </ShelfMain>
  );
}
