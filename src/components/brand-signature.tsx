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
      <svg className="brand-signature-mark" viewBox="0 0 72 24" fill="none" aria-hidden="true">
        <g className="brand-signature-wave">
          <path
            d="M1 12C7 8 13 8 19 12S31 16 37 12 49 8 55 12 65 16 71 12"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </g>
        <g className="brand-signature-nest" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 8c6 4 14 6 23 6s17-2 23-6" stroke="#b89a62" strokeWidth="1.25" />
          <path d="M16 9c2 7 9 12 20 12S54 16 56 9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M19 12c5 4 11 6 17 6s12-2 17-6M23 16c4 2 8 3 13 3s9-1 13-3" stroke="#b89a62" strokeWidth="1" />
          <path d="m17 10-5 1m43-1 5 1m-39 5-5 2m43-2 5 2" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="31" cy="8.5" rx="3" ry="3.8" fill="#f8f5ef" stroke="#b89a62" strokeWidth=".8" />
          <ellipse cx="40" cy="8.5" rx="3" ry="3.8" fill="#f8f5ef" stroke="#b89a62" strokeWidth=".8" />
        </g>
      </svg>
    </p>
  );
}
