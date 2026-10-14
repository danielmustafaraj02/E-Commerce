import { notFound } from "next/navigation";
import { loadPageMeta } from "@/lib/page-meta-admin";
import { MetaEditor } from "../../../seo/meta-editor";
import { db } from "@/lib/db";
import { LookForm } from "../../look-form";
import { updateLook } from "../../actions";
import { lookProductOptions } from "../../product-options";

export default async function EditLookPage({ params }: PageProps<"/admin/looks/[id]/edit">) {
  const { id } = await params;
  const [look, products] = await Promise.all([
    db.look.findUnique({
      where: { id },
      include: { products: { orderBy: { createdAt: "asc" }, select: { id: true } } },
    }),
    lookProductOptions(id),
  ]);
  if (!look) notFound();

  const metaKey = `look:${look.id}`;
  const meta = await loadPageMeta([metaKey]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit look</h1>
      <LookForm
        action={updateLook.bind(null, look.id)}
        products={products}
        submitLabel="Save changes"
        initial={{
          name: look.name,
          imageUrl: look.imageUrl,
          discountPercent: look.discountPercent,
          active: look.active,
          productIds: look.products.map((p) => p.id),
        }}
      />
      <section className="border-foreground/10 mt-8 flex flex-col gap-3 border-t pt-6">
        <h2 className="text-lg font-semibold">Search appearance</h2>
        <p className="text-foreground/60 text-sm">
          The title and description Google and social networks show for this page, per language.
        </p>
        <MetaEditor metaKey={metaKey} initial={meta[metaKey] ?? {}} />
      </section>
    </div>
  );
}
