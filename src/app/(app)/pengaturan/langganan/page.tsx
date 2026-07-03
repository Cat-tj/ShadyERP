import { requireRole } from "@/server/require-session";
import {
  getUsageForTenant,
  getPendingRequestForTenant,
  listSubscriptionHistory,
} from "@/server/services/billing-service";
import { LanggananManager } from "@/components/pengaturan/langganan-manager";

export default async function LanggananPage() {
  const user = await requireRole(["OWNER"]);

  const [usage, pendingRequest, history] = await Promise.all([
    getUsageForTenant(user.tenantId),
    getPendingRequestForTenant(user.tenantId),
    listSubscriptionHistory(user.tenantId),
  ]);

  return (
    <LanggananManager
      usage={usage}
      pendingRequest={
        pendingRequest
          ? { id: pendingRequest.id, requestedPlan: pendingRequest.requestedPlan, createdAt: pendingRequest.createdAt.toISOString() }
          : null
      }
      history={history.map((h) => ({
        id: h.id,
        requestedPlan: h.requestedPlan,
        status: h.status,
        createdAt: h.createdAt.toISOString(),
        reviewNote: h.reviewNote,
      }))}
    />
  );
}
