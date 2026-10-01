"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./hero-typing-sequence.css";

/* One keystroke, plus the jitter either side of it. A perfectly even cadence
   reads as a machine streaming text; a few milliseconds of variation per key
   is what makes it read as a hand. No mistakes and no backspacing — those are
   a different, much louder effect. */
const CHAR_MS = 82;
const CHAR_JITTER_MS = 26;
/* A beat at a word gap, a breath at punctuation. */
const WORD_PAUSE_MS = 120;
const PUNCT_PAUSE_MS = 420;
/* Between the title and the lede, and between the lede and the button. */
const TITLE_PAUSE_MS = 320;
const SUBTITLE_PAUSE_MS = 180;

const SENTENCE_END = /[.!?…]$/;
const CLAUSE_END = /[,;:—–]$/;

type Char = {
  ch: string;
  /** True on the last character of its word, which is where a pause lands. */
  endsWord: boolean;
  /** How long to wait AFTER this character before the next one. */
  pauseAfter: number;
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
function buildBlock(text: string, linePerWord: boolean): Block {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chars: Char[] = [];

  const built = words.map((word) => {
    const letters = [...word];
    return letters.map((ch, i) => {
      const endsWord = i === letters.length - 1;
      const entry: Char = {
        ch,
        endsWord,
        pauseAfter: !endsWord
          ? 0
          : SENTENCE_END.test(word)
            ? PUNCT_PAUSE_MS
            : CLAUSE_END.test(word)
              ? PUNCT_PAUSE_MS * 0.6
              : WORD_PAUSE_MS,
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

/** A keystroke's own length: the base pace with a little variation either way.
 *  `scale` is the block's own pace — the lede is several times longer than the
 *  store name, and at the title's cadence it would have taken about thirteen
 *  seconds, with the button unusable until the last full stop. */
function keystroke(scale: number) {
  return (CHAR_MS + (Math.random() - 0.5) * 2 * CHAR_JITTER_MS) * scale;
}

/* The title is written at full weight; the lede runs faster, because it is
   several times longer. Both were slowed deliberately — the hand should be
   visible. The lede is also a shorter sentence now, so the whole sequence
   still lands in about six and a half seconds. */
const TITLE_SPEED = 1;
const SUBTITLE_SPEED = 0.62;

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
        const rowStart = index;
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
            /* Before the row's first keystroke the caret has no character to
               ride, so it sits at the row's start instead. */
            data-caret-start={active && revealed === rowStart ? "true" : undefined}
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
  const titleBlock = useMemo(() => buildBlock(title, true), [title]);
  const subtitleBlock = useMemo(() => buildBlock(subtitle, false), [subtitle]);

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

      const previous = n > 0 ? block.chars[n - 1] : undefined;
      const speed = which === "title" ? TITLE_SPEED : SUBTITLE_SPEED;
      const pause = (previous?.pauseAfter ?? 0) * speed;
      /* Resting through the pause, striking through the keystroke itself. */
      if (pause > 0) setResting(true);
      wait(pause + keystroke(speed), () => {
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
      <span className={`hero-typing-cta${shownPhase === "cta" ? " hero-typing-cta--visible" : ""}`}>
        {cta}
      </span>
    </div>
  );
}
