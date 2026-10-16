// The alternative home-page heroes and everything they are made of: the
// transparent product cut-outs (cutouts.json, made by the archived
// hero-cutouts script), each concept's settings with their limits and
// defaults, and the wallpaper's fixed layout. Which concept is live, and its
// settings, is code: src/design/hero.ts.
import cutoutList from "./cutouts.json";

export type CutoutKind = "necklace" | "bracelet" | "earrings" | "other";
export type Cutout = {
  slug: string;
  src: string;
  width: number;
  height: number;
  kind: CutoutKind;
  /** Mean colour difference (ΔE) from the hero's blue. */
  contrast: number;
};

export const CUTOUTS = cutoutList as Cutout[];
const BY_SLUG = new Map(CUTOUTS.map((cutout) => [cutout.slug, cutout]));
export const cutoutFor = (slug: string) => BY_SLUG.get(slug);

/** Below this colour difference a piece reads as quiet on the blue (cobalt and
 *  deep teal glass); the wallpaper leaves such pieces out unless chosen. */
export const QUIET_CONTRAST = 40;
export const isQuiet = (cutout: Pick<Cutout, "contrast">) => cutout.contrast < QUIET_CONTRAST;
/** The wallpaper's pieces when none are chosen. */

/** Longest side, in pixels, a cut-out needs to stay crisp in the hero. */
export const HERO_MIN_PIXELS = 700;
/** Good enough to show large in a hero: sharp and clear of the blue. */
export const isHeroGrade = (cutout: Cutout) =>
  Math.max(cutout.width, cutout.height) >= HERO_MIN_PIXELS && !isQuiet(cutout);
/** The wallpaper's pieces when none are chosen: hero-grade ones only. */
export const WALLPAPER_POOL = CUTOUTS.filter(isHeroGrade).map((c) => c.slug);

export const CONCEPTS = ["minimal", "rotating", "wallpaper"] as const;
export type ConceptId = (typeof CONCEPTS)[number];
export const CONCEPT_LABELS: Record<ConceptId, string> = {
  minimal: "Minimal",
  rotating: "Rotating",
  wallpaper: "Wallpaper",
};

export const ROTATING_STYLES = ["drift", "rise", "fade"] as const;
export type RotatingStyle = (typeof ROTATING_STYLES)[number];
export const ROTATING_STYLE_LABELS: Record<RotatingStyle, string> = {
  drift: "Drift sideways",
  rise: "Rise and settle",
  fade: "Fade only",
};

/** One piece in a box: its centre (x, y, % of the box) and its size, the
 *  diameter of a circle of the same area, in % of the box's width. */
export type Placement = { slug: string; x: number; y: number; size: number; rotate: number };

export type MinimalConfig = {
  slug: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  float: boolean;
  /** 0–100: how far the entrance and the float move. */
  intensity: number;
};
export type RotatingScene = { pieces: Placement[] };
export type RotatingConfig = {
  scenes: RotatingScene[];
  seconds: number;
  style: RotatingStyle;
  intensity: number;
};
export type WallpaperConfig = {
  /** The pieces the wallpaper is made of; empty means WALLPAPER_POOL. */
  slugs: string[];
  /** Picks the arrangement. The same seed always gives the same wallpaper. */
  seed: number;
  /** Pieces on a computer screen (phones show about 60% of them). */
  density: number;
  /** Overall size, % of the default. */
  scale: number;
  /** 0–100: from all pieces alike to very large next to very small. */
  variation: number;
  /** Largest tilt, degrees either way. */
  rotation: number;
  /** 0–100: how strongly pieces keep out of the area behind the text. */
  clearing: number;
  /** 0–80: how much a piece that still reaches the text is faded, %. */
  dim: number;
  /** Moves the whole wallpaper, % of the hero. */
  shiftX: number;
  shiftY: number;
  entrance: boolean;
};
export type HeroConceptsConfig = {
  /** The concept marked as the favourite; publishing is a separate step. */
  chosen: ConceptId | null;
  /** Hovering (or tapping) a piece shows its name, price and a link to it. */
  cards: boolean;
  minimal: MinimalConfig;
  rotating: RotatingConfig;
  wallpaper: WallpaperConfig;
};

/** Slider ranges, shared by the controls and by parsing. */
export const LIMITS = {
  position: [0, 100],
  rotate: [-45, 45],
  intensity: [0, 100],
  minimalSize: [55, 110],
  pieceSize: [10, 80],
  seconds: [4, 12],
  scenes: [2, 6],
  piecesPerScene: [2, 4],
  density: [10, 40],
  scale: [60, 160],
  variation: [0, 100],
  wallRotation: [0, 45],
  clearing: [0, 100],
  dim: [0, 80],
  shift: [-20, 20],
} as const satisfies Record<string, readonly [number, number]>;

export const DEFAULTS: HeroConceptsConfig = {
  chosen: null,
  cards: true,
  minimal: {
    slug: "collana-fiamma-scarlatta-17effb",
    x: 50,
    y: 50,
    size: 88,
    rotate: 0,
    float: true,
    intensity: 50,
  },
  rotating: {
    seconds: 6,
    style: "drift",
    intensity: 60,
    // Each scene is one colour story, composed by hand: a large piece, then one
    // or two smaller ones that balance it across the box.
    scenes: [
      {
        pieces: [
          { slug: "collana-arabeschi-turchese-e-corallo-ottobre-2026", x: 58, y: 40, size: 50, rotate: -8 },
          { slug: "orecchini-arabeschi-turchese-e-corallo-ottobre-2026", x: 24, y: 74, size: 26, rotate: 6 },
          { slug: "bracciale-arabeschi-turchese-e-corallo-ottobre-2026", x: 80, y: 80, size: 22, rotate: 12 },
        ],
      },
      {
        pieces: [
          { slug: "collana-rubino-ff1b2a", x: 62, y: 46, size: 50, rotate: 10 },
          { slug: "orecchini-quadrati-rosso-ottobre-2026", x: 22, y: 30, size: 22, rotate: -6 },
          { slug: "bracciale-fuoco-di-granato-9ff520", x: 28, y: 76, size: 28, rotate: -14 },
        ],
      },
      {
        pieces: [
          { slug: "bracciale-carnevale-c35a85", x: 60, y: 38, size: 44, rotate: -6 },
          { slug: "orecchini-giardino-pastello-d650a2", x: 24, y: 70, size: 28, rotate: 6 },
          { slug: "orecchini-foglia-di-menta-9c749a", x: 82, y: 80, size: 20, rotate: -10 },
        ],
      },
      {
        pieces: [
          { slug: "collana-perle-rosa-ottobre-2026", x: 58, y: 44, size: 54, rotate: 4 },
          { slug: "orecchini-perle-rosa-ottobre-2026", x: 20, y: 74, size: 24, rotate: -10 },
        ],
      },
    ],
  },
  wallpaper: {
    slugs: [],
    seed: 20261012,
    density: 18,
    scale: 100,
    variation: 75,
    rotation: 22,
    clearing: 85,
    dim: 40,
    shiftX: 0,
    shiftY: 0,
    entrance: true,
  },
};

// ---- Parsing -------------------------------------------------------------------

const clamp = (value: number, [min, max]: readonly [number, number]) =>
  Math.min(max, Math.max(min, value));
const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
/** A finite number within the range (rounded to 0.1), or the fallback. */
const num = (value: unknown, range: readonly [number, number], fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(clamp(value, range) * 10) / 10
    : fallback;
const known = (slug: unknown): slug is string => typeof slug === "string" && BY_SLUG.has(slug);

function parsePlacement(value: unknown): Placement | null {
  if (!isRecord(value) || !known(value.slug)) return null;
  return {
    slug: value.slug,
    x: num(value.x, LIMITS.position, 50),
    y: num(value.y, LIMITS.position, 50),
    size: num(value.size, LIMITS.pieceSize, 30),
    rotate: num(value.rotate, LIMITS.rotate, 0),
  };
}

/**
 * A stored or submitted draft, made safe: unknown fields are dropped, numbers
 * are clamped to their sliders' ranges, pieces whose cut-out no longer exists
 * are left out, and anything missing or unusable falls back to the default.
 */
export function parseHeroConcepts(value: unknown): HeroConceptsConfig {
  const raw = isRecord(value) ? value : {};
  const m = isRecord(raw.minimal) ? raw.minimal : {};
  const r = isRecord(raw.rotating) ? raw.rotating : {};
  const w = isRecord(raw.wallpaper) ? raw.wallpaper : {};
  const d = DEFAULTS;

  const scenes = (Array.isArray(r.scenes) ? r.scenes : [])
    .slice(0, LIMITS.scenes[1])
    .map((scene) =>
      (isRecord(scene) && Array.isArray(scene.pieces) ? scene.pieces : [])
        .slice(0, LIMITS.piecesPerScene[1])
        .map(parsePlacement)
        .filter((piece): piece is Placement => piece !== null)
    )
    .filter((pieces) => pieces.length > 0)
    .map((pieces) => ({ pieces }));

  return {
    chosen: CONCEPTS.includes(raw.chosen as ConceptId) ? (raw.chosen as ConceptId) : null,
    cards: typeof raw.cards === "boolean" ? raw.cards : d.cards,
    minimal: {
      slug: known(m.slug) ? m.slug : d.minimal.slug,
      x: num(m.x, LIMITS.position, d.minimal.x),
      y: num(m.y, LIMITS.position, d.minimal.y),
      size: num(m.size, LIMITS.minimalSize, d.minimal.size),
      rotate: num(m.rotate, LIMITS.rotate, d.minimal.rotate),
      float: typeof m.float === "boolean" ? m.float : d.minimal.float,
      intensity: num(m.intensity, LIMITS.intensity, d.minimal.intensity),
    },
    rotating: {
      scenes: scenes.length >= LIMITS.scenes[0] ? scenes : d.rotating.scenes,
      seconds: num(r.seconds, LIMITS.seconds, d.rotating.seconds),
      style: ROTATING_STYLES.includes(r.style as RotatingStyle)
        ? (r.style as RotatingStyle)
        : d.rotating.style,
      intensity: num(r.intensity, LIMITS.intensity, d.rotating.intensity),
    },
    wallpaper: {
      slugs: Array.isArray(w.slugs) ? [...new Set(w.slugs.filter(known))] : d.wallpaper.slugs,
      seed:
        typeof w.seed === "number" && Number.isSafeInteger(w.seed) && w.seed >= 0
          ? w.seed
          : d.wallpaper.seed,
      density: Math.round(num(w.density, LIMITS.density, d.wallpaper.density)),
      scale: num(w.scale, LIMITS.scale, d.wallpaper.scale),
      variation: num(w.variation, LIMITS.variation, d.wallpaper.variation),
      rotation: num(w.rotation, LIMITS.wallRotation, d.wallpaper.rotation),
      clearing: num(w.clearing, LIMITS.clearing, d.wallpaper.clearing),
      dim: num(w.dim, LIMITS.dim, d.wallpaper.dim),
      shiftX: num(w.shiftX, LIMITS.shift, d.wallpaper.shiftX),
      shiftY: num(w.shiftY, LIMITS.shift, d.wallpaper.shiftY),
      entrance: typeof w.entrance === "boolean" ? w.entrance : d.wallpaper.entrance,
    },
  };
}

// ---- Geometry --------------------------------------------------------------------

/**
 * A piece's drawn width, % of its box, for a given size. Size is the diameter
 * of a circle with the piece's area, so a wide bangle and a long necklace at
 * the same size look equally important rather than equally wide.
 */
export function pieceWidth(cutout: Pick<Cutout, "width" | "height">, size: number) {
  return Math.round(size * Math.sqrt(cutout.width / cutout.height) * 100) / 100;
}

/** Whether a cut-out has enough pixels to be drawn `cssWidth` px wide on a
 *  2× screen without looking soft. */
export const sharpAt = (cutout: Pick<Cutout, "width">, cssWidth: number) =>
  cutout.width >= cssWidth * 1.6;

// ---- The wallpaper's arrangement ----------------------------------------------------

export type WallPiece = {
  slug: string;
  /** Centre, % of the hero's width and height. */
  x: number;
  y: number;
  /** Drawn width, % of the hero's width. */
  width: number;
  rotate: number;
  opacity: number;
  /** Stacking: large pieces behind, small in front. */
  layer: number;
};

/** A small seeded random-number generator (mulberry32): the same seed always
 *  gives the same sequence, on the server and in the browser alike. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Frame = {
  /** Height as a share of the width (the hero's shape). */
  aspect: number;
  /** The area behind the text, in % of width and height. */
  text: { left: number; right: number; top: number; bottom: number };
  /** Piece sizes (diameter, % of width) for the large, medium and small tiers. */
  tiers: [number, number][];
  /** Share of the admin's density that this frame shows. */
  share: number;
};

export const WALL_FRAMES: Record<"wide" | "tall", Frame> = {
  // A computer: the hero is about 16:9 and the text sits in its left half.
  wide: {
    aspect: 0.56,
    text: { left: 0, right: 48, top: 16, bottom: 86 },
    tiers: [
      [27, 36],
      [13, 18],
      [7, 10],
    ],
    share: 1,
  },
  // A phone: tall, with the text in its lower half.
  tall: {
    aspect: 1.9,
    text: { left: 0, right: 100, top: 44, bottom: 94 },
    tiers: [
      [44, 58],
      [26, 34],
      [15, 20],
    ],
    share: 0.6,
  },
};

// Large pieces need a sharp photo; small ones prefer earrings (a pair reads
// well small) and large ones round pieces (they read well big).
const LARGE_MIN_PIXELS = 900;
const TIER_SHARES = [0.2, 0.35, 0.45];

/**
 * The wallpaper's pieces for one screen shape. Fully determined by the
 * settings: the same draft always draws every piece in the same place, so the
 * layout never jumps between renders, and server and browser agree.
 *
 * Placement is best-candidate sampling: each piece, largest first, tries two
 * dozen random spots and takes the one farthest from the pieces already down,
 * with spots behind the text counted as crowded. That spreads the pieces
 * evenly but irregularly, like a hand-laid collage rather than a grid, and
 * lets some run past the hero's edges.
 */
export function wallpaperLayout(config: WallpaperConfig, shape: "wide" | "tall"): WallPiece[] {
  const frame = WALL_FRAMES[shape];
  const rand = random(config.seed * 2 + (shape === "tall" ? 1 : 0));
  const pool = (config.slugs.length ? config.slugs : WALLPAPER_POOL)
    .map(cutoutFor)
    .filter((cutout): cutout is Cutout => !!cutout);
  if (!pool.length) return [];

  const count = Math.max(4, Math.round(config.density * frame.share));
  const height = 100 * frame.aspect;
  const variation = config.variation / 100;
  const scale = config.scale / 100;
  const middle = (frame.tiers[1][0] + frame.tiers[1][1]) / 2;

  // Tier for each piece, largest first.
  const tiers: number[] = [];
  for (let tier = 0; tier < 3; tier++) {
    const n = tier === 2 ? count - tiers.length : Math.round(count * TIER_SHARES[tier]);
    for (let i = 0; i < n; i++) tiers.push(tier);
  }

  // Pieces dealt out in a shuffled order, each tier preferring the kind it
  // suits, so the same piece rarely appears twice until the pool runs out.
  const deck = [...pool];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const used = new Set<string>();
  const deal = (tier: number) => {
    const fits = (cutout: Cutout) =>
      tier === 0
        ? cutout.kind !== "earrings" && Math.max(cutout.width, cutout.height) >= LARGE_MIN_PIXELS
        : tier === 2
          ? cutout.kind === "earrings"
          : true;
    const pick =
      deck.find((cutout) => !used.has(cutout.slug) && fits(cutout)) ??
      deck.find((cutout) => !used.has(cutout.slug)) ??
      deck[Math.floor(rand() * deck.length)];
    used.add(pick.slug);
    if (used.size === deck.length) used.clear();
    return pick;
  };

  const { text } = frame;
  // `pad` is in % of the width; on the height axis the same distance is a
  // larger share of a wide frame and a smaller one of a tall frame.
  const inText = (x: number, y: number, pad: number) =>
    x > text.left - pad &&
    x < text.right + pad &&
    y > text.top - pad / frame.aspect &&
    y < text.bottom + pad / frame.aspect;

  const placed: { x: number; y: number; r: number }[] = [];
  const pieces: WallPiece[] = [];
  for (const tier of tiers) {
    const cutout = deal(tier);
    const [low, high] = frame.tiers[tier];
    const natural = low + rand() * (high - low);
    const size = (middle + (natural - middle) * variation) * scale;
    const radius = size / 2;

    let best = { x: 50, y: height / 2, score: -Infinity };
    for (let attempt = 0; attempt < 24; attempt++) {
      // Up to a third of a piece may run past each edge.
      const x = -radius * 0.6 + rand() * (100 + radius * 1.2);
      const y = -radius * 0.6 + rand() * (height + radius * 1.2);
      let gap = Infinity;
      for (const other of placed) {
        gap = Math.min(gap, Math.hypot(x - other.x, y - other.y) - (radius + other.r) * 0.95);
      }
      if (!placed.length) gap = 100;
      const yPct = (y / height) * 100;
      // At full clearing a spot behind the text loses to any spot outside it.
      const crowding = inText(x, yPct, radius * 0.8) ? (config.clearing / 100) * 200 : 0;
      const score = gap - crowding;
      if (score > best.score) best = { x, y, score };
    }
    placed.push({ x: best.x, y: best.y, r: radius });

    const yPct = (best.y / height) * 100;
    const tilt = cutout.kind === "earrings" ? 0.5 : 1;
    pieces.push({
      slug: cutout.slug,
      x: Math.round((best.x + config.shiftX) * 100) / 100,
      y: Math.round((yPct + config.shiftY) * 100) / 100,
      width: pieceWidth(cutout, size),
      rotate: Math.round((rand() * 2 - 1) * config.rotation * tilt * 10) / 10,
      opacity: inText(best.x, yPct, radius * 0.5) ? Math.round((1 - config.dim / 100) * 100) / 100 : 1,
      layer: tier + 1,
    });
  }
  return pieces;
}

/** The products a concept shows, for their cards (names and prices). */
export function conceptSlugs(concept: ConceptId, config: HeroConceptsConfig): string[] {
  if (concept === "minimal") return [config.minimal.slug];
  if (concept === "rotating") return [...new Set(config.rotating.scenes.flatMap((s) => s.pieces.map((p) => p.slug)))];
  return [
    ...new Set([...wallpaperLayout(config.wallpaper, "wide"), ...wallpaperLayout(config.wallpaper, "tall")].map((p) => p.slug)),
  ];
}
