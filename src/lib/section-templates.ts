// The built-in section designs offered in Admin > Page layout ("Templates"),
// as builder documents. Used by the editor and, on the server, by
// page-templates.ts; no browser bundle needs it.
import type { SectionStyle } from "@/lib/page-layout";
import type { Align, BuilderBlock, BuilderDoc, HeadingRule } from "@/lib/section-builder";

const h = (
  text: string,
  size: "s" | "m" | "l" | "xl" = "m",
  a?: Align,
  rule?: HeadingRule
): BuilderBlock => ({
  type: "heading",
  text,
  size,
  align: a,
  ...(rule && { rule }),
});
const t = (text: string, a?: Align): BuilderBlock => ({ type: "text", text, align: a });

export type SectionTemplate = {
  id: string;
  name: string;
  description: string;
  /** Reserved numbered slot for per-section templates. */
  slot?: number;
  doc: BuilderDoc;
  /** Section style the template brings with it (background film, spacing…). */
  style?: SectionStyle;
  /** The built-in home section this template recreates, if it is one. */
  recreates?: string;
};

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "highlights",
    name: "Three highlights",
    description: "Three columns separated by vertical lines.",
    doc: {
      columns: 3,
      gap: 2.5,
      divider: "thin",
      valign: "top",
      cells: [
        [
          h("Handmade", "m", "center"),
          t("Every piece is blown and finished by hand on Murano.", "center"),
        ],
        [
          h("Authentic", "m", "center"),
          t("Made on the island, with the glassmakers' own techniques.", "center"),
        ],
        [
          h("Delivered with care", "m", "center"),
          t("Wrapped in a gift box and shipped insured.", "center"),
        ],
      ],
    },
  },
  {
    id: "stats",
    name: "Numbers row",
    description: "Four big numbers with vertical lines.",
    doc: {
      columns: 4,
      gap: 2,
      divider: "thin",
      valign: "center",
      cells: [
        [h("700", "xl", "center"), t("years of tradition", "center")],
        [h("100%", "xl", "center"), t("made by hand", "center")],
        [h("48h", "xl", "center"), t("dispatch time", "center")],
        [h("30", "xl", "center"), t("days to return", "center")],
      ],
    },
  },
  {
    id: "image-text",
    name: "Image and text",
    description: "A photo beside a heading, text and button.",
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", rounded: true }],
        [
          h("Our story", "l"),
          t(
            "Tell visitors who you are and why every piece matters.\n\nA second paragraph goes here."
          ),
          { type: "button", text: "Learn more", href: "/about", look: "solid" },
        ],
      ],
    },
  },
  {
    id: "banner",
    name: "Centred banner",
    description: "A big heading, a line of text and a button.",
    doc: {
      columns: 1,
      gap: 2,
      divider: "none",
      valign: "top",
      cells: [
        [
          h("Handmade in Murano", "xl", "center"),
          t("A short line that invites people to explore the collection.", "center"),
          {
            type: "button",
            text: "Shop the collection",
            href: "/products",
            look: "solid",
            align: "center",
          },
        ],
      ],
    },
  },
  {
    id: "quote",
    name: "Quote between lines",
    description: "A pull quote framed by horizontal lines.",
    doc: {
      columns: 1,
      gap: 2,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "divider" },
          {
            type: "quote",
            text: "The most beautiful glass I have ever owned.",
            cite: "A happy customer",
          },
          { type: "divider" },
        ],
      ],
    },
  },
  {
    id: "two-text",
    name: "Two columns of text",
    description: "Two text columns with a vertical line between.",
    doc: {
      columns: 2,
      gap: 3,
      divider: "thin",
      valign: "top",
      cells: [
        [h("Care", "m"), t("How to keep your glass shining for years.")],
        [h("Shipping", "m"), t("Where we ship, how long it takes and what it costs.")],
      ],
    },
  },
  {
    id: "cta-band",
    name: "Call-to-action band",
    description: "A message on the left, a button on the right.",
    doc: {
      columns: 2,
      gap: 2,
      divider: "none",
      valign: "center",
      cells: [
        [h("Looking for a gift?", "l"), t("Let us help you choose the perfect piece.")],
        [
          {
            type: "button",
            text: "Find a gift",
            href: "/gift-finder",
            look: "solid",
            align: "right",
          },
        ],
      ],
    },
  },
  {
    id: "section-heading",
    name: "Heading with label",
    description: "A numbered label with a line, a big title and a thick rule.",
    doc: {
      columns: 1,
      gap: 1,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "eyebrow", number: "02", text: "The pieces in this look", line: "after" },
          h("Rosa e Salvia", "xl", undefined, "thick"),
        ],
      ],
    },
  },
  {
    id: "carousel",
    name: "Product carousel",
    description: "A centred heading over a sliding row of your favourite pieces.",
    doc: {
      columns: 1,
      gap: 2,
      divider: "none",
      valign: "top",
      cells: [
        [
          h("Our community favourites", "l", "center", "gold"),
          { type: "carousel", source: "popular", count: 10 },
        ],
      ],
    },
  },
  {
    id: "home-faq-editable",
    name: "FAQ you write yourself",
    description: "Heading and questions and answers you type.",
    doc: {
      columns: 1,
      gap: 1.5,
      divider: "none",
      valign: "top",
      cells: [
        [
          h("Questions, answered", "l", undefined, "gold"),
          {
            type: "faq",
            items: [
              { q: "How long does delivery take?", a: "Orders ship within two working days." },
              { q: "Can I return a piece?", a: "Yes, within 30 days, unworn and in its box." },
              {
                q: "How do I care for my jewellery?",
                a: "Keep it dry, and store it in its pouch.",
              },
            ],
          },
        ],
      ],
    },
  },
  // ---- Editorial layouts: overlapping blocks, set by dragging in the canvas.
  {
    id: "overlap-title",
    name: "Text over photo",
    description: "A big title that overlaps the edge of a photo. Drag the ✥ handle to move it.",
    style: { bg: "#e9d8c9", padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 0,
      divider: "none",
      valign: "center",
      cells: [
        [
          {
            ...h("Overlap text and photo", "xl"),
            style: { color: "#1f3d34", x: 28, z: 3 },
          } as BuilderBlock,
        ],
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 30, z: 1 } }],
      ],
    },
  },
  {
    id: "magazine-page",
    name: "Magazine page",
    description: "A large photo with title boxes that sit across its edge, and a short text below.",
    style: { bg: "#faf0e4", color: "#6e3404", padTop: 2, padBottom: 2 },
    doc: {
      columns: 2,
      gap: 0,
      divider: "none",
      valign: "center",
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 26, w: 100 } }],
        [
          {
            ...h("A simple", "m"),
            style: { bg: "#faf0e4", pad: 0.4, x: -22, z: 3, w: 60 },
          } as BuilderBlock,
          {
            ...h("Layout", "xl"),
            style: { bg: "#faf0e4", pad: 0.4, x: -22, z: 3, w: 60 },
          } as BuilderBlock,
          {
            ...t("A few lines about the picture, set in a block that overlaps it."),
            style: { bg: "#faf0e4", pad: 0.6, x: -12, z: 3, w: 80 },
          } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "essay-opening",
    name: "Photo essay opening",
    description: "A huge title, a byline and a tall photo beside them.",
    style: { bg: "#e3eef0", padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      cells: [
        [
          h("A title in big letters", "xl"),
          { ...h("By your name", "s"), style: { pad: 0 } } as BuilderBlock,
          t("One or two lines that tell people what the story is about."),
        ],
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 34 } }],
      ],
    },
  },
  {
    id: "essay-chapter",
    name: "Numbered chapter",
    description: "A big pale number and a heading on one side, a quote and the text on the other.",
    doc: {
      columns: 2,
      gap: 2.5,
      divider: "none",
      valign: "top",
      cells: [
        [
          { ...h("01", "xl"), style: { color: "#c9bfb2" } } as BuilderBlock,
          { ...h("Chapter title", "s"), style: { color: "#1f3d34" } } as BuilderBlock,
        ],
        [
          {
            type: "quote",
            text: "A memorable line that sets the mood for this chapter.",
            cite: "Someone wise",
          },
          t("Your text goes here. Add as many paragraphs as the chapter needs."),
        ],
      ],
    },
  },
  {
    id: "photo-collage",
    name: "Photo collage",
    description: "Three photos that overlap each other. Drag them to rearrange the stack.",
    doc: {
      columns: 3,
      gap: 0,
      divider: "none",
      valign: "top",
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 18, z: 1 } }],
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 22, x: -12, y: 4, z: 2 } }],
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 16, x: -24, y: -1, z: 3 } }],
      ],
    },
  },
  {
    id: "big-quote",
    name: "Big quote",
    description: "One large quote with an oversized pale quotation mark sitting behind it.",
    style: { bg: "#f4efe8", padTop: 4, padBottom: 4, align: "center", maxWidth: 52 },
    doc: {
      columns: 1,
      gap: 0,
      divider: "none",
      valign: "top",
      cells: [
        [
          {
            ...h("“", "xl", "center"),
            style: { color: "#d9cdbd", y: 2.5, z: 0 },
          } as BuilderBlock,
          {
            ...h("The kind of piece you keep and hand down.", "l", "center"),
            style: { z: 2 },
            motion: { type: "rise" },
          } as BuilderBlock,
          {
            ...t("A CUSTOMER, MURANO NECKLACE", "center"),
            motion: { type: "fade", order: 2 },
          } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "photo-caption",
    name: "Tall photo and story",
    description: "A tall photo with a small caption, beside an eyebrow, a heading and the story.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      widths: [0.8, 1.2],
      cells: [
        [
          { type: "image", src: "/logo.png", alt: "", style: { h: 34 } },
          { ...t("Photo caption, a few words."), style: { w: 60 } } as BuilderBlock,
        ],
        [
          { type: "eyebrow", number: "01", text: "The story", line: "after" },
          h("A heading that sets the scene", "l"),
          t("Tell the story in a few short paragraphs.\n\nKeep each one to two or three lines."),
          { type: "button", text: "Read more", href: "/about", look: "outline" },
        ],
      ],
    },
  },
  {
    id: "photo-quote-overlap",
    name: "Photo with overlapping quote",
    description: "A wide photo with a quote card that overlaps its lower corner.",
    style: { padTop: 3, padBottom: 5 },
    doc: {
      columns: 2,
      gap: 0,
      divider: "none",
      valign: "top",
      widths: [1.4, 0.6],
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 30 } }],
        [
          {
            type: "quote",
            text: "A line worth pulling out of the story.",
            cite: "Who said it",
            style: { bg: "#ffffff", pad: 1.5, x: -45, y: 18, z: 3, w: 130, shadow: "medium" },
            motion: { type: "slide-right", order: 2 },
          },
        ],
      ],
    },
  },
  {
    id: "three-steps",
    name: "Three numbered steps",
    description: "Three steps with big pale numbers, lines between them and a sequence animation.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 3,
      gap: 2.5,
      divider: "thin",
      valign: "top",
      stagger: 250,
      cells: [
        [
          { ...h("01", "xl"), style: { color: "#d9cdbd" }, motion: { type: "rise", order: 1 } },
          { ...h("Choose", "m"), motion: { type: "rise", order: 1 } },
          { ...t("Pick the piece that speaks to you."), motion: { type: "fade", order: 1 } },
        ],
        [
          { ...h("02", "xl"), style: { color: "#d9cdbd" }, motion: { type: "rise", order: 2 } },
          { ...h("Personalise", "m"), motion: { type: "rise", order: 2 } },
          { ...t("Add a colour, a length or a message."), motion: { type: "fade", order: 2 } },
        ],
        [
          { ...h("03", "xl"), style: { color: "#d9cdbd" }, motion: { type: "rise", order: 3 } },
          { ...h("Receive", "m"), motion: { type: "rise", order: 3 } },
          { ...t("Wrapped by hand and sent insured."), motion: { type: "fade", order: 3 } },
        ],
      ],
    } as BuilderDoc,
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Four dates in a row, with lines that draw themselves in as you scroll.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 4,
      gap: 2,
      divider: "thin",
      drawLines: true,
      valign: "top",
      cells: [
        [h("1291", "l"), t("Glassmakers are moved to the island of Murano.")],
        [h("1500", "l"), t("The art of crystal glass is perfected.")],
        [h("1900", "l"), t("Beads and jewellery spread across Europe.")],
        [h("Today", "l"), t("Every piece is still made by hand, one at a time.")],
      ],
    },
  },
  {
    id: "cover-title",
    name: "Magazine cover",
    description: "A full-width photo with the title pulled up over its lower edge.",
    style: { padTop: 2, padBottom: 3 },
    doc: {
      columns: 1,
      gap: 0,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "image", src: "/logo.png", alt: "", style: { h: 28 } },
          {
            ...h("The Autumn Issue", "xl"),
            style: { y: -4, x: 6, z: 3, color: "#ffffff" },
            motion: { type: "skew-rise" },
          } as BuilderBlock,
          {
            ...t("New colours, new stories, made by hand."),
            style: { y: -3, x: 6 },
            motion: { type: "fade", order: 2 },
          } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "photo-duo",
    name: "Two photos, offset",
    description: "Two photos at different heights, with a caption tucked between them.",
    style: { padTop: 3, padBottom: 4 },
    doc: {
      columns: 2,
      gap: 1.5,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "image", src: "/logo.png", alt: "", style: { h: 22 } },
          { ...t("The first photo."), style: { w: 70 } } as BuilderBlock,
        ],
        [
          { type: "spacer", height: 4 },
          { type: "image", src: "/logo.png", alt: "", style: { h: 26 } },
          { ...t("The second photo."), style: { w: 70 } } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "feature-review",
    name: "Featured review",
    description: "Stars, a big quote and who said it, beside a photo.",
    style: { bg: "#faf6f0", padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 26 } }],
        [
          { type: "stars", rating: 5, label: "5 out of 5" },
          h("Better than the photos.", "l"),
          {
            type: "quote",
            text: "It arrived beautifully wrapped, and the colours are even richer in person.",
            cite: "A happy customer",
          },
        ],
      ],
    },
  },
  {
    id: "intro-columns",
    name: "Editorial intro",
    description: "An eyebrow and a huge heading, with the text set in two columns underneath.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 2.5,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "eyebrow", number: "02", text: "Introduction", line: "after" },
          { ...h("Handmade, the slow way", "xl"), motion: { type: "rise" } } as BuilderBlock,
        ],
        [
          {
            ...t("Open with the idea behind it all, in a few lines."),
            motion: { type: "fade", order: 2 },
          } as BuilderBlock,
          {
            ...t("Then say how it is made, and why that matters."),
            motion: { type: "fade", order: 3 },
          } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "blank",
    name: "Blank",
    description: "An empty single column.",
    doc: { columns: 1, gap: 2, divider: "none", valign: "top", cells: [[t("Your text here.")]] },
  },
];
