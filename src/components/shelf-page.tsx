import type { ReactNode } from "react";
import "../app/home.css";
import "../app/shop.css";

// Header band and body column for the storefront pages that use the shelf
// design (app/home.css, app/shop.css). Compose as
// <ShelfMain><ShelfHead/><ShelfBody/></ShelfMain>; ShelfMain (shelf-main.tsx) is
// separate because it pulls in the fonts, which client components can't import.

// Header band. `icon` renders in a violet disc beside the title (account, wishlist);
// `children` sit under the title (a short line of context).
export function ShelfHead({
  title,
  heading,
  icon,
  settle = false,
  children,
  width = "md",
}: {
  title?: ReactNode;
  /** Replaces the default <h1> (for pages with their own, e.g. AnimatedHeading). */
  heading?: ReactNode;
  icon?: ReactNode;
  /** The icon disc drifts into place once (a completed moment, e.g. a paid order). */
  settle?: boolean;
  children?: ReactNode;
  width?: ShelfWidth;
}) {
  return (
    <header className="shop-head">
      <div className={`shelf-wrap ${widthClass(width)}`}>
        <div className="shop-head-row">
          {icon && (
            <span
              className={`shop-avatar ${settle ? "shop-avatar--settle" : ""}`}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <div className="shop-head-text">
            {heading ?? <h1 className="shop-title">{title}</h1>}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}

// `editorial` sets long-form copy (about, guide) in the display face; `airy` adds
// extra room between lines, paragraphs and sections (the long guide).
export function ShelfBody({
  children,
  width = "md",
  editorial = false,
  airy = false,
  className = "",
}: {
  children: ReactNode;
  width?: ShelfWidth;
  editorial?: boolean;
  airy?: boolean;
  className?: string;
}) {
  const modifiers = [editorial && "shop-editorial", airy && "shop-editorial--airy"]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={`shelf-wrap shop-body ${widthClass(width)} ${modifiers} ${className}`}>
      {children}
    </div>
  );
}

// sm ≈ 30rem (a single form), md ≈ 42rem (checkout, account), lg ≈ 48rem (cart),
// full = the site's 64rem column.
export type ShelfWidth = "sm" | "md" | "lg" | "full";

function widthClass(width: ShelfWidth) {
  return width === "full" ? "" : `shop-w-${width}`;
}
