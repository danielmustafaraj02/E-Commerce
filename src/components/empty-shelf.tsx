import type { CSSProperties } from "react";
import { Link } from "@/components/localized-link";

// Empty cart / wishlist: an animated line icon (a beating heart, a cart
// skidding into its circle), one line in the display serif, one sentence, one CTA.
export function EmptyShelf({
  icon,
  title,
  body,
  cta,
  href = "/products",
}: {
  icon: "heart" | "cart";
  title: string;
  body: string;
  cta: string;
  href?: string;
}) {
  const confettiColors = ["#b89a62", "#17464a", "#d6b5a1", "#8da9a5"];

  return (
    <div className="shop-empty-atelier">
      {icon === "heart" && (
        <div className="shop-empty-confetti" aria-hidden="true">
          {Array.from({ length: 48 }, (_, index) => {
            const angle = (index / 48) * Math.PI * 2;
            const burst = 5 + (index % 5) * 2;

            return (
              <span
                key={index}
                className={`shop-empty-confetti-piece shop-empty-confetti-piece--${["ribbon", "dot", "diamond"][index % 3]}`}
                style={
                  {
                    left: `${50 + Math.cos(angle) * 1.5}%`,
                    top: `${70 + Math.sin(angle) * 1.5}vh`,
                    backgroundColor: confettiColors[index % confettiColors.length],
                    animationDelay: `${(index % 8) * 35}ms`,
                    animationDuration: `${2300 + (index % 7) * 170}ms`,
                    "--confetti-burst-x": `${Math.cos(angle) * burst}vw`,
                    "--confetti-burst-y": `${Math.sin(angle) * burst}vh`,
                    "--confetti-drift-x": `${Math.cos(angle) * (18 + (index % 6) * 5)}vw`,
                    "--confetti-fall-y": `${25 + (index % 5) * 7}vh`,
                    "--confetti-spin": `${(index % 2 === 0 ? 1 : -1) * (540 + (index % 7) * 180)}deg`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
      )}
      {icon === "cart" && (
        <span className="shop-empty-cart-trail" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
      <span className={`shop-empty-icon shop-empty-icon--${icon}`} aria-hidden="true">
        {icon === "heart" ? (
          <svg viewBox="0 0 24 24" width="50" height="50" fill="none">
            <path
              d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="52" height="52" fill="none">
            <g className="shop-empty-cart-body">
              <path
                d="M2.5 3.5h2.2l2.2 11h10.8l2.3-8H6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="19" r="1.6" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="16.5" cy="19" r="1.6" stroke="currentColor" strokeWidth="1.7" />
            </g>
          </svg>
        )}
      </span>
      <h2 className="shop-empty-title">{title}</h2>
      <p className="shop-empty-body">{body}</p>
      <Link href={href} className="shelf-button">
        {cta}
        <span aria-hidden="true" className="shelf-button-arrow">
          →
        </span>
      </Link>
      <p className="shop-empty-signature" aria-hidden="true" translate="no">
        Murano · Venezia
      </p>
    </div>
  );
}
