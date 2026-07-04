import { requireSessionWithTenant } from "@/server/require-session";
import { hubsAvailableForRole } from "@/lib/nav";
import { resolveEnabledModules } from "@/lib/modules";
import { HubPicker } from "@/components/hub-picker";

export default async function PilihAplikasiPage() {
  const { user, tenant } = await requireSessionWithTenant();

  const enabledModules = resolveEnabledModules(tenant?.disabledModules ?? []);
  const availableHubKeys = Array.from(hubsAvailableForRole(user.role, enabledModules));

  return <HubPicker hubKeys={availableHubKeys} userName={user.name} tenantName={tenant?.name ?? "Toko Saya"} />;
}
