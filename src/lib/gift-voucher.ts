import { z } from "zod";

export const GIFT_VOUCHER_AMOUNTS = [10_000, 20_000, 50_000] as const;
export const GIFT_VOUCHER_CURRENCY = "EUR";
export const GIFT_VOUCHER_MESSAGE_MAX = 240;
export const GIFT_VOUCHER_NAME_MAX = 60;

export const giftVoucherPurchaseSchema = z.object({
  amount: z
    .number()
    .int()
    .refine((value) =>
      GIFT_VOUCHER_AMOUNTS.includes(value as (typeof GIFT_VOUCHER_AMOUNTS)[number])
    ),
  buyerEmail: z.string().trim().email().max(254).optional(),
  recipientEmail: z.string().trim().email().max(254),
  recipientName: z.string().trim().max(GIFT_VOUCHER_NAME_MAX).optional(),
  senderName: z.string().trim().max(GIFT_VOUCHER_NAME_MAX).optional(),
  message: z.string().trim().max(GIFT_VOUCHER_MESSAGE_MAX).optional(),
  turnstileToken: z.string().max(4096).optional(),
});

export type GiftVoucherPurchase = z.infer<typeof giftVoucherPurchaseSchema>;

// createGiftVoucherCode / normalizeGiftVoucherCode moved to
// @/lib/gift-voucher-codes (the node:crypto half of a gift voucher's
// definition) — see that file for why.
