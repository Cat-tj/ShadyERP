import { requireRole, requireSessionWithTenant } from "@/server/require-session";
import { SettingsTabs } from "@/components/pengaturan/settings-tabs";
import { SettingsBackButton } from "./settings-back-button";
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
    <div className="mx-auto max-w-3xl flex flex-col gap-4 pb-[var(--bottom-nav-height)]">
      <div>
        <EyebrowBadge>Admin</EyebrowBadge>
        <div className="flex items-center justify-between gap-3 mb-4 mt-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
            Pengaturan
          </h1>
          <SettingsBackButton />
        </div>
      </div>
      <SettingsTabs disabledModules={disabledModules} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
