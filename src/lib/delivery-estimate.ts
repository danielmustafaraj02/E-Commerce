/**
 * The delivery window, in one place.
 *
 * Every surface that quotes a delivery date — the product page, the cart, the
 * checkout, an order confirmation — calls this, so none of them can drift
 * apart and no date is ever written into a template by hand.
 *
 * The window is 14 to 26 CALENDAR days from the day the order is placed. It is
 * an estimate, and the copy that renders it says so.
 *
 * Two rules that matter:
 *
 *  - Before an order exists, the window is counted from TODAY in Europe/Rome.
 *    "Today" is a civil date in the shop's own timezone, not the visitor's and
 *    not UTC: a shopper in Los Angeles at 17:00 on the 1st must see the same
 *    window as the warehouse, which is already on the 2nd.
 *  - Once an order is placed, the window is counted from the SAVED order date,
 *    so a confirmation page does not quietly slide a day later every midnight.
 *
 * Dates are computed from the civil date alone — no clock time, no arithmetic
 * on epoch milliseconds — so a daylight-saving change inside the window cannot
 * shift a boundary by a day. Adding days to a UTC midnight and formatting the
 * result in Europe/Rome is exactly the bug this avoids: on the last Sunday in
 * October, 00:00 UTC + 14 days formats as the day before in Rome.
 */

export const DELIVERY_MIN_DAYS = 14;
export const DELIVERY_MAX_DAYS = 26;

/** The shop's own timezone. The warehouse ships from Italy. */
export const SHOP_TIME_ZONE = "Europe/Rome";

/** A civil date: year, month (1-12), day. No time, no zone. */
export type CivilDate = { year: number; month: number; day: number };

/**
 * The civil date in the shop's timezone at `instant`.
 *
 * Intl is what knows the offset on that particular day, including whether
 * summer time was in force, so the conversion is delegated to it rather than
 * reimplemented with a fixed +1/+2.
 */
export function shopDate(instant: Date = new Date()): CivilDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/**
 * `date` plus `days` calendar days.
 *
 * Done through Date.UTC purely as a calendar calculator — the UTC instant is
 * never formatted or shown — so month lengths, leap years and year ends are
 * handled by the platform, and no timezone is involved at any point.
 */
export function addDays(date: CivilDate, days: number): CivilDate {
  const ms = Date.UTC(date.year, date.month - 1, date.day) + days * 86_400_000;
  const d = new Date(ms);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export type DeliveryWindow = { from: CivilDate; to: CivilDate };

/**
 * The window for an order placed on `orderedOn`, or for one placed now.
 *
 * Pass the order's saved date for anything already ordered; leave it out only
 * where no order exists yet (a product page, a cart).
 */
export function deliveryWindow(orderedOn?: CivilDate | Date | null): DeliveryWindow {
  const start =
    orderedOn instanceof Date
      ? shopDate(orderedOn)
      : (orderedOn ?? shopDate());
  return {
    from: addDays(start, DELIVERY_MIN_DAYS),
    to: addDays(start, DELIVERY_MAX_DAYS),
  };
}

/** A civil date as a UTC-midnight Date, for handing to Intl for formatting. */
function asUtcInstant(date: CivilDate) {
  return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

/**
 * The window as text in the visitor's language — "3 – 15 November", or with
 * the year when the two ends fall in different ones.
 *
 * Formatted in UTC because the value being formatted is a civil date already
 * pinned to UTC midnight; asking Intl for Europe/Rome here would re-apply an
 * offset to a date that has no time of day and can only move it backwards.
 */
export function formatDeliveryWindow(window: DeliveryWindow, locale: string) {
  const crossesYear = window.from.year !== window.to.year;
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    ...(crossesYear ? { year: "numeric" } : {}),
  };
  const fmt = new Intl.DateTimeFormat(locale, options);

  /* formatRange collapses the parts the two dates share — "3–15 November"
     rather than "3 November – 15 November" — in whatever way the locale
     prefers. */
  return fmt.formatRange(asUtcInstant(window.from), asUtcInstant(window.to));
}

/** The whole thing in one call, for a component that just wants the string. */
export function deliveryEstimateText(locale: string, orderedOn?: CivilDate | Date | null) {
  return formatDeliveryWindow(deliveryWindow(orderedOn), locale);
}
