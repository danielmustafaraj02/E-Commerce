import Link from "next/link";
import { ARTICLES, readingMinutes } from "@/lib/journal";
import { getJournalProducts } from "@/lib/journal/products";
import { applyTemplate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { JournalImage } from "@/components/journal/journal-image";
import { categoryLabel } from "@/app/blog/journal-shared";
import "@/app/blog/journal.css";

// "The Murano Journal" on the homepage: the newest article large, two more
// beside it, and a link to the rest.
export async function JournalTeaser({ dict }: { dict: Dictionary["journal"] }) {
  const articles = ARTICLES.slice(0, 3);
  if (articles.length === 0) return null;
  const products = await getJournalProducts(
    articles.flatMap((a) => (a.hero.kind === "product" ? [a.hero.productSlug] : []))
  );
  const credit = (c: string) => applyTemplate(dict.photoCredit, { credit: c });

  return (
    <section className="shelf-section" aria-labelledby="journal-teaser-title">
      <div className="shelf-wrap">
        <div className="shelf-heading-row">
          <div>
            <h2 id="journal-teaser-title" className="shelf-heading">
              {dict.title}
            </h2>
            <p className="journal-index-intro">{dict.intro}</p>
          </div>
          <Link href="/blog" className="shelf-link">
            {dict.explore} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="journal-teaser">
          {articles.map((article, i) => (
            <li key={article.slug} className={i === 0 ? "journal-teaser-featured" : undefined}>
              <Link href={`/blog/${article.slug}`}>
                <JournalImage
                  image={article.hero}
                  products={products}
                  sizes={
                    i === 0 ? "(min-width: 48rem) 50vw, 100vw" : "(min-width: 48rem) 25vw, 100vw"
                  }
                  creditLabel={credit}
                />
                <span className="journal-kicker">{categoryLabel(dict, article.category)}</span>
                <span className="journal-related-title" lang="en">
                  {article.title}
                </span>
                <span className="journal-card-meta">
                  {applyTemplate(dict.minRead, { n: readingMinutes(article) })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
