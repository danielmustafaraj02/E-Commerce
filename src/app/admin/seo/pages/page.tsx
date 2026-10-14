import { db } from "@/lib/db";
import { loadPageMeta } from "@/lib/page-meta-admin";
import { MetaEditor } from "../meta-editor";

// Admin > Overview > Page metadata: the title, description and share image
// search engines and social networks show for each page, in every language.
const PAGES: { key: string; label: string; path: string }[] = [
  { key: "/", label: "Home", path: "/" },
  { key: "/products", label: "All products", path: "/products" },
  { key: "/looks", label: "Looks", path: "/looks" },
  { key: "/blog", label: "Journal", path: "/blog" },
  { key: "/about", label: "About us", path: "/about" },
  { key: "/contact", label: "Contact", path: "/contact" },
  { key: "/murano-glass", label: "Murano glass guide", path: "/murano-glass" },
  { key: "/murano-faq", label: "Murano FAQ", path: "/murano-faq" },
  { key: "/gift-finder", label: "Gift finder", path: "/gift-finder" },
  { key: "/gift-card", label: "Gift card", path: "/gift-card" },
  { key: "/personalised-gift-card", label: "Personalised gift card", path: "/personalised-gift-card" },
];

export default async function PageMetadataPage() {
  const legal = await db.legalPage.findMany({ select: { slug: true, title: true } });
  const pages = [
    ...PAGES,
    ...legal.map((p) => ({ key: `legal:${p.slug}`, label: p.title, path: `/legal/${p.slug}` })),
  ];
  const meta = await loadPageMeta(pages.map((p) => p.key));

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold">Page metadata</h1>
      <p className="text-foreground/70 mb-6 text-sm">
        What Google and social networks show for each page, in every language. Leave a field empty
        to keep the built-in text. Products, categories and looks have their own &ldquo;Search
        appearance&rdquo; section on their edit page; articles have it in the article editor.
      </p>
      <ul className="flex flex-col gap-3">
        {pages.map((page) => (
          <li key={page.key}>
            <details className="border-foreground/10 rounded-lg border bg-white">
              <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium">
                {page.label}
                <span className="text-foreground/50 font-mono text-xs font-normal">{page.path}</span>
                {meta[page.key] && <span className="text-accent ml-auto text-xs">Customised</span>}
              </summary>
              <div className="border-foreground/10 border-t p-4">
                <MetaEditor metaKey={page.key} initial={meta[page.key] ?? {}} />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
