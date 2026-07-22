import { requireSessionWithTenant } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { AppShell } from "@/components/app-shell";
import { SimpleShell } from "@/components/simple-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenant } = await requireSessionWithTenant();
  const setting = await getTenantSetting(user.tenantId);
  const accountingMode = setting?.accountingMode ?? "SIMPLE";

  if (accountingMode === "SIMPLE") {
    return (
      <SimpleShell
        userName={user.name}
        role={user.role}
        tenantName={tenant?.name ?? "Toko Saya"}
        disabledModules={tenant?.disabledModules ?? []}
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
