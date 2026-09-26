import type { CSSProperties, ReactNode } from "react";
import { GIFT_CARD_FONT_FAMILY } from "@/lib/gift-card-fonts";
import { BACK_ART, LOGO_MARK_SRC, STICKER_ART } from "@/lib/gift-card-art";
import type { GiftCardBack, GiftCardFont, GiftCardSticker, GiftCardStickerIcon } from "@/lib/gift-card";
import "./gift-card.css";

// The printed card as the customer (and the Perla team) sees it: ivory stock
// with a gold inner rule, the house name, the message in the chosen face and
// any motifs placed on it. `overlay` sits over the front (the designer's
// draggable stickers).
export function GiftCardPreview({
  lines,
  font,
  brand,
  stickers = [],
  overlay,
  size = "large",
}: {
  lines: string[];
  font: GiftCardFont;
  brand: string;
  stickers?: GiftCardSticker[];
  overlay?: ReactNode;
  size?: "large" | "small";
}) {
  return (
    <figure className={`gc-card gc-card--${size}`}>
      <p className="gc-card-brand" translate="no">
        {brand}
      </p>
      <span className="gc-card-rule" aria-hidden="true" />
      <div
        className={`gc-card-text gc-card-text--${font}`}
        style={{ fontFamily: GIFT_CARD_FONT_FAMILY[font] }}
      >
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <p className="gc-card-foot" aria-hidden="true" translate="no">
        Murano · Venezia
      </p>
      {stickers.map((sticker, i) => (
        <span
          key={i}
          className="gc-sticker"
          style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
          aria-hidden="true"
        >
          <StickerArt icon={sticker.icon} />
        </span>
      ))}
      {overlay}
    </figure>
  );
}

// The back: the chosen stock with the Perla logo printed in the matching ink.
export function GiftCardBackFace({
  back,
  size = "large",
  label,
}: {
  back: GiftCardBack;
  size?: "large" | "small";
  label?: string;
}) {
  const art = BACK_ART[back];
  return (
    <figure
      className={`gc-card gc-card--${size} gc-card--back`}
      style={{ "--gc-back-stock": art.stock, "--gc-back-ink": art.ink } as CSSProperties}
      aria-label={label}
    >
      <span
        className="gc-back-logo"
        role="img"
        aria-label="Perla Murano Glass"
        style={{ maskImage: `url(${LOGO_MARK_SRC})`, WebkitMaskImage: `url(${LOGO_MARK_SRC})` }}
      />
    </figure>
  );
}

export function StickerArt({ icon }: { icon: GiftCardStickerIcon }) {
  return (
    <svg viewBox="0 0 24 24" className="gc-sticker-art" focusable="false" aria-hidden="true">
      {STICKER_ART[icon].map((layer, i) => (
        <path
          key={i}
          d={layer.d}
          fill={layer.fill}
          stroke={layer.stroke}
          strokeWidth={layer.stroke ? 0.8 : undefined}
        />
      ))}
    </svg>
  );
}
