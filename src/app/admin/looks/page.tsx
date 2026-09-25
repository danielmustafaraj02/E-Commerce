import { Link } from "@/components/localized-link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { LOOK_SIZE, lookPricing } from "@/lib/looks";
import { deleteLook } from "./actions";

export default async function AdminLooksPage() {
  const looks = await db.look.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      products: { select: { name: true, price: true, currency: true, active: true } },
    },
  });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Looks</h1>
        <Link href="/admin/looks/new" className="btn-primary text-sm">
          New look
        </Link>
      </div>
      <p className="text-foreground/70 mb-6 max-w-2xl text-sm">
        A look is a matching necklace, bracelet and pair of earrings. Each piece&apos;s product page
        shows &quot;Complete the look&quot;, and buying all three takes the set discount off at
        checkout.
      </p>

      {looks.length === 0 ? (
        <p className="text-foreground/60 text-sm">No looks yet.</p>
      ) : (
        <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-foreground/10 text-foreground/60 border-b">
                  <th className="py-3 pr-4 pl-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Pieces</th>
                  <th className="py-3 pr-4 font-medium">Set price</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {looks.map((look) => {
                  const live = look.products.filter((p) => p.active);
                  const complete = look.active && live.length === LOOK_SIZE;
                  const pricing = lookPricing(
                    live.map((p) => p.price),
                    look.discountPercent
                  );
                  const currency = look.products[0]?.currency ?? "EUR";
                  return (
                    <tr
                      key={look.id}
                      className="border-foreground/5 border-b align-top last:border-b-0"
                    >
                      <td className="py-3 pr-4 pl-4 font-medium">{look.name}</td>
                      <td className="text-foreground/70 py-3 pr-4">
                        {look.products.map((p) => p.name).join(" · ")}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {formatMoney(pricing.setTotal, currency, "it")}{" "}
                        <span className="text-foreground/60">(-{look.discountPercent}%)</span>
                      </td>
                      <td className="py-3 pr-4">
                        {complete ? "Live" : !look.active ? "Off" : "Hidden: needs 3 active pieces"}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/admin/looks/${look.id}/edit`}
                            className="text-primary hover:underline"
                          >
                            Edit
                          </Link>
                          <form action={deleteLook.bind(null, look.id)}>
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
        </div>
      )}
    </div>
  );
}
