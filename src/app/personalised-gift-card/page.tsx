import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreSettings } from "@/lib/store-settings";
import { siteBaseUrl } from "@/lib/site-url";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { hreflangAlternates } from "@/lib/hreflang";
import { formatMoney } from "@/lib/format";
import { absoluteUrl, toSafeJsonLd } from "@/lib/json-ld";
import { giftCardFontClasses } from "@/lib/gift-card-fonts";
import { getGiftCardPageContent } from "@/lib/gift-card-page-content";
import { GIFT_CARD_IMAGE } from "@/lib/gift-card-art";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { GiftCardDesigner } from "@/components/gift-card-designer";
import { Reveal } from "@/components/reveal";
import { FaqAccordion } from "@/components/faq-accordion";
import "@/components/faq.css";
import "./gift-card-page.css";

const PATH = "/personalised-gift-card";

async function load() {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const content = getGiftCardPageContent(locale);
  const price = formatMoney(settings.giftCardPrice, settings.defaultCurrency, settings.defaultLocale);
  // Every {price} in the copy, filled once.
  const fill = (text: string) => applyTemplate(text, { price });
  return { settings, locale, content, price, fill };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings, content, fill } = await load();
  if (!settings.giftCardEnabled) return {};
  const description = fill(content.metaDescription);
  const image = GIFT_CARD_IMAGE;
  return {
    title: content.metaTitle,
    description,
    alternates: { canonical: PATH, languages: hreflangAlternates(PATH) },
    openGraph: {
      title: content.metaTitle,
      description,
      type: "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle,
      description,
      images: [image],
    },
  };
}

export default async function PersonalisedGiftCardPage() {
  const { settings, locale, content, price, fill } = await load();
  // Switched off in Admin > Settings: the page doesn't exist.
  if (!settings.giftCardEnabled) notFound();
  const dict = getDictionary(locale).giftCard;
  const base = siteBaseUrl(settings);
  const pageUrl = `${base}${PATH}`;

  const faq = content.faq.map((item, index) => ({
    id: `gift-card-faq-${index + 1}`,
    question: item.question,
    answer: fill(item.answer),
  }));

  // What the page sells, its questions and where it sits. The Product has the
  // card's real price (from Admin > Settings) and the photo of the card.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: dict.productName,
      description: fill(content.metaDescription),
      image: absoluteUrl(GIFT_CARD_IMAGE, base),
      brand: { "@type": "Brand", name: settings.storeName },
      url: pageUrl,
      offers: {
        "@type": "Offer",
        price: (settings.giftCardPrice / 100).toFixed(2),
        priceCurrency: settings.defaultCurrency,
        availability: "https://schema.org/InStock",
        url: pageUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: settings.storeName, item: base || undefined },
        { "@type": "ListItem", position: 2, name: content.h1, item: pageUrl },
      ],
    },
  ];

  return (
    <ShelfMain>
      {jsonLd.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJsonLd(data) }}
        />
      ))}

      <div className={giftCardFontClasses}>
        <ShelfHead title={content.h1} width="full">
          <p className="shop-lede gcp-lede">{fill(content.lede)}</p>
        </ShelfHead>
        <ShelfBody width="full">
          <GiftCardDesigner dict={dict} price={price} brand={settings.storeName} />
        </ShelfBody>
      </div>

      <section className="shelf-section shelf-section--sand" aria-labelledby="gcp-why">
        <Reveal className="shelf-wrap gcp-reveal gcp-reveal--why gcp-why">
          <h2 id="gcp-why" className="shelf-heading">
            {content.whyTitle}
          </h2>
          <div className="gcp-prose">
            {content.whyParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="shelf-section" aria-labelledby="gcp-loved">
        <Reveal className="shelf-wrap gcp-reveal gcp-reveal--loved">
          <h2 id="gcp-loved" className="shelf-heading gcp-section-title">
            {content.lovedTitle}
          </h2>
          <ul className="gcp-loved">
            {content.lovedPoints.map((point) => (
              <li key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="shelf-section shelf-section--sand" aria-labelledby="gcp-for-whom">
        <Reveal className="shelf-wrap gcp-reveal gcp-reveal--people">
          <h2 id="gcp-for-whom" className="shelf-heading gcp-section-title">
            {content.forWhomTitle}
          </h2>
          <p className="gcp-intro">{content.forWhomIntro}</p>
          <ul className="gcp-people">
            {content.forWhom.map((person) => (
              <li key={person.who}>
                <h3>{person.who}</h3>
                <p>{person.body}</p>
                <figure className="gcp-idea">
                  <figcaption>{content.ideaLabel}</figcaption>
                  <blockquote>{person.idea}</blockquote>
                </figure>
              </li>
            ))}
          </ul>
          <h3 className="gcp-occasions-title">{content.occasionsTitle}</h3>
          <ul className="gcp-occasions">
            {content.occasions.map((occasion) => (
              <li key={occasion}>{occasion}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="shelf-section" aria-labelledby="gcp-how">
        <Reveal className="shelf-wrap gcp-reveal gcp-reveal--how gcp-how-grid">
          <div>
            <h2 id="gcp-how" className="shelf-heading gcp-section-title">
              {content.howTitle}
            </h2>
            <ol className="gcp-steps">
              {content.howSteps.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{fill(step.body)}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside className="gcp-tips" aria-labelledby="gcp-tips">
            <h2 id="gcp-tips">{content.tipsTitle}</h2>
            <ul>
              {content.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </aside>
        </Reveal>
      </section>

      <section className="shelf-section shelf-section--sand" aria-labelledby="gcp-faq">
        <Reveal className="shelf-wrap gcp-reveal gcp-reveal--faq">
          <div className="faq faq--editorial">
            <div className="faq-intro">
              <h2 id="gcp-faq" className="shelf-heading">
                {content.faqTitle}
              </h2>
            </div>
            <FaqAccordion items={faq} initial={faq.length} moreLabel="" fewerLabel="" />
          </div>
        </Reveal>
      </section>

      <section className="shelf-section gcp-cta">
        <Reveal className="shelf-wrap gcp-reveal gcp-reveal--cta">
          <h2 className="shelf-heading">{content.ctaTitle}</h2>
          <p>{content.ctaBody}</p>
          <div className="gcp-cta-actions">
            <a href="#design" className="shelf-button">
              {content.ctaButton}
              <span aria-hidden="true" className="shelf-button-arrow">
                ↑
              </span>
            </a>
            <Link href="/products" className="shelf-link">
              {content.shopLink} <span aria-hidden="true">→</span>
            </Link>
            <Link href="/gift-finder" className="shelf-link">
              {getDictionary(locale).giftFinder.metaTitle} <span aria-hidden="true">→</span>
            </Link>
            <Link href="/murano-glass" className="shelf-link">
              {getDictionary(locale).footer.muranoGuide} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </ShelfMain>
  );
}
