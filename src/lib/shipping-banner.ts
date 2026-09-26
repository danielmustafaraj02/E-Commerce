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

type ZoneWithDays = {
  countries: { country: string }[];
  methods: {
    method: {
      basePrice: number;
      active: boolean;
      estimatedDaysMin: number;
      estimatedDaysMax: number;
    };
  }[];
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

// Delivery estimate per region, from its standard method: the cheapest,
// and of equally cheap ones the slowest, so the FAQ never promises express
// speed. Null unless all three regions have an active method.
export function shippingDays(zones: ZoneWithDays[]) {
  const days = (country: string) => {
    const zone = zones.find((z) => z.countries.some((c) => c.country === country));
    const standard = (zone?.methods ?? [])
      .map((l) => l.method)
      .filter((m) => m.active)
      .sort((a, b) => a.basePrice - b.basePrice || b.estimatedDaysMax - a.estimatedDaysMax)[0];
    if (!standard) return null;
    const { estimatedDaysMin: min, estimatedDaysMax: max } = standard;
    return min === max ? String(min) : `${min}–${max}`;
  };
  const europe = days(EUROPE);
  const northAmerica = days(NORTH_AMERICA);
  const rest = days(REST_OF_WORLD);
  if (!europe || !northAmerica || !rest) return null;
  return { europe, northAmerica, rest };
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
const loadZones = cache(() =>
  db.shippingZone.findMany({
    where: { countries: { some: { country: { in: [EUROPE, NORTH_AMERICA, REST_OF_WORLD] } } } },
    select: {
      countries: {
        where: { country: { in: [EUROPE, NORTH_AMERICA, REST_OF_WORLD] } },
        select: { country: true },
      },
      methods: {
        select: {
          method: {
            select: {
              basePrice: true,
              active: true,
              estimatedDaysMin: true,
              estimatedDaysMax: true,
            },
          },
        },
      },
    },
  })
);

// Shipping prices and delivery times for the FAQ, or nulls where the zones
// don't describe the policy (the FAQ then points to checkout instead).
export const getShippingFacts = cache(async (currency: string, locale: string) => {
  const zones = await loadZones();
  const rates = bannerRates(zones);
  return {
    prices: rates && {
      northAmerica: formatPrice(rates.northAmerica, currency, locale),
      rest: formatPrice(rates.rest, currency, locale),
    },
    days: shippingDays(zones),
  };
});

export const getShippingBanner = cache(
  async (template: string, currency: string, locale: string): Promise<string | null> => {
    const zones = await loadZones();
    const rates = bannerRates(zones);
    if (!rates) return null;
    return applyTemplate(template, {
      northAmerica: formatPrice(rates.northAmerica, currency, locale),
      rest: formatPrice(rates.rest, currency, locale),
    });
  }
);
