// schema.org shipping / return details for a Product's Offer. Google uses them
// to show delivery cost/time and return terms on merchant listings and in
// results, and they must match what a shopper actually sees — so both are
// derived from the same data the checkout uses (shipping zones and methods),
// never hard-coded guesses.

// The EU statutory minimum, and what the checkout and product pages promise
// ("14-day right of withdrawal"). Change it here if the store's own policy is
// longer and the visible copy is updated to match.
export const EU_WITHDRAWAL_DAYS = 14;

export type ShippingZoneInput = {
  countries: { country: string }[];
  methods: {
    method: {
      active: boolean;
      basePrice: number; // cents
      estimatedDaysMin: number;
      estimatedDaysMax: number;
    };
  }[];
};

const money = (cents: number) => (cents / 100).toFixed(2);

// One OfferShippingDetails per zone, priced at that zone's cheapest active
// method (what a shopper is offered first), or free when this product alone
// already reaches the free-shipping threshold. Zones with no countries or no
// usable method are skipped rather than advertised.
export function buildShippingDetails(
  zones: ShippingZoneInput[],
  opts: { priceCents: number; currency: string; freeShippingThresholdCents: number | null }
) {
  const details = zones.flatMap((zone) => {
    const countries = zone.countries.map((c) => c.country);
    const methods = zone.methods.map((link) => link.method).filter((method) => method.active);
    if (countries.length === 0 || methods.length === 0) return [];

    const cheapest = methods.reduce((best, method) =>
      method.basePrice < best.basePrice ? method : best
    );
    const freeShipping =
      opts.freeShippingThresholdCents !== null &&
      opts.priceCents >= opts.freeShippingThresholdCents;

    return [
      {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: money(freeShipping ? 0 : cheapest.basePrice),
          currency: opts.currency,
        },
        shippingDestination: countries.map((addressCountry) => ({
          "@type": "DefinedRegion",
          addressCountry,
        })),
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: cheapest.estimatedDaysMin,
            maxValue: cheapest.estimatedDaysMax,
            unitCode: "DAY",
          },
        },
      },
    ];
  });
  return details.length > 0 ? details : undefined;
}

// Return window for every country the store ships to. Fees are left out on
// purpose: the store doesn't state who pays for return shipping in structured
// terms, and an unstated fact must not be published as free returns.
export function buildReturnPolicy(
  zones: ShippingZoneInput[],
  opts: { returnPolicyUrl?: string; days?: number } = {}
) {
  const countries = [...new Set(zones.flatMap((zone) => zone.countries.map((c) => c.country)))];
  if (countries.length === 0) return undefined;

  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: countries,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: opts.days ?? EU_WITHDRAWAL_DAYS,
    returnMethod: "https://schema.org/ReturnByMail",
    ...(opts.returnPolicyUrl ? { merchantReturnLink: opts.returnPolicyUrl } : {}),
  };
}
