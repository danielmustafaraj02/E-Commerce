"use client";

import { useState, type ReactNode } from "react";
import { GiftCardBackFace, GiftCardPreview } from "@/components/gift-card-preview";
import type { GiftCardBack, GiftCardFont, GiftCardSticker } from "@/lib/gift-card";
import "./gift-card.css";

// A card with two faces that cross-fades in 2D between front and back.
export function GiftCardFlip({
  front,
  back,
  showBack,
  className = "",
}: {
  front: ReactNode;
  back: ReactNode;
  showBack: boolean;
  className?: string;
}) {
  return (
    <div className={`gc-flip ${className}`} data-back={showBack}>
      <div className="gc-flip-inner">
        <div className="gc-flip-face" aria-hidden={showBack}>
          {front}
        </div>
        <div className="gc-flip-face gc-flip-face--back" aria-hidden={!showBack}>
          {back}
        </div>
      </div>
    </div>
  );
}

// The card shown in the gift-card ad and anywhere a two-sided preview is
// needed. Tapping "See the back" cross-fades to the back face in 2D.
export function GiftCard3D({
  lines,
  font,
  brand,
  stickers = [],
  back = "ivory",
  labels,
}: {
  lines: string[];
  font: GiftCardFont;
  brand: string;
  stickers?: GiftCardSticker[];
  back?: GiftCardBack;
  labels: { seeBack: string; seeFront: string };
}) {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="gc3d">
      <div className="gc3d-stage">
        <GiftCardFlip
          showBack={showBack}
          front={<GiftCardPreview lines={lines} font={font} brand={brand} stickers={stickers} />}
          back={<GiftCardBackFace back={back} />}
        />
      </div>
      <div className="gc3d-controls">
        <button type="button" className="gc3d-flip" onClick={() => setShowBack(!showBack)}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path
              d="M3.5 8.5a6.5 6.5 0 0 1 12-2.5M16.5 11.5a6.5 6.5 0 0 1-12 2.5M15.5 2.5v3.5H12M4.5 17.5V14H8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {showBack ? labels.seeFront : labels.seeBack}
        </button>
      </div>
    </div>
  );
}
