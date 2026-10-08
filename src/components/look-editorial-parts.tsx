import type { ReactNode } from "react";
import { Link } from "@/components/localized-link";
import { CatalogImage } from "@/components/catalog-image";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import type { LookView } from "@/lib/look-data";

/**
 * The shared data and purchase primitives behind every Look composition.
 *
 * The editorial templates differ only in how they ARRANGE these parts, so
 * the parts live here once and each template composes them. Nothing here decides
 * layout: every primitive takes the className it should wear, which is what lets
 * one set of markup serve the different grids without duplication.
 *
 * Prices, the saving, the piece names and the CTA all come from the LookView the
 * page already loaded — no template invents its own copy or its own numbers.
 */

/** The labels every Look composition needs, resolved by the page. */
export type LookLabels = {
  view: string;
  save: string;
  pieces: string;
  /** Per-look copy (the page derives it from the look's name), so it is optional
   *  here: the preview page passes one description per rendered look. */
  description?: string;
  included: string;
  price: string;
  kinds?: Record<"necklace" | "bracelet" | "earrings", string>;
};

export type LookParts = {
  href: string;
  money: (value: number) => string;
  setTotal: string;
  individualTotal: string;
  saving: string | null;
  discountPercent: number;
  composed: boolean;
  ordered: { piece: LookView["pieces"][number]; i: number }[];
  labels: LookLabels;
};

const KIND_ORDER = { necklace: 0, bracelet: 1, earrings: 2 } as const;

/** Everything derived from a look, in one place, so no template recomputes it. */
export function lookParts(look: LookView, labels: LookLabels, locale: string): LookParts {
  const money = (value: number) => formatMoney(value, look.pieces[0].currency, locale);
  return {
    href: `/looks/${look.id}`,
    money,
    setTotal: money(look.pricing.setTotal),
    individualTotal: money(look.pricing.individualTotal),
    saving:
      look.discountPercent > 0
        ? applyTemplate(labels.save, { percent: look.discountPercent })
        : null,
    discountPercent: look.discountPercent,
    composed: !look.imageUrl,
    ordered: [...look.pieces]
      .map((piece, i) => ({ piece, i }))
      .sort(
        (a, b) =>
          (KIND_ORDER[a.piece.kind ?? "earrings"] ?? 3) -
          (KIND_ORDER[b.piece.kind ?? "earrings"] ?? 3)
      ),
    labels,
  };
}

/** Jewellery is linked directly, so touch and keyboard users can open every
 * product without needing the old hover-only overlay or a second product grid. */
export function LookJewelry({
  look,
  parts,
  priority = false,
  leadOnly = false,
  sizes = "(min-width: 64rem) 28vw, (min-width: 52rem) 40vw, 80vw",
}: {
  look: LookView;
  parts: LookParts;
  priority?: boolean;
  leadOnly?: boolean;
  sizes?: string;
}) {
  if (look.imageUrl) {
    return (
      <div className="look-jewelry look-jewelry--photo">
        <Link href={parts.href} className="look-jewelry-photo" aria-label={look.name}>
          <CatalogImage
            src={look.imageUrl}
            alt=""
            fill
            sizes={sizes}
            loading={priority ? "eager" : "lazy"}
          />
        </Link>
        <ul className="look-jewelry-links">
          {parts.ordered.map(({ piece }) => (
            <li key={piece.productId}>
              <Link href={`/products/${piece.slug}`}>{piece.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  const pieces = leadOnly ? parts.ordered.slice(0, 1) : parts.ordered;
  return (
    <div className={`look-jewelry look-jewelry--composed ${leadOnly ? "look-jewelry--lead" : ""}`}>
      {pieces.map(({ piece }, index) => (
        <Link
          key={piece.productId}
          href={`/products/${piece.slug}`}
          className={`look-jewelry-product ${index === 0 ? "look-jewelry-product--lead" : ""}`}
        >
          {piece.imageUrl && (
            <span className="look-jewelry-image">
              <CatalogImage
                src={piece.imageUrl}
                alt=""
                fill
                sizes={sizes}
                loading={priority ? "eager" : "lazy"}
              />
            </span>
          )}
          <span className="look-jewelry-caption">{piece.name}</span>
        </Link>
      ))}
    </div>
  );
}

/** The eyebrow: "01 / IN THIS LOOK ————". */
export function LookEyebrow({
  parts,
  index,
  className = "look-editorial-index",
}: {
  parts: LookParts;
  index: number;
  className?: string;
}) {
  return (
    <p className={className} aria-hidden="true">
      <span className="look-editorial-index-num">{String(index + 1).padStart(2, "0")}</span>
      <span className="look-editorial-index-sep" aria-hidden="true">
        /
      </span>
      <span className="look-editorial-index-label">{parts.labels.included}</span>
    </p>
  );
}

/** The title as a link into the look. */
export function LookTitle({
  look,
  parts,
  id,
  heading = "h3",
  className = "look-editorial-title",
}: {
  look: LookView;
  parts: LookParts;
  id: string;
  heading?: "h2" | "h3";
  className?: string;
}) {
  const Heading = heading;
  return (
    <Heading id={id} className={className}>
      <Link href={parts.href}>{look.name}</Link>
    </Heading>
  );
}

/**
 * Price block: the set total, the struck-through individual total, and the
 * saving. One component, so all templates show identical, correct money.
 */
export function LookPrice({
  parts,
  className = "look-editorial-price",
}: {
  parts: LookParts;
  className?: string;
}) {
  return (
    <p className={className}>
      <span>{parts.setTotal}</span>
      {parts.saving && <s>{parts.individualTotal}</s>}
      {parts.saving && <span className="look-editorial-saving">{parts.saving}</span>}
    </p>
  );
}

/** The "SCOPRI IL LOOK →" call to action, in the site's own button. */
export function LookCta({
  parts,
  className = "btn-primary look-editorial-cta",
  children,
}: {
  parts: LookParts;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link href={parts.href} className={className}>
      {children ?? parts.labels.view}
      <span className="look-editorial-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
