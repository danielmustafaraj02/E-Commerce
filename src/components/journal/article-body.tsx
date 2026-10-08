import { Link } from "@/components/localized-link";
import { ShelfItem } from "@/components/shelf-item";
import { JournalImage } from "@/components/journal/journal-image";
import { parseInline } from "@/lib/journal";
import { localizedCardProduct } from "@/lib/product-i18n";
import { videoEmbedUrl } from "@/lib/journal/article-schema";
import type { Block } from "@/lib/journal/types";
import type { JournalProductMap } from "@/lib/journal/products";
import type { Locale } from "@/lib/i18n/locale";

// Paragraph text with [label](href) links: internal ones via next/link,
// sources in a new tab.
// **bold** and *italic* are supported in plain text too.
function Emphasis({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/)
        .map((piece, i) =>
          piece.startsWith("**") && piece.endsWith("**") && piece.length > 4 ? (
            <strong key={i}>{piece.slice(2, -2)}</strong>
          ) : piece.startsWith("*") && piece.endsWith("*") && piece.length > 2 ? (
            <em key={i}>{piece.slice(1, -1)}</em>
          ) : (
            piece
          )
        )}
    </>
  );
}

export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) =>
        !("href" in part) ? (
          <Emphasis key={i} text={part.text} />
        ) : part.href.startsWith("/") ? (
          <Link key={i} href={part.href}>
            {part.text}
          </Link>
        ) : (
          <a key={i} href={part.href} target="_blank" rel="noopener noreferrer">
            {part.text}
          </a>
        )
      )}
    </>
  );
}

export function ArticleBody({
  blocks,
  products,
  locale,
  uiLocale,
  labels,
}: {
  blocks: Block[];
  products: JournalProductMap;
  locale: string;
  uiLocale: Locale;
  labels: {
    outOfStock: string;
    addToCart: string;
    added: string;
    photoCredit: (credit: string) => string;
  };
}) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i}>
                <InlineText text={block.text} />
              </p>
            );
          case "h2":
            return <h2 key={i}>{block.text}</h2>;
          case "h3":
            return <h3 key={i}>{block.text}</h3>;
          case "quote":
            return (
              <figure key={i} className="journal-quote">
                <blockquote>{block.text}</blockquote>
                {block.cite && <figcaption>{block.cite}</figcaption>}
              </figure>
            );
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <InlineText text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case "video": {
            const src = videoEmbedUrl(block.url);
            if (!src) return null;
            return (
              <figure key={i} className="journal-video">
                <iframe
                  className="journal-video-frame"
                  src={src}
                  title={block.caption || "Video"}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          }
          case "facts":
            return (
              <aside key={i} className="journal-facts">
                <p className="journal-facts-title">{block.title}</p>
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>
                      <InlineText text={item} />
                    </li>
                  ))}
                </ul>
              </aside>
            );
          case "image":
            return (
              <JournalImage
                key={i}
                image={block.image}
                products={products}
                sizes="(min-width: 48rem) 42rem, 100vw"
                className="journal-figure--inline"
                creditLabel={labels.photoCredit}
                locale={uiLocale}
              />
            );
          case "products": {
            const found = block.slugs.flatMap((slug) => {
              const product = products.get(slug);
              return product ? [product] : [];
            });
            if (found.length === 0) return null;
            return (
              <section key={i} className="journal-products" aria-label={block.title}>
                <p className="journal-facts-title">{block.title}</p>
                <ul className="shelf-row">
                  {found.map((product) => (
                    <ShelfItem
                      key={product.slug}
                      product={localizedCardProduct(product, uiLocale)}
                      locale={locale}
                      outOfStockLabel={labels.outOfStock}
                      quickAddLabel={labels.addToCart}
                      addedLabel={labels.added}
                      sizes="(min-width: 48rem) 13rem, 45vw"
                    />
                  ))}
                </ul>
              </section>
            );
          }
          case "cta":
            return (
              <p key={i} className="journal-cta">
                <Link href={block.href} className="shelf-button">
                  {block.text} <span aria-hidden="true">→</span>
                </Link>
              </p>
            );
        }
      })}
    </>
  );
}
