import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";

export default async function AdminNewsletterPage() {
  await requireStaff();

  const subscribers = await db.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { subscribedAt: "desc" },
    take: 500,
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Newsletter</h1>
      <p className="text-foreground/70 mb-6 text-sm">
        {subscribers.length} active subscriber{subscribers.length === 1 ? "" : "s"}. Export this
        list for your email tool of choice — there&apos;s no built-in campaign sender here, this is
        just the opt-in list itself.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-foreground/10 text-foreground/60 border-b">
              <th className="py-2 pr-4">Email</th>
              <th className="py-2">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-foreground/5 border-b">
                <td className="py-2 pr-4">{subscriber.email}</td>
                <td className="text-foreground/70 py-2">
                  {subscriber.subscribedAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <p className="text-foreground/70 py-6 text-sm">No subscribers yet.</p>
        )}
      </div>
    </div>
  );
}
