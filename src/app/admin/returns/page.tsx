import Link from "next/link";
import { db } from "@/lib/db";
import { ReturnStatusSelect } from "./status-select";

const STATUSES = ["requested", "approved", "rejected", "received", "refunded"];

export default async function AdminReturnsPage({ searchParams }: PageProps<"/admin/returns">) {
  const { status } = await searchParams;
  const statusFilter = typeof status === "string" && STATUSES.includes(status) ? status : undefined;

  const returnRequests = await db.returnRequest.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { order: true, user: true },
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Return requests</h1>

      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/returns"
          className={`rounded-full px-3 py-1 transition-colors ${
            !statusFilter
              ? "bg-primary text-white"
              : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/returns?status=${s}`}
            className={`rounded-full px-3 py-1 capitalize transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {returnRequests.length === 0 ? (
        <p className="text-foreground/70 text-sm">
          {statusFilter ? (
            <>
              No return requests with status &ldquo;{statusFilter}&rdquo;.{" "}
              <Link href="/admin/returns" className="text-primary hover:underline">
                Clear filter
              </Link>
            </>
          ) : (
            "No return requests yet."
          )}
        </p>
      ) : (
        <div className="overflow-x-auto">
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
                    <ReturnStatusSelect
                      returnRequestId={request.id}
                      currentStatus={request.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
