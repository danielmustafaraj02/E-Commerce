import type { Session } from "next-auth";

// Guest orders have no owning account, so the orderNumber itself acts as a
// bearer token (same model most storefronts use for guest order lookup).
// Account-linked orders require the owning account, or staff.
export function canAccessOrder(order: { userId: string | null }, session: Session | null) {
  if (!order.userId) return true;
  if (session?.user?.id === order.userId) return true;
  return session?.user?.role === "admin" || session?.user?.role === "staff";
}
