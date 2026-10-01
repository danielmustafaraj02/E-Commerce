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

// A lone piece takes the frame. The two viewports need different numbers
// because `s` is a fraction of the frame HEIGHT and the frames are different
// shapes — 4/3 from 40rem, 4/5 below it. A single `s` that filled the wide
// frame would make the widest photograph (the earrings, 1164x1351) wider than
// the whole portrait frame on a phone.
const CENTRE = {
  desktop: { x: 0.5, y: 0.5, s: 0.94 },
  mobile: { x: 0.5, y: 0.5, s: 0.7 },
};

/* Desktop: the necklace leads, centred on the frame, with the bracelet and the
   earrings BESIDE it — one to each side, on a shared centre line — rather than
   stacked underneath. Flanking is what makes the three read as one arranged
   set instead of a hero with two offcuts below it, and it is also what lets
   every piece grow: the necklace went from 0.68 of the frame's height to 0.86
   and the other two from 0.36 to ~0.43.

   The numbers are checked against the photographs' own proportions so no two
   bounding boxes can meet. With `s` a fraction of frame height H and a 4/3
   frame (W = 4/3 H), a piece's half-width as a fraction of W is
   `ratio * s * 3/8`:

     necklace   0.666 * 0.86 * 3/8 = 0.215   centred  ->  0.285 .. 0.715
     bracelet   0.666 * 0.44 * 3/8 = 0.110   x 0.15   ->  0.040 .. 0.260
     earrings   0.862 * 0.42 * 3/8 = 0.136   x 0.855  ->  0.719 .. 0.991

   Phones have no room to flank, so the necklace keeps the top and the other
   two sit side by side beneath it, checked the same way against the 4/5
   frame (half-width fraction = ratio * s * 5/8). */
const THREE = {
  desktop: {
    necklace: { x: 0.5, y: 0.47, s: 0.86 },
    // Both flanking pieces on ONE centre line, a little below the necklace's:
    // a shared baseline is what reads as balance, and it keeps the pair a
    // group rather than two separately placed objects.
    bracelet: { x: 0.15, y: 0.56, s: 0.44 },
    earrings: { x: 0.855, y: 0.56, s: 0.42 },
  },
  mobile: {
    necklace: { x: 0.5, y: 0.33, s: 0.56 },
    bracelet: { x: 0.26, y: 0.82, s: 0.32 },
    earrings: { x: 0.74, y: 0.8, s: 0.3 },
  },
};

function pairSlots(hasNecklace: boolean) {
  return hasNecklace
    ? {
        // The necklace keeps the lead and the other piece sits beside it, on
        // the same centre line as in the full set.
        desktop: [
          { x: 0.36, y: 0.5, s: 0.9 },
          { x: 0.8, y: 0.56, s: 0.46 },
        ],
        mobile: [
          { x: 0.5, y: 0.33, s: 0.62 },
          { x: 0.5, y: 0.82, s: 0.34 },
        ],
      }
    : {
        // Two equals, side by side with real air between them: the same `s`,
        // so the two read at the same HEIGHT, which is what balance means for
        // pieces whose frames are different widths. 0.72 is the largest size
        // at which the widest pairing still clears — earrings on the right at
        // 0.862 * 0.72 * 3/8 = 0.233 half-width span 0.517..0.983, against a
        // left-hand portrait piece ending at 0.45.
        desktop: [
          { x: 0.27, y: 0.5, s: 0.72 },
          { x: 0.75, y: 0.5, s: 0.72 },
        ],
        mobile: [
          { x: 0.5, y: 0.27, s: 0.46 },
          { x: 0.5, y: 0.75, s: 0.44 },
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
    result[shown[0].index] = {
      desktop: CENTRE.desktop,
      mobile: CENTRE.mobile,
      visible: true,
    };
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
