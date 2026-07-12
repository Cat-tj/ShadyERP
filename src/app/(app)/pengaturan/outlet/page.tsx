import { requireRole } from "@/server/require-session";
import { listAllOutlets } from "@/server/services/outlet-service";
import { OutletManager } from "@/components/pengaturan/outlet-manager";

export default async function OutletSettingsPage() {
  const user = await requireRole(["OWNER"]);
  const outlets = await listAllOutlets(user.tenantId);

  return (
    <OutletManager
      outlets={outlets.map((outlet) => ({
        id: outlet.id,
        name: outlet.name,
        address: outlet.address,
        phone: outlet.phone,
        receiptPaperWidth: outlet.receiptPaperWidth,
        isActive: outlet.isActive,
      }))}
    />
  );
}
