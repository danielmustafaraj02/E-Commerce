"use client";

import { useCallback, useState } from "react";
import {
  createHistory,
  gotoHistory,
  pushHistory,
  redoHistory,
  timelineOf,
  undoHistory,
  type History,
} from "@/lib/history";

/** State with undo / redo. `set` accepts a value or an updater and is stable. */
export function useUndoable<T>(initial: T) {
  const [history, setHistory] = useState<History<T>>(() => createHistory(initial));
  const set = useCallback(
    (next: T | ((prev: T) => T)) =>
      setHistory((h) =>
        pushHistory(h, typeof next === "function" ? (next as (prev: T) => T)(h.present) : next)
      ),
    []
  );
  const undo = useCallback(() => setHistory(undoHistory), []);
  const redo = useCallback(() => setHistory(redoHistory), []);
  const goto = useCallback((index: number) => setHistory((h) => gotoHistory(h, index)), []);
  const timeline = timelineOf(history);
  return {
    value: history.present,
    timeline,
    goto,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
