import { notFound } from "next/navigation";
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
    </div>
  );
}
