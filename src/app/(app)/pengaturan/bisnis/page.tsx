import { requireRole } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { BisnisForm } from "@/components/pengaturan/bisnis-form";

export default async function BisnisSettingsPage() {
  const user = await requireRole(["OWNER"]);
  const setting = await getTenantSetting(user.tenantId);

  return (
    <BisnisForm
      taxPercent={setting?.taxPercent ?? 0}
      pointsPerAmount={setting?.pointsPerAmount ?? 10000}
      receiptFooter={setting?.receiptFooter ?? null}
      staticQrisPayload={setting?.staticQrisPayload ?? null}
    />
  );
}
