import { parseBlockTheme, type BlockTheme } from "./block-theme";

/** Shared names for editable layouts and their matching global block treatments. */
export const JEWELLERY_STYLES = [
  {
    id: "maison-perla",
    name: "Maison Perla",
    note: "Classic luxury, balanced composition and fine gold rules.",
    tracking: -0.01,
    leading: 1.15,
    radius: 0,
    gap: 3,
  },
  {
    id: "quiet-atelier",
    name: "Quiet Atelier",
    note: "Minimal typography, open space and a single statement piece.",
    tracking: 0,
    leading: 1.25,
    radius: 0,
    gap: 5,
  },
  {
    id: "the-editorial",
    name: "The Editorial",
    note: "A magazine spread with a monumental title and portrait plate.",
    tracking: -0.03,
    leading: 1,
    radius: 0,
    gap: 4,
  },
  {
    id: "gallery-no-10",
    name: "Gallery No. 10",
    note: "Three jewellery plates, aligned captions and gallery spacing.",
    tracking: 0.02,
    leading: 1.2,
    radius: 0,
    gap: 2,
  },
  {
    id: "venetian-archive",
    name: "Venetian Archive",
    note: "Ivory paper, numbered details and archival hairlines.",
    tracking: 0.01,
    leading: 1.2,
    radius: 0,
    gap: 3,
  },
  {
    id: "botanical-muse",
    name: "Botanical Muse",
    note: "Soft rounded plates and a gentle forest green composition.",
    tracking: -0.01,
    leading: 1.3,
    radius: 2,
    gap: 3,
  },
  {
    id: "couture-papers",
    name: "Couture Papers",
    note: "Offset paper plates, italic copy and sculptural layering.",
    tracking: -0.02,
    leading: 1.1,
    radius: 0,
    gap: 2,
  },
  {
    id: "sculpture-studio",
    name: "Sculpture Studio",
    note: "An oversized object study with precise contemporary type.",
    tracking: 0.03,
    leading: 1.1,
    radius: 0.5,
    gap: 4,
  },
  {
    id: "modern-heirloom",
    name: "Modern Heirloom",
    note: "Warm surfaces, soft edges and intimate storytelling.",
    tracking: 0,
    leading: 1.3,
    radius: 1,
    gap: 3,
  },
  {
    id: "palazzo-evening",
    name: "Palazzo Evening",
    note: "Forest green, ivory lettering and restrained gold accents.",
    tracking: -0.02,
    leading: 1.15,
    radius: 0,
    gap: 4,
  },
] as const;

export function jewelleryBlockTheme(id: string): BlockTheme | null {
  const style = JEWELLERY_STYLES.find((item) => item.id === id);
  if (!style) return null;
  const theme: BlockTheme = {};
  const set = (type: string, selector: string, values: Record<string, string>) => {
    theme[`${type}|${selector}`] = values;
  };
  set("heading", ".bld-h", {
    weight: "400",
    tracking: String(style.tracking),
    lineHeight: String(style.leading),
  });
  set("text", ".bld-text", { size: "1", lineHeight: style.id === "quiet-atelier" ? "2" : "1.8" });
  set("image", ".bld-img", { radius: String(style.radius), shadow: "none" });
  set("button", ".bld-btn", {
    radius: String(Math.min(style.radius, 0.5)),
    padY: "0.8",
    padX: "1.8",
    weight: "500",
    caps: "uppercase",
    tracking: style.id === "sculpture-studio" ? "0.16" : "0.1",
  });
  set("eyebrow", ".bld-eyebrow", { size: "0.75", tracking: "0.18" });
  set("divider", ".bld-hr", { thickness: "1", opacity: "0.5", color: "var(--site-accent)" });
  set("quote", ".bld-quote", {
    bar: "var(--site-accent)",
    barWidth: "1",
    size: "1.25",
    style: "italic",
  });
  for (const [type, selector] of [
    ["shelf", ".shelf-row img"],
    ["carousel", ".popular-card-media"],
    ["looks", ".look-editorial-visual"],
    ["journal", ".journal-preview-card"],
    ["showcase", ".bld-collection-card"],
  ]) {
    set(type, selector, { radius: String(Math.min(style.radius, 2)), shadow: "none" });
  }
  set("reviews", ".shelf-quote", { radius: String(Math.min(style.radius, 2)), pad: "1.5" });
  return parseBlockTheme(theme);
}
