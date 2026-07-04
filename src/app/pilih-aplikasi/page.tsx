import { requireSession } from "@/server/require-session";
import { prisma } from "@/lib/prisma";
import { hubsAvailableForRole } from "@/lib/nav";
import { resolveEnabledModules } from "@/lib/modules";
import { HubPicker } from "@/components/hub-picker";

export default async function PilihAplikasiPage() {
  const user = await requireSession();
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { name: true, disabledModules: true },
  });

  const enabledModules = resolveEnabledModules(tenant?.disabledModules ?? []);
  const availableHubKeys = Array.from(hubsAvailableForRole(user.role, enabledModules));

  return <HubPicker hubKeys={availableHubKeys} userName={user.name} tenantName={tenant?.name ?? "Toko Saya"} />;
}
