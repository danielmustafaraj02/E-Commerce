import { JEWELLERY_STYLES } from "./jewellery-styles";
import {
  parseBuilder,
  type BuilderBlock,
  type BuilderDoc,
  type SectionTemplate,
} from "./section-builder";
import type { LayoutEntry, PageTarget, SectionMeta, SectionStyle } from "./page-layout";

export type SectionDesign = SectionTemplate & { styleOnly: boolean; style: SectionStyle };

const single = (blocks: BuilderBlock[], gap = 1.5): BuilderDoc => ({
  columns: 1,
  gap,
  divider: "none",
  valign: "top",
  cells: [blocks],
  mobile: { gap: 1.5 },
});
const LIVE = new Set([
  "original",
  "shelf",
  "carousel",
  "looks",
  "reviews",
  "newsletter",
  "journal",
  "siteFaq",
  "showcase",
]);
const HEADINGS =
  ":is(h1,h2,.bld-h,.shelf-heading,.look-editorial-title,.faq-title,.journal-heading,.shop-title)";
const DISPLAY = ":is(h1,h2,.bld-h-l,.bld-h-xl,.showcase-title,.shop-title)";
const CARDS =
  ":is(.shelf-item,.shelf-quote,.journal-preview-card,.bld-collection-card,.journal-card)";
const GRIDS = ":is(.shop-grid,.shelf-row,.shelf-quotes,.journal-preview-grid,.bld-collection-row)";

/** Ten designs of this section's own content. Live/functional sections retain their native markup. */
export function createSectionDesigns(
  page: PageTarget,
  section: SectionMeta,
  source?: SectionTemplate
): SectionDesign[] {
  const base = source?.doc ?? single([{ type: "original" }], 0);
  const native = !!section.fixed || base.cells.flat().some((b) => LIVE.has(b.type));
  return JEWELLERY_STYLES.map((direction, index) => {
    const dark = direction.id === "palazzo-evening";
    const center = ["maison-perla", "quiet-atelier", "gallery-no-10", "sculpture-studio"].includes(
      direction.id
    );
    const surface = [
      "venetian-archive",
      "botanical-muse",
      "couture-papers",
      "modern-heirloom",
    ].includes(direction.id);
    const bg = dark ? "var(--site-primary)" : surface ? "var(--site-surface)" : "var(--site-bg)";
    const fg = dark ? "var(--site-on-primary)" : "var(--site-text)";
    let doc = native ? single([{ type: "original" }], 0) : structuredClone(base);
    if (!native) {
      const content = doc.cells.flat();
      if (
        source?.style?.bgImage &&
        !content.some((block) => block.type === "image" || block.type === "video")
      )
        content.push({ type: "image", src: source.style.bgImage, alt: "" });
      const blocks = content.map((block) => {
        const clean = { ...block };
        // These are composed spreads, with all wording retained and no mandatory entrance effects.
        delete clean.motion;
        if ("typing" in clean) delete clean.typing;
        if ("afterTyping" in clean) delete clean.afterTyping;
        if (
          clean.type === "heading" ||
          clean.type === "text" ||
          clean.type === "button" ||
          clean.type === "eyebrow"
        )
          clean.align = center ? "center" : "left";
        if (clean.type === "heading") clean.size = direction.id === "quiet-atelier" ? "l" : "xl";
        clean.style = { ...clean.style, color: fg };
        if (clean.type === "image")
          clean.style = {
            ...clean.style,
            color: undefined,
            h: 30,
            mh: 20,
            radius: direction.radius,
          };
        if (clean.type === "button") {
          clean.look = ["quiet-atelier", "venetian-archive", "gallery-no-10"].includes(direction.id)
            ? "outline"
            : "solid";
          clean.style = {
            radius: Math.min(direction.radius, 0.4),
            color:
              clean.look === "outline"
                ? fg
                : dark
                  ? "var(--site-primary)"
                  : "var(--site-on-primary)",
            ...(clean.look === "solid"
              ? { bg: dark ? "var(--site-on-primary)" : "var(--site-primary)" }
              : {}),
          };
        }
        if (clean.type === "video") clean.style = { h: 30, mh: 20, radius: direction.radius };
        return clean;
      });
      const media = blocks.filter((b) => b.type === "image" || b.type === "video");
      const copy = blocks.filter((b) => b.type !== "image" && b.type !== "video");
      if (
        media.length &&
        !["quiet-atelier", "sculpture-studio", "gallery-no-10"].includes(direction.id)
      ) {
        const mediaFirst = ["botanical-muse", "modern-heirloom"].includes(direction.id);
        doc = {
          columns: 2,
          gap: direction.gap,
          divider:
            direction.id === "venetian-archive" || direction.id === "the-editorial"
              ? "thin"
              : "none",
          dividerColor: "var(--site-accent)",
          valign: "center",
          widths:
            direction.id === "the-editorial"
              ? [1.25, 0.75]
              : direction.id === "venetian-archive"
                ? [0.8, 1.2]
                : direction.id === "couture-papers"
                  ? [1.1, 0.9]
                  : [1, 1],
          mobile: { gap: 2, ...(mediaFirst ? { reverse: true } : {}) },
          cells: mediaFirst ? [media, copy] : [copy, media],
        };
      } else if (base.columns > 1 && !media.length && direction.id === "gallery-no-10") {
        doc = {
          ...structuredClone(base),
          gap: 3,
          divider: "thin",
          dividerColor: "var(--site-accent)",
        };
      } else {
        doc = single(
          media.length && (direction.id === "gallery-no-10" || direction.id === "sculpture-studio")
            ? [...media, ...copy]
            : blocks,
          direction.id === "quiet-atelier" ? 2.5 : 1.5
        );
      }
    }
    if (section.id === "showcase") {
      const treatments = [
        "classical",
        "minimal",
        "bold",
        "arched",
        "classical",
        "arched",
        "couture",
        "studio",
        "studio",
        "bold",
      ] as const;
      doc = single(
        [
          {
            type: "showcase",
            scroll: {
              style: treatments[index],
              bg,
              title: fg,
              textColor: fg,
              accent: "var(--site-accent)",
              accentText: "var(--site-on-primary)",
              ...(index === 1 ? { rail: false } : {}),
            },
            ...(index === 3 || index === 7 ? { layout: "row" as const } : {}),
          },
        ],
        0
      );
    }
    const familyCss = familyRules(page, section.id, index);
    const recipes = [
      `${HEADINGS}{text-align:center} ${CARDS}{border-bottom:1px solid var(--site-accent);padding-bottom:1.5rem} ${GRIDS}{gap:2.5rem}`,
      `${HEADINGS}{max-width:30ch;margin-inline:auto;text-align:center} ${CARDS}{background:transparent;box-shadow:none;border:0} ${GRIDS}{gap:3rem}`,
      `${DISPLAY}{font-size:clamp(2rem,4vw,4.5em);max-width:18ch} ${CARDS}{border-top:1px solid var(--site-accent);padding-top:1.5rem} ${GRIDS}{gap:3rem}`,
      `${CARDS}{padding:1.25rem;border:1px solid var(--site-border);text-align:center;background:var(--site-bg);color:var(--site-text)} ${GRIDS}{gap:1rem}`,
      `${HEADINGS}{border-top:1px solid var(--site-accent);padding-top:1.5rem} ${CARDS}{border-bottom:1px solid var(--site-accent);padding-bottom:1.5rem} ${GRIDS}{gap:2rem}`,
      `${CARDS}{padding:1.5rem;background:var(--site-bg);color:var(--site-text);border-radius:2rem} :is(.shelf-item-photo,.popular-card-media,.journal-preview-image){border-radius:2rem 2rem 0 0} ${GRIDS}{gap:2rem}`,
      `${CARDS}{padding:1.5rem;background:var(--site-bg);color:var(--site-text);border:1px solid var(--site-border)} ${GRIDS}{gap:2rem} ${DISPLAY}{font-style:italic}`,
      `${DISPLAY}{font-family:var(--font-body);text-transform:uppercase;font-size:clamp(1.5rem,3vw,3em)} ${CARDS}{border:1px solid var(--site-accent);padding:1.5rem} ${GRIDS}{gap:2.5rem}`,
      `${CARDS}{border-radius:1rem;padding:1.5rem;background:var(--site-bg);color:var(--site-text)} ${HEADINGS}{font-style:italic} ${GRIDS}{gap:2rem}`,
      `${CARDS}{background:var(--site-surface);color:var(--site-text);padding:1.5rem;border:1px solid var(--site-accent)} ${HEADINGS}{color:inherit} .shop-subtitle{color:inherit} ${CARDS} :is(.shelf-link,.look-editorial-price){color:var(--site-text)}`,
    ];
    const polish = `${HEADINGS}{text-wrap:balance} :is(.bld-text,.shop-subtitle){text-wrap:pretty} ${CARDS}{min-width:0} .bld-btn{min-height:2.75rem;display:inline-flex;align-items:center;justify-content:center} :is(a,button,input,textarea,select):focus-visible{outline:2px solid currentColor;outline-offset:4px}`;
    const css = `:is(.shelf-section,.shelf-newsletter,.form-card){background:transparent;color:inherit} ${HEADINGS}{color:inherit;letter-spacing:${direction.tracking}em;line-height:${direction.leading}} .bld-img{object-fit:contain} :is(.bld-text,.shop-subtitle){line-height:1.8} .bld-btn{border-radius:${Math.min(direction.radius, 0.5)}rem} ${recipes[index]} ${familyCss} ${polish} @media(max-width:47.99rem){${GRIDS}{grid-template-columns:minmax(0,1fr);gap:1.5rem} ${HEADINGS}{overflow-wrap:anywhere} ${CARDS}{padding-inline:min(1.25rem,5vw)} .bld-btn{max-width:100%;white-space:normal;text-align:center}}`;
    return {
      id: `section-${page}-${section.id}-${direction.id}`,
      name: direction.name,
      description: `${section.label} · ${direction.note}`,
      styleOnly: !!section.fixed,
      doc: parseBuilder(doc)!,
      style: {
        bg,
        color: fg,
        padTop: index === 1 ? 5 : 3,
        padBottom: index === 1 ? 5 : 3,
        maxWidth: [80, 68, 92, 88, 76, 84, 90, 82, 72, 88][index],
        css,
      },
    };
  });
}

/** Content-specific structure: product plates, reading widths, fields, collection rows and purchase layout. */
function familyRules(page: PageTarget, id: string, variant: number): string {
  const columns = [4, 3, 2, 4, 3, 3, 2, 2, 3, 3][variant];
  if (page === "product" && id === "top")
    return `@media(min-width:64rem){.shop-product-grid{grid-template-columns:${variant === 2 ? "1.4fr 0.6fr" : variant === 1 ? "1fr 1fr" : "1.15fr 0.85fr"};gap:${variant === 1 ? 5 : 3}rem}} .shop-product-info{padding:${variant === 5 || variant === 8 ? 2 : 0}rem;${variant === 5 || variant === 8 ? "background:var(--site-bg);color:var(--site-text);border-radius:1rem;" : ""}} .shop-gallery-main{border-radius:${variant === 5 ? 2 : variant === 8 ? 1 : 0}rem}`;
  if ((page === "contact" && id === "form") || id === "newsletter")
    return `:is(.form-card,.footer-newsletter,.shelf-newsletter){max-width:${variant === 1 ? 36 : 52}rem;margin-inline:auto;padding:${variant === 1 ? 1 : 2}rem;border:${variant === 1 ? 0 : 1}px solid var(--site-accent);border-radius:${variant === 5 ? 2 : variant === 8 ? 1 : 0}rem} :is(input:not([type=checkbox]):not([type=radio]),textarea,select){border-color:var(--site-accent);border-radius:${variant === 8 ? 0.5 : 0}rem}`;
  if (id === "body" || id === "customBlocks" || id === "story")
    return `:is(.journal-prose,.journal-article-body,.article-body,.about-body,.bld-text){max-width:${variant === 2 ? 72 : variant === 1 ? 56 : 64}ch;margin-inline:auto;line-height:${variant === 1 ? 2 : 1.85}} :is(blockquote,.bld-quote){border-left:1px solid var(--site-accent);padding-left:1.5rem} .bld-story{gap:${variant === 1 ? 4 : 2.5}rem}`;
  if (id === "showcase")
    return variant === 1 || variant === 3 || variant === 7
      ? `@media(min-width:48rem){.bld-collection-row{grid-template-columns:repeat(${variant === 7 ? 2 : 3},minmax(0,1fr));gap:2rem}}`
      : `.showcase-title{letter-spacing:${variant === 2 ? -0.03 : 0.01}em} .showcase-figure{border-radius:${variant === 5 ? 2 : 0}rem}`;
  if (id === "faq" || id === "reviews" || id === "testimonials")
    return `:is(.faq-item,.bld-faq-item){border-color:var(--site-accent);padding-block:${variant === 1 ? 1.5 : 1}rem} .shelf-quotes{gap:${variant === 1 ? 3 : 2}rem} @media(min-width:64rem){.shelf-quotes{grid-template-columns:repeat(${variant === 2 || variant === 7 ? 2 : 3},minmax(0,1fr))}}`;
  return `@media(min-width:64rem){${GRIDS}{grid-template-columns:repeat(${columns},minmax(0,1fr))}} :is(.shelf-item-photo img,.popular-card-media img){object-fit:contain} :is(.shelf-row,.popular-track){gap:${variant === 1 ? 3 : 1.5}rem}`;
}

/** Applying a preview changes only the draft. Fixed commerce sections retain their real buy controls. */
export function applySectionDesign(entry: LayoutEntry, design: SectionDesign): LayoutEntry {
  const builder = structuredClone(design.doc);
  const showcase = entry.builder?.cells.flat().find((block) => block.type === "showcase");
  if (showcase?.type === "showcase") {
    for (const block of builder.cells.flat())
      if (block.type === "showcase" && showcase.scenes)
        block.scenes = structuredClone(showcase.scenes);
  }
  return {
    ...entry,
    style: structuredClone(design.style),
    ...(!design.styleOnly ? { builder, html: undefined } : {}),
  };
}
