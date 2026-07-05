import { requireRole, requireSessionWithTenant } from "@/server/require-session";
import { SettingsTabs } from "@/components/pengaturan/settings-tabs";

export default async function PengaturanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["OWNER"]);
  const { tenant } = await requireSessionWithTenant();
  const disabledModules = tenant?.disabledModules ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-2xl font-semibold text-[var(--color-text)]">Pengaturan</h1>
      <SettingsTabs disabledModules={disabledModules} />
      {children}
    </div>
  );
}
