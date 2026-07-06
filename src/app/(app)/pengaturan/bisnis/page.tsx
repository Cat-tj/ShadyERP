import { requireSessionWithTenant } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { BisnisForm } from "@/components/pengaturan/bisnis-form";
import { normalizeBusinessMode } from "@/lib/business-modes";
import { redirect } from "next/navigation";

export default async function BisnisSettingsPage() {
  const { user, tenant } = await requireSessionWithTenant();
  if (user.role !== "OWNER") redirect("/pilih-aplikasi");
  const setting = await getTenantSetting(user.tenantId);

  return (
    <BisnisForm
      businessType={normalizeBusinessMode(tenant?.businessType)}
      taxPercent={setting?.taxPercent ?? 0}
      pointsPerAmount={setting?.pointsPerAmount ?? 10000}
      receiptFooter={setting?.receiptFooter ?? null}
      staticQrisPayload={setting?.staticQrisPayload ?? null}
      accountingMode={setting?.accountingMode ?? "SIMPLE"}
    />
  );
}
