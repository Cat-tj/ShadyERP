import { requireSuperAdmin } from "@/server/require-super-admin";
import { listSuperAdminAuditLogs } from "@/server/services/super-admin-service";
import { AuditLogsManager } from "@/components/superadmin/audit-logs-manager";

export default async function SuperAdminAuditLogsPage() {
  await requireSuperAdmin();
  const rawLogs = await listSuperAdminAuditLogs(100);

  const logs = rawLogs.map((log) => ({
    id: log.id,
    actorEmail: log.actor.email,
    actorName: log.actor.name,
    action: log.action,
    targetTenantId: log.targetTenantId,
    description: log.description,
    beforeJson: log.beforeJson,
    afterJson: log.afterJson,
    createdAt: log.createdAt.toISOString(),
  }));

  return <AuditLogsManager logs={logs} />;
}
