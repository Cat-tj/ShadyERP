import { redirect } from "next/navigation";
import { requireSessionWithTenant } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { hubsAvailableForRole } from "@/lib/nav";
import { resolveEnabledModules } from "@/lib/modules";
import { HubPicker } from "@/components/hub-picker";
import { normalizeBusinessMode } from "@/lib/business-modes";

export default async function PilihAplikasiPage() {
  const { user, tenant } = await requireSessionWithTenant();
  const setting = await getTenantSetting(user.tenantId);

  if ((setting?.accountingMode ?? "SIMPLE") === "SIMPLE") {
    if (user.role === "STAFF") {
      redirect("/kasir");
    } else {
      redirect("/simple/hari-ini");
    }
  }

  const enabledModules = resolveEnabledModules(tenant?.disabledModules ?? []);
  const availableHubKeys = Array.from(hubsAvailableForRole(user.role, enabledModules));

  return (
    <HubPicker
      hubKeys={availableHubKeys}
      userName={user.name}
      tenantName={tenant?.name ?? "Toko Saya"}
      businessMode={normalizeBusinessMode(tenant?.businessType)}
    />
  );
}
