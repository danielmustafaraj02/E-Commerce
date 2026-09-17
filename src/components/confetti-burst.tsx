import type { CSSProperties } from "react";

// One-shot "coriandoli" scatter fired from the wishlist heart the moment an
// item is saved (see wishlist-button.tsx) — mount it, let it play once via
// .confetti-piece (globals.css), then unmount after ~650ms.
const PIECES: { tx: number; ty: number; rot: number; className: string; delay: number }[] = [
  { tx: -20, ty: -24, rot: -35, className: "bg-primary", delay: 0 },
  { tx: 16, ty: -28, rot: 25, className: "bg-secondary", delay: 0.02 },
  { tx: -28, ty: -4, rot: -60, className: "bg-[#f5c451]", delay: 0.04 },
  { tx: 26, ty: -6, rot: 55, className: "bg-danger", delay: 0.06 },
  { tx: -10, ty: -32, rot: 10, className: "bg-success", delay: 0.08 },
  { tx: 22, ty: -22, rot: -15, className: "bg-secondary", delay: 0.03 },
];

export function ConfettiBurst() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {PIECES.map((piece, i) => (
        <span
          key={i}
          className={`confetti-piece absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-sm ${piece.className}`}
          style={
            {
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
