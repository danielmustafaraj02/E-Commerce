"use client";

import { useState, type CSSProperties } from "react";
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
            <fieldset key={kind} className="composer-row">
              <legend className="composer-row-title">{labels.kinds[kind]}</legend>
              <ul className="composer-options">
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
                            <CatalogImage src={piece.imageUrl} alt="" fill sizes="7rem" />
                          )}
                        </span>
                        <span className="composer-option-name">{piece.name}</span>
                        <span className="composer-option-price">
                          {piece.available ? money(piece.price) : labels.outOfStock}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ) : null
        )}
      </div>
    </div>
  );
}
