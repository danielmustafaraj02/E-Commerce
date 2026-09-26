import { Link } from "@/components/localized-link";
import { db } from "@/lib/db";
import { toggleShippingMethod } from "./actions";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminShippingMethodsPage() {
  const methods = await db.shippingMethod.findMany({ orderBy: { basePrice: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shipping methods</h1>
        <Link href="/admin/shipping/methods/new" className="btn-primary text-sm">
          New method
        </Link>
      </div>

      <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-foreground/10 text-foreground/60 border-b">
                <th className="py-3 pr-4 pl-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Base price</th>
                <th className="py-3 pr-4 font-medium">Per kg</th>
                <th className="py-3 pr-4 font-medium">Estimated</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => {
                const boundToggle = toggleShippingMethod.bind(null, method.id);
                return (
                  <tr
                    key={method.id}
                    className="border-foreground/5 hover:bg-foreground/[0.02] border-b transition-colors last:border-b-0"
                  >
                    <td className="py-3 pr-4 pl-4 font-medium">{method.name}</td>
                    <td className="py-3 pr-4">€{(method.basePrice / 100).toFixed(2)}</td>
                    <td className="py-3 pr-4">€{(method.pricePerKg / 100).toFixed(2)}</td>
                    <td className="text-foreground/70 py-3 pr-4">
                      {method.estimatedDaysMin}–{method.estimatedDaysMax} days
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={method.active ? "active" : "inactive"} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/shipping/methods/${method.id}/edit`}
                          className="text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <form action={boundToggle}>
                          <button type="submit" className="text-primary hover:underline">
                            {method.active ? "Disable" : "Enable"}
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
        {methods.length === 0 && (
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">
            No shipping methods yet.
          </p>
        )}
      </div>
    </div>
  );
}
