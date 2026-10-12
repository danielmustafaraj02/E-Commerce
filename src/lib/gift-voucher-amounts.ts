// The digital gift voucher's amounts and limits, without its validation
// (gift-voucher.ts, built on zod), so the purchase form in the browser can use
// them without bringing zod along. gift-voucher.ts re-exports all of it.

export const GIFT_VOUCHER_AMOUNTS = [10_000, 20_000, 50_000] as const;
export const GIFT_VOUCHER_CURRENCY = "EUR";
export const GIFT_VOUCHER_MESSAGE_MAX = 240;
export const GIFT_VOUCHER_NAME_MAX = 60;
