"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Text clamped to a few lines with a deliberate "Read more" instead of a
// sentence cut off by an ellipsis. The button only appears when the text is
// actually longer than the clamp; the full text is always in the DOM.
export function ExpandableText({
  text,
  lines = 4,
  moreLabel,
  lessLabel,
  className = "",
}: {
  text: string;
  lines?: number;
  moreLabel: string;
  lessLabel: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, text]);

  return (
    <div className="expandable">
      <p
        ref={ref}
        className={className}
        style={expanded ? undefined : { WebkitLineClamp: lines }}
        data-clamped={!expanded}
      >
        {text}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          className="expandable-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}
