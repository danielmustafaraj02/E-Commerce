"use client";

// Shared prev/next arrow button for every homepage carousel. Deliberately
// placed *outside* Swiper's own slide track (a flex sibling, not an
// absolutely-positioned overlay on top of the cards) — Swiper's built-in
// nav buttons float over the slide content itself, which clipped card text
// as soon as a card's text ran close to the edge (see git history: this
// replaced an earlier version that fought that overlap with padding/offset
// tuning and still clipped text).
export function CarouselNavButton({
  direction,
  refCallback,
  label,
}: {
  direction: "prev" | "next";
  refCallback: (el: HTMLButtonElement | null) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      ref={refCallback}
      aria-label={label}
      className="carousel-nav-btn"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          d={direction === "prev" ? "M12.5 4.5L7 10l5.5 5.5" : "M7.5 4.5L13 10l-5.5 5.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
