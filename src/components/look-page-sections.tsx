import { Link } from "@/components/localized-link";
import { CatalogImage } from "@/components/catalog-image";
import { ExpandableText } from "@/components/expandable-text";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { LookPageCopy } from "@/lib/i18n/look-page-copy";
import type { LookPieceDetails, LookView } from "@/lib/look-data";
import { PRODUCT_COLOR_SWATCH } from "@/lib/product-colors";
import "./look-page.css";

// The sections under a look's showcase (app/looks/[id]): each piece with its
// own description and story, the reasons to choose the set, and the pages to
// read before buying. Server components; the motion is CSS only (look-page.css).

export function LookPieces({
  look,
  details,
  copy,
  dict,
  moneyLocale,
}: {
  look: LookView;
  details: Record<string, LookPieceDetails>;
  copy: LookPageCopy;
  dict: Dictionary;
  moneyLocale: string;
}) {
  return (
    <section className="shelf-section lp-pieces" aria-labelledby="lp-pieces-title">
      <div className="shelf-wrap lp-wrap">
        <header className="lp-head">
          <h2 id="lp-pieces-title" className="shelf-heading">
            {copy.piecesTitle}
          </h2>
          <p className="lp-lede">{copy.piecesIntro}</p>
        </header>

        <ul className="lp-piece-list">
          {look.pieces.map((piece) => {
            const info = details[piece.productId];
            const href = `/products/${piece.slug}`;
            return (
              <li key={piece.productId} className="lp-piece">
                {/* The photo repeats the name's link for pointer users only. */}
                <Link href={href} className="lp-piece-photo" tabIndex={-1} aria-hidden="true">
                  {piece.imageUrl && (
                    <CatalogImage
                      src={piece.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 52rem) 28rem, 90vw"
                    />
                  )}
                </Link>

                <div className="lp-piece-text">
                  <h3 className="lp-piece-name">
                    <Link href={href}>{piece.name}</Link>
                  </h3>

                  <p className="lp-piece-price">
                    <span>{formatMoney(piece.price, piece.currency, moneyLocale)}</span>
                    <span className="lp-piece-stock" data-available={piece.available}>
                      {piece.available ? copy.available : dict.product.outOfStock}
                    </span>
                  </p>

                  {info && (info.sizeKey || info.color) && (
                    <dl className="lp-piece-facts">
                      {info.sizeKey && (
                        <div>
                          <dt>{dict.product.sizeLabel}</dt>
                          <dd>{dict.product[info.sizeKey]}</dd>
                        </div>
                      )}
                      {info.color && (
                        <div>
                          <dt>{dict.products.colorLabel}</dt>
                          <dd>
                            <span
                              className="lp-swatch"
                              style={{ background: PRODUCT_COLOR_SWATCH[info.color] }}
                              aria-hidden="true"
                            />
                            {dict.products.colors[info.color]}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}

                  {info?.description && (
                    <ExpandableText
                      text={info.description}
                      moreLabel={dict.journal.readMore}
                      lessLabel={dict.product.readLess}
                      className="lp-piece-description"
                    />
                  )}

                  {info?.story && (
                    <div className="lp-piece-story">
                      <h4>{copy.storyLabel}</h4>
                      <p>{info.story}</p>
                    </div>
                  )}

                  <Link href={href} className="lp-link">
                    {copy.viewPiece} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function LookWhy({
  copy,
  percents,
}: {
  copy: LookPageCopy;
  percents: { set: number; pair: number };
}) {
  return (
    <section className="shelf-section shelf-section--sand lp-why" aria-labelledby="lp-why-title">
      <div className="shelf-wrap lp-why-grid">
        <header className="lp-why-head">
          <h2 id="lp-why-title" className="shelf-heading">
            {copy.whyTitle}
          </h2>
          <p className="lp-lede">{copy.whyIntro}</p>
        </header>
        <ul className="lp-why-list">
          {copy.why.map((reason) => (
            <li key={reason.title} className="lp-why-item">
              <h3>{reason.title}</h3>
              <p>{applyTemplate(reason.body, percents)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LookLearnMore({
  copy,
  dict,
  composedPercent,
}: {
  copy: LookPageCopy;
  dict: Dictionary;
  composedPercent: number;
}) {
  const links = [
    { href: "/murano-glass", title: dict.footer.muranoGuide, body: copy.learn.guide },
    {
      href: "/blog/how-to-care-for-murano-glass-jewelry",
      title: copy.learn.careTitle,
      body: copy.learn.care,
    },
    {
      href: "/looks/compose",
      title: dict.looks.composeTitle,
      body: applyTemplate(dict.looks.composeSubtitle, { percent: composedPercent }),
    },
    { href: "/gift-finder", title: copy.learn.giftTitle, body: copy.learn.gift },
    { href: "/legal/returns", title: dict.footer.returns, body: copy.learn.returns },
    { href: "/about", title: dict.footer.about, body: copy.learn.about },
  ];

  return (
    <section className="shelf-section lp-learn" aria-labelledby="lp-learn-title">
      <div className="shelf-wrap lp-wrap">
        <h2 id="lp-learn-title" className="shelf-heading lp-learn-heading">
          {copy.learnTitle}
        </h2>
        <ul className="lp-learn-list">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="lp-learn-link">
                <span className="lp-learn-title">{link.title}</span>
                <span className="lp-learn-body">{link.body}</span>
                <span className="lp-learn-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
