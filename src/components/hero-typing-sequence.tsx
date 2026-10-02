"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./hero-typing-sequence.css";

/* ── The rhythm ───────────────────────────────────────────────────────────
   A hand does not type at one speed with noise sprinkled on it. It moves in
   BURSTS — a few characters in quick succession — and then hesitates, and it
   rests longest where the sentence rests: at a word gap, and after a stop.

   Jittering every single keystroke, which this did before, produces the
   opposite impression: no two letters alike is just as mechanical as all of
   them identical, because there is no pattern underneath for the eye to read
   as intention. So the variation lives at the level of the BURST, and the
   letters inside a burst share one pace.

   Ranges are the brief's: 45–110ms between characters, occasional 120–220ms
   at a word gap, 250–450ms after punctuation or a line change. */
/* However much the pace is scaled down, a keystroke never drops below this:
   the brief's floor is 45ms, and below roughly that the letters stop reading
   as struck and start reading as streamed. */
const MIN_KEYSTROKE_MS = 42;
/* How many characters share one pace before the hand hesitates. The lede runs
   in longer bursts; the TITLE uses shorter ones, because its words are five
   or six letters — at a burst of seven each word came out as one even run,
   which is precisely what made it read as a machine. */
const BURST_MIN = 3;
const BURST_MAX = 7;
const TITLE_BURST_MIN = 2;
const TITLE_BURST_MAX = 4;
/* The pace of one burst, picked once per burst and shared by its letters. */
const BURST_FAST_MS = 46;
const BURST_SLOW_MS = 96;
/* The hesitation between two bursts inside a word. */
const HESITATE_MIN_MS = 70;
const HESITATE_MAX_MS = 150;
/* A word gap: most are free, some are a real beat. */
const WORD_PAUSE_MIN_MS = 120;
const WORD_PAUSE_MAX_MS = 220;
const WORD_PAUSE_CHANCE = 0.45;
/* A stop gets a breath. */
const PUNCT_PAUSE_MIN_MS = 250;
const PUNCT_PAUSE_MAX_MS = 450;
/* A LINE change gets considerably more than a stop does. "Perla / Murano /
   Glass" is three separate thoughts set on three lines, and at punctuation
   length the three ran together into one stuttering word — the hand has to be
   heard lifting between them. */
const LINE_PAUSE_MIN_MS = 520;
const LINE_PAUSE_MAX_MS = 820;
/* Between the title and the lede, and between the lede and the button. */
const TITLE_PAUSE_MS = 300;
const SUBTITLE_PAUSE_MS = 160;

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
const between = (min: number, max: number) => min + Math.random() * (max - min);

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
          delay = between(PUNCT_PAUSE_MIN_MS, PUNCT_PAUSE_MAX_MS);
          rest = true;
        } else if (CLAUSE_END.test(previousWord)) {
          delay = between(PUNCT_PAUSE_MIN_MS * 0.7, PUNCT_PAUSE_MAX_MS * 0.7);
          rest = true;
        } else if (Math.random() < WORD_PAUSE_CHANCE) {
          delay = between(WORD_PAUSE_MIN_MS, WORD_PAUSE_MAX_MS);
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
              ? between(TITLE_BURST_MIN, TITLE_BURST_MAX)
              : between(BURST_MIN, BURST_MAX)
          );
          burstMs = between(BURST_FAST_MS, BURST_SLOW_MS);
          /* The hesitation that separates two bursts inside one word. */
          if (i > 0) {
            delay = between(HESITATE_MIN_MS, HESITATE_MAX_MS);
            rest = true;
          } else {
            delay = burstMs;
          }
        } else {
          delay = burstMs;
        }
        burstLeft -= 1;
      }

      /* A line of the title is its own thought: ending one earns a real lift,
         not merely a comma's worth of hesitation. */
      if (linePerWord && i === 0 && previousWord) {
        delay = Math.max(delay, between(LINE_PAUSE_MIN_MS, LINE_PAUSE_MAX_MS));
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

/* The title is written SLOWER than life — it is three words, it is the brand's
   name, and it is the one thing on the page worth watching being written. The
   lede flows faster, because it is several times longer and the button must
   not be kept waiting for it. The
   pace scales the whole timeline without changing its SHAPE — the bursts and
   the breaths keep their proportions to each other. 0.5 brings the whole
   sequence in around six seconds; the button should not be the last thing a
   visitor waits for. */
const TITLE_PACE = 1.35;
const SUBTITLE_PACE = 0.5;

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
