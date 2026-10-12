import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CUTOUTS,
  DEFAULTS,
  LIMITS,
  cutoutFor,
  isQuiet,
  parseHeroConcepts,
  pieceWidth,
  wallpaperLayout,
  WALL_FRAMES,
} from "./config";

describe("hero concept cut-outs", () => {
  it("lists only files that are served from public/hero/cutouts", () => {
    expect(CUTOUTS.length).toBeGreaterThan(20);
    for (const cutout of CUTOUTS) {
      expect(cutout.src).toMatch(new RegExp(`^/hero/cutouts/${cutout.slug}\\.[0-9a-f]{8}\\.webp$`));
      expect(existsSync(join(process.cwd(), "public", cutout.src)), cutout.src).toBe(true);
      expect(cutout.width).toBeGreaterThan(0);
    }
  });
  it("defaults name only pieces that have a cut-out", () => {
    expect(cutoutFor(DEFAULTS.minimal.slug)).toBeTruthy();
    for (const scene of DEFAULTS.rotating.scenes)
      for (const piece of scene.pieces) expect(cutoutFor(piece.slug), piece.slug).toBeTruthy();
  });
});

describe("parseHeroConcepts", () => {
  it("falls back to the defaults for anything missing or malformed", () => {
    expect(parseHeroConcepts(undefined)).toEqual(DEFAULTS);
    expect(parseHeroConcepts("nonsense")).toEqual(DEFAULTS);
    expect(parseHeroConcepts({ minimal: { slug: "no-such-piece", size: "big" } }).minimal).toEqual(
      DEFAULTS.minimal
    );
  });
  it("clamps numbers to the sliders' ranges and keeps valid choices", () => {
    const parsed = parseHeroConcepts({
      chosen: "wallpaper",
      minimal: { size: 999, rotate: -999, float: false },
      rotating: { seconds: 1, style: "spin" },
      wallpaper: { density: 1000, slugs: [CUTOUTS[0].slug, "gone", CUTOUTS[0].slug], seed: -4 },
    });
    expect(parsed.chosen).toBe("wallpaper");
    expect(parsed.minimal.size).toBe(LIMITS.minimalSize[1]);
    expect(parsed.minimal.rotate).toBe(LIMITS.rotate[0]);
    expect(parsed.minimal.float).toBe(false);
    expect(parsed.rotating.seconds).toBe(LIMITS.seconds[0]);
    expect(parsed.rotating.style).toBe(DEFAULTS.rotating.style);
    expect(parsed.wallpaper.density).toBe(LIMITS.density[1]);
    expect(parsed.wallpaper.slugs).toEqual([CUTOUTS[0].slug]);
    expect(parsed.wallpaper.seed).toBe(DEFAULTS.wallpaper.seed);
  });
  it("keeps the default scenes unless at least two usable ones remain", () => {
    const one = { pieces: [{ slug: CUTOUTS[0].slug, x: 10, y: 10, size: 20, rotate: 0 }] };
    expect(parseHeroConcepts({ rotating: { scenes: [one] } }).rotating.scenes).toEqual(
      DEFAULTS.rotating.scenes
    );
    expect(parseHeroConcepts({ rotating: { scenes: [one, one] } }).rotating.scenes).toHaveLength(2);
  });
});

describe("wallpaperLayout", () => {
  it("is identical for the same settings, so pieces never move between renders", () => {
    expect(wallpaperLayout(DEFAULTS.wallpaper, "wide")).toEqual(
      wallpaperLayout(DEFAULTS.wallpaper, "wide")
    );
    expect(wallpaperLayout(DEFAULTS.wallpaper, "wide")).not.toEqual(
      wallpaperLayout({ ...DEFAULTS.wallpaper, seed: 7 }, "wide")
    );
  });
  it("shows the density on computers and fewer pieces on phones", () => {
    expect(wallpaperLayout(DEFAULTS.wallpaper, "wide")).toHaveLength(DEFAULTS.wallpaper.density);
    expect(wallpaperLayout(DEFAULTS.wallpaper, "tall").length).toBeLessThan(
      DEFAULTS.wallpaper.density
    );
  });
  it("keeps the area behind the text mostly clear", () => {
    const { text } = WALL_FRAMES.wide;
    const pieces = wallpaperLayout(DEFAULTS.wallpaper, "wide");
    const behind = pieces.filter(
      (p) => p.x > text.left && p.x < text.right && p.y > text.top && p.y < text.bottom
    );
    expect(behind.length).toBeLessThanOrEqual(Math.ceil(pieces.length * 0.15));
    for (const piece of behind) expect(piece.opacity).toBeLessThan(1);
  });
  it("leaves pieces that are quiet on the blue out unless they are chosen", () => {
    const quiet = CUTOUTS.filter(isQuiet).map((cutout) => cutout.slug);
    for (const piece of wallpaperLayout({ ...DEFAULTS.wallpaper, density: 40 }, "wide"))
      expect(quiet).not.toContain(piece.slug);
  });
  it("only uses the chosen pieces", () => {
    const slugs = CUTOUTS.slice(0, 3).map((cutout) => cutout.slug);
    for (const piece of wallpaperLayout({ ...DEFAULTS.wallpaper, slugs }, "wide"))
      expect(slugs).toContain(piece.slug);
  });
});

describe("pieceWidth", () => {
  it("gives pieces of the same size the same area", () => {
    const wide = { width: 200, height: 100 };
    const tall = { width: 100, height: 200 };
    const area = (c: typeof wide) => pieceWidth(c, 40) ** 2 * (c.height / c.width);
    expect(Math.abs(area(wide) - area(tall)) / area(tall)).toBeLessThan(0.002);
  });
});
