"use client";

import { useEffect, useState } from "react";
import { deliveryEstimateText } from "@/lib/delivery-estimate";

/**
 * "Estimated delivery: 3 – 15 November · 14–26 days from your order".
 *
 * The window itself comes from lib/delivery-estimate.ts, the one place that
 * knows the rule, so this cannot disagree with the cart, the checkout or an
 * order confirmation.
 *
 * It is rendered on the server AND recomputed once on mount. Both halves
 * matter:
 *
 *  - the server value is what the first paint and every crawler see, so the
 *    estimate is in the HTML rather than appearing a frame later;
 *  - the mount recompute is what keeps a CACHED page honest. A product page
 *    held in a CDN or in Next's full route cache would otherwise keep quoting
 *    the window that was current when it was rendered, which goes stale at the
 *    first midnight. Correcting it in an effect rather than during render is
 *    also what keeps hydration clean: the first client render is byte-identical
 *    to the server's, and the new value lands afterwards.
 */
export function DeliveryEstimate({
  locale,
  label,
  window: windowLabel,
  note,
  initialRange,
}: {
  locale: string;
  label: string;
  /** "14–26 days from your order". */
  window: string;
  /** "Estimate, not a guarantee". */
  note: string;
  /** The range as the server computed it. */
  initialRange: string;
}) {
  const [range, setRange] = useState(initialRange);

  useEffect(() => {
    /* Deferred by a frame rather than written in the effect's own synchronous
       pass: a state write there cascades a second render before paint, and on
       the overwhelmingly common path (a page that is not stale) the value is
       identical anyway. */
    const id = requestAnimationFrame(() => {
      const fresh = deliveryEstimateText(locale);
      setRange((current) => (fresh === current ? current : fresh));
    });
    return () => cancelAnimationFrame(id);
  }, [locale]);

  return (
    <p className="shop-delivery-estimate">
      <span className="shop-delivery-estimate-label">{label}</span>
      <span className="shop-delivery-estimate-range">{range}</span>
      <span className="shop-delivery-estimate-window">{windowLabel}</span>
      {/* Said plainly, because it is an estimate and the brief is explicit
          that it must not read as a promise. */}
      <span className="shop-delivery-estimate-note">{note}</span>
    </p>
  );
}
