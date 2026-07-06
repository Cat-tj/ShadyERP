import { requireSessionWithTenant } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { AppShell } from "@/components/app-shell";
import { SimpleShell } from "@/components/simple-shell";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getSimpleAlerts } from "@/server/services/simple-dashboard-service";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenant } = await requireSessionWithTenant();
  const setting = await getTenantSetting(user.tenantId);
  const accountingMode = setting?.accountingMode ?? "SIMPLE";

  if (accountingMode === "SIMPLE") {
    const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
    const outletIds = outlets.map((o) => o.id);
    const alerts = await getSimpleAlerts(user.tenantId, outletIds);
    const alertCount = alerts.length;

    return (
      <SimpleShell
        userName={user.name}
        role={user.role}
        tenantName={tenant?.name ?? "Toko Saya"}
        alertCount={alertCount}
      >
        {children}
      </SimpleShell>
    );
  }

  return (
    <AppShell
      userName={user.name}
      role={user.role}
      tenantName={tenant?.name ?? "Toko Saya"}
      disabledModules={tenant?.disabledModules ?? []}
      accountingMode={accountingMode}
    >
      {children}
    </AppShell>
  );
}
