import { ShelfMain } from "@/components/shelf-main";
import { ShelfBody } from "@/components/shelf-page";

// Skeleton shown while any storefront route streams in. It uses the same
// ground, header band and 2:3 tiles as the pages it stands in for, so the swap
// doesn't flash white or shift the layout.
export default function Loading() {
  return (
    <ShelfMain>
      <header className="shop-head" aria-hidden="true">
        <div className="shelf-wrap">
          <div className="shop-skeleton animate-pulse" style={{ height: "3rem", width: "16rem" }} />
        </div>
      </header>
      <ShelfBody width="full">
        <ul className="shelf-row" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="flex flex-col gap-2">
              <div className="shop-skeleton shop-skeleton--photo animate-pulse" />
              <div
                className="shop-skeleton animate-pulse"
                style={{ height: "1.1rem", width: "75%" }}
              />
              <div
                className="shop-skeleton animate-pulse"
                style={{ height: "1rem", width: "33%" }}
              />
            </li>
          ))}
        </ul>
      </ShelfBody>
    </ShelfMain>
  );
}
