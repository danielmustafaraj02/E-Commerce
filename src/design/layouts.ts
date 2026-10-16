import type { PageTarget } from "@/lib/page-layout";

/**
 * The storefront's page layouts, as code.
 *
 * These were designed with the old visual page editor (now archived outside
 * the repo; see its README) and frozen here on 2026-10-16, so the site looks
 * exactly as it did. They use the same shape the editor saved, and go through
 * the same validation (resolveLayout in lib/page-layout.ts), so a typo here
 * falls back to the built-in section instead of breaking a page.
 *
 * A page that is not listed uses its built-in layout (SECTIONS_BY_TARGET).
 * To change a page, edit its entry here and redeploy.
 */

const HOME_LAYOUT: unknown = [
  {
    id: "hero",
    style: {
      bg: "var(--site-primary)",
      css: ".bld-h{text-wrap:balance}.bld-text{text-wrap:pretty;line-height:1.75}.bld-btn{min-height:2.75rem}@media(max-width:47.99rem){.bld-btn{width:100%}}@media(min-width:48rem){.bld{gap:0;min-height:min(88svh,58rem);align-items:stretch}.bld-col{display:flex;flex-direction:column;justify-content:center}.bld-col:has(:is(img,video,iframe)){justify-content:stretch}.bld-col:has(:is(img,video,iframe))>*{flex:1 1 auto;height:auto!important;min-height:0!important;margin:0!important;max-width:none!important;border-radius:0!important}.bld-col :is(.bld-img,.bld-video,img,video){width:100%;height:100%!important;aspect-ratio:auto;object-fit:cover}.bld-col:not(:has(:is(img,video,iframe))){padding:clamp(2.5rem,6vw,6rem) clamp(1.5rem,6vw,6rem);max-width:40rem;box-sizing:border-box}.bld-col:first-child:not(:has(:is(img,video,iframe))){margin-inline-start:auto}}@media(max-width:47.99rem){.bld-col:not(:has(:is(img,video,iframe))){padding-inline:1.25rem}}",
      color: "var(--site-on-primary)",
      padTop: 0,
      padBottom: 0,
    },
    builder: {
      gap: 4,
      cells: [
        [
          {
            line: "after",
            text: "Murano · Venezia",
            type: "eyebrow",
            align: "left",
          },
          {
            h1: true,
            size: "xl",
            text: "{{store.name}}",
            type: "heading",
            align: "left",
          },
          {
            text: "*{{home.heroSubtitle}}*",
            type: "text",
            align: "left",
          },
          {
            href: "/products",
            look: "outline",
            text: "{{home.heroCta}}  →",
            type: "button",
            align: "left",
          },
        ],
        [
          {
            alt: "",
            src: "https://x87ursb7dm5kkej8.public.blob.vercel-storage.com/products/transparent-photo-yK5lmc25SdWmg1AN8KfwP01N4Irfzq.png",
            type: "image",
            style: {
              h: 20.6,
              w: 52.3,
              x: 60,
              y: -7.9,
              z: 1,
            },
          },
          {
            alt: "",
            src: "https://x87ursb7dm5kkej8.public.blob.vercel-storage.com/products/transparent-photo-Sx6vbARzFcY8QSs4ZV1hDMoqoyWzrQ.png",
            type: "image",
            style: {
              h: 15.7,
              w: 42.3,
              x: 31.1,
              y: 8.9,
              z: 1,
              rotate: -70,
            },
            rounded: true,
          },
          {
            alt: "",
            src: "https://x87ursb7dm5kkej8.public.blob.vercel-storage.com/products/transparent-photo-SkfLlhXvZk9UPVarlTP7HMo9eSCbfe.png",
            type: "image",
            style: {
              h: 23.1,
              w: 55.2,
              x: -4.1,
              y: -30,
              z: 1,
            },
          },
        ],
      ],
      width: "full",
      mobile: {
        layout: "overlay",
        overlayShade: 50,
      },
      valign: "center",
      widths: [1, 1.1],
      columns: 2,
      divider: "none",
    },
    visible: true,
  },
  {
    id: "showcase",
    style: {
      bg: "var(--site-bg)",
      css: ".showcase-title{text-wrap:balance}.showcase-description{text-wrap:pretty}",
      color: "var(--site-on-primary)",
      padTop: 0,
      padBottom: 0,
    },
    builder: {
      gap: 0,
      cells: [
        [
          {
            type: "showcase",
            scenes: {
              bracelet: {
                imageX: 0,
                imageY: 0,
                imageScale: 100,
              },
              necklace: {
                imageX: 7,
                imageY: 7,
                titleX: -2,
                titleY: 0,
                counterX: 0,
                counterY: 0,
                imageScale: 98,
                titleScale: 110,
                counterScale: 101,
                descriptionX: 0,
                descriptionY: 0,
              },
            },
            scroll: {
              style: "minimal",
            },
          },
        ],
      ],
      mobile: {
        gap: 1.5,
      },
      valign: "top",
      columns: 1,
      divider: "none",
    },
    visible: true,
  },
  {
    id: "popular",
    visible: true,
  },
  {
    id: "bestSellers",
    visible: true,
  },
  {
    id: "looks",
    builder: {
      gap: 2,
      cells: [
        [
          {
            rule: "gold",
            size: "l",
            text: "{{looks.title}}",
            type: "heading",
            align: "center",
            motion: {
              type: "rise",
            },
          },
          {
            type: "looks",
            count: 3,
          },
        ],
      ],
      valign: "top",
      columns: 1,
      divider: "none",
    },
    visible: true,
  },
  {
    id: "newArrivals",
    visible: true,
  },
  {
    id: "special",
    visible: true,
  },
  {
    id: "faq",
    visible: true,
  },
  {
    id: "giftFinder",
    visible: true,
  },
  {
    id: "testimonials",
    visible: true,
  },
  {
    id: "journal",
    visible: true,
  },
  {
    id: "newsletter",
    visible: true,
  },
  {
    id: "custom-manifesto",
    custom: {
      css: "",
      html: "",
      name: "Editorial · Manifesto band",
    },
    visible: false,
  },
  {
    id: "custom-spread",
    custom: {
      css: "",
      html: "",
      name: "Editorial · Story spread",
    },
    visible: false,
  },
  {
    id: "custom-numbers",
    custom: {
      css: "",
      html: "",
      name: "Editorial · House numbers",
    },
    visible: false,
  },
  {
    id: "custom-quote",
    custom: {
      css: "",
      html: "",
      name: "Editorial · Pull quote",
    },
    visible: false,
  },
];

const PRODUCT_LAYOUT: unknown = [
  {
    id: "top",
    style: {
      bg: "var(--site-bg)",
      css: ":is(.shelf-section,.shelf-newsletter,.form-card){background:transparent;color:inherit} :is(h1,h2,.bld-h,.shelf-heading,.look-editorial-title,.faq-title,.journal-heading,.shop-title){color:inherit;letter-spacing:-0.01em;line-height:1.15} .bld-img{object-fit:contain} :is(.bld-text,.shop-subtitle){line-height:1.8} .bld-btn{border-radius:0rem} :is(h1,h2,.bld-h,.shelf-heading,.look-editorial-title,.faq-title,.journal-heading,.shop-title){text-align:center} :is(.shelf-item,.shelf-quote,.journal-preview-card,.bld-collection-card,.journal-card){border-bottom:1px solid var(--site-accent);padding-bottom:1.5rem} :is(.shop-grid,.shelf-row,.shelf-quotes,.journal-preview-grid,.bld-collection-row){gap:2.5rem} @media(min-width:64rem){.shop-product-grid{grid-template-columns:1.15fr 0.85fr;gap:3rem}} .shop-product-info{padding:0rem;} .shop-gallery-main{border-radius:0rem} :is(h1,h2,.bld-h,.shelf-heading,.look-editorial-title,.faq-title,.journal-heading,.shop-title){text-wrap:balance} :is(.bld-text,.shop-subtitle){text-wrap:pretty} :is(.shelf-item,.shelf-quote,.journal-preview-card,.bld-collection-card,.journal-card){min-width:0} .bld-btn{min-height:2.75rem;display:inline-flex;align-items:center;justify-content:center} :is(a,button,input,textarea,select):focus-visible{outline:2px solid currentColor;outline-offset:4px} @media(max-width:47.99rem){:is(.shop-grid,.shelf-row,.shelf-quotes,.journal-preview-grid,.bld-collection-row){grid-template-columns:minmax(0,1fr);gap:1.5rem} :is(h1,h2,.bld-h,.shelf-heading,.look-editorial-title,.faq-title,.journal-heading,.shop-title){overflow-wrap:anywhere} :is(.shelf-item,.shelf-quote,.journal-preview-card,.bld-collection-card,.journal-card){padding-inline:min(1.25rem,5vw)} .bld-btn{max-width:100%;white-space:normal;text-align:center}}",
      color: "var(--site-text)",
      padTop: 0.25,
      maxWidth: 80,
      padBottom: 0,
    },
    visible: true,
  },
  {
    id: "gift",
    visible: true,
  },
  {
    id: "reviews",
    visible: true,
  },
  {
    id: "customBlocks",
    visible: true,
  },
  {
    id: "story",
    visible: true,
  },
  {
    id: "articles",
    visible: true,
  },
  {
    id: "look",
    visible: true,
  },
  {
    id: "related",
    visible: true,
  },
];

const ARTICLE_LAYOUT: unknown = [
  {
    id: "head",
    builder: {
      gap: 0,
      cells: [
        [
          {
            type: "original",
            style: {
              h: 42.6,
              w: 68.6,
              x: 0,
              y: 0,
              z: 1,
              color: "var(--site-text-muted)",
              scale: 90,
            },
            motion: {
              type: "slide-left",
              speed: "slow",
            },
          },
        ],
      ],
      width: "full",
      valign: "top",
      columns: 1,
      divider: "none",
    },
    options: {
      articleOpening: "blended",
    },
    visible: true,
  },
  {
    id: "body",
    visible: true,
  },
  {
    id: "series",
    visible: true,
  },
  {
    id: "related",
    visible: true,
  },
];

export const PAGE_LAYOUTS: Partial<Record<PageTarget, unknown>> = {
  home: HOME_LAYOUT,
  product: PRODUCT_LAYOUT,
  article: ARTICLE_LAYOUT,
};
