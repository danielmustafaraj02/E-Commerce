import { Link } from "@/components/localized-link";
import { db } from "@/lib/db";
import { deleteTaxRule } from "./actions";

export default async function AdminTaxRulesPage() {
  const rules = await db.taxRule.findMany({
    orderBy: [{ country: "asc" }, { name: "asc" }],
    include: { category: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tax rules</h1>
        <Link href="/admin/tax-rules/new" className="btn-primary text-sm">
          New tax rule
        </Link>
      </div>

      <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-foreground/10 text-foreground/60 border-b">
                <th className="py-3 pr-4 pl-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Country</th>
                <th className="py-3 pr-4 font-medium">Region</th>
                <th className="py-3 pr-4 font-medium">Rate</th>
                <th className="py-3 pr-4 font-medium">Category</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const boundDelete = deleteTaxRule.bind(null, rule.id);
                return (
                  <tr
                    key={rule.id}
                    className="border-foreground/5 hover:bg-foreground/[0.02] border-b transition-colors last:border-b-0"
                  >
                    <td className="py-3 pr-4 pl-4 font-medium">{rule.name}</td>
                    <td className="py-3 pr-4">{rule.country}</td>
                    <td className="text-foreground/70 py-3 pr-4">{rule.region ?? "—"}</td>
                    <td className="py-3 pr-4">{rule.ratePercent}%</td>
                    <td className="text-foreground/70 py-3 pr-4">
                      {rule.category?.name ?? "All categories"}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/tax-rules/${rule.id}/edit`}
                          className="text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <form action={boundDelete}>
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
        {rules.length === 0 && (
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">
            No tax rules yet — checkout will charge no tax until at least one rule covers the
            customer&apos;s country.
          </p>
        )}
      </div>
    </div>
  );
}
