import { z } from "zod";

// The personalised gift card add-on: a printed card packed with the order.
// Shared by the designer page, the cart, checkout validation, order creation
// and the admin order page, so the limits and the printed text agree.

export const GIFT_CARD_FONTS = ["serif", "script", "classic", "modern", "handwritten"] as const;
export type GiftCardFont = (typeof GIFT_CARD_FONTS)[number];

export const GIFT_CARD_MESSAGE_MAX = 200;
export const GIFT_CARD_NAME_MAX = 40;

// Little printed motifs the customer drags onto the front, at most three so
// the message stays the point. Positions are the motif's centre as a
// percentage of the card's width and height, so they print the same at any size.
export const GIFT_CARD_STICKERS = ["heart", "pearl", "star", "sparkle", "flower", "moon"] as const;
export type GiftCardStickerIcon = (typeof GIFT_CARD_STICKERS)[number];
export const GIFT_CARD_STICKER_MAX = 3;

// The colour of the stock on the back, which carries the Perla logo.
export const GIFT_CARD_BACKS = ["ivory", "lagoon", "ruby", "blush"] as const;
export type GiftCardBack = (typeof GIFT_CARD_BACKS)[number];

const stickerSchema = z.object({
  icon: z.enum(GIFT_CARD_STICKERS),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});
export type GiftCardSticker = z.infer<typeof stickerSchema>;

export const giftCardSchema = z.object({
  messageType: z.enum(["preset", "custom"]),
  message: z.string().trim().min(1).max(GIFT_CARD_MESSAGE_MAX),
  recipient: z.string().trim().max(GIFT_CARD_NAME_MAX).optional(),
  sender: z.string().trim().max(GIFT_CARD_NAME_MAX).optional(),
  font: z.enum(GIFT_CARD_FONTS),
  // Optional: carts saved before these existed hold cards without them.
  stickers: z.array(stickerSchema).max(GIFT_CARD_STICKER_MAX).optional(),
  back: z.enum(GIFT_CARD_BACKS).optional(),
});
export type GiftCard = z.infer<typeof giftCardSchema>;

// Reads the stickers stored on an order (a JSON column), dropping anything
// that isn't a valid sticker rather than failing the page.
export function parseGiftCardStickers(value: unknown): GiftCardSticker[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => stickerSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data)
    .slice(0, GIFT_CARD_STICKER_MAX);
}

export function parseGiftCardBack(value: string | null | undefined): GiftCardBack {
  return (GIFT_CARD_BACKS as readonly string[]).includes(value ?? "")
    ? (value as GiftCardBack)
    : "ivory";
}

// What gets printed, line by line, with the greeting and sign-off in the
// customer's language ("For Sofia" / message / "With love, Marco"); the
// templates carry a {name} placeholder so each language can place the name.
export function giftCardLines(
  card: Pick<GiftCard, "message" | "recipient" | "sender">,
  labels: { forLine: string; fromLine: string }
): string[] {
  const fill = (template: string, name: string) => template.replace("{name}", name);
  const lines: string[] = [];
  if (card.recipient?.trim()) lines.push(fill(labels.forLine, card.recipient.trim()));
  lines.push(card.message.trim());
  if (card.sender?.trim()) lines.push(fill(labels.fromLine, card.sender.trim()));
  return lines;
}
