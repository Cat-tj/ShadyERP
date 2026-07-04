import { requireSession } from "@/server/require-session";
import { prisma } from "@/lib/prisma";
import { hubsAvailableForRole } from "@/lib/nav";
import { resolveEnabledModules } from "@/lib/modules";
import { HUBS } from "@/lib/hubs";
import { HubPicker } from "@/components/hub-picker";

export default async function PilihAplikasiPage() {
  const user = await requireSession();
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { name: true, disabledModules: true },
  });

  const enabledModules = resolveEnabledModules(tenant?.disabledModules ?? []);
  const availableHubKeys = hubsAvailableForRole(user.role, enabledModules);
  const hubs = HUBS.filter((hub) => availableHubKeys.has(hub.key));

  return <HubPicker hubs={hubs} userName={user.name} tenantName={tenant?.name ?? "Toko Saya"} />;
}
