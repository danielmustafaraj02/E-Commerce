import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const page = await db.legalPage.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">{page.title}</h1>
      <p className="text-foreground/80 whitespace-pre-line">{page.content}</p>
      <p className="text-foreground/50 mt-8 text-xs">
        Last updated {page.lastUpdated.toLocaleDateString()}
      </p>
    </main>
  );
}
