import { requireSessionWithTenant } from "@/server/require-session";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenant } = await requireSessionWithTenant();

  return (
    <AppShell
      userName={user.name}
      role={user.role}
      tenantName={tenant?.name ?? "Toko Saya"}
      disabledModules={tenant?.disabledModules ?? []}
    >
      {children}
    </AppShell>
  );
}
