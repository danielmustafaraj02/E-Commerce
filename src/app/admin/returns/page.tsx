import Link from "next/link";
import { db } from "@/lib/db";
import { ReturnStatusSelect } from "./status-select";

export default async function AdminReturnsPage() {
  const returnRequests = await db.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true, user: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Return requests</h1>

      {returnRequests.length === 0 ? (
        <p className="text-foreground/70 text-sm">No return requests yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-foreground/10 text-foreground/60 border-b">
              <th className="py-2 pr-4">Order</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Reason</th>
              <th className="py-2 pr-4">Requested</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {returnRequests.map((request) => (
              <tr key={request.id} className="border-foreground/5 border-b align-top">
                <td className="py-2 pr-4">
                  <Link
                    href={`/admin/orders/${request.order.orderNumber}`}
                    className="text-primary hover:underline"
                  >
                    {request.order.orderNumber}
                  </Link>
                </td>
                <td className="text-foreground/70 py-2 pr-4">
                  {request.user?.email ?? request.order.guestEmail ?? "guest"}
                </td>
                <td className="text-foreground/70 max-w-xs py-2 pr-4">{request.reason}</td>
                <td className="text-foreground/70 py-2 pr-4">
                  {request.createdAt.toLocaleDateString()}
                </td>
                <td className="py-2">
                  <ReturnStatusSelect returnRequestId={request.id} currentStatus={request.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
