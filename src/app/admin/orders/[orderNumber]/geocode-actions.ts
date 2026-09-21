"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { geocodeAndStoreAddress } from "@/lib/geocode-address";

// "Find on map" on an order: looks the delivery address up again (the automatic
// lookup after checkout can miss when OpenStreetMap is busy) and comes back to the
// order. `?map=unavailable` tells the page the geocoder didn't answer, so it can
// say so instead of looking like nothing happened.
export async function findOrderOnMap(orderNumber: string) {
  await requireStaff();

  const order = await db.order.findUnique({
    where: { orderNumber },
    select: { addressId: true },
  });
  const outcome = order?.addressId ? await geocodeAndStoreAddress(order.addressId) : "missing";

  const back = `/admin/orders/${encodeURIComponent(orderNumber)}`;
  redirect(outcome === "unavailable" ? `${back}?map=unavailable` : back);
}
