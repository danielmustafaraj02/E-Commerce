import { z } from "zod";
import {
  GIFT_CARD_BACKS,
  GIFT_CARD_EMAIL_MAX,
  GIFT_CARD_FONTS,
  GIFT_CARD_MESSAGE_MAX,
  GIFT_CARD_NAME_MAX,
  GIFT_CARD_STICKERS,
  GIFT_CARD_STICKER_MAX,
  type GiftCardBack,
} from "@/lib/gift-card-options";

export { giftCardLines } from "@/lib/gift-card-lines";
export * from "@/lib/gift-card-options";

// The personalised gift card add-on: a digital card, bought only together with
// an order and emailed to the recipient once that order is paid. Shared by the
// designer page, the cart, checkout validation, order creation, the email, the
// card's own page and the admin order page, so the limits and the text agree.

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
  // Where the card is emailed once the order is paid.
  recipientEmail: z.string().trim().toLowerCase().email().max(GIFT_CARD_EMAIL_MAX),
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

