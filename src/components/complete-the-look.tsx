"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CatalogImage } from "@/components/catalog-image";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import { trackLookEvent } from "@/lib/look-analytics";
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
}: {
  look: LookView;
  currentProductId: string;
  locale: string;
  dict: Dictionary["look"];
  outOfStockLabel: string;
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
  const chosenTotal = chosen.reduce((sum, p) => sum + p.price, 0);
  const percent = { percent: look.discountPercent };

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
            // No styled photo: arrange the pieces' own photos as one composition.
            <div className="look-visual" aria-hidden="true">
              {look.pieces.map(
                (piece) =>
                  piece.imageUrl && (
                    <div key={piece.productId} className="look-visual-tile">
                      <CatalogImage
                        src={piece.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 52rem) 22vw, 50vw"
                      />
                    </div>
                  )
              )}
            </div>
          )}
        </div>

        <div className="look-details">
          <dl className="look-prices" aria-live="polite">
            <div className="look-price-row">
              <dt>{dict.individualTotal}</dt>
              <dd>
                {completeSet ? <s>{money(look.pricing.individualTotal)}</s> : money(chosenTotal)}
              </dd>
            </div>
            {completeSet && (
              <>
                <div className="look-price-row look-price-row--set">
                  <dt>{dict.setTotal}</dt>
                  <dd>{money(look.pricing.setTotal)}</dd>
                </div>
                <div className="look-save">
                  <dt>{applyTemplate(dict.save, percent)}</dt>
                  <dd>-{money(look.pricing.saving)}</dd>
                </div>
              </>
            )}
          </dl>

          <ul className="look-pieces">
            {look.pieces.map((piece) => (
              <li key={piece.productId} className="look-piece">
                <div className="look-piece-photo">
                  {piece.imageUrl && (
                    <CatalogImage src={piece.imageUrl} alt={piece.imageAlt} fill sizes="4rem" />
                  )}
                </div>
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
                  <span className="look-piece-price">
                    {piece.available ? money(piece.price) : outOfStockLabel}
                  </span>
                </div>
                <input
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
                : dict.addSelected}
          </button>

          {!look.available && <p className="look-note">{dict.unavailable}</p>}
        </div>
      </div>
    </section>
  );
}
