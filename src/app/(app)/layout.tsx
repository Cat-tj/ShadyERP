import { requireSessionWithTenant } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { AppShell } from "@/components/app-shell";
import { SimpleShell } from "@/components/simple-shell";
import { getRequestVertical } from "@/lib/request-vertical";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenant } = await requireSessionWithTenant();
  const setting = await getTenantSetting(user.tenantId);
  const vertical = await getRequestVertical();
  const accountingMode = setting?.accountingMode ?? "SIMPLE";

  if (accountingMode === "SIMPLE") {
    return (
      <SimpleShell
        userName={user.name}
        role={user.role}
        tenantName={tenant?.name ?? "Toko Saya"}
        disabledModules={tenant?.disabledModules ?? []}
        vertical={vertical}
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
