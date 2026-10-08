import type { ReactNode } from "react";
import { LayoutSection } from "@/components/layout-section";
import { PreviewBridge } from "@/components/layout-preview-bridge-server";
import { isLayoutPreview } from "@/lib/layout-preview-server";
import { pageEntries } from "@/lib/page-layout-store";
import type { JOURNAL_SECTIONS } from "@/lib/page-layout";
import { withPageMeta } from "@/lib/page-meta";
import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { localizeArticle, readingMinutes } from "@/lib/journal";
import { getAllArticles } from "@/lib/journal/db-articles";
import type { JournalCategory, LocalizedArticle } from "@/lib/journal/types";
import { getJournalProducts } from "@/lib/journal/products";
import { JournalImage } from "@/components/journal/journal-image";
import { homeFontClasses } from "@/app/home-fonts";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { categoryLabel, formatArticleDate } from "./journal-shared";
import "../home.css";
import "./journal.css";

const CATEGORIES: JournalCategory[] = ["history", "craft", "buying", "care", "gifting"];

async function baseMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale).journal;
  const image = ogImage(settings);
  return {
    title: dict.title,
    description: dict.intro,
    alternates: {
      canonical: localizedCanonical(locale, "/blog"),
      languages: hreflangAlternates("/blog"),
    },
    openGraph: {
      title: dict.title,
      description: dict.intro,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return withPageMeta("/blog", await baseMetadata());
}

type JournalSectionId = (typeof JOURNAL_SECTIONS)[number]["id"];

export default async function JournalIndexPage({ searchParams }: PageProps<"/blog">) {
  const preview = await isLayoutPreview(searchParams);
  const entries = await pageEntries("journal", { preview });
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
      {entries.map((entry) => (
        <LayoutSection key={entry.id} entry={entry} preview={preview}>
          {entry.custom ? null : sections[entry.id as JournalSectionId]}
        </LayoutSection>
      ))}
      {preview && <PreviewBridge target="journal" />}
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
