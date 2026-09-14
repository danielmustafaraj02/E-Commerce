import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SupplierForm } from "../../supplier-form";
import { updateSupplier } from "../../actions";

export default async function EditSupplierPage({
  params,
}: PageProps<"/admin/suppliers/[id]/edit">) {
  const { id } = await params;
  const supplier = await db.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  const boundUpdate = updateSupplier.bind(null, supplier.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit supplier</h1>
      <SupplierForm
        action={boundUpdate}
        submitLabel="Save changes"
        initial={{
          name: supplier.name,
          email: supplier.email ?? "",
          website: supplier.website ?? "",
          notes: supplier.notes ?? "",
        }}
      />
    </div>
  );
}
