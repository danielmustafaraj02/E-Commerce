import { track } from "@vercel/analytics";
import { CONSENT_STORAGE_KEY, parseConsent } from "@/lib/consent";

// Gift Finder funnel events for Vercel Analytics (custom events), sent only
// with analytics consent — same rule and pattern as lib/look-analytics.ts.
export type GiftFinderEvent =
  | "finder_opened"
  | "finder_started"
  | "finder_completed"
  | "result_clicked"
  | "bundle_clicked"
  | "added_to_cart"
  | "purchase";

export function trackGiftFinderEvent(event: GiftFinderEvent, props: Record<string, string | number>) {
  try {
    if (parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY))?.analytics !== true) return;
  } catch {
    return; // storage blocked: no recorded consent
  }
  track(`gift_finder_${event}`, props);
}
