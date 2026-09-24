"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CatalogImage } from "@/components/catalog-image";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import { trackLookEvent } from "@/lib/look-analytics";
import { lookPricing, PAIR_DISCOUNT_PERCENT } from "@/lib/looks";
import { lookComposition, type Slot } from "@/lib/look-composition";
import type { LookView } from "@/lib/look-data";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// "Complete the look" on the product page: the piece's matching set, all
// pre-selected, priced as a set. The saving shown is computed the same way
// checkout charges it (lib/looks.ts); the cart itself holds full prices and
// the server applies the discount when every piece is in the order.
export function CompleteTheLook({
  look,
  currentProductId,
  locale,
  dict,
  outOfStockLabel,
  onAdded,
}: {
  look: LookView;
  currentProductId: string;
  locale: string;
  dict: Dictionary["look"];
  outOfStockLabel: string;
  // Optional extra hook for callers that need their own tracking/state on
  // top of this component's own trackLookEvent("added_to_cart", ...) below
  // — e.g. the Gift Finder result screen (lib/gift-finder-analytics.ts).
  // Unused on the product page, so its behavior there is unchanged.
  onAdded?: (chosenProductIds: string[]) => void;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [selected, setSelected] = useState(
    () => new Set(look.pieces.filter((p) => p.available).map((p) => p.productId))
  );
  const [added, setAdded] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        trackLookEvent("viewed", { lookId: look.id });
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [look.id]);

  const currency = look.pieces[0].currency;
  const money = (cents: number) => formatMoney(cents, currency, locale);
  const chosen = look.pieces.filter((p) => selected.has(p.productId));
  const completeSet = look.available && chosen.length === look.pieces.length;
  // Two pieces also save (lib/looks.ts: the same rule checkout applies).
  const pairPercent = Math.min(PAIR_DISCOUNT_PERCENT, look.discountPercent);
  const pair = chosen.length === 2;
  const chosenTotal = chosen.reduce((sum, p) => sum + p.price, 0);
  const percent = { percent: look.discountPercent };
  const offer = completeSet
    ? { label: dict.setTotal, pricing: look.pricing, percent: look.discountPercent }
    : pair
      ? {
          label: dict.pairTotal,
          pricing: lookPricing(
            chosen.map((p) => p.price),
            pairPercent
          ),
          percent: pairPercent,
        }
      : null;

  // The showcase follows the same selection as the cards (one source of
  // truth): unselected pieces fade out and the rest move into a new layout.
  const placements = lookComposition(
    look.pieces.map((p) => ({ kind: p.kind, selected: selected.has(p.productId) }))
  );
  const anyShown = placements.some((p) => p.visible);
  const slotVars = (d: Slot, m: Slot) =>
    ({
      "--x": d.x,
      "--y": d.y,
      "--s": d.s,
      "--mx": m.x,
      "--my": m.y,
      "--ms": m.s,
    }) as React.CSSProperties;

  const toggle = (productId: string) => {
    const next = new Set(selected);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    setSelected(next);
    trackLookEvent("selected", { lookId: look.id, pieces: next.size });
  };

  const addToCart = () => {
    for (const piece of chosen) {
      addItem({
        productId: piece.productId,
        slug: piece.slug,
        name: piece.name,
        price: piece.price,
        currency: piece.currency,
        imageUrl: piece.imageUrl,
      });
    }
    trackLookEvent("added_to_cart", {
      lookId: look.id,
      pieces: chosen.length,
      completeSet: completeSet ? 1 : 0,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    onAdded?.(chosen.map((piece) => piece.productId));
  };

  return (
    <section ref={rootRef} className="look-section" aria-labelledby="look-title">
      <div className="shelf-wrap look-grid">
        <div className="look-intro">
          <p className="look-kicker">{dict.kicker}</p>
          <h2 id="look-title" className="shelf-heading look-title">
            {dict.title}
          </h2>
          <p className="look-subtitle">{dict.subtitle}</p>
          <p className="look-copy">{dict.intro}</p>
          <p className="look-copy look-pair-hint">
            {applyTemplate(dict.pairHint, { percent: pairPercent })}
          </p>

          {look.imageUrl ? (
            <div className="look-visual look-visual--styled">
              <CatalogImage
                src={look.imageUrl}
                alt={look.pieces.map((p) => p.name).join(", ")}
                fill
                sizes="(min-width: 52rem) 45vw, 100vw"
              />
            </div>
          ) : (
            // No styled photo: the pieces' own photos as one composition,
            // arranged by lib/look-composition.ts for whatever is selected.
            <div className="look-visual" aria-hidden="true">
              {look.pieces.map((piece, i) =>
                piece.imageUrl ? (
                  <div
                    key={piece.productId}
                    className="look-visual-layer"
                    data-visible={placements[i].visible}
                    style={slotVars(placements[i].desktop, placements[i].mobile)}
                  >
                    <CatalogImage
                      src={piece.imageUrl}
                      alt=""
                      fill
                      sizes={
                        piece.kind === "necklace"
                          ? "(min-width: 52rem) 40vw, 90vw"
                          : "(min-width: 52rem) 20vw, 45vw"
                      }
                    />
                  </div>
                ) : null
              )}
              <p className="look-visual-empty" data-visible={!anyShown}>
                {dict.emptyState}
              </p>
            </div>
          )}
        </div>

        <div className="look-details">
          <dl className="look-prices" aria-live="polite">
            <div className="look-price-row">
              <dt>{dict.individualTotal}</dt>
              <dd>{offer ? <s>{money(chosenTotal)}</s> : money(chosenTotal)}</dd>
            </div>
            {offer && (
              <>
                <div className="look-price-row look-price-row--set">
                  <dt>{offer.label}</dt>
                  <dd>{money(offer.pricing.setTotal)}</dd>
                </div>
                <div className="look-save">
                  <dt>{applyTemplate(dict.save, { percent: offer.percent })}</dt>
                  <dd>-{money(offer.pricing.saving)}</dd>
                </div>
              </>
            )}
          </dl>

          <ul className="look-pieces">
            {look.pieces.map((piece) => (
              <li
                key={piece.productId}
                className="look-piece"
                data-selected={selected.has(piece.productId)}
              >
                {/* The photo and price are labels for the checkbox, so
                    clicking the card toggles the same single selection. */}
                <label htmlFor={`look-check-${piece.productId}`} className="look-piece-photo">
                  {piece.imageUrl && (
                    <CatalogImage src={piece.imageUrl} alt={piece.imageAlt} fill sizes="4rem" />
                  )}
                </label>
                <div className="look-piece-text">
                  {piece.productId === currentProductId ? (
                    <span className="look-piece-name">
                      {piece.name} <span className="look-piece-tag">{dict.thisPiece}</span>
                    </span>
                  ) : (
                    <Link href={`/products/${piece.slug}`} className="look-piece-name">
                      {piece.name}
                    </Link>
                  )}
                  <label htmlFor={`look-check-${piece.productId}`} className="look-piece-price">
                    {piece.available ? money(piece.price) : outOfStockLabel}
                  </label>
                </div>
                <input
                  id={`look-check-${piece.productId}`}
                  type="checkbox"
                  className="look-piece-check"
                  checked={selected.has(piece.productId)}
                  disabled={!piece.available}
                  onChange={() => toggle(piece.productId)}
                  aria-label={applyTemplate(dict.include, { name: piece.name })}
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={addToCart}
            disabled={chosen.length === 0}
            className="btn-primary shop-cta-teal look-cta"
          >
            {added
              ? `✓ ${dict.added}`
              : completeSet
                ? applyTemplate(dict.addSet, percent)
                : pair
                  ? applyTemplate(dict.addPair, { percent: pairPercent })
                  : dict.addSelected}
          </button>

          {!look.available && <p className="look-note">{dict.unavailable}</p>}
        </div>
      </div>
    </section>
  );
}
