"use client";

import { useEffect } from "react";
import { trackGiftFinderEvent } from "@/lib/gift-finder-analytics";

// Set by the Gift Finder result screen (src/app/gift-finder/gift-finder-flow.tsx)
// whenever a shopper adds a recommended pick or its matching set to the cart,
// so a purchase can be attributed back to the finder without a DB column —
// same sessionStorage-flag idea as LookPurchaseTracker, one level up: that
// component reports every bundle purchase, this one reports only purchases
// that started in the finder.
export const GIFT_FINDER_ATTRIBUTION_KEY = "gift-finder-attribution";

// Reports a Gift Finder-attributed purchase once per order, on the
// confirmation page. sessionStorage keys keep a reload (or a purchase from
// a different session) from double-counting or misattributing.
export function GiftFinderPurchaseTracker({ orderNumber }: { orderNumber: string }) {
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(GIFT_FINDER_ATTRIBUTION_KEY)) return;

      const reportedKey = `gift-finder-purchase:${orderNumber}`;
      if (sessionStorage.getItem(reportedKey)) return;
      sessionStorage.setItem(reportedKey, "1");
      sessionStorage.removeItem(GIFT_FINDER_ATTRIBUTION_KEY);

      trackGiftFinderEvent("purchase", { orderNumber });
    } catch {
      // storage blocked: nothing to attribute
    }
  }, [orderNumber]);

  return null;
}
