// The store's shipping policy as data: free across Europe, €30 to the USA and
// Canada, €40 everywhere else. Applied by scripts/setup-shipping-zones.ts.
import { ALL_COUNTRIES, EU_COUNTRIES, isEuCountry } from "../src/lib/countries";

// Not shipped to: comprehensive sanctions, or payment providers don't serve them.
export const EXCLUDED_COUNTRIES = ["BY", "CU", "IR", "KP", "RU", "SY"];

// EU plus the UK, Switzerland and Norway, and the microstates inside or next
// to Italy/France (San Marino, Vatican City, Monaco).
const EUROPE = [...EU_COUNTRIES, "GB", "CH", "NO", "SM", "VA", "MC"];
const NORTH_AMERICA = ["US", "CA"];

export type ZonePlan = {
  name: string;
  countries: string[];
  method: { name: string; basePrice: number; estimatedDaysMin: number; estimatedDaysMax: number };
};

export function shippingZonePlan(): { europe: string[]; paid: ZonePlan[] } {
  const assigned = new Set([...EUROPE, ...NORTH_AMERICA, ...EXCLUDED_COUNTRIES]);
  return {
    // Europe keeps its existing zone and free methods; only countries are added.
    europe: EUROPE,
    paid: [
      {
        name: "USA & Canada",
        countries: NORTH_AMERICA,
        method: {
          name: "International Shipping (USA & Canada)",
          basePrice: 3000,
          estimatedDaysMin: 5,
          estimatedDaysMax: 10,
        },
      },
      {
        name: "Rest of World",
        countries: ALL_COUNTRIES.filter((c) => !assigned.has(c)),
        method: {
          name: "International Shipping (Rest of World)",
          basePrice: 4000,
          estimatedDaysMin: 7,
          estimatedDaysMax: 15,
        },
      },
    ],
  };
}

// The store-wide VAT rule a destination without one gets. Goods shipped out
// of the EU are VAT-exempt exports (0%). EU buyers pay Italian VAT while
// cross-border EU sales stay under the €10,000/year OSS threshold — above it,
// each country's own rate applies and these rules must be updated.
export function defaultTaxRule(country: string, italianRatePercent: number) {
  return isEuCountry(country)
    ? { country, ratePercent: italianRatePercent, name: "IVA (vendite UE sotto soglia OSS)" }
    : { country, ratePercent: 0, name: "Export (VAT-exempt)" };
}
