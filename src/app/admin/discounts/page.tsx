import { db } from "@/lib/db";
import { DiscountForm } from "./discount-form";
import { toggleDiscountCode } from "./actions";
import { StatusBadge } from "@/components/status-badge";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";

export default async function AdminDiscountsPage() {
  const [discounts, settings] = await Promise.all([
    db.discountCode.findMany({ orderBy: { createdAt: "desc" } }),
    getStoreSettings(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Discount codes</h1>

      <div className="form-card mb-8">
        <DiscountForm />
      </div>

      <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-foreground/10 text-foreground/60 border-b">
                <th className="py-3 pr-4 pl-4 font-medium">Code</th>
                <th className="py-3 pr-4 font-medium">Discount</th>
                <th className="py-3 pr-4 font-medium">Uses</th>
                <th className="py-3 pr-4 font-medium">Expires</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => {
                const boundToggle = toggleDiscountCode.bind(null, discount.id);
                return (
                  <tr
                    key={discount.id}
                    className="border-foreground/5 hover:bg-foreground/[0.02] border-b transition-colors last:border-b-0"
                  >
                    <td className="py-3 pr-4 pl-4 font-medium">{discount.code}</td>
                    <td className="py-3 pr-4">
                      {discount.percentOff
                        ? `${discount.percentOff}%`
                        : formatMoney(discount.amountOff ?? 0, settings.defaultCurrency, settings.defaultLocale)}
                    </td>
                    <td className="py-3 pr-4">
                      {discount.usedCount}
                      {discount.maxUses ? ` / ${discount.maxUses}` : ""}
                    </td>
                    <td className="text-foreground/70 py-3 pr-4">
                      {discount.expiresAt ? discount.expiresAt.toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={discount.active ? "active" : "inactive"} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <form action={boundToggle}>
                        <button type="submit" className="text-primary hover:underline">
                          {discount.active ? "Disable" : "Enable"}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {discounts.length === 0 && (
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">
            No discount codes yet.
          </p>
        )}
      </div>
    </div>
  );
}
