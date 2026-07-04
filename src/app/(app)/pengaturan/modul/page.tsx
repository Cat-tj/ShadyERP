import { requireRole } from "@/server/require-session";
import { getEnabledModules } from "@/server/services/tenant-service";
import { ModulManager } from "@/components/pengaturan/modul-manager";
import { TOGGLEABLE_MODULES } from "@/lib/modules";

export default async function ModulSettingsPage() {
  const user = await requireRole(["OWNER"]);
  const enabled = await getEnabledModules(user.tenantId);

  return (
    <ModulManager
      modules={TOGGLEABLE_MODULES}
      enabledKeys={TOGGLEABLE_MODULES.filter((m) => enabled.has(m.key)).map((m) => m.key)}
    />
  );
}
