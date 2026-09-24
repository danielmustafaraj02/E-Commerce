// The spaced store name with a small wave beneath (a nod to the lagoon and to
// drawn glass), closing the footer and the mobile menu.
export function BrandWave({ className = "" }: { className?: string }) {
  return (
    <svg
      width="56"
      height="10"
      viewBox="0 0 56 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 6c6-5 10-5 16 0s10 5 16 0 10-5 20-1" />
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
