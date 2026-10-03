import type { CSSProperties } from "react";
import { Link } from "@/components/localized-link";
import { CatalogImage } from "@/components/catalog-image";
import { LookPieceHover } from "@/components/look-piece-hover";
import { LookSinglePieces } from "@/components/look-single-pieces";
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
    // The word printed beside each piece ("Necklace"); the raw kind if absent.
    kinds?: Record<"necklace" | "bracelet" | "earrings", string>;
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
  const composed = !look.imageUrl;
  /* Images only — no <Link> children, to avoid <a> inside <a>. For composed
     looks the hover overlays (which do contain links) are placed as siblings
     of this <Link>, outside it. */
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
        {/* Hover overlays for composed looks: same positioning as the images
            above but rendered OUTSIDE the <Link> to avoid <a> inside <a>. */}
        {composed &&
          orderedPieces.map(
            ({ piece, i }) =>
              piece.imageUrl && (
                <LookPieceHover
                  key={piece.productId}
                  slug={piece.slug}
                  name={piece.name}
                  price={money(piece.price)}
                  cta={labels.view}
                  style={
                    {
                      "--piece-x": placements[i].mobile.x,
                      "--piece-y": placements[i].mobile.y,
                      "--piece-size": placements[i].mobile.s,
                    } as CSSProperties
                  }
                />
              )
          )}
        {/* Piece-kind labels: numbered annotations overlaid on the composition.
            Only for multi-piece composed looks (not a single cover photo). */}
        {composed &&
          orderedPieces.map(({ piece, i }, labelIdx) =>
            piece.kind ? (
              <span
                key={piece.productId}
                className={`look-editorial-piece-tag look-editorial-piece-tag--${piece.kind}`}
                // The piece's own placement: the label sits level with the top of
                // the piece and its line runs out to the piece's near side.
                style={
                  {
                    "--piece-x": placements[i].mobile.x,
                    "--piece-y": placements[i].mobile.y,
                    "--piece-size": placements[i].mobile.s,
                  } as CSSProperties
                }
                aria-hidden="true"
              >
                <span className="look-editorial-piece-tag-label">
                  <span className="look-editorial-piece-tag-num">
                    {String(labelIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="look-editorial-piece-tag-kind">
                    {labels.kinds?.[piece.kind] ?? piece.kind}
                  </span>
                </span>
                <span className="look-editorial-piece-tag-line" />
              </span>
            ) : null
          )}
        {/* Circular discount badge: visible only when the look carries a saving. */}
        {look.discountPercent > 0 && (
          <span className="look-editorial-disc-badge" aria-hidden="true">
            <span className="look-editorial-disc-pct">{look.discountPercent}%</span>
            <span className="look-editorial-disc-save">save</span>
          </span>
        )}
        {/* For single-photo looks: piece thumbnails with hover popup cards,
            overlaid at the bottom so each individual piece is reachable. */}
        {!composed && look.pieces[0] && (
          <LookSinglePieces
            pieces={look.pieces}
            cta={labels.view}
            locale={locale}
            currency={look.pieces[0].currency}
          />
        )}
      </div>
      <div className="look-editorial-copy" data-editorial-part>
        {/* Eyebrow: "01 / IN THIS LOOK ————". Decorative, hidden from AT. */}
        <p className="look-editorial-index" aria-hidden="true">
          <span className="look-editorial-index-num">{String(index + 1).padStart(2, "0")}</span>
          <span className="look-editorial-index-sep" aria-hidden="true">/</span>
          <span className="look-editorial-index-label">{labels.included}</span>
        </p>
        <Heading id={`look-title-${look.id}`} className="look-editorial-title">
          <Link href={href}>{look.name}</Link>
        </Heading>
        {/* A short accent rule drawn below the title, matching the reference. */}
        <span className="look-editorial-title-rule" aria-hidden="true" />
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
