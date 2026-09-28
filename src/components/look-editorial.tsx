import type { CSSProperties } from "react";
import { Link } from "@/components/localized-link";
import { PointerZoom } from "@/components/pointer-zoom";
import { CatalogImage } from "@/components/catalog-image";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import { lookComposition } from "@/lib/look-composition";
import type { LookView } from "@/lib/look-data";
import "./look-editorial.css";

export function LookEditorial({
  look,
  locale,
  labels,
  index,
  priority = false,
  heading = "h3",
}: {
  look: LookView;
  locale: string;
  index: number;
  priority?: boolean;
  heading?: "h2" | "h3";
  labels: {
    view: string;
    save: string;
    pieces: string;
    description: string;
    included: string;
    price: string;
  };
}) {
  const Heading = heading;
  const href = `/looks/${look.id}`;
  const money = (value: number) => formatMoney(value, look.pieces[0].currency, locale);
  const placements = lookComposition(
    look.pieces.map((piece) => ({ kind: piece.kind, selected: true }))
  );
  // A look is either one composed photograph or several placed pieces, and the
  // zoom has to work either way: a single photo magnifies as a whole, a composed
  // look magnifies whichever accessory is under the pointer, one at a time.
  const visual = look.imageUrl ? (
    <CatalogImage
      src={look.imageUrl}
      alt=""
      fill
      sizes="(min-width: 80rem) 44rem, (min-width: 52rem) 55vw, 100vw"
      loading={priority ? "eager" : "lazy"}
    />
  ) : (
    look.pieces.map(
      (piece, i) =>
        piece.imageUrl && (
          <div
            key={piece.productId}
            className="look-editorial-piece"
            style={
              {
                "--piece-x": placements[i].mobile.x,
                "--piece-y": placements[i].mobile.y,
                "--piece-size": placements[i].mobile.s,
              } as CSSProperties
            }
          >
            <CatalogImage
              src={piece.imageUrl}
              alt=""
              fill
              sizes="(min-width: 80rem) 30rem, (min-width: 52rem) 36vw, 75vw"
              loading={priority ? "eager" : "lazy"}
            />
          </div>
        )
    )
  );
  return (
    <article className="look-editorial" aria-labelledby={`look-title-${look.id}`}>
      <PointerZoom className="look-editorial-zoom" scale={look.imageUrl ? 1.1 : 1.2}>
        <Link href={href} className="look-editorial-visual" tabIndex={-1} aria-hidden="true">
          {visual}
        </Link>
      </PointerZoom>
      <div className="look-editorial-copy">
        <p className="look-editorial-kicker">
          <span>{String(index + 1).padStart(2, "0")}</span>
          {applyTemplate(labels.pieces, { n: look.pieces.length })}
        </p>
        <Heading id={`look-title-${look.id}`} className="look-editorial-title">
          <Link href={href}>{look.name}</Link>
        </Heading>
        <p className="look-editorial-description">{labels.description}</p>
        <p className="look-editorial-label">{labels.included}</p>
        <ul className="look-editorial-included">
          {look.pieces.map((piece) => (
            <li key={piece.productId}>
              <Link href={`/products/${piece.slug}`}>{piece.name}</Link>
            </li>
          ))}
        </ul>
        <div className="look-editorial-purchase">
          <p className="look-editorial-label">{labels.price}</p>
          <p className="look-editorial-price">
            <span>{money(look.pricing.setTotal)}</span>
            {look.discountPercent > 0 && <s>{money(look.pricing.individualTotal)}</s>}
          </p>
          {look.discountPercent > 0 && (
            <p className="look-editorial-saving">
              {applyTemplate(labels.save, { percent: look.discountPercent })}
            </p>
          )}
          <Link href={href} className="look-editorial-cta">
            {labels.view}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
