import { JournalImage } from "@/components/journal/journal-image";
import { Link } from "@/components/localized-link";
import { ARTICLES, localizeArticle, readingMinutes } from "@/lib/journal";
import { getJournalProducts } from "@/lib/journal/products";
import type { JournalCategory } from "@/lib/journal/types";
import { applyTemplate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

const PREVIEW_COUNT = 3;
const FALLBACK_IMAGE = "/hero/handmade-red-murano-glass-necklace.jpg";

export async function JournalPreview({ locale }: { locale: Locale }) {
  const articles = ARTICLES.slice(0, PREVIEW_COUNT).map((article) =>
    localizeArticle(article, locale)
  );
  const products = await getJournalProducts(
    articles.flatMap((article) =>
      article.hero.kind === "product" ? [article.hero.productSlug] : []
    )
  );
  const journal = getDictionary(locale).journal;

  return (
    <section className="shelf-section shelf-section--journal-preview" aria-labelledby="journal-preview-title">
      <div className="shelf-wrap">
        <div className="shelf-heading-row journal-preview-heading">
          <div>
            <h2 id="journal-preview-title" className="shelf-heading">
              {journal.title}
            </h2>
            <p className="journal-preview-intro">{journal.intro}</p>
          </div>
          <Link href="/blog" className="shelf-link journal-preview-all">
            {journal.explore} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className="journal-preview-grid">
          {articles.map((article) => {
            const image =
              article.hero.kind === "product" &&
              !products.get(article.hero.productSlug)?.images[0]
                ? {
                    kind: "file" as const,
                    src: FALLBACK_IMAGE,
                    alt: article.hero.alt,
                    altIt: article.hero.altIt,
                    rights: { credit: "Perla Murano Glass", license: "own-photography" as const },
                  }
                : article.hero;

            return (
              <li key={article.slug}>
                <article className="journal-preview-card">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="journal-preview-image"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <JournalImage
                      image={image}
                      products={products}
                      sizes="(min-width: 48rem) 28vw, 7.5rem"
                      locale={article.contentLocale}
                      creditLabel={(credit) => applyTemplate(journal.photoCredit, { credit })}
                    />
                  </Link>

                  <div className="journal-preview-copy">
                    <p className="journal-preview-kicker">
                      {categoryLabel(journal, article.category)}
                      {article.series && ` · ${article.series.episode}/${article.series.total}`}
                    </p>
                    <h3 lang={article.contentLocale}>
                      <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="journal-preview-meta">
                      {applyTemplate(journal.minRead, { n: readingMinutes(article) })}
                    </p>
                    <p className="journal-preview-description" lang={article.contentLocale}>
                      {article.description}
                    </p>
                    {article.contentLocale !== locale && (
                      <p className="journal-preview-language">{journal.englishOnly}</p>
                    )}
                    <Link
                      href={`/blog/${article.slug}`}
                      className="journal-preview-read"
                      aria-label={`${journal.readMore}: ${article.title}`}
                    >
                      {journal.readMore} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function categoryLabel(
  journal: ReturnType<typeof getDictionary>["journal"],
  category: JournalCategory
) {
  const labels: Record<JournalCategory, string> = {
    history: journal.catHistory,
    craft: journal.catCraft,
    buying: journal.catBuying,
    care: journal.catCare,
    gifting: journal.catGifting,
  };
  return labels[category];
}
