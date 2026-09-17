import Link from "next/link";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { Tabs } from "@/components/tabs";

function Check({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
          ok ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
        }`}
        aria-hidden="true"
      >
        {ok ? "✓" : "!"}
      </span>
      <span className="text-sm">
        <span className="font-medium">{label}</span>
        {detail && <span className="text-foreground/70 block">{detail}</span>}
      </span>
    </li>
  );
}

export default async function AdminSeoPage() {
  const settings = await getStoreSettings();
  const base = settings.siteUrl || null;

  const [
    productCount,
    productsMissingEnName,
    productsMissingEnDescription,
    categoryCount,
    categoriesMissingEnName,
    productsWithReviews,
    legalPageCount,
  ] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.product.count({ where: { active: true, OR: [{ nameEn: null }, { nameEn: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionEn: null }, { descriptionEn: "" }] },
    }),
    db.category.count(),
    db.category.count({ where: { OR: [{ nameEn: null }, { nameEn: "" }] } }),
    db.product.count({ where: { active: true, reviews: { some: {} } } }),
    db.legalPage.count(),
  ]);

  const sitemapUrlCount = productCount + categoryCount + legalPageCount + 3; // home, /products, /about, /contact-ish base pages

  const readiness = [
    {
      ok: Boolean(settings.siteUrl),
      label: "Production site URL is set",
      detail: settings.siteUrl
        ? settings.siteUrl
        : "Admin > Settings > SEO — without this, canonical links, sitemap.xml and robots.txt all fall back to localhost, which Google will not index.",
    },
    {
      ok: Boolean(settings.googleSiteVerification),
      label: "Google Search Console verification is set",
      detail: settings.googleSiteVerification
        ? "Verification meta tag present in <head>."
        : "Admin > Settings > SEO — paste the HTML tag verification code from Search Console so this site shows up as a verified property.",
    },
    {
      ok: Boolean(settings.metaDescription),
      label: "Default meta description is set",
      detail: settings.metaDescription || "Falls back to a generic \"Shop at {store name}\" line.",
    },
    {
      ok: Boolean(settings.ogImageUrl || settings.logoUrl),
      label: "Social preview image (OG image) is set",
      detail: settings.ogImageUrl || settings.logoUrl || "Used for link previews on social/chat apps.",
    },
  ];

  const translationReadiness = [
    {
      ok: productsMissingEnName === 0,
      label: "Product names translated to English",
      detail: `${productCount - productsMissingEnName} / ${productCount} products have an English name.`,
    },
    {
      ok: productsMissingEnDescription === 0,
      label: "Product stories translated to English",
      detail: `${productCount - productsMissingEnDescription} / ${productCount} products have an English description.`,
    },
    {
      ok: categoriesMissingEnName === 0,
      label: "Category names translated to English",
      detail: `${categoryCount - categoriesMissingEnName} / ${categoryCount} categories have an English name.`,
    },
    {
      ok: productsWithReviews > 0,
      label: "Products with at least one review",
      detail: `${productsWithReviews} / ${productCount} — only these are eligible for the ⭐ rating shown in Google search results (AggregateRating rich result).`,
    },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold">SEO & Indexing</h1>
      <p className="text-foreground/70 mb-8 text-sm">
        A snapshot of what this store has in place for search engines and AI answer engines to
        crawl, understand and index it. This page only reflects local, computable configuration —
        it can&apos;t tell you whether Google has actually crawled or indexed any given page (see
        &quot;Live indexing status&quot; below for that).
      </p>

      <Tabs
        tabs={[
          {
            label: "Technical SEO",
            content: (
              <section>
                <h2 className="mb-3 text-lg font-medium">Technical SEO readiness</h2>
                <ul className="divide-foreground/10 divide-y">
                  {readiness.map((item) => (
                    <Check key={item.label} {...item} />
                  ))}
                </ul>
              </section>
            ),
          },
          {
            label: "Bilingual content",
            content: (
              <section>
                <h2 className="mb-3 text-lg font-medium">Bilingual content (IT / EN)</h2>
                <ul className="divide-foreground/10 divide-y">
                  {translationReadiness.map((item) => (
                    <Check key={item.label} {...item} />
                  ))}
                </ul>
              </section>
            ),
          },
          {
            label: "Sitemap",
            content: (
              <section>
                <h2 className="mb-3 text-lg font-medium">What&apos;s in your sitemap</h2>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="border-foreground/10 rounded border p-4">
                    <dt className="text-foreground/70 text-sm">Products</dt>
                    <dd className="text-xl font-semibold">{productCount}</dd>
                  </div>
                  <div className="border-foreground/10 rounded border p-4">
                    <dt className="text-foreground/70 text-sm">Categories</dt>
                    <dd className="text-xl font-semibold">{categoryCount}</dd>
                  </div>
                  <div className="border-foreground/10 rounded border p-4">
                    <dt className="text-foreground/70 text-sm">Legal pages</dt>
                    <dd className="text-xl font-semibold">{legalPageCount}</dd>
                  </div>
                  <div className="border-foreground/10 rounded border p-4">
                    <dt className="text-foreground/70 text-sm">Total URLs</dt>
                    <dd className="text-xl font-semibold">{sitemapUrlCount}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <Link href="/sitemap.xml" target="_blank" className="text-primary hover:underline">
                    View sitemap.xml
                  </Link>
                  <Link href="/robots.txt" target="_blank" className="text-primary hover:underline">
                    View robots.txt
                  </Link>
                </div>
              </section>
            ),
          },
          {
            label: "Live indexing",
            content: (
              <section>
                <h2 className="mb-3 text-lg font-medium">Live indexing status</h2>
                <p className="text-foreground/70 mb-3 text-sm">
                  Whether pages are actually indexed, how they rank, and real search
                  impressions/clicks can only come from Google itself — this app has no credentials
                  wired up to Google&apos;s Search Console API, so it can&apos;t show that data
                  inline. Once{" "}
                  {base ? <span className="font-medium">{base}</span> : "your production URL"} is
                  verified in Search Console (using the verification code above), check indexing
                  there directly:
                </p>
                <ul className="flex flex-col gap-2 text-sm">
                  <li>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Search Console
                    </a>
                    <span className="text-foreground/70">
                      {" "}
                      — Coverage / Pages report shows indexed vs. excluded URLs; Performance shows
                      real clicks/impressions.
                    </span>
                  </li>
                  <li>
                    <a
                      href="https://search.google.com/test/rich-results"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rich Results Test
                    </a>
                    <span className="text-foreground/70">
                      {" "}
                      — paste a product URL to validate the Product/BreadcrumbList structured data.
                    </span>
                  </li>
                  <li>
                    <a
                      href="https://pagespeed.web.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      PageSpeed Insights
                    </a>
                    <span className="text-foreground/70"> — Core Web Vitals, a Google ranking factor.</span>
                  </li>
                </ul>
              </section>
            ),
          },
        ]}
      />
    </div>
  );
}
