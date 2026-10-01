import type { CSSProperties } from "react";
import "./typing-title.css";

/**
 * The hero title (and the lede under it), typed out like a typewriter —
 * pure CSS, no JavaScript timers.
 *
 * The element itself is the mechanism: its box starts at width 0 and grows to
 * 100% in one discrete step per character (`steps(N, end)`), with the text
 * clipped by `overflow: hidden`. The blinking cursor is the element's own
 * `border-inline-end`, exactly like the classic typewriter — styled in the
 * store's gold rather than a terminal orange.
 *
 * Two variants:
 *  - headline (default): one line, `white-space: nowrap`, border caret. The
 *    caret blinks while the line is written and ends transparent, handing the
 *    eye down to the next line.
 *  - wrapped (`as="p"`): the lede is too long for one line, so it keeps its
 *    normal wrapping and reveals through a stepped clip-path wipe — the same
 *    discrete per-character rhythm, without a horizontal scrollbar. Its caret
 *    is a small inline bar after the last character: it appears exactly when
 *    the line starts typing (via --start-delay) and blinks forever after, so
 *    the cursor comes to rest at the end of the lede.
 *
 * The full text is always in the DOM — crawlers and JS-off visitors see the
 * real text; the animation only unveils what is already there.
 */

/* One keystroke, in ms. Slow enough to read as writing, not as a sweep. */
const MS_PER_CHAR = 95;
/* A longer beat after a space, so the name types as words. */
const WORD_PAUSE = 1.9;
// The whole reveal stays under this, however long the text is.
const MAX_MS = 6500;
// Shortest keystroke, so very long copy still reads as typing.
const MIN_MS = 45;
/* The cursor's blink cycle, matching the reference's .5s step-end blink. */
const CARET_MS = 500;

/** Right-to-left scripts (Arabic) type from the right, which the width
 *  animation delivers natively: the growing box is anchored to the inline
 *  start (the right edge in RTL) and reveals the text from there. */
function isRtl(locale: string) {
  return locale.slice(0, 2).toLowerCase() === "ar";
}

/**
 * How long one line takes to type, in ms — the same arithmetic the component
 * uses internally, exported so a second typed line can start exactly when the
 * first one ends (the caret handoff between the hero title and its lede).
 */
export function typingDurationMs(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  const charCount = words.reduce((total, word) => total + word.length, 0) + words.length - 1;
  const stepMs = Math.max(
    MIN_MS,
    Math.min(MS_PER_CHAR, MAX_MS / Math.max(charCount + 1, 1)),
  );
  return (charCount + 1) * stepMs + (words.length - 1) * stepMs * (WORD_PAUSE - 1);
}

export function TypingTitle({
  text,
  locale = "en",
  className,
  translate,
  as: Tag = "h1",
  startDelayMs = 0,
}: {
  text: string;
  /** BCP-47 tag of the current UI locale, e.g. "ar". */
  locale?: string;
  className?: string;
  translate?: "no" | "yes";
  /** The element to render. The store name is an h1; other typed copy, such
   *  as the hero lede, is a p (and gets the wrapped reveal + inline caret). */
  as?: "h1" | "p" | "h2" | "div";
  /** Wait this long before the first keystroke, so a second line can pick up
   *  exactly where the previous one left off. */
  startDelayMs?: number;
}) {
  const rtl = isRtl(locale);
  const clean = text.replace(/\s+/g, " ").trim();
  const words = clean.split(" ");
  const charCount = words.reduce((total, word) => total + word.length, 0) + words.length - 1;
  /* Keystroke length: the fixed pace, squeezed down if the line is so long
     that the reveal would otherwise drag past MAX_MS. */
  const stepMs = Math.max(
    MIN_MS,
    Math.min(MS_PER_CHAR, MAX_MS / Math.max(charCount + 1, 1)),
  );
  const typingMs = (charCount + 1) * stepMs + (words.length - 1) * stepMs * (WORD_PAUSE - 1);
  const wrapped = Tag !== "h1";

  /* `steps(N, end)` needs a literal integer in the timing function, and N is
     the character count of THIS line — so the longhands are set inline, from
     React, instead of through a custom property (a var() inside steps() is
     not reliably supported, and an invalid timing function would leave the
     box at width 0 forever: a blank headline). */
  const animation: CSSProperties = wrapped
    ? ({
        /* The text child owns the clip animation. Putting these custom
           properties on the line element lets its child inherit the exact
           per-line timing without animating all subtitle lines together. */
        "--typing-animation": rtl ? "typing-clip-rtl" : "typing-clip",
        "--typing-duration": `${Math.round(typingMs)}ms`,
        "--typing-steps": `steps(${Math.max(charCount, 1)}, end)`,
        "--typing-delay": `${Math.round(startDelayMs)}ms`,
        "--start-delay": `${Math.round(startDelayMs)}ms`,
        "--caret-cycle": `${CARET_MS}ms`,
      } as CSSProperties)
    : {
        animationName: "typing-w, typing-caret-blink",
        animationDuration: `${Math.round(typingMs)}ms, ${CARET_MS}ms`,
        animationTimingFunction: `steps(${Math.max(charCount, 1)}, end), step-end`,
        animationDelay: `${Math.round(startDelayMs)}ms, ${Math.round(startDelayMs)}ms`,
        animationIterationCount: "1, 1",
        animationFillMode: "forwards, forwards",
      };

  return (
    <Tag
      className={`typing-title${wrapped ? " typing-title--wrap" : ""} ${className ?? ""}`.trim()}
      translate={translate}
      lang={locale}
      dir={rtl ? "rtl" : "ltr"}
      data-rtl={rtl ? "true" : "false"}
      style={animation}
    >
      {/* The typed line lives in its own span: the clip-path reveal animates
          the whole block, and keeping the text (and the trailing caret) as
          distinct children lets the reduced-motion rule reset them cleanly. */}
      <span className="typing-title__text">{clean}</span>
      {wrapped ? (
        /* The wrapped line's cursor: a gate span holds it invisible until the
           line's own start delay, the bar inside blinks forever after — so
           the cursor comes to rest at the end of the lede. */
        <span className="typing-title__caret-gate" aria-hidden="true">
          <span className="typing-title__caret" />
        </span>
      ) : null}
    </Tag>
  );
}
