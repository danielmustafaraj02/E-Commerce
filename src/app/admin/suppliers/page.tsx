import Link from "next/link";
import { db } from "@/lib/db";
import { toggleSupplier } from "./actions";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminSuppliersPage() {
  const suppliers = await db.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Link href="/admin/suppliers/new" className="btn-primary text-sm">
          New supplier
        </Link>
      </div>

      <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-foreground/10 text-foreground/60 border-b">
                <th className="py-3 pr-4 pl-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Products</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => {
                const boundToggle = toggleSupplier.bind(null, supplier.id);
                return (
                  <tr
                    key={supplier.id}
                    className="border-foreground/5 hover:bg-foreground/[0.02] border-b transition-colors last:border-b-0"
                  >
                    <td className="py-3 pr-4 pl-4 font-medium">{supplier.name}</td>
                    <td className="text-foreground/70 py-3 pr-4">{supplier.email ?? "—"}</td>
                    <td className="py-3 pr-4">{supplier._count.products}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={supplier.active ? "active" : "inactive"} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/suppliers/${supplier.id}/edit`}
                          className="text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <form action={boundToggle}>
                          <button type="submit" className="text-primary hover:underline">
                            {supplier.active ? "Disable" : "Enable"}
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
        {suppliers.length === 0 && (
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">No suppliers yet.</p>
        )}
      </div>
    </div>
  );
}
