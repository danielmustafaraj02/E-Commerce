// The spaced store name with a small wave beneath (a nod to the lagoon and to
// drawn glass), closing the footer and the mobile menu.
export function BrandWave({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1 10C7 6 13 6 19 10S31 14 37 10 49 6 55 10 65 14 71 10"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandSignature({ storeName }: { storeName: string }) {
  return (
    <p className="brand-signature" translate="no">
      <span>{storeName}</span>
      <BrandWave />
    </p>
  );
}
