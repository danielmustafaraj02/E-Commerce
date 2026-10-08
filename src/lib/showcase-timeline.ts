/**
 * Timing for the homepage collection showcase.
 *
 * The showcase is a scroll-driven timeline: the page's scroll position IS the
 * playhead. This module is the whole animation model, kept pure and free of DOM
 * access so it can be unit-tested directly and so the component only has to
 * read scroll and write the result.
 *
 * The timeline is measured in "units", where one unit is one stage-height of
 * scroll. With N scenes the timeline runs to 2N-1 units, alternating:
 *
 *     unit 0        read scene 0
 *     unit 1        transition 0 -> 1
 *     unit 2        read scene 1
 *     unit 3        transition 1 -> 2
 *     ...
 *     unit 2N-2     read scene N-1
 *
 * Every scene therefore gets a FULL unit of stillness — its image settled, its
 * copy at full opacity, nothing moving — and every transition is squeezed into
 * the single unit between two reading intervals. Within a transition the order
 * is fixed and deliberate:
 *
 *   1. the outgoing copy fades out first, while its image is still at rest, so
 *      text never ghosts across a moving photograph;
 *   2. the two images travel, the outgoing one up and out, the incoming one up
 *      from below;
 *   3. the incoming copy fades in only once its image has settled.
 *
 * Every value is a pure function of the scroll position, so scrolling upward
 * replays the sequence exactly in reverse — there is no state to fall out of
 * sync and nothing to strand mid-flight.
 */

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** How far `value` has travelled from `start` toward `end`, as 0…1. */
export const segment = (value: number, start: number, end: number) =>
  clamp01((value - start) / (end - start));

/** Smoothstep, for motion that should ease in and out rather than run linearly. */
export const smooth = (value: number) => value * value * (3 - 2 * value);

export type SceneFrame = {
  /** Vertical offset in pixels: negative as a scene leaves, positive as it arrives. */
  y: number;
  /** Only for the "zoom" transition: the scene's scale (1 = normal). */
  scale?: number;
  imageOpacity: number;
  copyOpacity: number;
};

/** Where each phase of a transition sits inside its unit, as fractions.
 *
 *  The three phases deliberately do not fill the unit: the copy has finished
 *  fading out at COPY_OUT_END (0.2) long before the image starts moving at
 *  MOVE_START (0.2), and the incoming copy does not begin to appear until
 *  MOVE_END (0.8). That gap is what produces the required ordering — text out,
 *  then images move, then text in — instead of everything fading at once. */
const MOVE_START = 0.2;
const MOVE_END = 0.8;
const IMAGE_IN_END = 0.32;
const IMAGE_OUT_START = 0.68;
const COPY_IN_START = 0.8;

/** Total timeline length, in units, for `count` scenes. */
export const timelineLength = (count: number) => Math.max(1, 2 * count - 1);

/** Scroll consumed per timeline unit, as a fraction of the stage height.
 *  Below 1 the sequence needs less scrolling (the scenes still travel a full
 *  stage height; they just do it over a shorter scroll distance). */
export const SCROLL_PER_UNIT = 0.5;

/** How tall the showcase section should be, in pixels: the stage itself plus
 *  SCROLL_PER_UNIT stage-heights of scroll per timeline unit. */
export const sectionHeight = (
  count: number,
  stageHeight: number,
  /** Scroll per unit, as a fraction of the stage height (the editor can change it). */
  perUnit: number = SCROLL_PER_UNIT
) => (1 + timelineLength(count) * perUnit) * stageHeight;

/** The range the editor allows for the scroll distance per unit. */
export const SCROLL_PER_UNIT_RANGE = { min: 0.25, max: 1.5 } as const;
export const clampPerUnit = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(SCROLL_PER_UNIT_RANGE.max, Math.max(SCROLL_PER_UNIT_RANGE.min, value))
    : SCROLL_PER_UNIT;

/** How the scenes change: "slide" travels (the default), "fade" cross-fades the
 *  pictures in place, "zoom" cross-fades while the picture grows or shrinks. */
export type SceneTransition = "slide" | "fade" | "zoom";

/**
 * ── THE ONE TIMELINE ────────────────────────────────────────────────────────
 *
 * Everything downstream — the image transforms, the copy's visibility, the
 * active category, the rail's line fill and where a bullet click scrolls to —
 * is derived from the three functions below, so none of them can disagree.
 *
 * In timeline units (see the module comment: read, move, read, move…):
 *
 *   scene i READS over   [2i, 2i + 1]      — image settled, copy at full opacity
 *   scene i → i+1 MOVES over [2i + 1, 2i + 2]
 *
 * `readingInterval` states that in progress (0…1) terms; `readingProgress` is
 * its MIDPOINT, which is where a bullet click lands; and `sceneBoundary` is the
 * midpoint of a transition, which is where the active category flips over.
 * Because the boundary sits exactly halfway through the transition, the active
 * dot changes at the same scroll position going up as coming down — the
 * reversibility the rest of the module is built on.
 */

/** Scene `index`'s reading interval, as progress (0…1). */
export const readingInterval = (index: number, count: number) => {
  const length = timelineLength(count);
  return {
    start: clamp01((2 * index) / length),
    end: clamp01((2 * index + 1) / length),
  };
};

/**
 * The scroll progress at the MIDDLE of scene `index`'s reading interval — the
 * point at which its image is settled and its copy fully revealed, with the
 * most scroll room on either side before anything starts moving.
 *
 * The rail's bullets navigate with it, which is why clicking one lands on a
 * scroll offset the scene is genuinely at rest at, rather than on the very edge
 * of its interval where the next transition is about to begin.
 */
export const readingProgress = (index: number, count: number) => {
  const { start, end } = readingInterval(index, count);
  return (start + end) / 2;
};

/**
 * The progress at which the active category flips from scene `index - 1` to
 * scene `index`: the midpoint of the transition between them.
 */
export const sceneBoundary = (index: number, count: number) =>
  clamp01((2 * index - 0.5) / timelineLength(count));

/**
 * Which category is current at a given progress — the single source of truth
 * for the rail's active bullet.
 *
 * Deterministic and total: it is defined for every progress in 0…1, including
 * before the first transition (scene 0) and after the last (scene N-1), so
 * exactly one bullet is active whenever the showcase is on screen. Deriving it
 * from the boundaries rather than from "is this scene fully readable" is the
 * fix for the mid-transition gap, where no scene is settled and the old test
 * silently fell back to scene 0.
 */
export const activeScene = (progress: number, count: number) => {
  const p = clamp01(progress);
  let index = 0;
  for (let i = 1; i < count; i += 1) {
    if (p >= sceneBoundary(i, count)) index = i;
  }
  return index;
};

/**
 * How full the rail's connecting line is, 0…1.
 *
 * The line runs from the FIRST dot's centre to the LAST, so it fills between
 * the first and last reading positions — reaching 0 exactly when scene 0 is
 * being read and 1 exactly when the final scene is, instead of starting part
 * filled or stopping short of the last dot.
 */
export const railFill = (progress: number, count: number) => {
  if (count < 2) return 0;
  const first = readingProgress(0, count);
  const last = readingProgress(count - 1, count);
  return clamp01((clamp01(progress) - first) / (last - first));
};

/**
 * The frame for one scene at a given scroll progress.
 *
 * @param progress 0…1 through the whole sequence, where 1 means the final
 *                 scene has been fully read and the stage is about to release.
 * @param index    which scene this is, 0-based.
 * @param count    how many scenes there are in total.
 * @param distance how far a scene travels, in pixels (a little over one stage
 *                 height, so a departing scene clears the stage completely).
 */
export function getSceneFrame(
  progress: number,
  index: number,
  count: number,
  distance: number,
  transition: SceneTransition = "slide"
): SceneFrame {
  const timeline = clamp01(progress) * (2 * count - 1);
  const slide = transition === "slide";

  let y = 0;
  let scale = 1;
  let imageOpacity = 1;
  let copyOpacity = 1;

  /* Arriving: the previous scene's departure unit. */
  if (index > 0) {
    const arrival = timeline - (2 * index - 1);
    const movement = smooth(segment(arrival, MOVE_START, MOVE_END));

    if (slide) {
      y = distance * (1 - movement);
      imageOpacity = segment(arrival, MOVE_START, IMAGE_IN_END);
    } else {
      /* Cross-fade in place: the picture arrives over the whole movement. */
      imageOpacity = movement;
      scale = 0.86 + 0.14 * movement;
    }
    copyOpacity = smooth(segment(arrival, COPY_IN_START, 1));
  }

  /* Leaving: this scene's departure unit. */
  if (index < count - 1) {
    const departure = timeline - (2 * index + 1);
    const movement = smooth(segment(departure, MOVE_START, MOVE_END));

    if (slide) {
      y -= distance * movement;
      imageOpacity *= 1 - segment(departure, IMAGE_OUT_START, MOVE_END);
    } else {
      imageOpacity *= 1 - movement;
      scale *= 1 + 0.14 * movement;
    }
    copyOpacity *= 1 - smooth(segment(departure, 0, MOVE_START));
  }

  return transition === "zoom"
    ? { y, scale, imageOpacity, copyOpacity }
    : { y, imageOpacity, copyOpacity };
}

/** True when the scene's copy is fully present, and therefore the scene is the
 *  one a reader is meant to be reading. Used to decide what may take focus. */
export const isReading = (frame: SceneFrame) =>
  frame.copyOpacity >= 0.99 && frame.imageOpacity >= 0.99;
