import { GIFT_CARD_FONT_FAMILY } from "@/lib/gift-card-fonts";
import type { GiftCardFont } from "@/lib/gift-card";
import "./gift-card.css";

// The printed card as the customer (and the Perla team) sees it: ivory stock
// with a gold inner rule, the house name, and the message in the chosen face.
export function GiftCardPreview({
  lines,
  font,
  brand,
  size = "large",
}: {
  lines: string[];
  font: GiftCardFont;
  brand: string;
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
    </figure>
  );
}
