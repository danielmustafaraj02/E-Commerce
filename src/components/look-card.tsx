import type { CSSProperties } from "react";
import Link from "next/link";
import { CatalogImage } from "@/components/catalog-image";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import { lookComposition } from "@/lib/look-composition";
import type { LookView } from "@/lib/look-data";

// One look on /looks and the home page: its pieces composed together (the
// portrait arrangement, since the card is upright) in an
// ivory niche (or its styled photo), the name, and the set price against the
// pieces bought separately.
export function LookCard({
  look,
  locale,
  labels,
  priority = false,
}: {
  look: LookView;
  locale: string;
  labels: { view: string; save: string; pieces: string };
  priority?: boolean;
}) {
  const href = `/looks/${look.id}`;
  const money = (cents: number) => formatMoney(cents, look.pieces[0].currency, locale);
  const placements = lookComposition(look.pieces.map((p) => ({ kind: p.kind, selected: true })));
  const loading = priority ? ({ loading: "eager" } as const) : {};

  return (
    <article className="look-card">
      <Link href={href} className="look-card-visual" tabIndex={-1} aria-hidden="true">
        {look.imageUrl ? (
          <CatalogImage
            src={look.imageUrl}
            alt=""
            fill
            sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 90vw"
            className="look-card-photo"
            {...loading}
          />
        ) : (
          look.pieces.map((piece, i) =>
            piece.imageUrl ? (
              <div
                key={piece.productId}
                className="look-visual-layer"
                style={
                  {
                    "--x": placements[i].mobile.x,
                    "--y": placements[i].mobile.y,
                    "--s": placements[i].mobile.s,
                    "--mx": placements[i].mobile.x,
                    "--my": placements[i].mobile.y,
                    "--ms": placements[i].mobile.s,
                  } as CSSProperties
                }
              >
                <CatalogImage
                  src={piece.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 64rem) 16rem, (min-width: 40rem) 30vw, 60vw"
                  {...loading}
                />
              </div>
            ) : null
          )
        )}
      </Link>
      <div className="look-card-body">
        <p className="look-card-meta">
          {applyTemplate(labels.pieces, { n: look.pieces.length })}
          <span aria-hidden="true"> · </span>
          {applyTemplate(labels.save, { percent: look.discountPercent })}
        </p>
        <h3 className="look-card-name">
          <Link href={href}>{look.name}</Link>
        </h3>
        <p className="look-card-price">
          <s>{money(look.pricing.individualTotal)}</s>
          <span>{money(look.pricing.setTotal)}</span>
        </p>
        <span className="look-card-cta" aria-hidden="true">
          {labels.view}
          <span className="look-card-arrow">→</span>
        </span>
      </div>
    </article>
  );
}
