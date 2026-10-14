import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { CampaignForm } from "./campaign-form";

// A subscriber list large enough to need every batch (see actions.ts) could
// take longer than the platform's default function timeout to send.
export const maxDuration = 60;

type AuditCampaign = {
  subject: string;
  message: string;
  recipients: number;
  sent: number;
  failed: number;
};

export default async function AdminNewsletterPage() {
  const session = await requireStaff();
  const isAdmin = session?.user?.role === "admin";

  const [subscribers, campaignLogs] = await Promise.all([
    db.newsletterSubscriber.findMany({
      where: { unsubscribedAt: null },
      orderBy: { subscribedAt: "desc" },
      take: 500,
    }),
    db.auditLog.findMany({
      where: { action: "newsletter.send" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Newsletter</h1>
      <p className="text-foreground/70 mb-6 text-sm">
        {subscribers.length} active subscriber{subscribers.length === 1 ? "" : "s"}.
      </p>

      {isAdmin ? (
        <div className="mb-10">
          <h2 className="mb-3 text-lg font-medium">Send a campaign</h2>
          <CampaignForm subscriberCount={subscribers.length} />
        </div>
      ) : (
        <p className="text-foreground/70 mb-10 text-sm">
          Only admins can send a campaign to the list.
        </p>
      )}

      {campaignLogs.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-lg font-medium">Recent campaigns</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-foreground/10 text-foreground/60 border-b">
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Sent by</th>
                  <th className="py-2 pr-4">Results</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {campaignLogs.map((log) => {
                  const data: Partial<AuditCampaign> = log.afterData
                    ? JSON.parse(log.afterData)
                    : {};
                  return (
                    <tr key={log.id} className="border-foreground/5 border-b">
                      <td className="py-2 pr-4">{data.subject ?? "—"}</td>
                      <td className="text-foreground/70 py-2 pr-4">
                        {log.user?.name ?? log.user?.email ?? "—"}
                      </td>
                      <td className="text-foreground/70 py-2 pr-4">
                        {data.sent ?? 0} sent{data.failed ? `, ${data.failed} failed` : ""}
                      </td>
                      <td className="text-foreground/70 py-2">
                        {log.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-medium">Subscribers</h2>
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
