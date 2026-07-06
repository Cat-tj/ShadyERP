import { requireSessionWithTenant } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenant } = await requireSessionWithTenant();
  const setting = await getTenantSetting(user.tenantId);

  return (
    <AppShell
      userName={user.name}
      role={user.role}
      tenantName={tenant?.name ?? "Toko Saya"}
      disabledModules={tenant?.disabledModules ?? []}
      accountingMode={setting?.accountingMode ?? "SIMPLE"}
    >
      {children}
    </AppShell>
  );
}
