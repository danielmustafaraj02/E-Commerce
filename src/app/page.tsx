import type { CSSProperties } from "react";
import Image from "next/image";
import { HeroTypingSequence } from "@/components/hero-typing-sequence";
import { HeroVideo } from "@/components/hero-video";
import { HeroVideoProduct } from "@/components/hero-video-product";
import type { Metadata } from "next";
import { Link } from "@/components/localized-link";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { getHomepageData } from "@/lib/homepage-data";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedDescription, localizedCardProduct } from "@/lib/product-i18n";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { fitTitle } from "@/lib/seo-text";
import { truncateAtWord } from "@/lib/text";
import { CatalogImage } from "@/components/catalog-image";
import { ShelfItem } from "@/components/shelf-item";
import { Reveal } from "@/components/reveal";
import { ShelfStagger } from "@/components/shelf-stagger";
import { EditorialReveal } from "@/components/editorial-reveal";
import { getShowcaseCopy, SHOWCASE_SCENE_ORDER } from "@/lib/i18n/showcase-copy";
import { CollectionShowcase } from "@/components/collection-showcase";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { FaqSection } from "@/components/faq-section";
import { buildFaq } from "@/lib/faq";
import { getShippingFacts } from "@/lib/shipping-banner";
import { GiftFinderArrow } from "@/components/gift-finder-arrow";
import { PopularCarousel } from "@/components/popular-carousel";
import { MuranoReasons } from "@/components/murano-reasons";
import { chosenBySlot, pickReasonProducts } from "@/lib/murano-reasons";
import { db } from "@/lib/db";

import { getAllLooks } from "@/lib/look-data";
import { LookEditorial } from "@/components/look-editorial";
import { getLookPageCopy, getLookEditorialDescription } from "@/lib/i18n/look-page-copy";
import { JournalPreview } from "@/components/journal/journal-preview";
import { homeFontClasses } from "./home-fonts";
import "./home.css";

// "Murano Glass Jewelry" in the locale's own words, same idea as the keyword
// carried in products/[slug]/page.tsx and category/[slug]/page.tsx — the
// homepage is the single highest-authority URL on the site, so it shouldn't
// be the one page whose <title>/description fall through to the root
// layout's bare store name and generic "Shop at {storeName}" default.
export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);

  const titleCandidatesByLocale: Record<Locale, string[]> = {
    en: ["Murano Glass Jewelry, Handmade in Venice, Italy", "Murano Glass Jewelry"],
    it: ["Gioielli in Vetro di Murano, Fatti a Mano a Venezia", "Gioielli in Vetro di Murano"],
    fr: ["Bijoux en Verre de Murano, Faits Main à Venise", "Bijoux en Verre de Murano"],
    de: ["Muranoglas-Schmuck, Handgefertigt in Venedig", "Muranoglas-Schmuck"],
    ar: ["مجوهرات زجاج مورانو، صناعة يدوية في البندقية", "مجوهرات زجاج مورانو"],
    zh: ["穆拉诺玻璃珠宝，威尼斯手工制作", "穆拉诺玻璃珠宝"],
    ru: ["Ювелирные изделия из муранского стекла, Венеция", "Муранское стекло"],
    es: ["Joyería de Vidrio de Murano, Hecha a Mano en Venecia", "Joyería de Vidrio de Murano"],
    pt: ["Joias em Vidro de Murano, Feitas à Mão em Veneza", "Joias em Vidro de Murano"],
    hi: ["मुरानो ग्लास ज्वेलरी, वेनिस में हस्तनिर्मित", "मुरानो ग्लास ज्वेलरी"],
    ja: ["ムラノガラスジュエリー、ヴェネツィアで手作り", "ムラノガラスジュエリー"],
  };
  const candidates = titleCandidatesByLocale[locale];
  const title = fitTitle(candidates, settings.storeName);
  // Admin-entered copy (Settings > SEO) wins when set; otherwise the hero
  // subtitle is already keyword-rich, locale-translated marketing copy, so
  // it makes a far better snippet than the layout's generic fallback.
  const description = settings.metaDescription
    ? settings.metaDescription
    : truncateAtWord(dict.home.heroSubtitle, 155);
  const image = ogImage(settings);
  const canonical = "/";

  return {
    title,
    description,
    alternates: {
      canonical: localizedCanonical(locale, canonical),
      languages: hreflangAlternates(canonical),
    },
    openGraph: {
      title: candidates[0],
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: candidates[0],
      description,
      images: image ? [image] : undefined,
    },
  };
}

// The number of pieces shown per shelf: one row at the widest layout.
const SHELF_SIZE = 4;
// New arrivals fill two rows of four (the loader fetches 8); on phones the CSS
// keeps it to two rows of two.
const NEW_ARRIVALS_SIZE = 8;

// The colour the hero's title and CTA take on. A CSS reference, not a hex,
// so it re-colours with the palette in app/palette.css.
const HERO_ACCENT = "var(--brass)";

const COLLECTION_ORDER = ["collane", "bracciali", "orecchini"];

// A short breath between the store name finishing and the lede starting, so
// the caret's handoff reads as a pause between sentences, not a race.
const LEDE_PICKUP_PAUSE_MS = 450;

export default async function Home() {
  const [
    settings,
    locale,
    { products, specialSelection, categoriesWithImage, heroProduct, bestSellers, reviews, popularProducts },
  ] = await Promise.all([getStoreSettings(), getLocale(), getHomepageData()]);
  const dict = getDictionary(locale);
  const looks = await getAllLooks(locale, 3);
  const lookCopy = getLookPageCopy(locale);
  const showcaseCopy = getShowcaseCopy(locale);
  // The pieces beside the "why Murano" reasons: the one staff chose for each row
  // in Admin > Settings, and the homepage's popular pieces for any row left on
  // Automatic. A chosen piece that has since been unpublished, hidden or lost
  // its photo is treated as not chosen, not shown broken.
  // `?? []`: the column is new, and until its migration has been applied (and the
  // dev server restarted) the settings row simply does not carry it.
  const chosenReasonIds = settings.muranoReasonProductIds ?? [];
  const chosenReasonProducts = chosenReasonIds.some(Boolean)
    ? chosenBySlot(
        await db.product.findMany({
          where: {
            id: { in: chosenReasonIds.filter(Boolean) },
            active: true,
            unlisted: false,
            images: { some: {} },
          },
          include: { images: { take: 1, orderBy: { position: "asc" } } },
        }),
        chosenReasonIds
      )
    : [];
  const reasonProducts = pickReasonProducts(
    chosenReasonProducts,
    popularProducts.filter((product) => product.images[0])
  );
  const editorialCollections = COLLECTION_ORDER.flatMap((prefix) => {
    const category = categoriesWithImage.find((item) => item.slug.startsWith(prefix));
    return category?.image ? [category] : [];
  });
  const testimonials = reviews
    .filter((review) => review.comment)
    .map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment as string,
      // First name only — a reviewer's full name is personal data and
      // wasn't collected for public display purposes.
      authorName: review.user.name?.split(" ")[0] || dict.home.verifiedBuyer,
      productName: localizedName(review.product, locale),
    }));

  // The FAQ answers restate the site's own settings: shipping figures come
  // from the shipping zones (lib/shipping-banner.ts), not fixed text.
  const faq = buildFaq(
    dict,
    await getShippingFacts(settings.defaultCurrency, settings.defaultLocale),
    settings.contactEmail
  );

  const shelfProps = {
    locale: settings.defaultLocale,
    outOfStockLabel: dict.product.outOfStock,
    quickAddLabel: dict.product.addToCart,
    addedLabel: dict.product.added,
  };

  // The design (app/home.css) is scoped to `.shelf`: the glass is the only
  // saturated thing on the page, and the product photos are blended straight
  // into the ground instead of sitting in cards.
  return (
    <main className={`shelf shelf-home flex flex-1 flex-col ${homeFontClasses}`}>
      <section
        className="shelf-hero"
        style={{ "--hero-accent": HERO_ACCENT } as CSSProperties}
      >
        {/* Both files carry no audio track at all, so there is nothing to
            mute and no volume control to offer. The component handles a
            refused autoplay, reduced motion and pause/resume. */}
        <HeroVideo
          className="shelf-hero-video"
          poster="/hero/hero-atelier-poster.jpg"
          sources={[
            { src: "/hero/hero-atelier.webm", type: "video/webm" },
            { src: "/hero/hero-atelier.mp4", type: "video/mp4" },
          ]}
          playLabel={dict.home.heroVideoPlay}
        />
        {/* The piece worn in the film, linked to its own page. Rendered only
            when that product is really on sale and has a photo — see
            HERO_VIDEO_PRODUCT_SLUG in lib/homepage-data.ts. */}
        {heroProduct && heroProduct.images[0] && (
          <HeroVideoProduct
            href={`/products/${heroProduct.slug}`}
            name={localizedName(heroProduct, locale)}
            imageUrl={heroProduct.images[0].url}
            price={formatMoney(heroProduct.price, settings.defaultCurrency, locale)}
            compareAtPrice={
              heroProduct.compareAtPrice && heroProduct.compareAtPrice > heroProduct.price
                ? formatMoney(heroProduct.compareAtPrice, settings.defaultCurrency, locale)
                : undefined
            }
            labels={{
              eyebrow: dict.home.heroProductEyebrow,
              cta: dict.home.heroProductCta,
              open: dict.home.heroProductOpen,
              close: dict.home.heroProductClose,
            }}
          />
        )}
        {/* The legibility veil, a real element: the ::before pseudo-element on
            this hero silently stopped painting in one browser build, so the
            wash moved onto a node that cannot fail. Above the film (z -1),
            below the copy column. */}
        <div className="shelf-hero-veil" aria-hidden="true" />
        <div className="shelf-wrap">
          <div className="shelf-hero-grid">
            <div className="shelf-hero-copy">
              <HeroTypingSequence
                title={settings.storeName}
                subtitle={dict.home.heroSubtitle}
                locale={locale}
                cta={
                  <Link href="/products" className="shelf-button">
                    {dict.home.heroCta}
                    <span aria-hidden="true" className="shelf-button-arrow">
                      →
                    </span>
                  </Link>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* The collections showcase: a scroll-driven sequence. The stage pins and
          the page's own scroll carries it from the necklace (centred) through
          the bracelet (copy left) to the earrings (copy right); after the last
          one the stage releases and normal scrolling resumes. */}
      <CollectionShowcase
        items={editorialCollections.map((category, i) => {
          const scene = SHOWCASE_SCENE_ORDER[i] ?? "necklace";
          return {
            id: category.id,
            href: `/category/${category.slug}`,
            name: localizedName(category, locale),
            image: category.image!.url,
            description: showcaseCopy.scenes[scene].description,
            cta: showcaseCopy.scenes[scene].cta,
            scene,
          };
        })}
      />

      {popularProducts.length >= 3 && (
        <section className="shelf-section shelf-section--popular">
          <div className="shelf-wrap">
            <Reveal>
              <div className="shelf-heading-row shelf-heading-row--center">
                <h2 className="shelf-heading">{dict.home.popularTitle}</h2>
              </div>
            </Reveal>
          </div>
          <PopularCarousel
            products={popularProducts
              .filter((p) => p.images[0])
              .map((p) => ({
                slug: p.slug,
                name: localizedName(p, locale),
                price: formatMoney(p.price, settings.defaultCurrency, locale),
                imageUrl: p.images[0].url,
              }))}
          />
        </section>
      )}

      {bestSellers.length > 0 && (
        <section className="shelf-section">
          <div className="shelf-wrap">
            <div className="shelf-heading-row">
              <h2 className="shelf-heading">{dict.home.bestSellers}</h2>
            </div>
            <ShelfStagger className="shelf-row">
              {bestSellers.slice(0, SHELF_SIZE).map((product) => (
                <ShelfItem
                  key={product.id}
                  product={localizedCardProduct(product, locale)}
                  {...shelfProps}
                />
              ))}
            </ShelfStagger>
          </div>
        </section>
      )}

      <section className="shelf-section shelf-section--looks">
        <div className="shelf-wrap">
          <div className="looks-editorial-heading">
            <div className="shelf-heading-row shelf-heading-row--center">
              <p className="shelf-eyebrow shelf-eyebrow--center">{dict.look.kicker}</p>
              <h2 className="shelf-heading">{dict.looks.title}</h2>
            </div>
          </div>
          {looks.length > 0 && (
            <div className="looks-editorial-list" data-editorial-root>
              {/* One controller for the whole list: it arms the scroll-in
                  sequence. The scroll-linked parallax drift that used to run
                  alongside it is gone — three elements of a row sliding past
                  each other at three different rates read as a carousel
                  effect, not as an editorial page. The rows now simply
                  arrive, in order, and then hold still. */}
              <EditorialReveal>
                {looks.map((look, index) => (
                  <LookEditorial
                    index={index}
                    key={look.id}
                    look={look}
                    locale={settings.defaultLocale}
                    labels={{
                    view: dict.looks.viewLook,
                    save: dict.look.save,
                    pieces: dict.looks.pieces,
                    description: getLookEditorialDescription(look.name, locale),
                    included: lookCopy.editorialIncluded,
                    price: lookCopy.editorialPrice,
                    kinds: dict.giftFinder.preference,
                  }}
                />
                ))}
              </EditorialReveal>
            </div>
          )}
          {looks.length > 0 && (
            <p className="shelf-looks-more">
              <Link href="/looks" className="shelf-link">
                {dict.looks.allLooks} <span aria-hidden="true">→</span>
              </Link>
            </p>
          )}
        </div>
      </section>

      {products.length > 0 && (
        <section className="shelf-section">
          <div className="shelf-wrap">
            {/* Heading and its one-line introduction travel together as a
                group, so the link baselines with the introduction on a wide
                screen and wraps BELOW the whole group on a narrow one. */}
            <div className="shelf-heading-row shelf-heading-row--intro">
              <div className="shelf-heading-group">
                <h2 className="shelf-heading">{dict.home.newArrivals}</h2>
                <p className="shelf-heading-intro">{dict.home.newArrivalsIntro}</p>
              </div>
              <Link href="/products" className="shelf-link">
                {dict.footer.allProducts}
              </Link>
            </div>
            <ShelfStagger className="shelf-row shelf-row--two-rows">
              {products.slice(0, NEW_ARRIVALS_SIZE).map((product) => (
                <ShelfItem
                  key={product.slug}
                  product={localizedCardProduct(product, locale)}
                  {...shelfProps}
                />
              ))}
            </ShelfStagger>
          </div>
        </section>
      )}

      {specialSelection.length > 0 && (
        <section className="shelf-section">
          <div className="shelf-wrap">
            <Reveal>
              <div className="shelf-heading-row shelf-heading-row--intro">
                <div className="shelf-heading-group">
                  <h2 className="shelf-heading">{dict.home.specialSelectionTitle}</h2>
                  <p className="shelf-special-subtitle">{dict.home.specialSelectionSubtitle}</p>
                </div>
                <Link href="/products?sale=1" className="shelf-link">
                  {dict.home.specialSelectionCta} →
                </Link>
              </div>
              <ul className="shelf-row shelf-row--special">
                {specialSelection.map((product) => (
                  <ShelfItem
                    key={product.slug}
                    product={localizedCardProduct(product, locale)}
                    {...shelfProps}
                  />
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {reasonProducts.length > 0 && (
        <section className="shelf-section shelf-section--reasons">
          <MuranoReasons
            products={reasonProducts.map((product) => ({
              slug: product.slug,
              name: localizedName(product, locale),
              // The store's own number format, like every other price on this
              // page's shelves and looks ("80,00 €"), not the interface language's.
              price: formatMoney(product.price, settings.defaultCurrency, settings.defaultLocale),
              imageUrl: product.images[0].url,
            }))}
            reasons={[
              { title: dict.home.muranoReason1Title, body: dict.home.muranoReason1Body },
              { title: dict.home.muranoReason2Title, body: dict.home.muranoReason2Body },
              { title: dict.home.muranoReason3Title, body: dict.home.muranoReason3Body },
            ]}
            viewLabel={lookCopy.viewPiece}
          />
        </section>
      )}

      <section className="shelf-section">
        <div className="shelf-wrap">
          <FaqSection items={faq} dict={dict} />
        </div>
      </section>

      <section className="shelf-section shelf-giftfinder-band">
        <Reveal className="shelf-wrap shelf-giftfinder-reveal" repeatOnView>
          <div className="shelf-giftfinder-content">
            <p className="shelf-giftfinder-time">{dict.giftFinder.homeCtaTime}</p>
            <Link href="/gift-finder" className="shelf-giftfinder-link">
              <span>{dict.giftFinder.homeCtaLine}</span>
              <GiftFinderArrow />
            </Link>
            <p className="shelf-giftfinder-details">{dict.giftFinder.homeCtaDetails}</p>
          </div>
        </Reveal>
      </section>

      {settings.showTestimonials && testimonials.length > 0 && (
        <section className="shelf-section">
          <div className="shelf-wrap">
            <div className="shelf-heading-row">
              <h2 className="shelf-heading">{dict.home.testimonialsTitle}</h2>
            </div>
            <ul className="shelf-quotes">
              {testimonials.slice(0, 3).map((review) => (
                <li key={review.id}>
                  <figure className="shelf-quote">
                    <span className="shelf-stars" aria-hidden="true">
                      {"\u2605".repeat(review.rating)}
                    </span>
                    <span className="sr-only">{review.rating}/5</span>
                    <blockquote>{review.comment}</blockquote>
                    <figcaption>
                      {review.authorName}, {review.productName}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <JournalPreview locale={locale} />

      <section className="shelf-newsletter shelf-section">
        <div className="shelf-wrap shelf-newsletter-wrap">
          <div className="shelf-newsletter-inner">
            <h2 className="shelf-heading">{dict.home.newsletterCtaTitle}</h2>
            <p>{dict.home.newsletterCtaBody}</p>
            <NewsletterSignupForm dict={dict.footer} submitLabel={dict.home.newsletterSubmit} />
          </div>
          <span className="shelf-newsletter-discount" aria-hidden="true">
            −10%
          </span>
        </div>
      </section>
    </main>
  );
}
