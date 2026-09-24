"use client";

import { useEffect } from "react";
import { trackLookEvent } from "@/lib/look-analytics";

// Reports a complete-the-look purchase once per order, on the confirmation
// page. sessionStorage keeps a reload from counting it twice.
export function LookPurchaseTracker({
  orderNumber,
  saving,
}: {
  orderNumber: string;
  saving: number;
}) {
  useEffect(() => {
    const key = `look-purchase:${orderNumber}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: report it anyway
    }
    trackLookEvent("purchased", { orderNumber, saving });
  }, [orderNumber, saving]);

  return null;
}
