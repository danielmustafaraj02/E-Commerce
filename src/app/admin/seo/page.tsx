import { Link } from "@/components/localized-link";
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
    productsMissingFrName,
    productsMissingFrDescription,
    productsMissingDeName,
    productsMissingDeDescription,
    productsMissingArName,
    productsMissingArDescription,
    productsMissingZhName,
    productsMissingZhDescription,
    productsMissingRuName,
    productsMissingRuDescription,
    productsMissingEsName,
    productsMissingEsDescription,
    productsMissingPtName,
    productsMissingPtDescription,
    productsMissingHiName,
    productsMissingHiDescription,
    productsMissingJaName,
    productsMissingJaDescription,
    categoryCount,
    categoriesMissingEnName,
    categoriesMissingFrName,
    categoriesMissingDeName,
    categoriesMissingArName,
    categoriesMissingZhName,
    categoriesMissingRuName,
    categoriesMissingEsName,
    categoriesMissingPtName,
    categoriesMissingHiName,
    categoriesMissingJaName,
    productsWithReviews,
    legalPageCount,
  ] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.product.count({ where: { active: true, OR: [{ nameEn: null }, { nameEn: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionEn: null }, { descriptionEn: "" }] },
    }),
    db.product.count({ where: { active: true, OR: [{ nameFr: null }, { nameFr: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionFr: null }, { descriptionFr: "" }] },
    }),
    db.product.count({ where: { active: true, OR: [{ nameDe: null }, { nameDe: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionDe: null }, { descriptionDe: "" }] },
    }),
    db.product.count({ where: { active: true, OR: [{ nameAr: null }, { nameAr: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionAr: null }, { descriptionAr: "" }] },
    }),
    db.product.count({ where: { active: true, OR: [{ nameZh: null }, { nameZh: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionZh: null }, { descriptionZh: "" }] },
    }),
    db.product.count({ where: { active: true, OR: [{ nameRu: null }, { nameRu: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionRu: null }, { descriptionRu: "" }] },
    }),
    db.product.count({ where: { active: true, OR: [{ nameEs: null }, { nameEs: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionEs: null }, { descriptionEs: "" }] },
    }),
    db.product.count({ where: { active: true, OR: [{ namePt: null }, { namePt: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionPt: null }, { descriptionPt: "" }] },
    }),
    db.product.count({ where: { active: true, OR: [{ nameHi: null }, { nameHi: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionHi: null }, { descriptionHi: "" }] },
    }),
    db.product.count({ where: { active: true, OR: [{ nameJa: null }, { nameJa: "" }] } }),
    db.product.count({
      where: { active: true, OR: [{ descriptionJa: null }, { descriptionJa: "" }] },
    }),
    db.category.count(),
    db.category.count({ where: { OR: [{ nameEn: null }, { nameEn: "" }] } }),
    db.category.count({ where: { OR: [{ nameFr: null }, { nameFr: "" }] } }),
    db.category.count({ where: { OR: [{ nameDe: null }, { nameDe: "" }] } }),
    db.category.count({ where: { OR: [{ nameAr: null }, { nameAr: "" }] } }),
    db.category.count({ where: { OR: [{ nameZh: null }, { nameZh: "" }] } }),
    db.category.count({ where: { OR: [{ nameRu: null }, { nameRu: "" }] } }),
    db.category.count({ where: { OR: [{ nameEs: null }, { nameEs: "" }] } }),
    db.category.count({ where: { OR: [{ namePt: null }, { namePt: "" }] } }),
    db.category.count({ where: { OR: [{ nameHi: null }, { nameHi: "" }] } }),
    db.category.count({ where: { OR: [{ nameJa: null }, { nameJa: "" }] } }),
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
      ok: productsMissingFrName === 0,
      label: "Product names translated to French",
      detail: `${productCount - productsMissingFrName} / ${productCount} products have a French name.`,
    },
    {
      ok: productsMissingFrDescription === 0,
      label: "Product stories translated to French",
      detail: `${productCount - productsMissingFrDescription} / ${productCount} products have a French description.`,
    },
    {
      ok: productsMissingDeName === 0,
      label: "Product names translated to German",
      detail: `${productCount - productsMissingDeName} / ${productCount} products have a German name.`,
    },
    {
      ok: productsMissingDeDescription === 0,
      label: "Product stories translated to German",
      detail: `${productCount - productsMissingDeDescription} / ${productCount} products have a German description.`,
    },
    {
      ok: productsMissingArName === 0,
      label: "Product names translated to Arabic",
      detail: `${productCount - productsMissingArName} / ${productCount} products have an Arabic name.`,
    },
    {
      ok: productsMissingArDescription === 0,
      label: "Product stories translated to Arabic",
      detail: `${productCount - productsMissingArDescription} / ${productCount} products have an Arabic description.`,
    },
    {
      ok: productsMissingZhName === 0,
      label: "Product names translated to Chinese",
      detail: `${productCount - productsMissingZhName} / ${productCount} products have a Chinese name.`,
    },
    {
      ok: productsMissingZhDescription === 0,
      label: "Product stories translated to Chinese",
      detail: `${productCount - productsMissingZhDescription} / ${productCount} products have a Chinese description.`,
    },
    {
      ok: productsMissingRuName === 0,
      label: "Product names translated to Russian",
      detail: `${productCount - productsMissingRuName} / ${productCount} products have a Russian name.`,
    },
    {
      ok: productsMissingRuDescription === 0,
      label: "Product stories translated to Russian",
      detail: `${productCount - productsMissingRuDescription} / ${productCount} products have a Russian description.`,
    },
    {
      ok: productsMissingEsName === 0,
      label: "Product names translated to Spanish",
      detail: `${productCount - productsMissingEsName} / ${productCount} products have a Spanish name.`,
    },
    {
      ok: productsMissingEsDescription === 0,
      label: "Product stories translated to Spanish",
      detail: `${productCount - productsMissingEsDescription} / ${productCount} products have a Spanish description.`,
    },
    {
      ok: productsMissingPtName === 0,
      label: "Product names translated to Portuguese",
      detail: `${productCount - productsMissingPtName} / ${productCount} products have a Portuguese name.`,
    },
    {
      ok: productsMissingPtDescription === 0,
      label: "Product stories translated to Portuguese",
      detail: `${productCount - productsMissingPtDescription} / ${productCount} products have a Portuguese description.`,
    },
    {
      ok: productsMissingHiName === 0,
      label: "Product names translated to Hindi",
      detail: `${productCount - productsMissingHiName} / ${productCount} products have a Hindi name.`,
    },
    {
      ok: productsMissingHiDescription === 0,
      label: "Product stories translated to Hindi",
      detail: `${productCount - productsMissingHiDescription} / ${productCount} products have a Hindi description.`,
    },
    {
      ok: productsMissingJaName === 0,
      label: "Product names translated to Japanese",
      detail: `${productCount - productsMissingJaName} / ${productCount} products have a Japanese name.`,
    },
    {
      ok: productsMissingJaDescription === 0,
      label: "Product stories translated to Japanese",
      detail: `${productCount - productsMissingJaDescription} / ${productCount} products have a Japanese description.`,
    },
    {
      ok: categoriesMissingEnName === 0,
      label: "Category names translated to English",
      detail: `${categoryCount - categoriesMissingEnName} / ${categoryCount} categories have an English name.`,
    },
    {
      ok: categoriesMissingFrName === 0,
      label: "Category names translated to French",
      detail: `${categoryCount - categoriesMissingFrName} / ${categoryCount} categories have a French name.`,
    },
    {
      ok: categoriesMissingDeName === 0,
      label: "Category names translated to German",
      detail: `${categoryCount - categoriesMissingDeName} / ${categoryCount} categories have a German name.`,
    },
    {
      ok: categoriesMissingArName === 0,
      label: "Category names translated to Arabic",
      detail: `${categoryCount - categoriesMissingArName} / ${categoryCount} categories have an Arabic name.`,
    },
    {
      ok: categoriesMissingZhName === 0,
      label: "Category names translated to Chinese",
      detail: `${categoryCount - categoriesMissingZhName} / ${categoryCount} categories have a Chinese name.`,
    },
    {
      ok: categoriesMissingRuName === 0,
      label: "Category names translated to Russian",
      detail: `${categoryCount - categoriesMissingRuName} / ${categoryCount} categories have a Russian name.`,
    },
    {
      ok: categoriesMissingEsName === 0,
      label: "Category names translated to Spanish",
      detail: `${categoryCount - categoriesMissingEsName} / ${categoryCount} categories have a Spanish name.`,
    },
    {
      ok: categoriesMissingPtName === 0,
      label: "Category names translated to Portuguese",
      detail: `${categoryCount - categoriesMissingPtName} / ${categoryCount} categories have a Portuguese name.`,
    },
    {
      ok: categoriesMissingHiName === 0,
      label: "Category names translated to Hindi",
      detail: `${categoryCount - categoriesMissingHiName} / ${categoryCount} categories have a Hindi name.`,
    },
    {
      ok: categoriesMissingJaName === 0,
      label: "Category names translated to Japanese",
      detail: `${categoryCount - categoriesMissingJaName} / ${categoryCount} categories have a Japanese name.`,
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
            label: "Translations",
            content: (
              <section>
                <h2 className="mb-3 text-lg font-medium">
                  Translations (IT / EN / FR / DE / AR / ZH / RU / ES / PT / HI / JA)
                </h2>
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
