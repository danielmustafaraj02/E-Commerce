// The personalised gift card's choices and limits, without its validation
// (gift-card.ts, built on zod), so the designer in the browser can use them
// without bringing zod along. gift-card.ts re-exports all of it.

export const GIFT_CARD_FONTS = ["serif", "script", "classic", "modern", "handwritten"] as const;
export type GiftCardFont = (typeof GIFT_CARD_FONTS)[number];

export const GIFT_CARD_MESSAGE_MAX = 200;
export const GIFT_CARD_NAME_MAX = 40;
export const GIFT_CARD_EMAIL_MAX = 254;

// Little printed motifs the customer drags onto the front, at most three so
// the message stays the point. Positions are the motif's centre as a
// percentage of the card's width and height, so they print the same at any size.
export const GIFT_CARD_STICKERS = ["heart", "pearl", "star", "sparkle", "flower", "moon"] as const;
export type GiftCardStickerIcon = (typeof GIFT_CARD_STICKERS)[number];
export const GIFT_CARD_STICKER_MAX = 3;

// The colour of the stock on the back, which carries the Perla logo.
export const GIFT_CARD_BACKS = ["ivory", "lagoon", "ruby", "blush"] as const;
export type GiftCardBack = (typeof GIFT_CARD_BACKS)[number];
