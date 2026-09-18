import type { CSSProperties } from "react";

// One-shot word-by-word entrance for a page heading — splits on whitespace
// and staggers each word's .word-in animation (globals.css) via
// --word-delay. Pure CSS (no JS/hooks needed), so it plays correctly on
// first paint for every visitor, JS or not. Splitting on /(\s+)/ keeps the
// whitespace itself as plain (unanimated) text between word spans, so line
// wrapping still happens at the normal points.
const MAX_DELAY_MS = 450;
const STEP_MS = 45;

export function AnimatedHeading({
  text,
  as: Tag = "h1",
  className,
  id,
}: {
  text: string;
  as?: "h1" | "h2";
  className?: string;
  id?: string;
}) {
  const parts = text.split(/(\s+)/);
  const indexed = parts.reduce<{ part: string; wordIndex: number }[]>((acc, part) => {
    const isWord = part !== "" && !/^\s+$/.test(part);
    const wordIndex = isWord ? acc.filter((p) => p.wordIndex !== -1).length : -1;
    return [...acc, { part, wordIndex }];
  }, []);

  return (
    <Tag id={id} className={className}>
      {indexed.map(({ part, wordIndex }, i) => {
        if (wordIndex === -1) return part;
        const delay = Math.min(wordIndex * STEP_MS, MAX_DELAY_MS);
        return (
          <span
            key={i}
            className="word-in inline-block"
            style={{ "--word-delay": `${delay}ms` } as CSSProperties}
          >
            {part}
          </span>
        );
      })}
    </Tag>
  );
}
