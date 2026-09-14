import { db } from "@/lib/db";
import { ShippingZoneForm } from "../zone-form";
import { createShippingZone } from "../actions";

export default async function NewShippingZonePage() {
  const methods = await db.shippingMethod.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New shipping zone</h1>
      <ShippingZoneForm action={createShippingZone} methods={methods} submitLabel="Create zone" />
    </div>
  );
}
