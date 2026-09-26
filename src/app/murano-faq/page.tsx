import type { Metadata } from "next";
import { Link } from "@/components/localized-link";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { siteBaseUrl } from "@/lib/site-url";
import { toSafeJsonLd } from "@/lib/json-ld";
import { faqJsonLd } from "@/lib/faq";
import {
  buildMuranoFaq,
  getMuranoFaqFacts,
  MURANO_FAQ_LOCALE,
  MURANO_FAQ_PATH,
  muranoFaqCopy as copy,
} from "@/lib/murano-faq";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead } from "@/components/shelf-page";
import { FaqAccordion } from "@/components/faq-accordion";
import "@/components/faq.css";
import "./murano-faq.css";

// Italian only: every locale's copy names the Italian URL as canonical and
// Italian is the page's only language version (see lib/murano-faq.ts).
const CANONICAL = `/${MURANO_FAQ_LOCALE}${MURANO_FAQ_PATH}`;

export function generateMetadata(): Metadata {
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical: CANONICAL,
      languages: { [MURANO_FAQ_LOCALE]: CANONICAL, "x-default": CANONICAL },
    },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      type: "website",
      locale: "it_IT",
    },
  };
}

export default async function MuranoFaqPage() {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const groups = buildMuranoFaq(await getMuranoFaqFacts(settings));
  const base = siteBaseUrl(settings);

  // One FAQPage for exactly the 30 visible questions, plus the breadcrumb.
  const jsonLd = [
    faqJsonLd(groups.flatMap((group) => group.items)),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: settings.storeName, item: `${base}/${MURANO_FAQ_LOCALE}` },
        { "@type": "ListItem", position: 2, name: copy.title, item: `${base}${CANONICAL}` },
      ],
    },
  ];

  return (
    <ShelfMain className="mfaq-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonLd(jsonLd) }} />
      <div lang="it">
        <ShelfHead title={copy.title} width="full">
          <p className="shop-lede mfaq-lede">{copy.lede}</p>
          {locale !== MURANO_FAQ_LOCALE && (
            <p className="mfaq-lang-note" lang="en">
              {copy.italianOnly}
            </p>
          )}
          <nav className="mfaq-toc" aria-label={copy.tocLabel}>
            <ol>
              {groups.map((group) => (
                <li key={group.id}>
                  <a href={`#${group.id}`}>
                    <span className="mfaq-toc-title">{group.title}</span>
                    <span className="mfaq-toc-count">{copy.count(group.items.length)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </ShelfHead>

        {groups.map((group, index) => (
          <section
            key={group.id}
            id={group.id}
            className={`shelf-section mfaq-group${index % 2 === 1 ? " shelf-section--sand" : ""}`}
            aria-labelledby={`${group.id}-title`}
          >
            <div className="shelf-wrap faq faq--editorial">
              <div className="faq-intro">
                <h2 id={`${group.id}-title`} className="shelf-heading">
                  {group.title}
                </h2>
                <p>{group.intro}</p>
              </div>
              <FaqAccordion
                items={group.items}
                initial={group.items.length}
                moreLabel={copy.more}
                fewerLabel={copy.fewer}
                defaultOpen={index === 0 ? group.items[0]?.id : undefined}
              />
            </div>
          </section>
        ))}

        <section className="shelf-section mfaq-end" aria-labelledby="mfaq-end-title">
          <div className="shelf-wrap mfaq-end-inner">
            <h2 id="mfaq-end-title" className="shelf-heading">
              {copy.endTitle}
            </h2>
            <p>{copy.endBody}</p>
            <div className="mfaq-end-actions">
              <Link href="/contact" className="shelf-button">
                {copy.endContact}
              </Link>
              <Link href="/products" className="shelf-link">
                {copy.endShop} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ShelfMain>
  );
}
