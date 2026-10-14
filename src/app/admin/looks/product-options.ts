import { db } from "@/lib/db";
import type { LookProductOption } from "./look-form";

// Every product, grouped by category in the pickers, noting pieces that are
// already in a different look.
export async function lookProductOptions(currentLookId?: string): Promise<LookProductOption[]> {
  const products = await db.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: { select: { name: true } },
      look: { select: { id: true, name: true } },
    },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.name ?? "No category",
    otherLook: p.look && p.look.id !== currentLookId ? p.look.name : null,
  }));
}
