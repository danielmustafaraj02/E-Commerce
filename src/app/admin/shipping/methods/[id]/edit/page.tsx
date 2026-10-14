import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ShippingMethodForm } from "../../method-form";
import { updateShippingMethod } from "../../actions";

export default async function EditShippingMethodPage({
  params,
}: PageProps<"/admin/shipping/methods/[id]/edit">) {
  const { id } = await params;
  const method = await db.shippingMethod.findUnique({ where: { id } });
  if (!method) notFound();

  const boundUpdate = updateShippingMethod.bind(null, method.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit shipping method</h1>
      <ShippingMethodForm action={boundUpdate} submitLabel="Save changes" initial={method} />
    </div>
  );
}
