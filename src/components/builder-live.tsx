import { cache } from "react";
import { applyHomeCopy, parseHomeCopy } from "@/lib/home-copy";
import { formatMoney } from "@/lib/format";
import { getHomepageData } from "@/lib/homepage-data";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedCardProduct } from "@/lib/product-i18n";
import { getStoreSettings } from "@/lib/store-settings";
import { getShowcaseCopy, SHOWCASE_SCENE_ORDER } from "@/lib/i18n/showcase-copy";
import { getAllLooks } from "@/lib/look-data";
import { getLookPageCopy, getLookEditorialDescription } from "@/lib/i18n/look-page-copy";
import { buildFaq } from "@/lib/faq";
import { getShippingFacts } from "@/lib/shipping-banner";
import { Link } from "@/components/localized-link";
import { ShelfItem } from "@/components/shelf-item";
import { PopularCarousel } from "@/components/popular-carousel";
import { EditorialReveal } from "@/components/editorial-reveal";
import { LookEditorial } from "@/components/look-editorial";
import { CollectionShowcase } from "@/components/collection-showcase";
import { CatalogImage } from "@/components/catalog-image";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { FaqSection } from "@/components/faq-section";
import { JournalPreview } from "@/components/journal/journal-preview";
import type { BuilderBlock, LiveType } from "@/lib/section-builder";

/**
 * The live blocks of the section builder, rendered on the server with the
 * site's own components, so a designed section can show your real products,
 * looks, reviews and the collections animation while everything around them is
 * laid out freely.
 */

const COLLECTION_ORDER = ["collane", "bracciali", "orecchini"];

const context = cache(async () => {
  const [settings, locale, data] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getHomepageData(),
  ]);
  // Staff overrides from Admin > Settings > Page text, per language.
  const dict = applyHomeCopy(getDictionary(locale), parseHomeCopy(settings.homeCopy)[locale]);
  return { settings, locale, data, dict };
});

type Live<T extends LiveType> = Extract<BuilderBlock, { type: T }>;

export async function LiveBlock({ block }: { block: Extract<BuilderBlock, { type: LiveType }> }) {
  const { settings, locale, data, dict } = await context();

  switch (block.type) {
    case "carousel":
    case "shelf": {
      const pool = {
        popular: data.popularProducts,
        bestSellers: data.bestSellers,
        newest: data.products,
        special: data.specialSelection,
      }[block.source].filter((p) => p.images[0]);
      const items = pool.slice(0, block.count);
      if (block.type === "carousel") {
        if (items.length < 3) return null;
        return (
          <PopularCarousel
            products={items.map((p) => ({
              slug: p.slug,
              name: localizedName(p, locale),
              price: formatMoney(p.price, settings.defaultCurrency, locale),
              imageUrl: p.images[0].url,
            }))}
          />
        );
      }
      if (items.length === 0) return null;
      return (
        <ul className="shelf-row">
          {items.map((p) => (
            <ShelfItem
              key={p.slug}
              product={localizedCardProduct(p, locale)}
              locale={settings.defaultLocale}
              outOfStockLabel={dict.product.outOfStock}
              quickAddLabel={dict.product.addToCart}
              addedLabel={dict.product.added}
            />
          ))}
        </ul>
      );
    }

    case "looks": {
      const looks = await getAllLooks(locale, (block as Live<"looks">).count);
      if (looks.length === 0) return null;
      const lookCopy = getLookPageCopy(locale);
      return (
        <>
          <div className="looks-editorial-list" data-editorial-root>
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
          <p className="shelf-looks-more">
            <Link href="/looks" className="shelf-link">
              {dict.looks.allLooks} <span aria-hidden="true">→</span>
            </Link>
          </p>
        </>
      );
    }

    case "reviews": {
      if (!settings.showTestimonials) return null;
      const reviews = data.reviews
        .filter((r) => r.comment)
        .slice(0, (block as Live<"reviews">).count);
      if (reviews.length === 0) return null;
      return (
        <ul className="shelf-quotes">
          {reviews.map((review) => (
            <li key={review.id}>
              <figure className="shelf-quote">
                <span className="shelf-stars" aria-hidden="true">
                  {"★".repeat(review.rating)}
                </span>
                <span className="sr-only">{review.rating}/5</span>
                <blockquote>{review.comment}</blockquote>
                <figcaption>
                  {/* First name only: a reviewer's full name is personal data. */}
                  {review.user.name?.split(" ")[0] || dict.home.verifiedBuyer},{" "}
                  {localizedName(review.product, locale)}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      );
    }

    case "original":
      // Rendered by BuilderView from the section's own markup.
      return null;

    case "newsletter":
      return <NewsletterSignupForm dict={dict.footer} submitLabel={dict.home.newsletterSubmit} />;

    case "journal":
      return <JournalPreview locale={locale} />;

    case "siteFaq": {
      const faq = buildFaq(
        dict,
        await getShippingFacts(settings.defaultCurrency, settings.defaultLocale),
        settings.contactEmail
      );
      return <FaqSection items={faq} dict={dict} />;
    }

    case "showcase": {
      const collections = COLLECTION_ORDER.flatMap((prefix) => {
        const category = data.categoriesWithImage.find((c) => c.slug.startsWith(prefix));
        return category?.image ? [category] : [];
      });
      if (collections.length === 0) return null;
      const copy = getShowcaseCopy(locale);
      const overrides = (block as Live<"showcase">).scenes ?? {};
      if ((block as Live<"showcase">).layout === "row") {
        return (
          <ul className="bld-collection-row">
            {collections.map((category, i) => {
              const scene = SHOWCASE_SCENE_ORDER[i] ?? "necklace";
              return (
                <li key={category.id}>
                  <Link
                    href={overrides[scene]?.href ?? `/category/${category.slug}`}
                    className="bld-collection-card"
                  >
                    <CatalogImage
                      src={overrides[scene]?.image ?? category.image!.url}
                      alt={overrides[scene]?.name ?? localizedName(category, locale)}
                      width={640}
                      height={800}
                      sizes="(min-width: 48rem) 22rem, 100vw"
                    />
                    <span className="bld-collection-name shelf-heading">
                      {overrides[scene]?.name ?? localizedName(category, locale)}
                    </span>
                    <span className="bld-collection-desc">
                      {overrides[scene]?.description ?? copy.scenes[scene].description}
                    </span>
                    <span className="bld-collection-cta">
                      {overrides[scene]?.cta ?? copy.scenes[scene].cta}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      }
      return (
        <CollectionShowcase
          options={(block as Live<"showcase">).scroll}
          items={collections.map((category, i) => {
            const scene = SHOWCASE_SCENE_ORDER[i] ?? "necklace";
            return {
              id: category.id,
              href: overrides[scene]?.href ?? `/category/${category.slug}`,
              name: overrides[scene]?.name ?? localizedName(category, locale),
              image: overrides[scene]?.image ?? category.image!.url,
              side: overrides[scene]?.side,
              description: overrides[scene]?.description ?? copy.scenes[scene].description,
              cta: overrides[scene]?.cta ?? copy.scenes[scene].cta,
              scene,
            };
          })}
        />
      );
    }
  }
}
