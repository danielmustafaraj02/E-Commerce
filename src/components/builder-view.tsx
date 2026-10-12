import { sanitizeSectionHtml } from "@/lib/custom-section";
import {
  blockHtml,
  blockWrap,
  columnShare,
  isLiveBlock,
  type BuilderBlock,
  type BuilderDoc,
} from "@/lib/section-builder";
import type { ReactNode } from "react";
import { LiveBlock } from "./builder-live";

function BlockView({
  block,
  position,
  share,
  slot,
}: {
  block: BuilderBlock;
  position: number;
  /** The fraction of the page width its column takes on computers. */
  share: number;
  slot?: ReactNode;
}) {
  if (isLiveBlock(block)) {
    const wrap = blockWrap(block, position);
    // "Original content" is the section's own built-in markup, passed in.
    const live = block.type === "original" ? (slot ?? null) : <LiveBlock block={block} />;
    return wrap ? (
      <div className={wrap.className} style={wrap.style} {...wrap.data}>
        {live}
      </div>
    ) : (
      <div className="bld-s">{live}</div>
    );
  }
  const html = blockHtml(block, false, Math.floor(position / 25), position % 25, share);
  return html ? (
    <div className="bld-s" dangerouslySetInnerHTML={{ __html: sanitizeSectionHtml(html) }} />
  ) : null;
}

/**
 * A builder design as React, used when it contains live blocks (real products,
 * looks, reviews…). Same structure and class names as the compiled HTML, so the
 * design's CSS applies unchanged.
 */
export function BuilderView({ doc, slot }: { doc: BuilderDoc; slot?: ReactNode }) {
  return (
    <div
      className="bld"
      {...(doc.drawLines ? { "data-bld-draw": "" } : {})}
      {...(doc.stagger !== undefined ? { "data-bm-stagger": String(doc.stagger) } : {})}
    >
      {doc.cells.map((cell, c) => (
        <div className="bld-col" key={c}>
          {cell.map((block, i) => (
            <BlockView
              key={i}
              block={block}
              position={c * 25 + i}
              share={columnShare(doc, c)}
              slot={slot}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
