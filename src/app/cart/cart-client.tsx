"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CatalogImage } from "@/components/catalog-image";
import { Link } from "@/components/localized-link";
import { useCartStore, MAX_CART_QUANTITY } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import { QuantityStepper } from "@/components/quantity-stepper";
import { EmptyShelf } from "@/components/empty-shelf";
import { ExpressCheckoutButton } from "@/components/express-checkout-button";
import { CartUndoToast, type PendingRemoval } from "@/components/cart-undo-toast";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cartLookSummary, type PieceKind } from "@/lib/looks";
import { trackLookEvent } from "@/lib/look-analytics";
import type { LookView } from "@/lib/look-data";
import { GiftCardPreview } from "@/components/gift-card-preview";
import { giftCardLines } from "@/lib/gift-card";

export function CartClient({
  locale,
  uiLocale,
  dict,
  shippingBanner,
  freeShippingThreshold,
  stripePublishableKey,
  giftCardOffer,
}: {
  locale: string;
  uiLocale: string;
  dict: Dictionary["cart"];
  shippingBanner: string | null;
  freeShippingThreshold: number | null;
  stripePublishableKey: string | null;
  giftCardOffer: { price: number; dict: Dictionary["giftCard"]; brand: string } | null;
}) {
  const storedGiftCard = useCartStore((state) => state.giftCard);
  const removeGiftCard = useCartStore((state) => state.removeGiftCard);
  const giftCard = giftCardOffer ? storedGiftCard : null;
  const giftAmount = giftCard && giftCardOffer ? giftCardOffer.price : 0;
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const addItem = useCartStore((state) => state.addItem);
  const [looks, setLooks] = useState<LookView[]>([]);
  const [kinds, setKinds] = useState<Record<string, PieceKind | null>>({});
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [upsellBusy, setUpsellBusy] = useState(false);

  const handleRemove = useCallback(
    (item: (typeof items)[number]) => {
      setPendingRemoval({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        price: item.price,
        currency: item.currency,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
      });
      removeItem(item.productId);
    },
    [removeItem]
  );

  const handleUndo = useCallback(() => {
    if (!pendingRemoval) return;
    addItem(
      {
        productId: pendingRemoval.productId,
        slug: pendingRemoval.slug,
        name: pendingRemoval.name,
        price: pendingRemoval.price,
        currency: pendingRemoval.currency,
        imageUrl: pendingRemoval.imageUrl,
      },
      pendingRemoval.quantity
    );
    setPendingRemoval(null);
  }, [pendingRemoval, addItem]);

  const handleExpire = useCallback(() => {
    setPendingRemoval(null);
  }, []);

  // Which looks the cart's pieces belong to: for the set-saving estimate and
  // the "complete the look" upsell. Refetched only when the set of products
  // changes, not on quantity changes.
  const productKey = [...new Set(items.map((i) => i.productId))].sort().join(",");
  useEffect(() => {
    if (!productKey) return;
    let cancelled = false;
    fetch(`/api/looks?productIds=${encodeURIComponent(productKey)}`)
      .then((res) => (res.ok ? res.json() : { looks: [], kinds: {} }))
      .then((data: { looks: LookView[]; kinds?: Record<string, PieceKind | null> }) => {
        if (cancelled) return;
        setLooks(data.looks);
        setKinds(data.kinds ?? {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productKey]);

  if (items.length === 0 && !pendingRemoval) {
    return (
      <EmptyShelf icon="cart" title={dict.empty} body={dict.emptyBody} cta={dict.browse} />
    );
  }

  // Display estimate only — the server recomputes authoritative pricing,
  // stock, tax, and shipping from live product data at checkout.
  const estimatedSubtotal =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) + giftAmount;
  const lookSummary = cartLookSummary(items, looks, kinds);

  return (
    <div className="flex flex-col gap-6">
      {freeShippingThreshold !== null && (
        <div className="shop-panel shop-panel-pad">
          {estimatedSubtotal >= freeShippingThreshold ? (
            <p className="text-accent-deep flex items-center text-sm font-medium">
              <span className="shop-check shop-settle" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              {dict.freeShippingUnlocked}
            </p>
          ) : (
            <>
              <p className="text-foreground/70 mb-2 text-sm">
                {applyTemplate(dict.freeShippingProgress, {
                  amount: formatMoney(
                    freeShippingThreshold - estimatedSubtotal,
                    items[0].currency,
                    locale
                  ),
                })}
              </p>
              <div className="shop-track">
                <div
                  className="shop-fill"
                  style={{
                    width: `${Math.min(100, (estimatedSubtotal / freeShippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <ul className="shop-panel shop-list">
        {items.map((item) => (
          <li key={item.productId} className="shop-cart-line">
            {item.imageUrl ? (
              <Link href={`/products/${item.slug}`} className="shop-thumb shop-thumb--cart">
                <CatalogImage
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(min-width: 48rem) 112px, 84px"
                />
              </Link>
            ) : (
              <span className="shop-thumb shop-thumb--cart" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <Link href={`/products/${item.slug}`} className="shop-line-name line-clamp-2">
                {item.name}
              </Link>
              <p className="text-foreground/70 mt-0.5 text-sm">
                {formatMoney(item.price, item.currency, locale)}
              </p>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="text-foreground/60 hover:text-danger mt-1 text-xs underline-offset-2 transition-colors hover:underline"
              >
                {dict.remove}
              </button>
            </div>
            <div className="shop-cart-controls">
              <QuantityStepper
                value={item.quantity}
                onChange={(next) => setQuantity(item.productId, next)}
                max={MAX_CART_QUANTITY}
                decreaseLabel={dict.decreaseQuantity}
                increaseLabel={dict.increaseQuantity}
              />
              <span className="shop-cart-total">
                {formatMoney(item.price * item.quantity, item.currency, locale)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {lookSummary.upsells.map(({ look, missing }) => (
        <div key={look.id} className="shop-panel shop-panel-pad cart-look-upsell">
          <div>
            <p className="cart-look-upsell-title">{dict.lookUpsellTitle}</p>
            <p className="text-foreground/70 text-sm">
              {applyTemplate(dict.lookUpsellText, { percent: look.discountPercent })}
            </p>
            <p className="text-foreground/60 mt-1 text-xs">
              {missing.map((piece) => piece.name).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary text-sm"
            disabled={upsellBusy}
            onClick={() => {
              setUpsellBusy(true);
              for (const piece of missing) {
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
                pieces: missing.length,
                source: "cart",
              });
              setTimeout(() => setUpsellBusy(false), 1500);
            }}
          >
            {dict.lookUpsellCta}
          </button>
        </div>
      ))}

      {giftCardOffer && giftCard && (
        <div className="shop-panel shop-panel-pad cart-gift">
          <GiftCardPreview
            size="small"
            font={giftCard.font}
            brand={giftCardOffer.brand}
            lines={giftCardLines(giftCard, giftCardOffer.dict)}
            stickers={giftCard.stickers}
          />
          <div className="cart-gift-details">
            <p className="cart-gift-title">
              <span>{giftCardOffer.dict.productName}</span>
              <span>{formatMoney(giftCardOffer.price, items[0].currency, locale)}</span>
            </p>
            <p className="cart-gift-meta">
              <span>{giftCardOffer.dict.yourMessage}:</span> &ldquo;{giftCard.message}&rdquo;
            </p>
            <p className="cart-gift-meta">
              <span>{giftCardOffer.dict.fontLabel}:</span>{" "}
              {giftCardOffer.dict.fonts[giftCard.font]}
            </p>
            <p className="cart-gift-meta">
              <span>{giftCardOffer.dict.backLabel}:</span>{" "}
              {giftCardOffer.dict.backs[giftCard.back ?? "ivory"]}
            </p>
            <p className="cart-gift-actions">
              <Link href="/personalised-gift-card">{giftCardOffer.dict.edit}</Link>
              <button type="button" onClick={removeGiftCard}>
                {giftCardOffer.dict.remove}
              </button>
            </p>
          </div>
        </div>
      )}

      {giftCardOffer && !giftCard && (
        <Link href="/personalised-gift-card" className="shop-panel shop-panel-pad cart-gift-invite">
          <span className="cart-gift-invite-art" aria-hidden="true">
            <GiftCardPreview
              size="small"
              font="serif"
              brand={giftCardOffer.brand}
              lines={[giftCardOffer.dict.adHeadline]}
            />
          </span>
          <span className="cart-gift-invite-copy">
            <span className="cart-gift-invite-title">{giftCardOffer.dict.pdpTitle}</span>
            <span className="cart-gift-invite-body">
              {applyTemplate(giftCardOffer.dict.pdpLine, {
                price: formatMoney(giftCardOffer.price, items[0].currency, locale),
              })}
            </span>
            <span className="cart-gift-invite-cta">
              {giftCardOffer.dict.pdpCta} <span aria-hidden="true">→</span>
            </span>
          </span>
        </Link>
      )}

      <div className="shop-panel shop-panel-pad flex flex-col gap-2">
        {lookSummary.saving > 0 && (
          <div className="text-success flex items-center justify-between text-sm">
            <span>{dict.bundleSaving}</span>
            <span>-{formatMoney(lookSummary.saving, items[0].currency, locale)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-foreground/70 text-sm">{dict.estimatedSubtotal}</span>
          <span className="shop-total">
            {formatMoney(estimatedSubtotal - lookSummary.saving, items[0].currency, locale)}
          </span>
        </div>
      </div>

      {shippingBanner && <p className="text-foreground/70 -mt-3 text-sm">{shippingBanner}</p>}

      <Link href="/checkout" className="btn-primary text-center">
        {dict.checkout}
      </Link>

      {/* The wallet sheet can't carry the card's details, so a card means
          the full checkout. */}
      {!giftCard && (
        <ExpressCheckoutButton
          publishableKey={stripePublishableKey}
          discount={lookSummary.saving}
          locale={uiLocale}
          dividerLabel={dict.expressCheckoutOr}
        />
      )}

      {pendingRemoval && (
        <CartUndoToast
          pending={pendingRemoval}
          label={applyTemplate(dict.itemRemoved, { name: pendingRemoval.name })}
          undoLabel={dict.undo}
          onUndo={handleUndo}
          onExpire={handleExpire}
        />
      )}
    </div>
  );
}
