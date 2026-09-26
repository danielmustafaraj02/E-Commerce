"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CatalogImage } from "@/components/catalog-image";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import { lookComposition } from "@/lib/look-composition";
import { COMPOSED_LOOK_DISCOUNT_PERCENT, lookPricing } from "@/lib/looks";
import type { ComposerPiece } from "@/lib/look-data";
import type { ProductType } from "@/lib/gift-finder";

const KINDS: ProductType[] = ["necklace", "bracelet", "earrings"];

// Compose a look: one necklace, one bracelet, one pair of earrings from the
// whole catalog, shown together as they're chosen. The saving shown is the
// one checkout applies to any such trio (lib/looks.ts), so nothing here is
// trusted: the cart holds full prices and the server takes the 10% off.
export function LookComposer({
  pieces,
  locale,
  labels,
}: {
  pieces: Record<ProductType, ComposerPiece[]>;
  locale: string;
  labels: {
    kinds: Record<ProductType, string>;
    hint: string;
    total: string;
    individualTotal: string;
    save: string;
    add: string;
    added: string;
    outOfStock: string;
    previous: string;
    next: string;
  };
}) {
  const addItem = useCartStore((state) => state.addItem);
  // Start with a look already on screen: the first available piece of each kind.
  const [chosen, setChosen] = useState<Partial<Record<ProductType, string>>>(() =>
    Object.fromEntries(
      KINDS.map((kind) => [kind, pieces[kind].find((p) => p.available)?.productId])
    )
  );
  const [added, setAdded] = useState(false);

  const selected = KINDS.flatMap((kind) => {
    const piece = pieces[kind].find((p) => p.productId === chosen[kind]);
    return piece ? [piece] : [];
  });
  const complete = selected.length === KINDS.length;
  const currency = selected[0]?.currency ?? pieces.necklace[0]?.currency ?? "EUR";
  const money = (cents: number) => formatMoney(cents, currency, locale);
  const pricing = lookPricing(
    selected.map((p) => p.price),
    complete ? COMPOSED_LOOK_DISCOUNT_PERCENT : 0
  );
  const placements = lookComposition(
    KINDS.map((kind) => ({ kind, selected: Boolean(chosen[kind]) }))
  );

  const toggle = (kind: ProductType, productId: string) =>
    setChosen((current) => ({
      ...current,
      [kind]: current[kind] === productId ? undefined : productId,
    }));

  const addToCart = () => {
    for (const piece of selected) {
      addItem({
        productId: piece.productId,
        slug: piece.slug,
        name: piece.name,
        price: piece.price,
        currency: piece.currency,
        imageUrl: piece.imageUrl,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="composer">
      <div className="composer-stage">
        <div className="composer-visual" aria-hidden="true">
          {KINDS.map((kind, i) => {
            const piece = pieces[kind].find((p) => p.productId === chosen[kind]);
            const slot = placements[i].mobile;
            return piece?.imageUrl ? (
              <div
                key={piece.productId}
                className="look-visual-layer"
                data-visible={placements[i].visible}
                style={
                  {
                    "--x": slot.x,
                    "--y": slot.y,
                    "--s": slot.s,
                    "--mx": slot.x,
                    "--my": slot.y,
                    "--ms": slot.s,
                  } as CSSProperties
                }
              >
                <CatalogImage
                  src={piece.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 52rem) 30vw, 70vw"
                />
              </div>
            ) : null;
          })}
        </div>

        <div className="composer-summary" aria-live="polite">
          {complete ? (
            <>
              <p className="composer-total-label">{labels.total}</p>
              <p className="composer-total">
                <s>{money(pricing.individualTotal)}</s>
                <span>{money(pricing.setTotal)}</span>
              </p>
              <p className="composer-save">
                {applyTemplate(labels.save, { percent: COMPOSED_LOOK_DISCOUNT_PERCENT })}
              </p>
            </>
          ) : (
            <p className="composer-hint">
              {applyTemplate(labels.hint, { percent: COMPOSED_LOOK_DISCOUNT_PERCENT })}
            </p>
          )}
          <button
            type="button"
            className="btn-primary composer-add"
            disabled={selected.length === 0 || selected.some((p) => !p.available)}
            onClick={addToCart}
          >
            {added ? labels.added : labels.add}
          </button>
        </div>
      </div>

      <div className="composer-rows">
        {KINDS.map((kind) =>
          pieces[kind].length > 0 ? (
            <ComposerRow
              key={kind}
              title={labels.kinds[kind]}
              previousLabel={labels.previous}
              nextLabel={labels.next}
            >
              {pieces[kind].map((piece) => {
                const isChosen = chosen[kind] === piece.productId;
                return (
                  <li key={piece.productId}>
                    <button
                      type="button"
                      className="composer-option"
                      aria-pressed={isChosen}
                      disabled={!piece.available}
                      onClick={() => toggle(kind, piece.productId)}
                    >
                      <span className="composer-option-photo">
                        {piece.imageUrl && (
                          <CatalogImage
                            src={piece.imageUrl}
                            alt=""
                            fill
                            sizes="(min-width: 52rem) 12rem, 10.5rem"
                          />
                        )}
                      </span>
                      <span className="composer-option-name">{piece.name}</span>
                      {piece.description && (
                        <span className="composer-option-description">
                          {piece.description}
                        </span>
                      )}
                      <span className="composer-option-price">
                        {piece.available ? money(piece.price) : labels.outOfStock}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ComposerRow>
          ) : null
        )}
      </div>
    </div>
  );
}

// One kind's choices as a swipeable row with its own slider: thin arrows by
// the title (faded at either end) and a hairline track whose gold bar shows
// how much of the row is in view and where. The native scrollbar is hidden.
function ComposerRow({
  title,
  previousLabel,
  nextLabel,
  children,
}: {
  title: string;
  previousLabel: string;
  nextLabel: string;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const titleId = useId();
  const [view, setView] = useState({ start: 0, size: 1 });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = list;
      const size = scrollWidth > 0 ? Math.min(1, clientWidth / scrollWidth) : 1;
      const max = scrollWidth - clientWidth;
      const progress = max > 0 ? Math.abs(scrollLeft) / max : 0;
      setView({ start: progress * (1 - size), size });
    };
    update();
    list.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      list.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const rtl = getComputedStyle(list).direction === "rtl" ? -1 : 1;
    list.scrollBy({ left: direction * rtl * list.clientWidth * 0.8, behavior: "smooth" });
  };

  const scrollable = view.size < 0.999;
  const atStart = view.start <= 0.001;
  const atEnd = view.start + view.size >= 0.999;

  return (
    <section className="composer-row" aria-labelledby={titleId}>
      <div className="composer-row-head">
        <h3 id={titleId} className="composer-row-title">
          {title}
        </h3>
        {scrollable && (
          <div className="composer-row-arrows">
            <button
              type="button"
              aria-label={previousLabel}
              disabled={atStart}
              onClick={() => scroll(-1)}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:rotate-180">
                <path d="M21 12H3m6-6-6 6 6 6" />
              </svg>
            </button>
            <button type="button" aria-label={nextLabel} disabled={atEnd} onClick={() => scroll(1)}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:rotate-180">
                <path d="M3 12h18m-6-6 6 6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <ul ref={listRef} className="composer-options">
        {children}
      </ul>
      {scrollable && (
        <div className="composer-track" aria-hidden="true">
          <span
            className="composer-track-bar"
            style={{ width: `${view.size * 100}%`, left: `${view.start * 100}%` }}
          />
        </div>
      )}
    </section>
  );
}
