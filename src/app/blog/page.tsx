import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { ARTICLES, readingMinutes } from "@/lib/journal";
import type { JournalCategory } from "@/lib/journal/types";
import { getJournalProducts } from "@/lib/journal/products";
import { JournalImage } from "@/components/journal/journal-image";
import { homeFontClasses } from "@/app/home-fonts";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { categoryLabel, formatArticleDate } from "./journal-shared";
import "../home.css";
import "./journal.css";

const CATEGORIES: JournalCategory[] = ["history", "craft", "buying", "care", "gifting"];

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale).journal;
  const image = ogImage(settings);
  return {
    title: dict.title,
    description: dict.intro,
    alternates: { canonical: localizedCanonical(locale, "/blog"), languages: hreflangAlternates("/blog") },
    openGraph: {
      title: dict.title,
      description: dict.intro,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function JournalIndexPage({ searchParams }: PageProps<"/blog">) {
  const [{ category }, settings, uiLocale] = await Promise.all([
    searchParams,
    getStoreSettings(),
    getLocale(),
  ]);
  const dict = getDictionary(uiLocale);
  const j = dict.journal;
  const active = CATEGORIES.find((c) => c === category) ?? null;
  const articles = ARTICLES.filter((a) => !active || a.category === active);
  // Only offer filters that have articles behind them.
  const categories = CATEGORIES.filter((c) => ARTICLES.some((a) => a.category === c));
  const products = await getJournalProducts(
    articles.flatMap((a) => (a.hero.kind === "product" ? [a.hero.productSlug] : []))
  );
  const [featured, ...rest] = articles;

  return (
    <main className={`shelf journal ${homeFontClasses}`}>
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
                creditLabel={(credit) => applyTemplate(j.photoCredit, { credit })}
              />
            </Link>
            <ArticleCardText article={featured} dict={dict} locale={settings.defaultLocale} />
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
                creditLabel={(credit) => applyTemplate(j.photoCredit, { credit })}
              />
            </Link>
            <ArticleCardText article={article} dict={dict} locale={settings.defaultLocale} />
          </article>
        ))}
      </div>
    </main>
  );
}

function ArticleCardText({
  article,
  dict,
  locale,
}: {
  article: (typeof ARTICLES)[number];
  dict: ReturnType<typeof getDictionary>;
  locale: string;
}) {
  const j = dict.journal;
  return (
    <div className="journal-card-text">
      <p className="journal-kicker">{categoryLabel(j, article.category)}</p>
      <h2 lang="en">
        <Link href={`/blog/${article.slug}`}>{article.title}</Link>
      </h2>
      <p className="journal-card-meta">
        {applyTemplate(j.minRead, { n: readingMinutes(article) })} ·{" "}
        {formatArticleDate(article.published, locale)}
      </p>
      <p className="journal-card-description" lang="en">
        {article.description}
      </p>
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
