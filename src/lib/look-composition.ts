// Where each piece of a look sits in the "Complete the look" showcase, for
// however many pieces are selected. Pure data: the component turns a slot
// into a transform (translate + scale of a full-size layer), so moving
// between states is a compositor-only animation with no layout jumps.
//
// x/y: the piece's centre as a fraction of the showcase (0–1);
// s: its height as a fraction of the showcase height.
export type Slot = { x: number; y: number; s: number };
export type Placement = { desktop: Slot; mobile: Slot; visible: boolean };

type Kind = "necklace" | "bracelet" | "earrings" | null;

const CENTRE: Slot = { x: 0.5, y: 0.5, s: 0.86 };

// Desktop: the necklace leads in the middle, with smaller pieces held apart
// at the upper-left and lower-right. Phones (portrait): the necklace on top,
// the others side by side below.
const THREE = {
  desktop: {
    necklace: { x: 0.5, y: 0.5, s: 0.78 },
    bracelet: { x: 0.2, y: 0.28, s: 0.34 },
    earrings: { x: 0.8, y: 0.72, s: 0.34 },
  },
  mobile: {
    necklace: { x: 0.5, y: 0.34, s: 0.62 },
    bracelet: { x: 0.26, y: 0.8, s: 0.36 },
    earrings: { x: 0.74, y: 0.8, s: 0.36 },
  },
};

function pairSlots(hasNecklace: boolean) {
  return hasNecklace
    ? {
        // The necklace keeps the lead; the other piece beside / below it.
        desktop: [
          { x: 0.42, y: 0.5, s: 0.82 },
          { x: 0.82, y: 0.68, s: 0.4 },
        ],
        mobile: [
          { x: 0.5, y: 0.36, s: 0.66 },
          { x: 0.5, y: 0.82, s: 0.34 },
        ],
      }
    : {
        // Two equals, side by side (one above the other on phones).
        desktop: [
          { x: 0.3, y: 0.5, s: 0.62 },
          { x: 0.7, y: 0.5, s: 0.62 },
        ],
        mobile: [
          { x: 0.5, y: 0.28, s: 0.46 },
          { x: 0.5, y: 0.74, s: 0.46 },
        ],
      };
}

export function lookComposition(pieces: { kind: Kind; selected: boolean }[]): Placement[] {
  // Necklace first, so it's the one given the lead in every state.
  const order = (kind: Kind) => (kind === "necklace" ? 0 : kind === "bracelet" ? 1 : 2);
  const shown = pieces
    .map((piece, index) => ({ ...piece, index }))
    .filter((p) => p.selected)
    .sort((a, b) => order(a.kind) - order(b.kind));

  const result: Placement[] = pieces.map((piece) => {
    // Hidden pieces rest where they'd sit in the full set, so they fade out
    // (and back in) in place instead of flying across the showcase.
    const kind = piece.kind ?? "earrings";
    return { desktop: THREE.desktop[kind], mobile: THREE.mobile[kind], visible: false };
  });

  if (shown.length === 1) {
    result[shown[0].index] = { desktop: CENTRE, mobile: CENTRE, visible: true };
  } else if (shown.length === 2) {
    const slots = pairSlots(shown[0].kind === "necklace");
    shown.forEach((p, i) => {
      result[p.index] = { desktop: slots.desktop[i], mobile: slots.mobile[i], visible: true };
    });
  } else if (shown.length >= 3) {
    // Unknown kinds fall back to the free positions in order.
    const free = (["necklace", "bracelet", "earrings"] as const).filter(
      (k) => !shown.some((p) => p.kind === k)
    );
    shown.forEach((p) => {
      const kind = p.kind ?? free.shift() ?? "earrings";
      result[p.index] = { desktop: THREE.desktop[kind], mobile: THREE.mobile[kind], visible: true };
    });
  }
  return result;
}
