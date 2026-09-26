import { Link } from "@/components/localized-link";
import { db } from "@/lib/db";

const REQUIRED_SLUGS = [
  { slug: "terms", title: "Terms & Conditions" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "returns", title: "Return & Refund Policy" },
  { slug: "cookies", title: "Cookie Policy" },
];

export default async function AdminLegalPagesPage() {
  const pages = await db.legalPage.findMany();
  const bySlug = new Map(pages.map((page) => [page.slug, page]));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Legal pages</h1>
      <p className="text-foreground/70 mb-6 max-w-xl text-sm">
        Edit the content customers see at <code>/legal/&lt;slug&gt;</code> and linked from checkout
        and the footer. These are starting templates, not legal advice — have a lawyer review before
        relying on them.
      </p>

      <ul className="divide-foreground/10 flex flex-col divide-y text-sm">
        {REQUIRED_SLUGS.map(({ slug, title }) => {
          const page = bySlug.get(slug);
          return (
            <li key={slug} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{page?.title ?? title}</p>
                <p className="text-foreground/60">
                  {page
                    ? `Last updated ${page.lastUpdated.toLocaleDateString()}`
                    : "Not created yet"}
                </p>
              </div>
              <Link
                href={`/admin/legal-pages/${slug}/edit`}
                className="text-primary hover:underline"
              >
                Edit
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
