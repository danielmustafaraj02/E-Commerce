import { repairLegalContent } from "@/lib/legal-content";
import { withPageMeta } from "@/lib/page-meta";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { truncateAtWord } from "@/lib/text";
import { getLocale } from "@/lib/i18n/locale";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";

// Rendered on a page's first visit, then cached and served to everyone (with
// the layout's `revalidate`, and refreshed by admin edits) rather than built
// for every piece and language at deploy time.
export function generateStaticParams() {
  return [];
}

async function baseMetadata({ params }: PageProps<"/[locale]/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await db.legalPage.findUnique({
    where: { slug },
    select: { title: true, content: true },
  });
  // Here, not only in the page: metadata resolves before the body streams,
  // so this is what makes a missing item a real 404 (not a 200 carrying the
  // not-found page), including the copy kept in the cache.
  if (!page) notFound();
  const canonical = `/legal/${slug}`;
  const locale = await getLocale();
  return {
    title: page.title,
    description: describe(page.content),
    alternates: {
      canonical: localizedCanonical(locale, canonical),
      languages: hreflangAlternates(canonical),
    },
  };
}

export async function generateMetadata(
  props: Parameters<typeof baseMetadata>[0]
): Promise<Metadata> {
  return withPageMeta(`legal:${(await props.params).slug}`, await baseMetadata(props));
}

// Meta description from the page's own opening text. Skips a short leading
// heading line ("1. About these terms") so the snippet starts with real text.
function describe(content: string) {
  const lines = content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const body = lines.length > 1 && lines[0].length < 60 ? lines.slice(1) : lines;
  return truncateAtWord(body.join(" ").replace(/\s+/g, " ").trim(), 155) || undefined;
}

export default async function LegalPage({ params }: PageProps<"/[locale]/legal/[slug]">) {
  const { slug } = await params;
  const page = await db.legalPage.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <ShelfMain>
      <ShelfHead title={page.title} />
      <ShelfBody>
        <p className="shop-legal">{repairLegalContent(slug, page.content)}</p>
        <p className="text-foreground/60 mt-8 text-xs">
          Last updated {page.lastUpdated.toLocaleDateString()}
        </p>
      </ShelfBody>
    </ShelfMain>
  );
}
