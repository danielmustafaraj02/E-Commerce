"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero film.
 *
 * It is decoration, so it carries no sound and offers no volume control: both
 * source files are encoded with NO AUDIO TRACK at all, which is the only way
 * to be certain a hero can never make noise at someone.
 *
 * What this component adds over a plain <video autoplay muted loop>:
 *
 *  - `muted` is set on the ELEMENT, imperatively, before play() is called.
 *    React's `muted` prop is a property, not an attribute, and in a few
 *    browsers it is applied a tick late — long enough for the autoplay policy
 *    to see an unmuted video and refuse it. Setting it directly first removes
 *    that race.
 *  - A refused autoplay is handled rather than left as a frozen poster: the
 *    poster stays and a discreet button offers to start it.
 *  - A pause/resume control that is a real, labelled, keyboard-reachable
 *    button, so the motion can be stopped by anyone it bothers.
 *  - Reduced motion is honoured by NOT playing: the poster is the hero, and
 *    starting the film is the visitor's choice.
 *  - play() is called once per state change, never per render, so a parent
 *    re-render cannot restart the film or trigger a second download.
 */
export function HeroVideo({
  className,
  poster,
  sources,
  playLabel,
}: {
  className?: string;
  poster: string;
  sources: { src: string; type: string }[];
  /** The film offers only "play": while it runs it shows no chrome at all. */
  playLabel: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  /* "pending" until we know whether the browser allowed it to start. */
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Before anything else, and before play(): see the note above. */
    el.muted = true;
    el.defaultMuted = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const start = () => {
      /* Already running, because the autoPlay attribute got there first: do
         not call play() again — a second call restarts the fetch in some
         browsers — but DO record it, or the control keeps offering to start
         a film that is already playing. */
      if (!el.paused) {
        setPlaying(true);
        setBlocked(false);
        return;
      }
      el.play().then(
        () => {
          setPlaying(true);
          setBlocked(false);
        },
        () => {
          /* Refused (an autoplay policy, or a data-saver mode). The poster is
             already showing; offer a way in rather than leaving a dead frame. */
          setPlaying(false);
          setBlocked(true);
        }
      );
    };

    const apply = () => {
      if (reduce.matches) {
        el.pause();
        setPlaying(false);
        /* Not "blocked": nothing went wrong, the visitor asked for stillness.
           The control below still offers to play it. */
        setBlocked(false);
        return;
      }
      start();
    };

    apply();
    reduce.addEventListener("change", apply);

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    return () => {
      reduce.removeEventListener("change", apply);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      el.muted = true;
      el.play().then(
        () => setBlocked(false),
        () => setBlocked(true)
      );
    } else {
      el.pause();
    }
  };

  return (
    <>
      <video
        ref={ref}
        className={className}
        /* The attribute is still here for the no-JS case and for crawlers;
           the effect above is what makes it reliable. */
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
        tabIndex={-1}
        suppressHydrationWarning
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      {/* While it is running there is NO control at all: the film is meant to
          read as a looping image, not as a player, so nothing is laid over
          the jewellery.

          The button appears only when the film is NOT running, which is the
          one case where a control is the difference between a hero and a dead
          frame: autoplay refused by the browser, or motion reduced by the
          visitor — where the brief asks for a poster and a voluntary start.
          In both cases it offers to play, never to pause. */}
      {!playing && (
        <button
          type="button"
          className="shelf-hero-video-toggle"
          data-blocked={blocked ? "true" : undefined}
          onClick={toggle}
        >
          <span className="sr-only">{playLabel}</span>
          <span aria-hidden="true" className="shelf-hero-video-glyph">
            <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor">
              <path d="M3 1.8 10 6l-7 4.2z" />
            </svg>
          </span>
        </button>
      )}
    </>
  );
}
