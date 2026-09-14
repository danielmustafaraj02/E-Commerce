// A short trust-signal row shown near the price/buy button — the exact
// placement the competitor research (murano-storefront-improvement-prompt.md
// §2) called out as effective. The authenticity line is admin-editable
// (StoreSettings.trustBadgeText) so it stays true if the catalog changes;
// the returns/security lines are always shown since they're always true —
// the 14-day EU withdrawal right and hosted-checkout security don't depend
// on what's being sold.
function CheckSealIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function TrustBadges({
  trustBadgeText,
  dict,
}: {
  trustBadgeText: string | null;
  dict: { returnsBadge: string; secureBadge: string };
}) {
  return (
    <ul className="text-foreground/70 mt-6 flex flex-col gap-2 text-sm">
      {trustBadgeText && (
        <li className="flex items-center gap-2">
          <CheckSealIcon />
          {trustBadgeText}
        </li>
      )}
      <li className="flex items-center gap-2">
        <ReturnIcon />
        {dict.returnsBadge}
      </li>
      <li className="flex items-center gap-2">
        <LockIcon />
        {dict.secureBadge}
      </li>
    </ul>
  );
}
