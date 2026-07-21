import { requireSessionWithTenant } from "@/server/require-session";
import { SettingsMobileIndex } from "@/features/settings/components/settings-mobile-index";
import { getVisibleSettingsNavigation } from "@/features/settings/settings-navigation";

export default async function PengaturanPage() {
  const { tenant } = await requireSessionWithTenant();
  const items = getVisibleSettingsNavigation(tenant?.disabledModules ?? []);

  return <SettingsMobileIndex items={items} />;
}
