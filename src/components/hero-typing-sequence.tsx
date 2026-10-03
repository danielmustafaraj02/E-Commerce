"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./hero-typing-sequence.css";

/* ── The rhythm ───────────────────────────────────────────────────────────
   A hand does not type at one speed with noise sprinkled on it. It moves in
   BURSTS — a few characters in quick succession — and then hesitates, and it
   rests longest where the sentence rests: at a word gap, and after a stop.

   Two sources of variation:
   1. BURST-LEVEL: the whole burst shares one chosen pace, but the burst speed
      itself is drawn from a gaussian (bell-curve) rather than a flat range, so
      extreme speeds are rarer and the middle is more common — matching how
      human WPM actually clusters.
   2. CHAR-LEVEL: within a burst, each keystroke gets ±28% micro-jitter around
      the burst's pace, so letters inside a burst are NOT perfectly metronomic.
      Previously they were identical, which is the one thing that reads as
      synthetic even when the burst rhythm is right.

   The title lines each earn a real theatrical pause — 0.8–1.6 s — because
   "Perla / Murano / Glass" are three separate thoughts lifted on three beats,
   not a single word that happens to wrap. */

/* A keystroke never goes below this floor; below ~38ms the glyphs stop
   reading as struck and start reading as streamed. */
const MIN_KEYSTROKE_MS = 38;

/* Burst sizes: shorter for the title (each word is one thought, so the
   hesitations within it are real finger-lifts) and longer for the flowing
   lede. */
const BURST_MIN = 2;
const BURST_MAX = 6;
const TITLE_BURST_MIN = 1;
const TITLE_BURST_MAX = 3;

/* The burst pace range. The gaussian sampler makes extreme values rare, so
   most bursts land in the comfortable middle. */
const BURST_FAST_MS = 38;
const BURST_SLOW_MS = 155;

/* Hesitation between two bursts inside one word — the finger re-positions. */
const HESITATE_MIN_MS = 88;
const HESITATE_MAX_MS = 230;

/* A word gap: more than half earn a real beat; the rest just continue. */
const WORD_PAUSE_MIN_MS = 145;
const WORD_PAUSE_MAX_MS = 310;
const WORD_PAUSE_CHANCE = 0.54;

/* After sentence-ending punctuation: a proper breath. */
const PUNCT_PAUSE_MIN_MS = 320;
const PUNCT_PAUSE_MAX_MS = 580;

/* A title LINE change is the longest rest: the hand lifts, the eye moves,
   the mind composes the next word. 0.8–1.6 s after pace scaling. */
const LINE_PAUSE_MIN_MS = 680;
const LINE_PAUSE_MAX_MS = 1300;

/* Gaps between blocks. */
const TITLE_PAUSE_MS = 440;
const SUBTITLE_PAUSE_MS = 175;

const SENTENCE_END = /[.!?…]$/;
const CLAUSE_END = /[,;:—–]$/;

type Char = {
  ch: string;
  /** True on the last character of its word, which is where a pause lands. */
  endsWord: boolean;
  /** Milliseconds to wait BEFORE writing this character. Precomputed once. */
  delay: number;
  /** True when that wait is long enough to read as a rest, which is when the
   *  caret is allowed to blink. */
  rest: boolean;
};

type Row = { words: Char[][] };
type Block = { rows: Row[]; chars: Char[]; text: string };

/**
 * Split text into the structure it will be typed in.
 *
 * `linePerWord` puts every word on its own row, which is how the store name is
 * set: the three lines exist in the layout before the first keystroke, so the
 * title is written straight into its final arrangement instead of filling one
 * line and then re-flowing onto the next.
 *
 * Spaces are never typed as characters. A word break is a row break (in the
 * title) or an ordinary breaking space between two word spans (in the lede),
 * and the gap it would have cost is charged as a pause on the preceding
 * character instead. That keeps the caret off a blank cell and keeps the
 * character count equal to the number of visible glyphs.
 */
/* Uniform sample — used only where we want true flat randomness (burst size). */
const rand = (min: number, max: number) => min + Math.random() * (max - min);

/* Gaussian approximation via averaging three uniform samples. This gives a
   bell-curve distribution centred on (min+max)/2, so extreme values are rare
   and mid-range values dominate — matching how human pause durations cluster
   much more than a flat random range does. Used for all timing decisions. */
const gauss = (min: number, max: number) =>
  min + ((Math.random() + Math.random() + Math.random()) / 3) * (max - min);

/**
 * Build the block AND its timeline, once.
 *
 * The timeline is computed here rather than per keystroke so that one run has
 * one fixed rhythm: the effect only reads numbers, a re-render cannot reroll
 * them mid-sentence, and `pace` lets the lede run faster than the title
 * without changing the SHAPE of the rhythm.
 */
function buildBlock(text: string, linePerWord: boolean, pace: number): Block {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chars: Char[] = [];

  /* Burst state: how many characters are left in the current burst, and the
     pace those characters share. */
  let burstLeft = 0;
  let burstMs = BURST_FAST_MS;

  const built = words.map((word, wordIndex) => {
    const letters = [...word];
    const previousWord = wordIndex > 0 ? words[wordIndex - 1] : null;

    return letters.map((ch, i) => {
      let delay: number;
      let rest = false;

      if (i === 0 && previousWord) {
        /* A word gap. Most cost nothing beyond the next keystroke; some are a
           real beat, and a stop is always a breath — that is what makes the
           sentence audible rather than a stream of letters. */
        if (SENTENCE_END.test(previousWord)) {
          delay = gauss(PUNCT_PAUSE_MIN_MS, PUNCT_PAUSE_MAX_MS);
          rest = true;
        } else if (CLAUSE_END.test(previousWord)) {
          delay = gauss(PUNCT_PAUSE_MIN_MS * 0.7, PUNCT_PAUSE_MAX_MS * 0.7);
          rest = true;
        } else if (Math.random() < WORD_PAUSE_CHANCE) {
          delay = gauss(WORD_PAUSE_MIN_MS, WORD_PAUSE_MAX_MS);
          rest = true;
        } else {
          delay = burstMs;
        }
        /* A new word starts a new burst, so the hand "re-aims". */
        burstLeft = 0;
      } else {
        if (burstLeft <= 0) {
          burstLeft = Math.round(
            linePerWord
              ? rand(TITLE_BURST_MIN, TITLE_BURST_MAX)
              : rand(BURST_MIN, BURST_MAX)
          );
          burstMs = gauss(BURST_FAST_MS, BURST_SLOW_MS);
          /* The hesitation that separates two bursts inside one word. */
          if (i > 0) {
            delay = gauss(HESITATE_MIN_MS, HESITATE_MAX_MS);
            rest = true;
          } else {
            /* First char of the first burst in a word: the hand lands. */
            delay = burstMs;
          }
        } else {
          /* Within a burst the pace is shared, but not perfectly metronomic:
             ±28% micro-jitter so consecutive letters never feel mechanical. */
          delay = burstMs * (0.72 + Math.random() * 0.56);
        }
        burstLeft -= 1;
      }

      /* A title line is its own beat — the hand lifts, composes, re-aims.
         The pause is considerably longer than punctuation: 0.8–1.6 s after
         pace scaling, which is what makes three words read as three thoughts. */
      if (linePerWord && i === 0 && previousWord) {
        delay = Math.max(delay, gauss(LINE_PAUSE_MIN_MS, LINE_PAUSE_MAX_MS));
        rest = true;
      }

      const entry: Char = {
        ch,
        endsWord: i === letters.length - 1,
        /* The rests keep their full length — they are what the rhythm is made
           of — while the keystrokes themselves are floored. */
        delay: Math.round(rest ? delay * pace : Math.max(MIN_KEYSTROKE_MS, delay * pace)),
        rest,
      };
      chars.push(entry);
      return entry;
    });
  });

  const rows: Row[] = linePerWord
    ? built.map((word) => ({ words: [word] }))
    : [{ words: built }];

  return { rows, chars, text };
}

/* Title is deliberate — three words, each line a beat. Lede flows faster so
   the button arrives while the subtitle is still typing. Pace scales the whole
   timeline without changing its shape; the rests keep their proportions. */
const TITLE_PACE = 1.52;
const SUBTITLE_PACE = 0.52;

/**
 * One typed block, rendered WHOLE from the first frame.
 *
 * Every character is in the document and in its final position before anything
 * is revealed; only `visibility` changes as the typing advances. Nothing can
 * reflow mid-animation, so a character that has been written never moves and a
 * half-typed word can never jump to the next line — which is what happens when
 * the visible text is re-wrapped on every keystroke.
 *
 * Each word is a `white-space: nowrap` span, so the lede's wrapping is decided
 * once, by the complete text, and holds for the whole reveal.
 */
function TypedBlock({
  block,
  revealed,
  active,
}: {
  block: Block;
  revealed: number;
  /** True while this block is the one being typed (it owns the caret). */
  active: boolean;
}) {
  let index = 0;
  return (
    <span aria-hidden="true" className="hero-typing-type">
      {block.rows.map((row, r) => {
        const body = row.words.map((word, w) => {
          const span = (
            <span className="hero-typing-word" key={w}>
              {word.map((char) => {
                const i = index++;
                return (
                  <span
                    className="hero-typing-char"
                    key={i}
                    data-on={i < revealed ? "true" : undefined}
                    data-caret={active && i === revealed - 1 ? "true" : undefined}
                  >
                    {char.ch}
                  </span>
                );
              })}
            </span>
          );
          /* A real breaking space between words, so the lede wraps the way the
             browser would wrap the finished sentence. */
          return w === row.words.length - 1 ? span : [span, " "];
        });
        return (
          <span
            className="hero-typing-row"
            key={r}
            /* ONLY at the very beginning, before a single character exists to
               ride. The condition used to be `revealed === rowStart`, which is
               true for row 2 at the exact moment row 1 finishes — so during
               the pause between lines TWO carets were drawn at once, one
               trailing "Perla" and one waiting on the empty line below. A
               caret is a single insertion point; it cannot be in two places.
               Once anything is written, the trailing caret on the last
               character is the only one. */
            data-caret-start={active && revealed === 0 && r === 0 ? "true" : undefined}
          >
            {body}
          </span>
        );
      })}
    </span>
  );
}

type Phase = "idle" | "title" | "subtitle" | "cta";

export function HeroTypingSequence({
  title,
  subtitle,
  locale,
  cta,
}: {
  title: string;
  subtitle: string;
  locale: string;
  cta: ReactNode;
}) {
  /* The two blocks are derived once per copy change, so the typing effect's
     dependencies are stable and a parent re-render cannot restart the
     sequence. */
  /* Built once per copy change, which is also what pins the timeline: the
     random choices inside buildBlock happen here, not on every keystroke and
     not on every re-render. */
  const titleBlock = useMemo(() => buildBlock(title, true, TITLE_PACE), [title]);
  const subtitleBlock = useMemo(
    () => buildBlock(subtitle, false, SUBTITLE_PACE),
    [subtitle]
  );

  const [phase, setPhase] = useState<Phase>("idle");
  const [titleCount, setTitleCount] = useState(0);
  const [subtitleCount, setSubtitleCount] = useState(0);
  /* The caret holds steady while keys are falling and blinks while the hand
     rests — at a word gap, at punctuation, and between the two lines. */
  const [resting, setResting] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [started, setStarted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  /* Start when the hero is actually on screen. Reduced motion skips straight
     to the finished state and never arms the observer. */
  useEffect(() => {
    /* Nothing to observe: reduced motion renders the finished state directly. */
    if (reducedMotion) return;
    const node = headingRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      /* Deferred rather than set inline, so this effect writes no state in its
         own synchronous pass. */
      const immediate = setTimeout(() => setStarted(true), 0);
      return () => clearTimeout(immediate);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStarted(true);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  /* ONE effect owns the whole sequence and ONE timer at a time.
     Its dependencies are the two memoised blocks and the two flags, so it is
     not re-entered per keystroke — the counts live in the closure and reach
     React only as renders. That is what stops a second chain starting on a
     re-render, and the cleanup cancels the pending key on unmount. */
  useEffect(() => {
    if (!started) return;

    /* Reduced motion needs no effect at all: the finished state is derived
       below at render time, so there is nothing to schedule and nothing to
       write. */
    if (reducedMotion) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const wait = (ms: number, fn: () => void) => {
      timer = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const type = (which: "title" | "subtitle", n: number) => {
      const block = which === "title" ? titleBlock : subtitleBlock;
      const setCount = which === "title" ? setTitleCount : setSubtitleCount;

      if (n >= block.chars.length) {
        setResting(true);
        if (which === "title") {
          wait(TITLE_PAUSE_MS, () => {
            setPhase("subtitle");
            type("subtitle", 0);
          });
        } else {
          wait(SUBTITLE_PAUSE_MS, () => setPhase("cta"));
        }
        return;
      }

      /* The next character's own wait, decided when the block was built. */
      const next = block.chars[n];
      /* The caret blinks only where the hand genuinely rests — a word gap, a
         breath after a stop, the hesitation between two bursts — and holds
         steady through the quick runs in between. */
      if (next.rest) setResting(true);
      wait(next.delay, () => {
        setResting(false);
        setCount(n + 1);
        type(which, n + 1);
      });
    };

    /* Nothing is typed until the face it will be typed in has loaded: starting
       first means every glyph written with the fallback shifts the moment the
       real font swaps in, which is exactly the movement this component is
       built to avoid. */
    let armed = true;
    const begin = () => {
      if (cancelled || !armed) return;
      armed = false;
      setPhase("title");
      type("title", 0);
    };

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(begin).catch(begin);
      /* A font that never settles must not cost the visitor the hero. */
      wait(1200, begin);
    } else {
      /* Still deferred by a tick: nothing in this effect writes state
         synchronously, which is what keeps a render from cascading out of it. */
      wait(0, begin);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [started, reducedMotion, titleBlock, subtitleBlock]);

  /* What the markup actually shows. Under reduced motion the sequence is
     simply its own end state — every character revealed, no caret, the button
     already in — rather than a second code path that has to be kept in step
     with the first. */
  const shownPhase: Phase = reducedMotion ? "cta" : phase;
  const shownTitle = reducedMotion ? titleBlock.chars.length : titleCount;
  const shownSubtitle = reducedMotion ? subtitleBlock.chars.length : subtitleCount;

  return (
    <div
      className="hero-typing-sequence"
      lang={locale}
      dir={locale.startsWith("ar") ? "rtl" : "ltr"}
      data-resting={resting ? "true" : undefined}
    >
      {/* The complete copy, once, for assistive tech. Everything below it is
          aria-hidden, so a screen reader reads the hero as finished prose
          rather than announcing it one character at a time. */}
      <h1 ref={headingRef} className="shelf-title hero-typing-line">
        <span className="hero-typing-sr-only">{title}</span>
        <TypedBlock block={titleBlock} revealed={shownTitle} active={shownPhase === "title"} />
      </h1>
      <p className="shelf-lede hero-typing-line">
        <span className="hero-typing-sr-only">{subtitle}</span>
        <TypedBlock
          block={subtitleBlock}
          revealed={shownSubtitle}
          active={shownPhase === "subtitle"}
        />
      </p>
      {/* The button arrives once the TITLE is written, not once everything is
          — it fades in gently while the lede types beneath it. With the title
          deliberately slow, waiting for the last full stop meant the only
          thing on the page a visitor can act on stayed unusable for seven and
          a half seconds. It is still the last element to appear, which is the
          sequence the brief asks for; it just no longer waits for the lede to
          finish before becoming real. */}
      <span
        className={`hero-typing-cta${
          shownPhase === "subtitle" || shownPhase === "cta"
            ? " hero-typing-cta--visible"
            : ""
        }`}
      >
        {cta}
      </span>
    </div>
  );
}
