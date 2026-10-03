"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/components/localized-link";

/**
 * Hero film product card.
 *
 * Desktop (fine pointer): the card appears after the visitor hovers the film
 * for one second. It is placed near the cursor at that moment and then stays
 * put — it never follows the mouse. Moving the pointer onto the card keeps it
 * open so the link can be clicked. Moving far from both the film and the card
 * closes it after a short grace period, resetting for the next hover.
 *
 * Touch / keyboard: a real button opens it at its CSS corner; Escape, the ×
 * and a tap outside close it.
 */
export function HeroVideoProduct({
  href,
  name,
  imageUrl,
  price,
  compareAtPrice,
  labels,
}: {
  href: string;
  name: string;
  imageUrl: string;
  price: string;
  compareAtPrice?: string;
  labels: { eyebrow: string; cta: string; open: string; close: string };
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  /* Absolute position inside the layer. Null while the card is at its CSS
     corner (touch / keyboard path). */
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  /* Mirrors `open` so the window-level pointermove handler, which is wired
     once, can read the current value without a stale closure. */
  const openRef = useRef(false);
  /* Latest cursor position inside the layer, updated on every pointermove so
     the 1-second timer can snapshot it when it fires. */
  const lastPos = useRef({ x: 0, y: 0 });

  const cancelOpen = useCallback(() => {
    if (openTimer.current !== undefined) {
      window.clearTimeout(openTimer.current);
      openTimer.current = undefined;
    }
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== undefined) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
    }
  }, []);

  const closeSoon = useCallback(() => {
    cancelOpen();
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setPoint(null);
      openRef.current = false;
    }, 280);
  }, [cancelOpen, cancelClose]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;

      const layer = layerRef.current;
      const card = cardRef.current;
      if (!layer) return;

      const rect = layer.getBoundingClientRect();
      const inLayer =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      /* Also count as "close enough" while the pointer is on the card. */
      const cardBox = card?.getBoundingClientRect();
      const onCard =
        cardBox !== undefined &&
        e.clientX >= cardBox.left - 16 &&
        e.clientX <= cardBox.right + 16 &&
        e.clientY >= cardBox.top - 16 &&
        e.clientY <= cardBox.bottom + 16;

      if (!inLayer && !onCard) {
        closeSoon();
        return;
      }

      /* Pointer is in the film area or on the card — keep it open. */
      cancelClose();

      if (inLayer) {
        lastPos.current = { x: e.clientX, y: e.clientY };
      }

      /* Already open: no re-positioning; just cancel any pending close. */
      if (openRef.current) return;

      /* Start the 1-second hover timer (only once per hover entry). */
      if (openTimer.current === undefined) {
        openTimer.current = window.setTimeout(() => {
          openTimer.current = undefined;

          const r = layerRef.current?.getBoundingClientRect();
          const c = cardRef.current;
          if (!r) return;

          /* Place the card beside the cursor, flipped to whichever side has
             room, then clamped so it never hangs outside the film. */
          const width = c?.offsetWidth ?? 280;
          const height = c?.offsetHeight ?? 130;
          const margin = 16;
          const gap = 20;
          const cx = lastPos.current.x - r.left;
          const cy = lastPos.current.y - r.top;
          const maxX = Math.max(margin, r.width - width - margin);
          const maxY = Math.max(margin, r.height - height - margin);
          const right = cx + gap;
          const below = cy + gap;

          setPoint({
            x: Math.min(
              Math.max(
                right + width > r.width - margin ? cx - gap - width : right,
                margin
              ),
              maxX
            ),
            y: Math.min(
              Math.max(
                below + height > r.height - margin ? cy - gap - height : below,
                margin
              ),
              maxY
            ),
          });
          setOpen(true);
          openRef.current = true;
        }, 1000);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelOpen();
      cancelClose();
    };
  }, [cancelOpen, cancelClose, closeSoon]);

  /* Escape closes on any device. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPoint(null);
        openRef.current = false;
        cancelOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, cancelOpen]);

  /* Tap outside closes the touch / keyboard card. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const target = e.target;
      if (target instanceof Node && cardRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest(".shelf-hero-product-open")) return;
      setOpen(false);
      setPoint(null);
      openRef.current = false;
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div className="shelf-hero-product" ref={layerRef}>
      {/* Touch and keyboard entry point. On mouse devices this is visually
          hidden unless focused, since hover is the way in there. */}
      <button
        type="button"
        className="shelf-hero-product-open"
        aria-expanded={open}
        onClick={() => {
          cancelOpen();
          cancelClose();
          setPoint(null);
          setOpen((was) => {
            openRef.current = !was;
            return !was;
          });
        }}
      >
        {labels.open}
      </button>

      <div
        ref={cardRef}
        className="shelf-hero-product-card"
        data-open={open ? "true" : undefined}
        data-positioned={point ? "true" : undefined}
        style={point ? { left: `${point.x}px`, top: `${point.y}px` } : undefined}
        aria-hidden={!open}
        inert={!open}
      >
        <Image
          src={imageUrl}
          alt=""
          width={120}
          height={120}
          sizes="60px"
          className="shelf-hero-product-photo"
        />
        <div className="shelf-hero-product-text">
          <p className="shelf-hero-product-eyebrow">{labels.eyebrow}</p>
          <p className="shelf-hero-product-name">{name}</p>
          <p className="shelf-hero-product-price">
            <span className="shelf-hero-product-price-current">{price}</span>
            {compareAtPrice && (
              <s className="shelf-hero-product-price-was" aria-hidden="true">
                {compareAtPrice}
              </s>
            )}
          </p>
          <Link href={href} className="shelf-hero-product-link">
            {labels.cta}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </div>
        <button
          type="button"
          className="shelf-hero-product-close"
          onClick={() => {
            setOpen(false);
            setPoint(null);
            openRef.current = false;
            cancelOpen();
          }}
        >
          <span className="sr-only">{labels.close}</span>
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
}
