import { requireRole, requireSessionWithTenant } from "@/server/require-session";
import { SettingsTabs } from "@/components/pengaturan/settings-tabs";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";

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
      <EyebrowBadge>Admin</EyebrowBadge>
      <h1 className="mb-4 mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
        Pengaturan
      </h1>
      <SettingsTabs disabledModules={disabledModules} />
      {children}
    </div>
  );
}
