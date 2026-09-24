import Link from "next/link";
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
  articleProductSlugs,
  getArticle,
  readingMinutes,
  relatedArticles,
} from "@/lib/journal";
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
  const article = getArticle(slug);
  if (!article) return {};
  const products = await getJournalProducts(articleProductSlugs(article));
  const image = journalImageSrc(article.hero, products);
  const canonical = `/blog/${article.slug}`;
  return {
    title: article.seoTitle,
    description: article.description,
    alternates: { canonical },
    openGraph: {
      title: article.seoTitle,
      description: article.description,
      type: "article",
      publishedTime: article.published,
      modifiedTime: article.updated ?? article.published,
      images: image ? [{ url: image, alt: article.hero.alt }] : undefined,
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
  const article = getArticle(slug);
  if (!article) notFound();

  const [settings, uiLocale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(uiLocale);
  const j = dict.journal;
  const related = relatedArticles(article);
  const products = await getJournalProducts([
    ...articleProductSlugs(article),
    ...related.flatMap((r) => (r.hero.kind === "product" ? [r.hero.productSlug] : [])),
  ]);
  const base = siteBaseUrl(settings);
  const url = `${base}/blog/${article.slug}`;
  const heroSrc = journalImageSrc(article.hero, products);
  const credit = (c: string) => applyTemplate(j.photoCredit, { credit: c });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      inLanguage: "en",
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
        { "@type": "ListItem", position: 1, name: settings.storeName, item: base },
        { "@type": "ListItem", position: 2, name: j.title, item: `${base}/blog` },
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

      <article className="journal-article">
        <JournalImage
          image={article.hero}
          products={products}
          sizes="(min-width: 64rem) 60rem, 100vw"
          priority
          className="journal-hero"
          creditLabel={credit}
        />

        <header className="journal-article-head">
          <nav aria-label="Breadcrumb" className="journal-breadcrumb">
            <Link href="/blog">{j.title}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/blog?category=${article.category}`}>
              {categoryLabel(j, article.category)}
            </Link>
          </nav>
          <h1 lang="en">{article.title}</h1>
          <p className="journal-card-meta">
            {applyTemplate(j.minRead, { n: readingMinutes(article) })} ·{" "}
            {applyTemplate(j.published, {
              date: formatArticleDate(article.published, settings.defaultLocale),
            })}
            {article.updated && (
              <>
                {" · "}
                {applyTemplate(j.updated, {
                  date: formatArticleDate(article.updated, settings.defaultLocale),
                })}
              </>
            )}
            {" · "}
            {j.byline}
          </p>
          {uiLocale !== "en" && <p className="journal-language-note">{j.englishOnly}</p>}
        </header>

        <div className="journal-prose" lang="en">
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

          <section className="journal-sources" aria-labelledby="journal-sources-title">
            <h2 id="journal-sources-title">{j.sources}</h2>
            <ul>
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title}
                  </a>
                  {" — "}
                  {source.publisher}
                  {source.published ? ` (${source.published})` : ""}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>

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
                    />
                    <span className="journal-kicker">{categoryLabel(j, r.category)}</span>
                    <span className="journal-related-title" lang="en">
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
