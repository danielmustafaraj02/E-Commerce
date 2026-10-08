import type { CSSProperties, ReactNode } from "react";
import { sanitizeSectionHtml, scopeSectionCss } from "@/lib/custom-section";
import type { LayoutEntry } from "@/lib/page-layout";
import { entryContent, innerClass } from "@/lib/section-content";
import { localizeForRequest } from "@/lib/builder-i18n-server";
import { docNeedsLocalizing } from "@/lib/builder-i18n";
import {
  backgroundLayersHtml,
  hasBackgroundLayers,
  optionAttributes,
  sectionInlineStyle,
} from "@/lib/section-style";
import { builderNeedsRuntime, hasLiveBlocks } from "@/lib/section-builder";
import { BuilderView } from "./builder-view";
import { AnimateOnView } from "./animate-on-view";
import { BuilderRuntime } from "./builder-runtime";
import "./layout-section.css";

/** The section's outer element: animated when an entrance animation is set. */
function Frame({
  entry,
  className,
  style,
  children,
  ...data
}: {
  entry: LayoutEntry;
  className?: string;
  style: CSSProperties;
  children: ReactNode;
  "data-custom-section"?: string;
}) {
  const s = entry.style;
  const opts = optionAttributes(entry.options);
  if (s?.anim) {
    return (
      <AnimateOnView
        anim={s.anim}
        speed={s.animSpeed}
        delay={s.animDelay}
        className={className}
        style={style}
        {...data}
        {...opts}
      >
        {children}
      </AnimateOnView>
    );
  }
  return (
    <div className={className} style={style} {...data} {...opts}>
      {children}
    </div>
  );
}

/**
 * One section of the home / product page: applies the admin's appearance
 * options (background, spacing, hide on mobile/desktop, scoped CSS) around a
 * built-in section, or renders what replaces it (a builder design, a custom
 * section, or hand-edited HTML). With nothing set it renders the built-in
 * section untouched.
 */
/** A design that uses site text or per-language wording, in the visitor's language. */
async function LocalizedLayoutSection({
  entry,
  children,
}: {
  entry: LayoutEntry;
  children?: ReactNode;
}) {
  const builder = await localizeForRequest(entry.builder!);
  return (
    <LayoutSection entry={{ ...entry, builder }} localized>
      {children}
    </LayoutSection>
  );
}

export function LayoutSection({
  entry,
  children,
  preview = false,
  localized = false,
}: {
  entry: LayoutEntry;
  children?: ReactNode;
  /** Admin live preview: an empty, unstyled wrapper the preview bridge fills in. */
  preview?: boolean;
  /** Internal: the design's text has already been put in the visitor's language. */
  localized?: boolean;
}) {
  if (preview) {
    // The section's own markup is always there: the preview bridge keeps it
    // aside while a design replaces it, and fills a design's "original
    // content" block with it.
    return <div data-layout-id={entry.id}>{children}</div>;
  }
  // A design in the visitor's language (site text and per-language wording).
  if (!localized && entry.builder && docNeedsLocalizing(entry.builder)) {
    return <LocalizedLayoutSection entry={entry}>{children}</LocalizedLayoutSection>;
  }
  const { style } = entry;
  const content = entryContent(entry);
  const scopeClass = `layout-sec-${entry.id}`;
  const scoped = scopeSectionCss(`${content?.css ?? ""}\n${style?.css ?? ""}`, scopeClass);
  const classes = [
    scoped ? scopeClass : "",
    style?.hideOn ? `layout-hide-${style.hideOn}` : "",
    hasBackgroundLayers(style) ? "lay-has-bg" : "",
    style?.parallax && style.bgImage ? "lay-parallax" : "",
    entry.custom ? "custom-section" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const css = sectionInlineStyle(style) as CSSProperties;

  if (!content) {
    if (!classes && Object.keys(css).length === 0 && !style?.anim && !entry.options) {
      return <>{children}</>;
    }
    return (
      <Frame entry={entry} className={classes || undefined} style={css}>
        {hasBackgroundLayers(style) && (
          <div
            className="lay-bg-layers"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: backgroundLayersHtml(style) }}
          />
        )}
        {scoped && <style>{scoped}</style>}
        {children}
      </Frame>
    );
  }

  return (
    <Frame
      entry={entry}
      className={classes || undefined}
      style={css}
      data-custom-section={entry.id}
    >
      {hasBackgroundLayers(style) && (
        <div
          className="lay-bg-layers"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: backgroundLayersHtml(style) }}
        />
      )}
      {scoped && <style>{scoped}</style>}
      {entry.builder && hasLiveBlocks(entry.builder) ? (
        <div className={innerClass(content)}>
          <BuilderView doc={entry.builder} slot={children} />
        </div>
      ) : (
        <div
          className={innerClass(content)}
          dangerouslySetInnerHTML={{ __html: sanitizeSectionHtml(content.html) }}
        />
      )}
      {entry.builder && builderNeedsRuntime(entry.builder) && <BuilderRuntime />}
    </Frame>
  );
}
