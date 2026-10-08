import type { ReactNode } from "react";
import { LayoutSection } from "@/components/layout-section";
import { PreviewBridge } from "@/components/layout-preview-bridge-server";
import { isLayoutPreview } from "@/lib/layout-preview-server";
import { pageEntries } from "@/lib/page-layout-store";
import type { LOOKS_SECTIONS } from "@/lib/page-layout";
import { withPageMeta } from "@/lib/page-meta";
import type { Metadata } from "next";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { getAllLooks } from "@/lib/look-data";
import { getLookPageCopy, getLookEditorialDescription } from "@/lib/i18n/look-page-copy";
import { applyTemplate } from "@/lib/i18n/format";
import { COMPOSED_LOOK_DISCOUNT_PERCENT } from "@/lib/looks";
import type { FaqItem } from "@/lib/faq";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { LookRow } from "@/components/look-editorial";
import { ComposePromo } from "@/components/compose-promo";
import { FaqSection } from "@/components/faq-section";

async function baseMetadata(): Promise<Metadata> {
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

export async function generateMetadata(): Promise<Metadata> {
  return withPageMeta("/looks", await baseMetadata());
}

type LooksSectionId = (typeof LOOKS_SECTIONS)[number]["id"];

export default async function LooksPage({ searchParams }: PageProps<"/looks">) {
  const preview = await isLayoutPreview(searchParams);
  const entries = await pageEntries("looks", { preview });
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);
  const looks = await getAllLooks(locale);
  const copy = getLookPageCopy(locale);
  // The chosen Look layout for this page (Admin > Page layout > Looks >
  // Options), read from the page's own `list` entry.
  const listStyle = entries.find((e) => e.id === "list")?.options?.lookStyle;
  const faqItems: FaqItem[] = copy.listingFaq.map((item) => ({
    ...item,
    answer: applyTemplate(item.answer, { composed: COMPOSED_LOOK_DISCOUNT_PERCENT }),
  }));

  const sections: Record<LooksSectionId, ReactNode> = {
    head: (
      <ShelfHead title={dict.looks.title} width="full">
        <p className="shop-lede">{copy.editorialIntro}</p>
      </ShelfHead>
    ),
    list: (
      <ShelfBody width="full">
        {looks.length === 0 ? (
          <p className="look-grid-empty">{dict.looks.empty}</p>
        ) : (
          <div className="looks-editorial-list">
            {looks.map((look, i) => (
              <LookRow
                style={listStyle}
                index={i}
                heading="h2"
                key={look.id}
                look={look}
                locale={settings.defaultLocale}
                priority={i === 0}
                labels={{
                  view: dict.looks.viewLook,
                  save: dict.look.save,
                  pieces: dict.looks.pieces,
                  description: getLookEditorialDescription(look.name, locale),
                  included: copy.editorialIncluded,
                  price: copy.editorialPrice,
                  kinds: dict.giftFinder.preference,
                }}
              />
            ))}
          </div>
        )}
        <ComposePromo
          labels={{
            kicker: dict.looks.composeKicker,
            title: dict.looks.composeTitle,
            subtitle: dict.looks.composeSubtitle,
            cta: dict.looks.composeCta,
          }}
        />
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
    ),
  };

  return (
    <ShelfMain>
      {entries.map((entry) => (
        <LayoutSection key={entry.id} entry={entry} preview={preview}>
          {entry.custom ? null : sections[entry.id as LooksSectionId]}
        </LayoutSection>
      ))}
      {preview && <PreviewBridge target="looks" />}
    </ShelfMain>
  );
}
