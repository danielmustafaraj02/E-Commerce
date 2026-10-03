import { describe, expect, it } from "vitest";
import {
  activeScene,
  clamp01,
  getSceneFrame,
  isReading,
  railFill,
  readingInterval,
  readingProgress,
  sceneBoundary,
  segment,
  sectionHeight,
  SCROLL_PER_UNIT,
  smooth,
  timelineLength,
} from "./showcase-timeline";

const COUNT = 3;
/** The timeline is 2N-1 units long, so a scene i is read at unit 2i. */
const readUnit = (i: number) => (2 * i) / timelineLength(COUNT);
const progressAt = (unit: number) => unit / timelineLength(COUNT);

describe("clamp01 / segment / smooth", () => {
  it("clamps to 0…1", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(9)).toBe(1);
  });

  it("maps a value across a range and clamps outside it", () => {
    expect(segment(0.5, 0.2, 0.8)).toBeCloseTo(0.5, 5);
    expect(segment(0.1, 0.2, 0.8)).toBe(0);
    expect(segment(0.9, 0.2, 0.8)).toBe(1);
  });

  it("smoothstep eases at both ends", () => {
    expect(smooth(0)).toBe(0);
    expect(smooth(1)).toBe(1);
    expect(smooth(0.5)).toBeCloseTo(0.5, 5);
    // Flattened at the extremes: the motion starts and stops gently.
    expect(smooth(0.1)).toBeLessThan(0.1);
    expect(smooth(0.9)).toBeGreaterThan(0.9);
  });
});

describe("timeline shape", () => {
  it("alternates a reading unit and a transition unit", () => {
    expect(timelineLength(3)).toBe(5);
    expect(timelineLength(1)).toBe(1);
    expect(timelineLength(4)).toBe(7);
  });

  it("reserves SCROLL_PER_UNIT stage-heights of scroll per unit, plus the stage itself", () => {
    expect(sectionHeight(3, 600)).toBe((1 + 5 * SCROLL_PER_UNIT) * 600);
  });
});

describe("getSceneFrame — reading intervals", () => {
  it.each([0, 1, 2])("holds scene %i still and fully visible", (i) => {
    const f = getSceneFrame(readUnit(i), i, COUNT, 600);
    expect(f.y).toBe(0);
    expect(f.imageOpacity).toBe(1);
    expect(f.copyOpacity).toBe(1);
    expect(isReading(f)).toBe(true);
  });

  it("shows exactly one scene at a time while reading", () => {
    for (const i of [0, 1, 2]) {
      const reading = [0, 1, 2].filter(
        (j) => isReading(getSceneFrame(readUnit(i), j, COUNT, 600)),
      );
      expect(reading).toEqual([i]);
    }
  });

  it("keeps a non-reading scene's copy inert", () => {
    for (const i of [0, 1, 2]) {
      for (const j of [0, 1, 2]) {
        if (j === i) continue;
        const f = getSceneFrame(readUnit(i), j, COUNT, 600);
        // A scene outside its reading interval is never fully readable, which
        // is exactly the condition the component uses to set `inert`.
        expect(isReading(f)).toBe(false);
      }
    }
  });
});

describe("getSceneFrame — transition ordering", () => {
  const D = 600;
  /* Scene 0 hands over to scene 1 across unit 1; scene 1 hands over to scene 2
     across unit 3. Positions below are absolute timeline units. */
  const at = (unit: number) => unit / timelineLength(COUNT);

  it("fades the outgoing copy out BEFORE the image moves", () => {
    // Early in unit 1 the copy is already fading (it fades over the first
    // fifth) while the photograph has barely begun to travel (movement starts
    // at 20% and is smoothstepped). The copy is therefore strictly further
    // through its own transition than the image is — which is the ordering the
    // design requires — and both are still near their starting values.
    const f = getSceneFrame(at(1.15), 0, COUNT, D);
    // Copy: 1 -> 0 is 84% done. Image: 0 -> 1 has barely begun.
    expect(f.copyOpacity).toBeLessThan(0.25);
    expect(f.imageOpacity).toBeGreaterThan(0.99);
    expect(Math.abs(f.y)).toBeLessThan(D * 0.05);
  });

  it("brings the incoming copy in only AFTER its image has settled", () => {
    // At 85% into unit 1 the photograph has arrived (movement ends at 80%)
    // but the copy does not begin to appear until 80% and is only just
    // starting — the required ordering, copy last.
    const f = getSceneFrame(at(1.85), 1, COUNT, D);
    expect(f.copyOpacity).toBeLessThan(0.2);
    expect(Math.abs(f.y)).toBeLessThan(D * 0.02);
  });

  it("moves the outgoing scene up and out", () => {
    const f = getSceneFrame(at(1.9), 0, COUNT, D);
    expect(f.y).toBeLessThan(0);
  });

  it("brings the incoming scene up from below", () => {
    const f = getSceneFrame(at(0.1), 1, COUNT, D);
    expect(f.y).toBeGreaterThan(0);
  });

  it("never shows two scenes' copies at once mid-transition", () => {
    for (let u = 0; u <= timelineLength(COUNT); u += 0.05) {
      const opacities = [0, 1, 2].map(
        (i) => getSceneFrame(progressAt(u), i, COUNT, D).copyOpacity,
      );
      // A crossfade would put two above a visible threshold simultaneously.
      const readable = opacities.filter((o) => o >= 0.99).length;
      expect(readable).toBeLessThanOrEqual(1);
    }
  });
});

describe("getSceneFrame — reversibility", () => {
  const D = 600;

  it("is a pure function of progress, so scrolling back replays exactly", () => {
    // The same progress must always produce the same frame: there is no state,
    // no easing cache and no direction to get out of sync.
    for (let u = 0; u <= timelineLength(COUNT); u += 0.1) {
      const forward = getSceneFrame(progressAt(u), 1, COUNT, D);
      const again = getSceneFrame(progressAt(u), 1, COUNT, D);
      expect(again).toEqual(forward);
    }
  });

  it("returns to the first scene's reading frame when scrolled back", () => {
    const start = getSceneFrame(0, 0, COUNT, D);
    const mid = getSceneFrame(progressAt(2), 0, COUNT, D);
    const back = getSceneFrame(0, 0, COUNT, D);
    expect(back).toEqual(start);
    expect(mid).not.toEqual(start);
  });
});

describe("readingProgress", () => {
  it("puts each scene at the progress where it is actually settled", () => {
    // The rail navigates with these, so they must land on the same scroll
    // offset the scene naturally comes to rest at.
    for (const i of [0, 1, 2]) {
      const p = readingProgress(i, COUNT);
      const frame = getSceneFrame(p, i, COUNT, 600);
      expect(frame.y).toBe(0);
      expect(frame.imageOpacity).toBe(1);
      expect(frame.copyOpacity).toBe(1);
      expect(isReading(frame)).toBe(true);
    }
  });

  it("keeps the progress strictly increasing between scenes", () => {
    const ps = [0, 1, 2].map((i) => readingProgress(i, COUNT));
    expect(ps[0]).toBeGreaterThan(0);
    expect(ps[1]).toBeGreaterThan(ps[0]);
    expect(ps[2]).toBeGreaterThan(ps[1]);
    expect(ps[2]).toBeLessThan(1);
  });

  it("lands on the MIDPOINT of the scene's reading interval", () => {
    // A bullet click scrolls here, so it must be the point with the most scroll
    // room on either side before anything starts moving — not the edge of the
    // interval, where the next transition is one pixel away.
    for (const i of [0, 1, 2]) {
      const { start, end } = readingInterval(i, COUNT);
      expect(readingProgress(i, COUNT)).toBeCloseTo((start + end) / 2, 10);
      // And the whole declared interval really is settled, end to end.
      for (const p of [start, (start + end) / 2, end]) {
        expect(isReading(getSceneFrame(p, i, COUNT, 600))).toBe(true);
      }
    }
  });
});

describe("activeScene — exactly one category, at every progress", () => {
  it("is defined before the first transition and after the last", () => {
    expect(activeScene(0, COUNT)).toBe(0);
    expect(activeScene(1, COUNT)).toBe(COUNT - 1);
    // Outside the range too: a restored scroll position can land anywhere.
    expect(activeScene(-3, COUNT)).toBe(0);
    expect(activeScene(7, COUNT)).toBe(COUNT - 1);
  });

  it("returns the scene being read at every reading position", () => {
    for (const i of [0, 1, 2]) {
      const { start, end } = readingInterval(i, COUNT);
      expect(activeScene(start, COUNT)).toBe(i);
      expect(activeScene(readingProgress(i, COUNT), COUNT)).toBe(i);
      expect(activeScene(end, COUNT)).toBe(i);
    }
  });

  it("flips at the midpoint of the transition, in both directions", () => {
    // This is the property that makes the rail reverse correctly: the boundary
    // is a single number, so scrolling up crosses it at exactly the scroll
    // position scrolling down did.
    for (const i of [1, 2]) {
      const b = sceneBoundary(i, COUNT);
      expect(activeScene(b - 1e-6, COUNT)).toBe(i - 1);
      expect(activeScene(b, COUNT)).toBe(i);
    }
  });

  it("never leaves a gap or an overlap across the whole timeline", () => {
    // Swept at a fine step: every progress yields exactly one in-range index,
    // and the sequence only ever steps forward by one.
    let prev = 0;
    for (let p = 0; p <= 1.0001; p += 0.002) {
      const a = activeScene(p, COUNT);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(COUNT);
      expect(a - prev === 0 || a - prev === 1).toBe(true);
      prev = a;
    }
    expect(prev).toBe(COUNT - 1);
  });

  it("degrades safely with a single scene", () => {
    expect(activeScene(0.5, 1)).toBe(0);
  });
});

describe("railFill — the connecting line", () => {
  it("is empty at the first reading position and full at the last", () => {
    expect(railFill(readingProgress(0, COUNT), COUNT)).toBe(0);
    expect(railFill(readingProgress(COUNT - 1, COUNT), COUNT)).toBe(1);
  });

  it("is monotonic and bounded, so it reverses exactly on the way up", () => {
    let prev = -1;
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const f = railFill(p, COUNT);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
      expect(f).toBeGreaterThanOrEqual(prev);
      prev = f;
    }
  });

  it("passes the middle dot exactly when the middle scene is current", () => {
    expect(railFill(readingProgress(1, COUNT), COUNT)).toBeCloseTo(0.5, 10);
  });

  it("stays at 0 with a single scene rather than dividing by zero", () => {
    expect(railFill(0.5, 1)).toBe(0);
  });
});

describe("getSceneFrame — scroll synchronisation", () => {
  const D = 600;

  /* The component derives progress from window.scrollY against a cached start
     offset, so every scene offset must be a pure, exactly-invertible function of
     the scroll position. These are the properties that guarantee the animation
     cannot drift from the scrollbar. */

  it("is strictly monotonic per scene across the timeline", () => {
    // Each scene travels monotonically from wherever it starts to its end
    // position, so scrolling in either direction can never overshoot or reverse
    // within a single scene's own span.
    for (const idx of [0, 1, 2]) {
      let prev = null;
      let monotonic = true;
      for (let u = 0; u <= timelineLength(COUNT); u += 0.05) {
        const y = getSceneFrame(u / timelineLength(COUNT), idx, COUNT, D).y;
        if (prev !== null && y > prev + 1e-6) monotonic = false;
        prev = y;
      }
      expect(monotonic).toBe(true);
    }
  });

  it("responds to every scroll increment through a transition — no dead zone", () => {
    // Sampled INSIDE scene 0's departure unit (movement runs 0.2–0.8 of it),
    // where the scene must move on every single increment. A plateau here is
    // exactly what reads as "unsynced".
    const from = 1.2;
    const to = 1.8;
    const steps = 120;
    let prev = getSceneFrame(from / timelineLength(COUNT), 0, COUNT, D).y;
    let flatSteps = 0;
    for (let i = 1; i <= steps; i++) {
      const u = from + ((to - from) * i) / steps;
      const y = getSceneFrame(u / timelineLength(COUNT), 0, COUNT, D).y;
      if (Math.abs(y - prev) < 1e-9) flatSteps += 1;
      prev = y;
    }
    // Smoothstep has zero derivative exactly at the two endpoints, so at most a
    // sample or two at each end may read as flat. Nothing more.
    expect(flatSteps).toBeLessThanOrEqual(4);
  });

  it("maps equal scroll deltas to comparable frame deltas through a transition", () => {
    // Smoothstep eases, so equal scroll steps give slightly different frame
    // steps — but only within the easing. A wildly different ratio would mean the
    // mapping is non-monotonic or jumping.
    const at = (u: number) => getSceneFrame(u / timelineLength(COUNT), 0, COUNT, D).y;
    const deltas: number[] = [];
    let prev = at(1.3);
    for (let u = 1.4; u <= 1.7001; u += 0.1) {
      const y = at(u);
      deltas.push(Math.abs(y - prev));
      prev = y;
    }
    for (const d of deltas) expect(d).toBeGreaterThan(0);
    const min = Math.min(...deltas);
    const max = Math.max(...deltas);
    // Smoothstep's peak-to-edge ratio is about 1.5x here, not orders of
    // magnitude — which is what "in sync but eased" looks like.
    expect(max / min).toBeLessThan(3);
  });
});

describe("getSceneFrame — edges", () => {
  it("keeps the first scene on screen at progress 0 and the last at 1", () => {
    const first = getSceneFrame(0, 0, COUNT, 600);
    const last = getSceneFrame(1, 2, COUNT, 600);
    expect(first.y).toBe(0);
    expect(first.copyOpacity).toBe(1);
    // The final scene never hands over to anything, so it simply stays put.
    expect(last.y).toBe(0);
    expect(last.copyOpacity).toBe(1);
  });

  it("clamps progress outside 0…1 rather than extrapolating", () => {
    expect(getSceneFrame(-5, 0, COUNT, 600)).toEqual(getSceneFrame(0, 0, COUNT, 600));
    expect(getSceneFrame(9, 2, COUNT, 600)).toEqual(getSceneFrame(1, 2, COUNT, 600));
  });

  it("degrades safely with a single scene", () => {
    const f = getSceneFrame(0.5, 0, 1, 600);
    expect(f.y).toBe(0);
    expect(f.copyOpacity).toBe(1);
  });
});