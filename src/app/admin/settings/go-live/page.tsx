import { requireAdmin } from "@/lib/require-admin";
import { evaluateReadiness } from "@/lib/go-live";
import { gatherReadinessFacts } from "./facts";
import { GoLiveWizard } from "./go-live-wizard";

// Admin > Settings > Go live: everything a launch depends on, checked step by
// step. Read-only: it changes nothing, shows no secret, and deploys nothing.
export default async function GoLivePage() {
  await requireAdmin();
  const steps = evaluateReadiness(await gatherReadinessFacts());
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Go live</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-600">
        Everything the shop needs before it takes real orders, checked for you. Fix what is red,
        consider what is amber. This page only looks: it never changes a setting or publishes
        anything.
      </p>
      <GoLiveWizard steps={steps} checkedAt={new Date().toISOString()} />
    </div>
  );
}
