import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await db.legalPage.findUnique({
    where: { slug },
    select: { title: true, content: true },
  });
  if (!page) return {};
  return {
    title: page.title,
    description: describe(page.content),
    alternates: { canonical: `/legal/${slug}` },
  };
}

// Meta description from the page's own opening text, cut at a word boundary
// (~155 characters is roughly what a search result shows).
function describe(content: string) {
  // Skip a short leading heading line ("1. About these terms") so the snippet
  // starts with the actual text.
  const lines = content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const body = lines.length > 1 && lines[0].length < 60 ? lines.slice(1) : lines;
  const text = body.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= 155) return text || undefined;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const page = await db.legalPage.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <ShelfMain>
      <ShelfHead title={page.title} />
      <ShelfBody>
        <p className="shop-legal">{page.content}</p>
        <p className="text-foreground/60 mt-8 text-xs">
          Last updated {page.lastUpdated.toLocaleDateString()}
        </p>
      </ShelfBody>
    </ShelfMain>
  );
}
