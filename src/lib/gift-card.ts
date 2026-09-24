import { z } from "zod";

// The personalised gift card add-on: a printed card packed with the order.
// Shared by the designer page, the cart, checkout validation, order creation
// and the admin order page, so the limits and the printed text agree.

export const GIFT_CARD_FONTS = ["serif", "script", "classic", "modern", "handwritten"] as const;
export type GiftCardFont = (typeof GIFT_CARD_FONTS)[number];

export const GIFT_CARD_MESSAGE_MAX = 200;
export const GIFT_CARD_NAME_MAX = 40;

export const giftCardSchema = z.object({
  messageType: z.enum(["preset", "custom"]),
  message: z.string().trim().min(1).max(GIFT_CARD_MESSAGE_MAX),
  recipient: z.string().trim().max(GIFT_CARD_NAME_MAX).optional(),
  sender: z.string().trim().max(GIFT_CARD_NAME_MAX).optional(),
  font: z.enum(GIFT_CARD_FONTS),
});
export type GiftCard = z.infer<typeof giftCardSchema>;

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
