"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

// Admin-only, permanent. Detaches (rather than cascade-deletes) rows that
// carry history that should survive account deletion — Order (financial
// records; Order.addressId also still points at this user's Address rows,
// so those are detached rather than deleted to avoid an FK conflict),
// ReturnRequest, AuditLog, ConsentLog. Account/Session/Review/WishlistItem
// have no such conflict and cascade-delete with the user normally.
export async function deleteCustomer(userId: string) {
  const session = await requireAdmin();

  const customer = await db.user.findUnique({ where: { id: userId } });
  if (!customer) redirect("/admin/customers");

  if (customer.role !== "customer") {
    redirect("/admin/customers?error=not-a-customer");
  }

  await db.$transaction([
    db.address.updateMany({ where: { userId }, data: { userId: null } }),
    db.order.updateMany({
      where: { userId },
      data: { userId: null, guestEmail: customer.email },
    }),
    db.returnRequest.updateMany({ where: { userId }, data: { userId: null } }),
    db.auditLog.updateMany({ where: { userId }, data: { userId: null } }),
    db.consentLog.updateMany({ where: { userId }, data: { userId: null } }),
    db.user.delete({ where: { id: userId } }),
  ]);

  await writeAuditLog({
    userId: session!.user.id,
    action: "customer.delete",
    entityType: "User",
    entityId: userId,
    before: { email: customer.email },
  });

  redirect("/admin/customers");
}
