import type { GiftCardBack, GiftCardStickerIcon } from "@/lib/gift-card";

// The card's printed artwork as plain data, so the page (SVG), the 3D card
// (canvas Path2D) and the admin's print preview all draw the same thing.

export const CARD_INK = "#123d43";
export const CARD_GOLD = "#b89a62";
export const CARD_STOCK = "#fdfbf6";

// Sticker width as a share of the card's width.
export const STICKER_SIZE = 0.12;

type Layer = { d: string; fill: string; stroke?: string };

// Each motif is drawn on a 24×24 grid.
export const STICKER_ART: Record<GiftCardStickerIcon, Layer[]> = {
  heart: [
    {
      d: "M12 21s-7.4-4.5-9.5-9C.9 8.6 3 4.4 6.8 4.4c2.2 0 3.9 1.3 5.2 3.2 1.3-1.9 3-3.2 5.2-3.2 3.8 0 5.9 4.2 4.3 7.6C19.4 16.5 12 21 12 21z",
      fill: "#a3243b",
    },
  ],
  pearl: [
    { d: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17z", fill: "#efe6da", stroke: CARD_GOLD },
    { d: "M9 6.8a2.6 2.1 0 1 0 0 4.2 2.6 2.1 0 1 0 0-4.2z", fill: "#ffffff" },
  ],
  star: [
    {
      d: "M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z",
      fill: CARD_GOLD,
    },
  ],
  sparkle: [
    {
      d: "M12 1.5c.7 5.2 2.5 8.6 10.5 10.5-8 1.9-9.8 5.3-10.5 10.5-.7-5.2-2.5-8.6-10.5-10.5 8-1.9 9.8-5.3 10.5-10.5z",
      fill: CARD_GOLD,
    },
  ],
  flower: [
    {
      d: "M12 2.5a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM19.2 7.7a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM16.4 15.7a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM7.6 15.7a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM4.8 7.7a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2z",
      fill: "#d98a94",
    },
    { d: "M12 9.4a3 3 0 1 0 0 6 3 3 0 1 0 0-6z", fill: CARD_GOLD },
  ],
  moon: [{ d: "M20.5 15.2A9 9 0 1 1 9.3 3a7.4 7.4 0 0 0 11.2 12.2z", fill: CARD_INK }],
};

// The back's stock and the colour its logo and frame are printed in.
export const BACK_ART: Record<GiftCardBack, { stock: string; ink: string; edge: string }> = {
  ivory: { stock: CARD_STOCK, ink: CARD_INK, edge: "#ece4d5" },
  lagoon: { stock: "#123d43", ink: "#d8bf8a", edge: "#0d2e33" },
  ruby: { stock: "#6e1a26", ink: "#d8bf8a", edge: "#55131d" },
  blush: { stock: "#f2e0da", ink: "#6e1a26", edge: "#e3cbc3" },
};

// Transparent Perla logo (from public/logo.png), tinted on the back.
export const LOGO_MARK_SRC = "/gift-card/perla-logo-mark.png";

// A picture of the card, front and back, used for link previews and in the
// page's Product structured data.
export const GIFT_CARD_IMAGE = "/gift-card/personalised-gift-card.jpg";
