import { contrastRatio } from "@/lib/site-style";
import type { BlockPos, BuilderBlock, BuilderDoc } from "@/lib/section-builder";

/**
 * Checks a builder design for things that make it hard to use (accessibility)
 * or slow (performance), in plain words. Pure: the editor shows the result.
 */

export type AuditIssue = {
  level: "warn" | "info";
  area: "accessibility" | "performance";
  message: string;
  /** The block it is about, when it is about one. */
  pos?: BlockPos;
};

const TEXTY = new Set(["heading", "text", "list", "quote", "button", "badge", "eyebrow"]);
const VAGUE_LINKS = /^\s*(click here|here|read more|more|link|button|learn more)\s*$/i;
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function auditDesign(
  doc: BuilderDoc,
  colors: { pageBg?: string; text?: string; sectionBg?: string; sectionText?: string } = {}
): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const blocks: { block: BuilderBlock; pos: BlockPos }[] = doc.cells.flatMap((cell, col) =>
    cell.map((block, idx) => ({ block, pos: { col, idx } }))
  );
  const name = (b: BuilderBlock) => b.type.charAt(0).toUpperCase() + b.type.slice(1);

  for (const { block, pos } of blocks) {
    if (block.type === "image" && block.src && !block.alt.trim())
      issues.push({
        level: "warn",
        area: "accessibility",
        message:
          "An image has no description. Add one so screen readers can describe it (leave it empty only if the picture is purely decorative).",
        pos,
      });
    if (block.type === "button" && VAGUE_LINKS.test(block.text))
      issues.push({
        level: "warn",
        area: "accessibility",
        message: `The button "${block.text.trim()}" doesn't say where it goes. Name the destination instead.`,
        pos,
      });

    const st = block.style;
    const fg = st?.color && HEX.test(st.color) ? st.color : undefined;
    const bg = st?.bg && HEX.test(st.bg) ? st.bg : undefined;
    if ((fg || bg) && TEXTY.has(block.type)) {
      const useFg = fg ?? colors.sectionText ?? colors.text;
      const useBg = bg ?? colors.sectionBg ?? colors.pageBg;
      const ratio = useFg && useBg ? contrastRatio(useFg, useBg) : null;
      const large = block.type === "heading" && (block.size === "l" || block.size === "xl");
      if (ratio !== null && ratio < (large ? 3 : 4.5))
        issues.push({
          level: "warn",
          area: "accessibility",
          message: `${name(block)} text is hard to read: contrast ${ratio.toFixed(1)}:1, it needs ${large ? "3" : "4.5"}:1. Pick a darker or lighter colour.`,
          pos,
        });
    }

    if (block.idle && TEXTY.has(block.type))
      issues.push({
        level: "warn",
        area: "accessibility",
        message: `A looping animation on ${block.type} text makes it hard to read. Use it on pictures and icons instead.`,
        pos,
      });
    if (st?.x !== undefined || st?.y !== undefined) {
      if (st.mx === undefined && st.my === undefined && !block.hide)
        issues.push({
          level: "info",
          area: "accessibility",
          message:
            "This block is moved on computers but goes back to its normal place on phones. Set a phone position in the toolbar if you want it different.",
          pos,
        });
    }
    if (block.sticky && (st?.x !== undefined || st?.y !== undefined))
      issues.push({
        level: "warn",
        area: "accessibility",
        message:
          "A sticky block that is also moved can't stay in view. Remove the move, or turn sticky off.",
        pos,
      });
  }

  if ((doc.mobile?.fontScale ?? 100) < 80)
    issues.push({
      level: "warn",
      area: "accessibility",
      message: `Text is scaled down to ${doc.mobile?.fontScale}% on phones, which may be too small to read.`,
    });
  if (blocks.some((b) => b.block.idle))
    issues.push({
      level: "info",
      area: "accessibility",
      message:
        "Looping animations never stop. Keep them few; visitors who prefer reduced motion won't see them.",
    });

  // ---- Performance
  const count = (type: string) => blocks.filter((b) => b.block.type === type).length;
  if (count("video") > 1)
    issues.push({
      level: count("video") > 2 ? "warn" : "info",
      area: "performance",
      message: `${count("video")} videos on one section slow the page down on phones. Keep one, or link to the video instead.`,
    });
  if (count("image") > 8)
    issues.push({
      level: "info",
      area: "performance",
      message: `${count("image")} pictures in one section. Make sure they are compressed (under about 300 KB each).`,
    });
  const external = blocks.filter(
    (b) => b.block.type === "image" && /^https?:\/\//.test(b.block.src)
  );
  if (external.length)
    issues.push({
      level: "info",
      area: "performance",
      message:
        "Some pictures are loaded from another website. Upload them so they load as fast as the rest of the site and can't disappear.",
      pos: external[0].pos,
    });
  const motions = blocks.filter((b) => b.block.motion);
  if (motions.length > 12)
    issues.push({
      level: "info",
      area: "performance",
      message: `${motions.length} blocks animate on scroll. A few well-chosen ones look better and run smoother.`,
    });
  const scrub = motions.filter((b) => b.block.motion?.mode === "scrub");
  if (scrub.length > 4)
    issues.push({
      level: "warn",
      area: "performance",
      message: `${scrub.length} blocks follow the scroll position; each one is recalculated on every scroll. Use "play once" for most of them.`,
    });
  const parallax = blocks.filter((b) => b.block.parallax);
  if (parallax.length > 3)
    issues.push({
      level: "info",
      area: "performance",
      message: `${parallax.length} blocks use parallax. It can feel heavy on older phones.`,
    });
  const live = blocks.filter((b) =>
    ["carousel", "shelf", "looks", "reviews", "journal", "showcase"].includes(b.block.type)
  );
  if (live.length > 4)
    issues.push({
      level: "info",
      area: "performance",
      message: `${live.length} live blocks (products, reviews, looks…) each load data. Split them across sections if the page feels slow.`,
    });
  if (blocks.length > 40)
    issues.push({
      level: "info",
      area: "performance",
      message: `${blocks.length} blocks in one section is a lot. Splitting it into two sections keeps the editor and the page quick.`,
    });

  return issues;
}
