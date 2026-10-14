import { Link } from "@/components/localized-link";
import { db } from "@/lib/db";
import { deleteShippingZone } from "./actions";

export default async function AdminShippingZonesPage() {
  const zones = await db.shippingZone.findMany({
    orderBy: { name: "asc" },
    include: { countries: true, methods: { include: { method: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shipping zones</h1>
        <Link href="/admin/shipping/zones/new" className="btn-primary text-sm">
          New zone
        </Link>
      </div>

      <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-foreground/10 text-foreground/60 border-b">
                <th className="py-3 pr-4 pl-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Countries</th>
                <th className="py-3 pr-4 font-medium">Methods</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => {
                const boundDelete = deleteShippingZone.bind(null, zone.id);
                return (
                  <tr
                    key={zone.id}
                    className="border-foreground/5 hover:bg-foreground/[0.02] border-b transition-colors last:border-b-0"
                  >
                    <td className="py-3 pr-4 pl-4 font-medium">{zone.name}</td>
                    <td className="text-foreground/70 py-3 pr-4">
                      {zone.countries.map((c) => c.country).join(", ") || "—"}
                    </td>
                    <td className="text-foreground/70 py-3 pr-4">
                      {zone.methods.map((m) => m.method.name).join(", ") || "—"}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/shipping/zones/${zone.id}/edit`}
                          className="text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <form action={boundDelete}>
                          <button type="submit" className="text-danger hover:underline">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {zones.length === 0 && (
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">
            No shipping zones yet — checkout can&apos;t calculate shipping until at least one zone
            covers the customer&apos;s country.
          </p>
        )}
      </div>
    </div>
  );
}
