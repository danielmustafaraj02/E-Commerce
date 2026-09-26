"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CART_ITEM_ADDED_EVENT } from "@/lib/cart-store";

const CONFETTI = Array.from({ length: 32 }, (_, index) => {
  const angle = (index / 32) * Math.PI * 2;
  const radius = 21 + (index % 5) * 5;

  return {
    x: `${Math.cos(angle) * radius}vw`,
    y: `${Math.sin(angle) * radius * 0.68}vh`,
    rotate: `${(index % 2 === 0 ? 1 : -1) * (160 + (index % 6) * 55)}deg`,
    delay: `${(index % 8) * 0.035}s`,
    width: index % 3 === 0 ? 7 : 10,
    height: index % 3 === 0 ? 11 : 7,
    shape: index % 4 === 0 ? "round" : "square",
    color: ["petrol", "gold", "rose", "teal"][index % 4],
  };
});

export function CartCelebration() {
  const [run, setRun] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const celebrate = () => {
      setRun((current) => current + 1);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setRun(0), 2800);
    };

    window.addEventListener(CART_ITEM_ADDED_EVENT, celebrate);
    return () => {
      window.removeEventListener(CART_ITEM_ADDED_EVENT, celebrate);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!run) return null;

  return (
    <div key={run} className="cart-celebration" aria-hidden="true">
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className={`cart-celebration__confetti cart-celebration__confetti--${piece.shape} cart-celebration__confetti--${piece.color}`}
          style={
            {
              width: `${piece.width}px`,
              height: `${piece.height}px`,
              "--confetti-x": piece.x,
              "--confetti-y": piece.y,
              "--confetti-rotation": piece.rotate,
              "--confetti-delay": piece.delay,
            } as CSSProperties
          }
        />
      ))}
      <div className="cart-celebration__vehicle">
        <span className="cart-celebration__speed-line cart-celebration__speed-line--one" />
        <span className="cart-celebration__speed-line cart-celebration__speed-line--two" />
        <svg viewBox="0 0 120 100" fill="none">
          <path
            className="cart-celebration__basket"
            d="M13 17h13l10 48a7 7 0 0 0 7 5h43a7 7 0 0 0 6.8-5.3L102 37H33"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M43 45h50M46 56h44" stroke="var(--cart-celebration-gold)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="51" cy="83" r="8" fill="var(--cart-celebration-ground)" stroke="currentColor" strokeWidth="4" />
          <circle cx="87" cy="83" r="8" fill="var(--cart-celebration-ground)" stroke="currentColor" strokeWidth="4" />
          <g className="cart-celebration__wheel-spokes" stroke="var(--cart-celebration-gold)" strokeWidth="2" strokeLinecap="round">
            <path d="M51 78v10m-5-5h10" />
          </g>
          <g className="cart-celebration__wheel-spokes" stroke="var(--cart-celebration-gold)" strokeWidth="2" strokeLinecap="round">
            <path d="M87 78v10m-5-5h10" />
          </g>
          <path d="m78 28 7 7 14-16" stroke="var(--cart-celebration-gold)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
