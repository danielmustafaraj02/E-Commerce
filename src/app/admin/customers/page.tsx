import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "customer" },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { orders: true, wishlistItems: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Customers</h1>

      <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-foreground/10 text-foreground/60 border-b">
                <th className="py-3 pr-4 pl-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Orders</th>
                <th className="py-3 pr-4 font-medium">Wishlist</th>
                <th className="py-3 pr-4 font-medium">Email verified</th>
                <th className="py-3 pr-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-foreground/5 hover:bg-foreground/[0.02] border-b transition-colors last:border-b-0"
                >
                  <td className="py-3 pr-4 pl-4 font-medium">{customer.name ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-primary hover:underline"
                    >
                      {customer.email}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{customer._count.orders}</td>
                  <td className="py-3 pr-4">{customer._count.wishlistItems}</td>
                  <td className="py-3 pr-4">
                    {customer.emailVerified ? (
                      <span className="text-success">Verified</span>
                    ) : (
                      <span className="text-foreground/50">Unverified</span>
                    )}
                  </td>
                  <td className="text-foreground/70 py-3 pr-4">
                    {customer.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">No customers yet.</p>
        )}
      </div>
    </div>
  );
}
