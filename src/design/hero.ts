import { parseLiveHero } from "@/lib/hero-concepts/live";

/**
 * The home page hero (frozen from the old Hero concepts workbench on
 * 2026-10-16). Set it to null to fall back to the original hero.
 */
export const LIVE_HERO = parseLiveHero({
  at: "2026-10-13T18:25:38.982Z",
  config: {
    cards: true,
    chosen: "rotating",
    minimal: {
      x: 50,
      y: 50,
      size: 88,
      slug: "collana-fiamma-scarlatta-17effb",
      float: true,
      rotate: 0,
      intensity: 50,
    },
    rotating: {
      style: "drift",
      scenes: [
        {
          pieces: [
            {
              x: 58,
              y: 40,
              size: 50,
              slug: "collana-arabeschi-turchese-e-corallo-ottobre-2026",
              rotate: -8,
            },
            {
              x: 24,
              y: 74,
              size: 26,
              slug: "orecchini-arabeschi-turchese-e-corallo-ottobre-2026",
              rotate: 6,
            },
            {
              x: 80,
              y: 80,
              size: 22,
              slug: "bracciale-arabeschi-turchese-e-corallo-ottobre-2026",
              rotate: 12,
            },
          ],
        },
        {
          pieces: [
            {
              x: 62,
              y: 46,
              size: 50,
              slug: "collana-rubino-ff1b2a",
              rotate: 10,
            },
            {
              x: 22,
              y: 30,
              size: 22,
              slug: "orecchini-quadrati-rosso-ottobre-2026",
              rotate: -6,
            },
            {
              x: 28,
              y: 76,
              size: 28,
              slug: "bracciale-fuoco-di-granato-9ff520",
              rotate: -14,
            },
          ],
        },
        {
          pieces: [
            {
              x: 60,
              y: 38,
              size: 44,
              slug: "bracciale-carnevale-c35a85",
              rotate: -6,
            },
            {
              x: 24,
              y: 70,
              size: 28,
              slug: "orecchini-giardino-pastello-d650a2",
              rotate: 6,
            },
            {
              x: 82,
              y: 80,
              size: 20,
              slug: "orecchini-foglia-di-menta-9c749a",
              rotate: -10,
            },
          ],
        },
        {
          pieces: [
            {
              x: 58,
              y: 44,
              size: 54,
              slug: "collana-perle-rosa-ottobre-2026",
              rotate: 4,
            },
            {
              x: 20,
              y: 74,
              size: 24,
              slug: "orecchini-perle-rosa-ottobre-2026",
              rotate: -10,
            },
          ],
        },
      ],
      seconds: 6.5,
      intensity: 67,
    },
    wallpaper: {
      dim: 31,
      seed: 20261012,
      scale: 82,
      slugs: [],
      shiftX: 0,
      shiftY: -2,
      density: 15,
      clearing: 80,
      entrance: true,
      rotation: 23,
      variation: 100,
    },
  },
  concept: "wallpaper",
});
