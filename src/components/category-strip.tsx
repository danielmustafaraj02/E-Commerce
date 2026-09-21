"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The home page's category list. On desktop it is a grid and nothing here does
// anything. On phones CSS turns it into a swipeable strip, and this opens it on
// the middle item (the necklaces), so the neighbours peek in from both sides and
// it is obvious there is more to swipe to, instead of starting at the far edge.
export function CategoryStrip({ children, className }: { children: ReactNode; className: string }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth + 1) return; // grid layout: no overflow
    const item = list.children[Math.floor(list.children.length / 2)];
    if (!item) return;
    const listBox = list.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();
    // Horizontal only, so it never scrolls the page itself.
    list.scrollBy({
      left: itemBox.left + itemBox.width / 2 - (listBox.left + listBox.width / 2),
      behavior: "instant",
    });
  }, []);

  return (
    <ul ref={listRef} className={className}>
      {children}
    </ul>
  );
}
