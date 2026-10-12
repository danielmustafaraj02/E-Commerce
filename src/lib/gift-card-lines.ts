import type { GiftCard } from "@/lib/gift-card";

// Presentation only: importing the printed text must not pull checkout's
// validation library into the cart or the homepage's gift-card preview.
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
