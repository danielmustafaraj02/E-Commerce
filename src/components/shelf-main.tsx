import type { ReactNode } from "react";
import { homeFontClasses } from "@/app/home-fonts";
import "../app/home.css";
import "../app/shop.css";

// The <main> of a shelf-design page: the tinted ground plus the display and UI
// fonts (app/home.css, app/shop.css). Server components only — see shelf-page.tsx.
export function ShelfMain({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={`shelf flex flex-1 flex-col ${homeFontClasses} ${className}`}>
      {children}
    </main>
  );
}
