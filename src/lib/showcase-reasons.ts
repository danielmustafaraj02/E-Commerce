import type { ShowcaseScene } from "@/lib/i18n/showcase-copy";

/**
 * The "why Murano" reasons, told by the collections showcase: each scene
 * carries one reason as its heading and text, and the collection itself stays
 * in the button, the rail and the photograph.
 *
 * Paired by meaning, not by the reasons' old order:
 *   necklace  "Look closely at the beads"    a necklace shows many beads side by side
 *   bracelet  "Since 1291, on one island"    the history, beside the piece in the hero film
 *   earrings  "Where it comes from matters"  the closing promise, on the last scene
 *
 * They are brand-wide statements about Murano glass and how Perla chooses its
 * pieces. They deliberately make no hand-production claim: Perla curates from
 * several makers, and that is not verified for every piece.
 */
export const SCENE_REASON: Record<ShowcaseScene, 1 | 2 | 3> = {
  necklace: 2,
  bracelet: 1,
  earrings: 3,
};

export type ShowcaseReason = {
  title: string;
  /** The full text, beside the piece on wider screens. */
  body: string;
  /** A shorter telling of the same facts, for the stacked phone scene. */
  short: string;
};

type ReasonCopy = Record<`muranoReason${1 | 2 | 3}${"Title" | "Body" | "Short"}`, string>;

/** Each scene's reason, read from the (admin-overridable) home dictionary. */
export function showcaseReasons(home: ReasonCopy): Record<ShowcaseScene, ShowcaseReason> {
  const reason = (n: 1 | 2 | 3): ShowcaseReason => ({
    title: home[`muranoReason${n}Title`],
    body: home[`muranoReason${n}Body`],
    short: home[`muranoReason${n}Short`],
  });
  return {
    necklace: reason(SCENE_REASON.necklace),
    bracelet: reason(SCENE_REASON.bracelet),
    earrings: reason(SCENE_REASON.earrings),
  };
}
