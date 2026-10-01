import type { CSSProperties } from "react";
import { Link } from "@/components/localized-link";
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
  /* The observer applies data-editorial-state to the copy and image wrapper. */
  const KIND_ORDER = { necklace: 0, bracelet: 1, earrings: 2 } as const;
  const orderedPieces = [...look.pieces]
    .map((piece, i) => ({ piece, i }))
    .sort(
      (a, b) =>
        (KIND_ORDER[a.piece.kind ?? "earrings"] ?? 3) -
        (KIND_ORDER[b.piece.kind ?? "earrings"] ?? 3)
    );
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
    orderedPieces.map(
      ({ piece, i }) =>
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
      {/* The photograph is still; the name below is the way in. The observer
          marks this wrapper and the copy column as the two editorial parts. */}
      <div className="look-editorial-zoom" data-editorial-part>
        <Link href={href} className="look-editorial-visual" tabIndex={-1} aria-hidden="true">
          {visual}
        </Link>
      </div>
      <div className="look-editorial-copy" data-editorial-part>
        {/* The editorial index: a numeral and a rule, the same device the
            collection showcase uses. Decorative — the heading already names
            the look — so it is hidden from assistive tech rather than read
            out as a second, competing count. */}
        <p className="look-editorial-index" aria-hidden="true">
          <span>{String(index + 1).padStart(2, "0")}</span>
        </p>
        {/* The name is the link; the way in is the button beneath. The arrow
            that used to ride on the title is gone: with a real call to action
            below it was a second affordance for the same destination, and it
            had no space before it, so it printed as "Rosso Rubino→" and hung
            past the copy column's right edge. */}
        <Heading id={`look-title-${look.id}`} className="look-editorial-title">
          <Link href={href}>{look.name}</Link>
        </Heading>
        <p className="look-editorial-description">{labels.description}</p>
        <p className="look-editorial-price">
          <span>{money(look.pricing.setTotal)}</span>
          {look.discountPercent > 0 && <s>{money(look.pricing.individualTotal)}</s>}
          {look.discountPercent > 0 && (
            <span className="look-editorial-saving">
              {applyTemplate(labels.save, { percent: look.discountPercent })}
            </span>
          )}
        </p>
        {/* The call to action, in the site's own button. `labels.view` is the
            existing localised label for this destination (looks.viewLook) —
            it was already being passed in and never rendered. */}
        <Link href={href} className="btn-primary look-editorial-cta">
          {labels.view}
          <span className="look-editorial-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
