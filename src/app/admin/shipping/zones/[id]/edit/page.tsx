import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ShippingZoneForm } from "../../zone-form";
import { updateShippingZone } from "../../actions";

export default async function EditShippingZonePage({
  params,
}: PageProps<"/admin/shipping/zones/[id]/edit">) {
  const { id } = await params;
  const [zone, methods] = await Promise.all([
    db.shippingZone.findUnique({ where: { id }, include: { countries: true, methods: true } }),
    db.shippingMethod.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!zone) notFound();

  const boundUpdate = updateShippingZone.bind(null, zone.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit shipping zone</h1>
      <ShippingZoneForm
        action={boundUpdate}
        methods={methods}
        submitLabel="Save changes"
        initial={{
          name: zone.name,
          countries: zone.countries.map((c) => c.country).join(", "),
          methodIds: zone.methods.map((m) => m.methodId),
        }}
      />
    </div>
  );
}
