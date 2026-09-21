import { useId } from "react";

// A single glass bead with a few aventurine flecks (the gold specks in Murano
// glass), used as the illustration for quiet moments such as the empty cart.
// Decorative only. Give it the `shop-settle` class to have it drift into place
// once (shop.css; skipped for visitors who ask for reduced motion).
export function BeadMark({ size = 96, className }: { size?: number; className?: string }) {
  const gradient = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradient} cx="38%" cy="32%" r="78%">
          <stop offset="0" stopColor="#efe6f5" />
          <stop offset="0.45" stopColor="#a37ab8" />
          <stop offset="1" stopColor="#5f3676" />
        </radialGradient>
      </defs>
      <ellipse cx="48" cy="87" rx="26" ry="4" fill="#0e3a46" opacity="0.08" />
      <circle cx="48" cy="46" r="36" fill={`url(#${gradient})`} />
      <ellipse
        cx="36"
        cy="31"
        rx="12"
        ry="6.5"
        transform="rotate(-32 36 31)"
        fill="#fff"
        opacity="0.55"
      />
      <g fill="#f5c451" opacity="0.85">
        <circle cx="58" cy="52" r="1.6" />
        <circle cx="66" cy="42" r="1.1" />
        <circle cx="52" cy="64" r="1.2" />
        <circle cx="41" cy="55" r="0.9" />
        <circle cx="62" cy="62" r="0.8" />
      </g>
    </svg>
  );
}
