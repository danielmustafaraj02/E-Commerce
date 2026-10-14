import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { InviteForm, RoleForm } from "./role-form";

export default async function AdminTeamPage() {
  await requireAdmin();

  const team = await db.user.findMany({
    where: { role: { in: ["admin", "staff"] } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold">Team</h1>
      <p className="text-foreground/70 mb-6 text-sm">
        Grant or remove admin/staff access. Staff can manage products, orders, shipping, and
        discounts, but not payments, integrations, or other people&apos;s access — only admins can.
      </p>

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-medium">Add a team member</h2>
        <p className="text-foreground/70 mb-3 text-sm">
          Creates their account and emails them a link to choose a password. Staff and admins must
          also set up two-factor sign-in at first login. Staff can add and edit articles, products
          and orders.
        </p>
        <InviteForm />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-medium">Change an existing account&apos;s access</h2>
        <RoleForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Current team</h2>
        <ul className="divide-foreground/10 flex flex-col divide-y text-sm">
          {team.map((member) => (
            <li key={member.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{member.name ?? member.email}</p>
                <p className="text-foreground/70">{member.email}</p>
              </div>
              <span className="border-foreground/20 rounded border px-3 py-1 text-xs tracking-wide uppercase">
                {member.role}
              </span>
            </li>
          ))}
          {team.length === 0 && (
            <p className="text-foreground/70 py-6">No staff or admin accounts yet.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
