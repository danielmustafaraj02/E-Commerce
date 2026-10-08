import { describe, expect, it } from "vitest";
import { createHistory, pushHistory, redoHistory, undoHistory } from "./history";

describe("history", () => {
  it("undoes and redoes distinct steps", () => {
    let h = createHistory("a");
    h = pushHistory(h, "b", 1000);
    h = pushHistory(h, "c", 5000);
    expect(h.present).toBe("c");
    h = undoHistory(h);
    expect(h.present).toBe("b");
    h = undoHistory(h);
    expect(h.present).toBe("a");
    expect(undoHistory(h)).toBe(h);
    h = redoHistory(h);
    expect(h.present).toBe("b");
    h = redoHistory(h);
    expect(h.present).toBe("c");
    expect(redoHistory(h)).toBe(h);
  });

  it("merges quick successive changes into one step", () => {
    let h = createHistory("a");
    h = pushHistory(h, "b", 1000);
    h = pushHistory(h, "bc", 1100);
    h = pushHistory(h, "bcd", 1200);
    expect(h.past).toEqual(["a"]);
    h = undoHistory(h);
    expect(h.present).toBe("a");
  });

  it("drops the redo stack on a new change and ignores no-ops", () => {
    let h = createHistory(1);
    h = pushHistory(h, 2, 1000);
    h = pushHistory(h, 3, 5000);
    h = undoHistory(h);
    h = pushHistory(h, 9, 9000);
    expect(h.future).toEqual([]);
    expect(pushHistory(h, 9, 9999)).toBe(h);
  });

  it("caps the history length", () => {
    let h = createHistory(0);
    for (let i = 1; i <= 150; i++) h = pushHistory(h, i, i * 10_000);
    expect(h.past.length).toBe(100);
  });
});

describe("timeline", () => {
  it("jumps to any state and keeps the rest for undo and redo", async () => {
    const { createHistory, pushHistory, gotoHistory, timelineOf } = await import("./history");
    let h = createHistory("a");
    h = pushHistory(h, "b", 0, 0);
    h = pushHistory(h, "c", 10_000, 0);
    h = pushHistory(h, "d", 20_000, 0);
    expect(timelineOf(h)).toEqual({ states: ["a", "b", "c", "d"], index: 3 });
    const back = gotoHistory(h, 1);
    expect(back.present).toBe("b");
    expect(back.past).toEqual(["a"]);
    expect(back.future).toEqual(["c", "d"]);
    expect(gotoHistory(back, 3).present).toBe("d");
    expect(gotoHistory(h, 9)).toBe(h);
  });
});
