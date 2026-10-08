/**
 * Undo / redo for the section editor. Pure so it can be tested. Changes made in
 * quick succession (typing, dragging a slider) are merged into one step.
 */
export type History<T> = { past: T[]; present: T; future: T[]; at: number };

export const createHistory = <T>(value: T): History<T> => ({
  past: [],
  present: value,
  future: [],
  at: 0,
});

export function pushHistory<T>(
  h: History<T>,
  value: T,
  now = Date.now(),
  mergeMs = 600,
  limit = 100
): History<T> {
  if (Object.is(value, h.present)) return h;
  const merge = h.past.length > 0 && h.future.length === 0 && now - h.at < mergeMs;
  return {
    past: merge ? h.past : [...h.past, h.present].slice(-limit),
    present: value,
    future: [],
    at: now,
  };
}

export function undoHistory<T>(h: History<T>): History<T> {
  if (h.past.length === 0) return h;
  return {
    past: h.past.slice(0, -1),
    present: h.past[h.past.length - 1],
    future: [h.present, ...h.future],
    at: 0,
  };
}

export function redoHistory<T>(h: History<T>): History<T> {
  if (h.future.length === 0) return h;
  return {
    past: [...h.past, h.present],
    present: h.future[0],
    future: h.future.slice(1),
    at: 0,
  };
}

/** Every state in order (oldest first) and which one is current. */
export function timelineOf<T>(h: History<T>): { states: T[]; index: number } {
  return { states: [...h.past, h.present, ...h.future], index: h.past.length };
}

/** Jumps to any state of the timeline; the others stay available as undo / redo. */
export function gotoHistory<T>(h: History<T>, index: number): History<T> {
  const { states } = timelineOf(h);
  if (index < 0 || index >= states.length || index === h.past.length) return h;
  return {
    past: states.slice(0, index),
    present: states[index],
    future: states.slice(index + 1),
    at: 0,
  };
}
