import type { CSSProperties } from "react";

// One-shot "coriandoli" scatter — mount it over a relatively-positioned
// parent, let it play once via .confetti-piece (globals.css), then unmount
// (or just leave it; it's invisible and inert once the animation ends).
// Used by the wishlist heart (wishlist-button.tsx) and the post-registration
// welcome moment (account/page.tsx).
const PIECES: {
  tx: number;
  ty: number;
  rot: number;
  w: number;
  h: number;
  rounded: string;
  className: string;
  delay: number;
}[] = [
  {
    tx: -38,
    ty: -46,
    rot: -40,
    w: 8,
    h: 8,
    rounded: "rounded-sm",
    className: "bg-accent",
    delay: 0,
  },
  {
    tx: 30,
    ty: -52,
    rot: 30,
    w: 10,
    h: 6,
    rounded: "rounded-sm",
    className: "bg-[color:var(--glass-teal)]",
    delay: 0.02,
  },
  {
    tx: -52,
    ty: -10,
    rot: -70,
    w: 8,
    h: 8,
    rounded: "rounded-full",
    className: "bg-[#f5c451]",
    delay: 0.04,
  },
  {
    tx: 48,
    ty: -14,
    rot: 65,
    w: 6,
    h: 10,
    rounded: "rounded-sm",
    className: "bg-[color:var(--glass-rose)]",
    delay: 0.06,
  },
  {
    tx: -18,
    ty: -58,
    rot: 15,
    w: 8,
    h: 8,
    rounded: "rounded-full",
    className: "bg-[color:var(--glass-gold)]",
    delay: 0.08,
  },
  {
    tx: 40,
    ty: -40,
    rot: -20,
    w: 10,
    h: 8,
    rounded: "rounded-sm",
    className: "bg-[color:var(--glass-teal)]",
    delay: 0.03,
  },
  {
    tx: -44,
    ty: 20,
    rot: 50,
    w: 8,
    h: 6,
    rounded: "rounded-sm",
    className: "bg-accent",
    delay: 0.05,
  },
  {
    tx: 44,
    ty: 24,
    rot: -45,
    w: 8,
    h: 8,
    rounded: "rounded-sm",
    className: "bg-[#f5c451]",
    delay: 0.07,
  },
  {
    tx: -10,
    ty: 36,
    rot: 80,
    w: 6,
    h: 10,
    rounded: "rounded-sm",
    className: "bg-[color:var(--glass-rose)]",
    delay: 0.09,
  },
  {
    tx: 16,
    ty: 42,
    rot: -60,
    w: 8,
    h: 8,
    rounded: "rounded-full",
    className: "bg-[color:var(--glass-gold)]",
    delay: 0.1,
  },
];

export function ConfettiBurst() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {PIECES.map((piece, i) => (
        <span
          key={i}
          className={`confetti-piece absolute top-1/2 left-1/2 ${piece.rounded} ${piece.className}`}
          style={
            {
              width: `${piece.w}px`,
              height: `${piece.h}px`,
              "--tx": `${piece.tx}px`,
              "--ty": `${piece.ty}px`,
              "--rot": `${piece.rot}deg`,
              animationDelay: `${piece.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
