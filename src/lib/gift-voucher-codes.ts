import { randomBytes } from "node:crypto";

// Split out of gift-voucher.ts: this is the only part of a gift voucher's
// definition that needs Node's crypto, and gift-voucher.ts's constants and
// schema are imported by a "use client" form (gift-voucher-purchase-form.tsx).
// Webpack has no browser-side "node:crypto", so pulling it in through that
// import chain broke the client bundle. Keep this file's exports out of
// anything a client component imports.

export function createGiftVoucherCode(): string {
  const body = randomBytes(16).toString("hex").toUpperCase();
  return `PERLA-${body.match(/.{1,8}/g)!.join("-")}`;
}

export function normalizeGiftVoucherCode(value: string): string {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = compact.startsWith("PERLA") ? compact.slice(5) : compact;
  const groups = body.match(/.{1,8}/g);
  return groups?.length === 4 && groups.join("").length === 32 ? `PERLA-${groups.join("-")}` : "";
}
