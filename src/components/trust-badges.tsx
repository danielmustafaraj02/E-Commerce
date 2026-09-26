// A short trust-signal row shown near the price/buy button — the exact
// placement the competitor research (murano-storefront-improvement-prompt.md
// §2) called out as effective. Four short checkmarked facts that are always
// true regardless of catalog (handmade origin, checkout security, tracked
// shipping, easy returns), plus an optional 5th admin-editable line
// (StoreSettings.trustBadgeText) for anything store-specific. Deliberately
// compact — short phrases, not sentences — so this reads at a glance.
function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary shrink-0"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function TrustBadges({
  trustBadgeText,
  dict,
}: {
  trustBadgeText: string | null;
  dict: {
    handmadeInMurano: string;
    secureBadge: string;
    trackedShipping: string;
    returnsBadge: string;
  };
}) {
  const items = [
    dict.handmadeInMurano,
    dict.secureBadge,
    dict.trackedShipping,
    dict.returnsBadge,
    trustBadgeText,
  ].filter((item): item is string => Boolean(item));

  return (
    <ul className="text-foreground/70 mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5">
          <CheckIcon />
          {item}
        </li>
      ))}
    </ul>
  );
}
