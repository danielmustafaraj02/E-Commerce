import { videoEmbedUrl } from "@/lib/video-embed";
import { JEWELLERY_STYLES } from "./jewellery-styles";
import { parseBuilder, type BuilderBlock, type BuilderDoc } from "./section-builder";
import { type SectionTemplate } from "@/lib/section-templates";
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
    const surface = [
      "venetian-archive",
      "botanical-muse",
      "couture-papers",
      "modern-heirloom",
    ].includes(direction.id);
    const bg = dark ? "var(--site-primary)" : surface ? "var(--site-surface)" : "var(--site-bg)";
    const fg = dark ? "var(--site-on-primary)" : "var(--site-text)";
    let doc = native ? single([{ type: "original" }], 0) : structuredClone(base);
    const nativeContent = base.cells.flat().find((block) => block.type === "original");
    const nativeTransforms = nativeContent?.type === "original" ? nativeContent.guiElements : undefined;
    if (native && doc.cells[0]?.[0]?.type === "original" && nativeTransforms)
      doc.cells[0][0] = { type: "original", guiElements: structuredClone(nativeTransforms) };
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
        return clean;
      });
      return composeDesign(page, section, index, blocks);
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
    // The collections showcase brings its own typography and composition:
    // generic heading/card recipes would only pull its text off its edge.
    if (section.id === "showcase")
      return {
        id: `section-${page}-${section.id}-${direction.id}`,
        name: direction.name,
        description: `${section.label} · ${direction.note}`,
        styleOnly: !!section.fixed,
        doc: parseBuilder(doc)!,
        style: { bg, color: fg, padTop: 0, padBottom: 0, css: `.showcase-title{text-wrap:balance}.showcase-description{text-wrap:pretty}` },
      };
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

// ---- Composed designs for content sections ---------------------------------
// Ten distinct compositions of a section's own blocks (headings, text, buttons,
// images, video). Colours come from the section, never the blocks, so text
// stays readable when a phone layout puts it over the photo.

type Archetype = {
  name: string;
  note: string;
  /** Edge to edge: the photo meets the screen edges and fills the height. */
  bleed?: boolean;
  /** Width of the content column, rem; the background always spans the page. */
  measure?: number;
  /** Builds the composition; media/copy are the section's own blocks. */
  build: (media: BuilderBlock[], copy: BuilderBlock[]) => { doc: BuilderDoc; style: SectionStyle };
};

const DARK: SectionStyle = { bg: "var(--site-primary)", color: "var(--site-on-primary)" };
const SURFACE: SectionStyle = { bg: "var(--site-surface)", color: "var(--site-text)" };
const PLAIN: SectionStyle = { bg: "var(--site-bg)", color: "var(--site-text)" };

const tune = (
  blocks: BuilderBlock[],
  opts: { align?: "left" | "center"; heading?: "l" | "xl"; button?: "solid" | "outline"; rule?: boolean; media?: { h?: number; fit?: "cover" | "contain" } }
): BuilderBlock[] =>
  blocks.map((block) => {
    const b = structuredClone(block);
    if (opts.align && (b.type === "heading" || b.type === "text" || b.type === "button" || b.type === "eyebrow"))
      b.align = opts.align;
    if (b.type === "heading" && opts.heading) {
      b.size = opts.heading;
      if (opts.rule) b.rule = "gold";
    }
    if (b.type === "button" && opts.button) b.look = opts.button;
    if (b.type === "image" && opts.media?.fit) b.fit = opts.media.fit;
    if ((b.type === "image" || b.type === "video") && opts.media?.h)
      b.style = { ...b.style, h: opts.media.h, mh: Math.min(opts.media.h, 22) };
    if (b.style?.color) b.style = { ...b.style, color: undefined };
    return b;
  });

const split = (
  cells: BuilderBlock[][],
  widths: number[],
  mobile: BuilderDoc["mobile"],
  extra: Partial<BuilderDoc> = {}
): BuilderDoc => ({
  columns: cells.length as 2 | 3,
  gap: 4,
  divider: "none",
  valign: "center",
  widths,
  mobile,
  cells,
  ...extra,
});

/** On phones: the photo fills the screen and the text sits on it. */
const OVERLAY: BuilderDoc["mobile"] = { layout: "overlay", overlayShade: 50, overlayHeight: 85 };

export const ARCHETYPES: Archetype[] = [
  {
    name: "Split",
    bleed: true,
    note: "Text on the left, photo on the right. On phones the photo becomes the background with the text on it.",
    build: (media, copy) => ({
      doc: split([tune(copy, { align: "left", heading: "xl" }), tune(media, { media: { h: 34, fit: "cover" } })], [1, 1.1], OVERLAY),
      style: { ...PLAIN, padTop: 4, padBottom: 4 },
    }),
  },
  {
    name: "Split, photo first",
    bleed: true,
    note: "Photo on the left, text on the right. On phones the photo becomes the background with the text on it.",
    build: (media, copy) => ({
      doc: split([tune(media, { media: { h: 34, fit: "cover" } }), tune(copy, { align: "left", heading: "xl" })], [1.15, 1], OVERLAY),
      style: { ...PLAIN, padTop: 4, padBottom: 4 },
    }),
  },
  {
    name: "Centred",
    measure: 64,
    note: "Everything centred, with a wide photo below the text. Stacks naturally on phones.",
    build: (media, copy) => ({
      doc: single([...tune(copy, { align: "center", heading: "xl" }), ...tune(media, { media: { h: 28, fit: "cover" } })], 2),
      style: { ...PLAIN, padTop: 5, padBottom: 5, align: "center" },
    }),
  },
  {
    name: "Cover",
    measure: 72,
    note: "The photo or video fills the whole section and the text sits on it, darkened for reading.",
    build: (media, copy) => {
      const image = media.find((b) => b.type === "image");
      // Only a video file can play as a background; a YouTube/Vimeo link stays a block.
      const video = media.find((b) => b.type === "video" && !videoEmbedUrl(b.url));
      if (!image && !video)
        return {
          doc: single([...tune(copy, { align: "left", heading: "xl" }), ...tune(media, { media: { h: 30 } })], 1.5),
          style: { ...DARK, padTop: 6, padBottom: 6 },
        };
      return {
        doc: single(tune(copy, { align: "left", heading: "xl" }), 1.5),
        style: {
          color: "#fff",
          padTop: 8,
          padBottom: 8,
          ...(image?.type === "image" ? { bgImage: image.src, bgFit: "cover" as const } : {}),
          ...(video?.type === "video" ? { bgVideo: video.url } : {}),
          overlayColor: "#000",
          overlayStrength: 45,
        },
      };
    },
  },
  {
    name: "Editorial",
    measure: 88,
    note: "A wide headline column with a fine rule and a narrower photo. Stacks on phones, text first.",
    build: (media, copy) => ({
      doc: split([tune(copy, { align: "left", heading: "xl", rule: true }), tune(media, { media: { h: 30, fit: "cover" } })], [1.4, 0.6], { gap: 2 }, { divider: "thin", dividerColor: "var(--site-accent)", gap: 3 }),
      style: { ...PLAIN, padTop: 5, padBottom: 5 },
    }),
  },
  {
    name: "Card",
    measure: 52,
    note: "Photo on top and centred text, on a soft surface. Compact and calm on every screen.",
    build: (media, copy) => ({
      doc: single([...tune(media, { media: { h: 22, fit: "cover" } }), ...tune(copy, { align: "center", heading: "l" })], 1.5),
      style: { ...SURFACE, padTop: 4, padBottom: 4, radius: 1, align: "center" },
    }),
  },
  {
    name: "Night",
    bleed: true,
    note: "Dark background, light text beside the photo. On phones the photo becomes the background.",
    build: (media, copy) => ({
      doc: split([tune(copy, { align: "left", heading: "xl", button: "outline" }), tune(media, { media: { h: 34, fit: "cover" } })], [1, 1.1], OVERLAY),
      style: { ...DARK, padTop: 5, padBottom: 5 },
    }),
  },
  {
    name: "Minimal",
    measure: 46,
    note: "Mostly typography: a large headline, generous space and a quiet link-style button.",
    build: (media, copy) => ({
      doc: single([...tune(copy, { align: "left", heading: "l", button: "outline" }), ...tune(media, { media: { h: 20, fit: "contain" } })], 2.5),
      style: { ...PLAIN, padTop: 7, padBottom: 7 },
    }),
  },
  {
    name: "Gallery",
    measure: 80,
    note: "The photo shown whole, never cropped, beside the text on a pale surface. Stacks on phones, photo first.",
    build: (media, copy) => ({
      doc: split([tune(media, { media: { h: 32, fit: "contain" } }), tune(copy, { align: "left", heading: "l", rule: true })], [1.2, 1], { gap: 2 }),
      style: { ...SURFACE, padTop: 5, padBottom: 5 },
    }),
  },
  {
    name: "Framed",
    measure: 80,
    note: "Fine rules above and below, text and photo separated by a hairline. Stacks on phones, text first.",
    build: (media, copy) => ({
      doc: split([tune(copy, { align: "left", heading: "l", button: "outline" }), tune(media, { media: { h: 28, fit: "cover" } })], [1, 1], { gap: 2 }, { divider: "thin", dividerColor: "var(--site-accent)" }),
      style: { ...PLAIN, padTop: 4, padBottom: 4, borderTop: true, borderBottom: true },
    }),
  },
];

function composeDesign(
  page: PageTarget,
  section: SectionMeta,
  index: number,
  blocks: BuilderBlock[]
): SectionDesign {
  const archetype = ARCHETYPES[index % ARCHETYPES.length];
  const media = blocks.filter((b) => b.type === "image" || b.type === "video");
  const copy = blocks.filter((b) => b.type !== "image" && b.type !== "video");
  // Without a photo, the layouts that need one become a single text column.
  const titles = copy.filter((b) => b.type === "heading" || b.type === "eyebrow");
  const rest = copy.filter((b) => b.type !== "heading" && b.type !== "eyebrow");
  const { doc, style } = media.length
    ? archetype.build(media, copy)
    : index % ARCHETYPES.length === 1 && titles.length && rest.length
      ? // Text only: headline on the left, words and button on the right.
        {
          doc: split([tune(titles, { align: "left", heading: "xl" }), tune(rest, { align: "left" })], [1, 1.2], { gap: 1.5 }, { valign: "top" }),
          style: archetype.build([], copy).style,
        }
      : { doc: single(tune(copy, { align: index === 2 || index === 5 ? "center" : "left", heading: index === 7 ? "l" : "xl" }), index % ARCHETYPES.length === 1 ? 3 : 1.5), style: archetype.build([], copy).style };
  const base = `.bld-h{text-wrap:balance}.bld-text{text-wrap:pretty;line-height:1.75}.bld-btn{min-height:2.75rem}@media(max-width:47.99rem){.bld-btn{width:100%}}`;
  const bleed = archetype.bleed && media.length > 0;
  // Edge to edge on computers: the photo column fills the full height and
  // reaches the screen edge; the text column keeps a comfortable padding.
  const bleedCss = `@media(min-width:48rem){.bld{gap:0;min-height:min(88svh,58rem);align-items:stretch}.bld-col{display:flex;flex-direction:column;justify-content:center}.bld-col:has(:is(img,video,iframe)){justify-content:stretch}.bld-col:has(:is(img,video,iframe))>*{flex:1 1 auto;height:auto!important;min-height:0!important;margin:0!important;max-width:none!important;border-radius:0!important}.bld-col :is(.bld-img,.bld-video,img,video){width:100%;height:100%!important;aspect-ratio:auto;object-fit:cover}.bld-col:not(:has(:is(img,video,iframe))){padding:clamp(2.5rem,6vw,6rem) clamp(1.5rem,6vw,6rem);max-width:40rem;box-sizing:border-box}.bld-col:first-child:not(:has(:is(img,video,iframe))){margin-inline-start:auto}}@media(max-width:47.99rem){.bld-col:not(:has(:is(img,video,iframe))){padding-inline:1.25rem}}`;
  const measureCss = archetype.measure ? `.bld{max-width:${archetype.measure}rem;margin-inline:auto}` : "";
  const css = base + (bleed ? bleedCss : measureCss);
  if (bleed) {
    doc.width = "full";
    style.padTop = 0;
    style.padBottom = 0;
  }
  return {
    id: `section-${page}-${section.id}-${archetype.name.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    name: archetype.name,
    description: `${archetype.name} — ${archetype.note}`,
    styleOnly: false,
    doc: parseBuilder(doc)!,
    style: { ...style, css },
  };
}
