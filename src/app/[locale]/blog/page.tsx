import type { ReactNode } from "react";
import { LayoutSection } from "@/components/layout-section";
import { pageEntries } from "@/lib/page-layout-store";
import type { JOURNAL_SECTIONS } from "@/lib/page-layout";
import { withPageMeta } from "@/lib/page-meta";
import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { articlePath, localizeArticle, readingMinutes } from "@/lib/journal";
import { getAllArticles } from "@/lib/journal/db-articles";
import type { JournalCategory, LocalizedArticle } from "@/lib/journal/types";
import { getJournalProducts } from "@/lib/journal/products";
import { JournalImage, journalImageSrc } from "@/components/journal/journal-image";
import { homeFontClasses } from "@/app/home-fonts";
import { hreflangAlternates, localizedCanonical, ogLocale } from "@/lib/hreflang";
import { fitTitle } from "@/lib/seo-text";
import { shareImageUrl } from "@/lib/optimized-image";
import { siteBaseUrl } from "@/lib/site-url";
import { toSafeJsonLd } from "@/lib/json-ld";
import { categoryLabel, formatArticleDate } from "./journal-shared";
import "../../home.css";
import "./journal.css";
import "./journal-simple.css";

const CATEGORIES: JournalCategory[] = ["history", "craft", "buying", "care", "gifting"];

// The journal's own name says little to someone searching, so English and
// Italian get a title naming what the articles cover, and a description
// listing the actual subjects. Other languages keep the name and the intro.
const SEARCH_COPY: Partial<Record<Locale, { title: string; description: string }>> = {
  en: {
    title: "The Murano Journal: Glass History, Techniques and Care",
    description:
      "Articles on Murano glass: what changed in 1291, cristallo and lattimo, filigrana and murrine, Venetian beads, spotting imitations and caring for jewelry.",
  },
  it: {
    title: "Storie di Murano: storia, tecniche e cura del vetro",
    description:
      "Articoli sul vetro di Murano: cosa cambiò nel 1291, cristallo e lattimo, filigrana e murrine, perle veneziane, imitazioni e cura dei gioielli.",
  },
};

async function baseMetadata(): Promise<Metadata> {
  const [settings, locale, articles] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getAllArticles(),
  ]);
  const dict = getDictionary(locale).journal;
  const copy = SEARCH_COPY[locale];
  const title = copy?.title ?? dict.title;
  const description = copy?.description ?? dict.intro;
  // The newest article's photograph, as on the page itself, rather than the
  // store-wide share image.
  const latest = articles[0];
  const products = await getJournalProducts(
    latest?.hero.kind === "product" ? [latest.hero.productSlug] : []
  );
  const hero = latest ? journalImageSrc(latest.hero, products) : null;
  const image = hero ? shareImageUrl(hero) : ogImage(settings);
  return {
    title: fitTitle([title], settings.storeName),
    description,
    alternates: {
      canonical: localizedCanonical(locale, "/blog"),
      languages: hreflangAlternates("/blog"),
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: ogLocale(locale),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return withPageMeta("/blog", await baseMetadata());
}

type JournalSectionId = (typeof JOURNAL_SECTIONS)[number]["id"];

export default async function JournalIndexPage({ searchParams }: PageProps<"/[locale]/blog">) {
  const entries = await pageEntries("journal");
  const [{ category }, uiLocale] = await Promise.all([searchParams, getLocale()]);
  const dict = getDictionary(uiLocale);
  const j = dict.journal;
  const ARTICLES = await getAllArticles();
  const active = CATEGORIES.find((c) => c === category) ?? null;
  const articles = ARTICLES.filter((a) => !active || a.category === active);
  // Only offer filters that have articles behind them.
  const categories = CATEGORIES.filter((c) => ARTICLES.some((a) => a.category === c));
  const products = await getJournalProducts(
    articles.flatMap((a) => (a.hero.kind === "product" ? [a.hero.productSlug] : []))
  );
  const [featured, ...rest] = articles;

  const settings = await getStoreSettings();
  const base = siteBaseUrl(settings);
  const blogUrl = `${base}${localizedCanonical(uiLocale, "/blog")}`;
  // The journal as a Blog whose posts are the articles, each at the URL of
  // the language it is actually written in (an untranslated article is the
  // English page), plus the trail back to the home page.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: j.title,
      description: SEARCH_COPY[uiLocale]?.description ?? j.intro,
      url: blogUrl,
      inLanguage: uiLocale,
      publisher: { "@type": "Organization", name: settings.storeName, url: base },
      blogPost: ARTICLES.map((source) => {
        const article = localizeArticle(source, uiLocale);
        return {
          "@type": "BlogPosting",
          headline: article.title,
          description: article.description,
          url: `${base}${articlePath(article.slug, article.contentLocale)}`,
          inLanguage: article.contentLocale,
          datePublished: article.published,
          dateModified: article.updated ?? article.published,
        };
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: settings.storeName,
          item: `${base}${localizedCanonical(uiLocale, "/")}`,
        },
        { "@type": "ListItem", position: 2, name: j.title, item: blogUrl },
      ],
    },
  ];

  const sections: Record<JournalSectionId, ReactNode> = {
    head: (
      <header className="journal-index-head shelf-wrap">
        <h1 className="shelf-heading">{j.title}</h1>
        <p className="journal-index-intro">{j.intro}</p>
        <nav aria-label={j.title} className="journal-filters">
          <Link href="/blog" aria-current={active ? undefined : "page"}>
            {j.filterAll}
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/blog?category=${c}`}
              aria-current={active === c ? "page" : undefined}
            >
              {categoryLabel(j, c)}
            </Link>
          ))}
        </nav>
      </header>
    ),
    list: (
      <>
        <div className="shelf-wrap journal-index-list">
          {featured && (
            <article className="journal-card journal-card--featured">
              <Link
                href={`/blog/${featured.slug}`}
                className="journal-card-image"
                tabIndex={-1}
                aria-hidden="true"
              >
                <JournalImage
                  image={featured.hero}
                  products={products}
                  sizes="(min-width: 48rem) 55vw, 100vw"
                  priority
                  locale={localizeArticle(featured, uiLocale).contentLocale}
                  creditLabel={(credit) => applyTemplate(j.photoCredit, { credit })}
                />
              </Link>
              <ArticleCardText
                article={localizeArticle(featured, uiLocale)}
                dict={dict}
                locale={uiLocale}
                requestedLocale={uiLocale}
              />
            </article>
          )}
          {rest.map((article) => (
            <article key={article.slug} className="journal-card">
              <Link
                href={`/blog/${article.slug}`}
                className="journal-card-image"
                tabIndex={-1}
                aria-hidden="true"
              >
                <JournalImage
                  image={article.hero}
                  products={products}
                  sizes="(min-width: 48rem) 16rem, 40vw"
                  locale={localizeArticle(article, uiLocale).contentLocale}
                  creditLabel={(credit) => applyTemplate(j.photoCredit, { credit })}
                />
              </Link>
              <ArticleCardText
                article={localizeArticle(article, uiLocale)}
                dict={dict}
                locale={uiLocale}
                requestedLocale={uiLocale}
              />
            </article>
          ))}
        </div>
      </>
    ),
  };

  return (
    <main className={`shelf journal ${homeFontClasses}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonLd(jsonLd) }} />
      {entries.map((entry) => (
        <LayoutSection key={entry.id} entry={entry}>
          {entry.custom ? null : sections[entry.id as JournalSectionId]}
        </LayoutSection>
      ))}
    </main>
  );
}

function ArticleCardText({
  article,
  dict,
  locale,
  requestedLocale,
}: {
  article: LocalizedArticle;
  dict: ReturnType<typeof getDictionary>;
  locale: string;
  requestedLocale: string;
}) {
  const j = dict.journal;
  return (
    <div className="journal-card-text">
      <p className="journal-kicker">
        {categoryLabel(j, article.category)}
        {article.series && (
          <>
            {" "}
            · {article.series.episode}/{article.series.total}
          </>
        )}
      </p>
      <h2 lang={article.contentLocale}>
        <Link href={`/blog/${article.slug}`}>{article.title}</Link>
      </h2>
      <p className="journal-card-meta">
        {applyTemplate(j.minRead, { n: readingMinutes(article) })} ·{" "}
        {formatArticleDate(article.published, locale)}
      </p>
      <p className="journal-card-description" lang={article.contentLocale}>
        {article.description}
      </p>
      {article.contentLocale !== requestedLocale && (
        <p className="journal-language-note">{j.englishOnly}</p>
      )}
      <Link
        href={`/blog/${article.slug}`}
        className="journal-read-more"
        aria-label={`${j.readMore}: ${article.title}`}
      >
        {j.readMore} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
