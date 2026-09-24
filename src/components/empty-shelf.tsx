import Link from "next/link";

// Empty cart / wishlist: an animated line icon (a beating heart, a cart
// rolling in place), one line in the display serif, one sentence, one CTA.
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
  return (
    <div className="shop-empty-atelier">
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
