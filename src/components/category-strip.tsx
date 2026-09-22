"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";

// The home page's category list. On desktop it is a static 3-column grid and
// nothing here does anything (checked via matchMedia, matching home.css's
// own 47.99rem breakpoint). On phones it becomes a one-card-at-a-time
// carousel that loops in both directions, advances by itself, and shows a
// row of dots (one per category, the current one highlighted) so it reads
// as "there's more, swipe" rather than a single static card.
const AUTOPLAY_MS = 4500;
const RESUME_AFTER_INTERACTION_MS = 6000;
const MOBILE_QUERY = "(max-width: 47.99rem)";

export function CategoryStrip({ children, className }: { children: ReactNode; className: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const dotCount = Children.count(children);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const realCount = list.children.length;
    if (realCount < 2) return;
    if (!window.matchMedia(MOBILE_QUERY).matches) return;

    const setActiveDot = (realIndex: number) => {
      const dots = dotsRef.current?.children;
      if (!dots) return;
      for (let i = 0; i < dots.length; i++) {
        dots[i].classList.toggle("is-active", i === realIndex);
      }
    };

    // Loop trick: clone the first and last card to the opposite ends. A
    // swipe (or autoplay step) that lands on a clone is instantly (no
    // animation) re-centered on the matching real card, so the wrap is
    // invisible — the alternative, disabling native scrolling to hand-roll
    // wraparound, would give up momentum scrolling and swipe-back-to-cancel,
    // both of which this keeps for free.
    const firstClone = list.children[0].cloneNode(true) as HTMLElement;
    const lastClone = list.children[realCount - 1].cloneNode(true) as HTMLElement;
    for (const clone of [firstClone, lastClone]) {
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("inert", "");
    }
    list.appendChild(firstClone);
    list.insertBefore(lastClone, list.children[0]);

    const cardLeft = (i: number) => (list.children[i] as HTMLElement).offsetLeft;
    let index = 1; // index 0 is now the cloned last card; 1 is the real first
    list.scrollLeft = cardLeft(index);
    setActiveDot(0);

    const goTo = (nextIndex: number, smooth: boolean) => {
      index = nextIndex;
      setActiveDot(index - 1);
      list.scrollTo({ left: cardLeft(index), behavior: smooth ? "smooth" : "instant" });
    };

    // After a swipe or an autoplay step settles, find whichever card is
    // actually nearest the scroll position and, if it's a clone, jump to
    // the real card it stands in for.
    let settleTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        let nearest = 0;
        let nearestDist = Infinity;
        for (let i = 0; i < list.children.length; i++) {
          const dist = Math.abs(cardLeft(i) - list.scrollLeft);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = i;
          }
        }
        if (nearest === 0) {
          goTo(realCount, false); // on the cloned-last card -> jump to the real last
        } else if (nearest === list.children.length - 1) {
          goTo(1, false); // on the cloned-first card -> jump to the real first
        } else {
          index = nearest;
          setActiveDot(index - 1);
        }
      }, 120);
    };
    list.addEventListener("scroll", onScroll, { passive: true });

    // Autoplay pauses the moment a finger touches the strip and resumes a
    // few seconds after it's released, so it never fights a swipe in
    // progress. Skipped entirely for prefers-reduced-motion, same as every
    // other auto-playing motion in this app.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let autoplayTimer: ReturnType<typeof setInterval> | null = null;
    let resumeTimer: ReturnType<typeof setTimeout>;

    const stopAutoplay = () => {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    };
    const startAutoplay = () => {
      if (reducedMotion || autoplayTimer || document.hidden) return;
      autoplayTimer = setInterval(() => goTo(index + 1, true), AUTOPLAY_MS);
    };
    const pauseThenResume = () => {
      stopAutoplay();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAutoplay, RESUME_AFTER_INTERACTION_MS);
    };
    const onVisibilityChange = () => (document.hidden ? stopAutoplay() : startAutoplay());

    list.addEventListener("pointerdown", pauseThenResume);
    document.addEventListener("visibilitychange", onVisibilityChange);
    startAutoplay();

    return () => {
      list.removeEventListener("scroll", onScroll);
      list.removeEventListener("pointerdown", pauseThenResume);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimeout(settleTimer);
      clearTimeout(resumeTimer);
      stopAutoplay();
      firstClone.remove();
      lastClone.remove();
    };
  }, []);

  return (
    <>
      <ul ref={listRef} className={className}>
        {children}
      </ul>
      {dotCount > 1 && (
        <div ref={dotsRef} className="category-dots sm:hidden" aria-hidden="true">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span key={i} className={`category-dot ${i === 0 ? "is-active" : ""}`} />
          ))}
        </div>
      )}
    </>
  );
}
