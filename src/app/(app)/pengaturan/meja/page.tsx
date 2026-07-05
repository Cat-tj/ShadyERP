import { requireRole } from "@/server/require-session";
import { listTables } from "@/server/services/table-service";
import { listAllOutlets } from "@/server/services/outlet-service";
import { MejaManager } from "@/components/pengaturan/meja-manager";

export default async function MejaSettingsPage() {
  const user = await requireRole(["OWNER"]);

  const outlets = await listAllOutlets(user.tenantId);
  const tables = await listTables(
    user.tenantId,
    outlets.map((o) => o.id)
  );

  return (
    <MejaManager
      outlets={outlets.map((outlet) => ({ id: outlet.id, name: outlet.name }))}
      tables={tables.map((table) => ({
        id: table.id,
        name: table.name,
        outletId: table.outletId,
        outletName: table.outlet.name,
        isActive: table.isActive,
        posX: table.posX,
        posY: table.posY,
        floor: table.floor,
        shape: table.shape,
        capacity: table.capacity,
      }))}
    />
  );
}
