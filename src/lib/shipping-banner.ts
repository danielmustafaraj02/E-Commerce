import { cache } from "react";
import { db } from "@/lib/db";
import { applyTemplate } from "@/lib/i18n/format";

// The shipping line (announcement bar, footer, cart, product page) reads its
// prices from the same zones checkout charges from, so the two can't drift.
// One country stands in for each part of the policy.
const EUROPE = "IT";
const NORTH_AMERICA = "US";
const REST_OF_WORLD = "JP";

type ZoneForBanner = {
  countries: { country: string }[];
  methods: { method: { basePrice: number; active: boolean } }[];
};

// Cheapest active method per stand-in country, or null if the policy the text
// describes (free Europe, paid USA/Canada and rest of world) isn't configured.
export function bannerRates(zones: ZoneForBanner[]) {
  const cheapest = (country: string) => {
    const zone = zones.find((z) => z.countries.some((c) => c.country === country));
    const prices = (zone?.methods ?? [])
      .filter((l) => l.method.active)
      .map((l) => l.method.basePrice);
    return prices.length ? Math.min(...prices) : null;
  };
  const europe = cheapest(EUROPE);
  const northAmerica = cheapest(NORTH_AMERICA);
  const rest = cheapest(REST_OF_WORLD);
  if (europe !== 0 || northAmerica === null || rest === null) return null;
  return { northAmerica, rest };
}

function formatPrice(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

// The resolved banner text, or null (hide it) when the zones don't match it.
// Cached per request: several components on one page render it.
export const getShippingBanner = cache(
  async (template: string, currency: string, locale: string): Promise<string | null> => {
    const zones = await db.shippingZone.findMany({
      where: { countries: { some: { country: { in: [EUROPE, NORTH_AMERICA, REST_OF_WORLD] } } } },
      select: {
        countries: {
          where: { country: { in: [EUROPE, NORTH_AMERICA, REST_OF_WORLD] } },
          select: { country: true },
        },
        methods: { select: { method: { select: { basePrice: true, active: true } } } },
      },
    });
    const rates = bannerRates(zones);
    if (!rates) return null;
    return applyTemplate(template, {
      northAmerica: formatPrice(rates.northAmerica, currency, locale),
      rest: formatPrice(rates.rest, currency, locale),
    });
  }
);
