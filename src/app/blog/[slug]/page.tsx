import { Link } from "@/components/localized-link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/store-settings";
import { siteBaseUrl } from "@/lib/site-url";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { toSafeJsonLd, absoluteUrl } from "@/lib/json-ld";
import {
  ARTICLES,
  articleLanguages,
  articlePath,
  articleProductSlugs,
  localizeArticle,
  readingMinutes,
  relatedArticles,
  seriesArticles,
} from "@/lib/journal";
import { findArticle } from "@/lib/journal/db-articles";
import type { Source } from "@/lib/journal/types";
import { getJournalProducts } from "@/lib/journal/products";
import { ArticleBody, InlineText } from "@/components/journal/article-body";
import { JournalImage, journalImageSrc } from "@/components/journal/journal-image";
import { homeFontClasses } from "@/app/home-fonts";
import { categoryLabel, formatArticleDate } from "../journal-shared";
import "../../home.css";
import "../journal.css";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const source = await findArticle(slug);
  if (!source) return {};
  const [uiLocale, products] = await Promise.all([
    getLocale(),
    getJournalProducts(articleProductSlugs(source)),
  ]);
  const article = localizeArticle(source, uiLocale);
  const image = journalImageSrc(article.hero, products);
  const canonical = articlePath(article.slug, article.contentLocale);
  const languages = articleLanguages(source);
  const alternateLocale = source.translations?.it
    ? article.contentLocale === "it"
      ? ["en_US"]
      : ["it_IT"]
    : undefined;
  return {
    title: article.seoTitle,
    description: article.description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: article.seoTitle,
      description: article.description,
      type: "article",
      locale: article.contentLocale === "it" ? "it_IT" : "en_US",
      alternateLocale,
      publishedTime: article.published,
      modifiedTime: article.updated ?? article.published,
      images: image
        ? [
            {
              url: image,
              alt:
                article.contentLocale === "it"
                  ? (article.hero.altIt ?? article.hero.alt)
                  : article.hero.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle,
      description: article.description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function JournalArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const source = await findArticle(slug);
  if (!source) notFound();

  const relatedHeroSlugs = source.related.flatMap((relatedSlug) => {
    const relatedArticle = ARTICLES.find((a) => a.slug === relatedSlug);
    return relatedArticle?.hero.kind === "product" ? [relatedArticle.hero.productSlug] : [];
  });
  const [settings, uiLocale, products] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getJournalProducts([...articleProductSlugs(source), ...relatedHeroSlugs]),
  ]);
  const dict = getDictionary(uiLocale);
  const j = dict.journal;
  const article = localizeArticle(source, uiLocale);
  const contentJournal = getDictionary(article.contentLocale).journal;
  const related = relatedArticles(source, uiLocale);
  const episodes = seriesArticles(source, uiLocale);
  const base = siteBaseUrl(settings);
  const url = `${base}${articlePath(article.slug, article.contentLocale)}`;
  const heroSrc = journalImageSrc(article.hero, products);
  const credit = (c: string) => applyTemplate(j.photoCredit, { credit: c });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      inLanguage: article.contentLocale,
      mainEntityOfPage: url,
      datePublished: article.published,
      dateModified: article.updated ?? article.published,
      image: heroSrc ? [absoluteUrl(heroSrc, base)] : undefined,
      author: { "@type": "Organization", name: settings.storeName, url: base },
      publisher: { "@type": "Organization", name: settings.storeName, url: base },
      citation: article.sources.map((s) => s.url),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: settings.storeName,
          item: `${base}/${article.contentLocale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: contentJournal.title,
          item: `${base}/${article.contentLocale}/blog`,
        },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  return (
    <main className={`shelf journal ${homeFontClasses}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(jsonLd) }}
      />

      <article className="journal-article" lang={article.contentLocale}>
        <JournalImage
          image={article.hero}
          products={products}
          sizes="(min-width: 64rem) 60rem, 100vw"
          priority
          className="journal-hero"
          creditLabel={credit}
          locale={article.contentLocale}
        />

        <header className="journal-article-head">
          <nav aria-label="Breadcrumb" className="journal-breadcrumb" lang={uiLocale}>
            <Link href="/blog">{j.title}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/blog?category=${article.category}`}>
              {categoryLabel(j, article.category)}
            </Link>
          </nav>
          {article.series && (
            <p className="journal-series-kicker" lang={article.contentLocale}>
              {article.contentLocale === "it" ? article.series.titleIt : article.series.title}
              {" · "}
              {article.contentLocale === "it" ? "Episodio" : "Episode"} {article.series.episode}{" "}
              {article.contentLocale === "it" ? "di" : "of"} {article.series.total}
            </p>
          )}
          <h1 lang={article.contentLocale}>{article.title}</h1>
          <p className="journal-card-meta" lang={uiLocale}>
            {applyTemplate(j.minRead, { n: readingMinutes(article) })} ·{" "}
            {applyTemplate(j.published, {
              date: formatArticleDate(article.published, article.contentLocale),
            })}
            {article.updated && (
              <>
                {" · "}
                {applyTemplate(j.updated, {
                  date: formatArticleDate(article.updated, article.contentLocale),
                })}
              </>
            )}
            {" · "}
            {j.byline}
          </p>
          {article.contentLocale !== uiLocale && (
            <p className="journal-language-note" lang={uiLocale}>
              {j.englishOnly}
            </p>
          )}
        </header>

        <div className="journal-prose" lang={article.contentLocale}>
          <p className="journal-intro">
            <InlineText text={article.intro} />
          </p>
          <ArticleBody
            blocks={article.body}
            products={products}
            locale={settings.defaultLocale}
            uiLocale={uiLocale}
            labels={{
              outOfStock: dict.product.outOfStock,
              addToCart: dict.product.addToCart,
              added: dict.product.added,
              photoCredit: credit,
            }}
          />

          {article.sources.length > 0 && (
            <section className="journal-sources" aria-labelledby="journal-sources-title">
              <h2 id="journal-sources-title" lang={uiLocale}>
                {j.sources}
              </h2>
              <ul>
                {article.sources.map((source) => (
                  <li key={source.url}>
                    <p className="journal-source-heading">
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.title}
                      </a>
                    </p>
                    <p className="journal-source-meta">
                      {source.author ? `${source.author}. ` : ""}
                      {source.publisher}
                      {source.published ? ` · ${source.published}` : ""}
                      {source.locator ? ` · ${source.locator}` : ""}
                      {" · "}
                      {article.contentLocale === "it" ? "Consultato" : "Accessed"}{" "}
                      {formatArticleDate(source.accessed, article.contentLocale)}
                      {source.kind && <> · {sourceKindLabel(source.kind, article.contentLocale)}</>}
                    </p>
                    <p className="journal-source-note">
                      {article.contentLocale === "it"
                        ? (source.usedForIt ?? source.usedFor)
                        : source.usedFor}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>

      {episodes.length > 0 && article.series && (
        <nav
          className="journal-series"
          aria-label={
            article.contentLocale === "it" ? article.series.titleIt : article.series.title
          }
          lang={article.contentLocale}
        >
          <div className="shelf-wrap">
            <p className="journal-kicker">
              {article.contentLocale === "it" ? "Percorso completo" : "The complete series"}
            </p>
            <h2>
              {article.contentLocale === "it" ? article.series.titleIt : article.series.title}
            </h2>
            <ol>
              {episodes.map((episode) => (
                <li key={episode.slug}>
                  {episode.slug === article.slug ? (
                    <span aria-current="page">
                      <span className="journal-series-number">{episode.series?.episode}</span>
                      {episode.title}
                    </span>
                  ) : (
                    <Link href={`/blog/${episode.slug}`}>
                      <span className="journal-series-number">{episode.series?.episode}</span>
                      {episode.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}

      {related.length > 0 && (
        <section
          className="shelf-section shelf-section--sand"
          aria-labelledby="journal-related-title"
        >
          <div className="shelf-wrap">
            <h2 id="journal-related-title" className="shelf-heading">
              {j.related}
            </h2>
            <ul className="journal-related">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`}>
                    <JournalImage
                      image={r.hero}
                      products={products}
                      sizes="(min-width: 48rem) 22rem, 100vw"
                      creditLabel={credit}
                      locale={r.contentLocale}
                    />
                    <span className="journal-kicker">{categoryLabel(j, r.category)}</span>
                    <span className="journal-related-title" lang={r.contentLocale}>
                      {r.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}

function sourceKindLabel(kind: NonNullable<Source["kind"]>, locale: string) {
  const labels = {
    en: {
      primary: "Primary source",
      scholarly: "Scholarly research",
      institutional: "Museum or institutional source",
      reference: "Reference work",
    },
    it: {
      primary: "Fonte primaria",
      scholarly: "Studio scientifico",
      institutional: "Fonte museale o istituzionale",
      reference: "Opera di consultazione",
    },
  };
  return labels[locale === "it" ? "it" : "en"][kind];
}
