import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listEquipment } from "@/server/services/equipment-service";
import { EquipmentManager } from "@/components/maintenance/equipment-manager";

export default async function MaintenancePage() {
  const user = await requireRole(["OWNER", "MANAGER", "STAFF"]);
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const equipment = await listEquipment(
    user.tenantId,
    outlets.map((outlet) => outlet.id)
  );

  return (
    <EquipmentManager
      outlets={outlets.map((outlet) => ({ id: outlet.id, name: outlet.name }))}
      equipment={equipment.map((item) => ({
        id: item.id,
        outletId: item.outletId,
        outletName: item.outlet.name,
        name: item.name,
        category: item.category,
        serialNumber: item.serialNumber,
        status: item.status,
        note: item.note,
        logs: item.logs.map((log) => ({
          id: log.id,
          status: log.status,
          issue: log.issue,
          actionTaken: log.actionTaken,
          cost: log.cost,
          reportedAt: log.reportedAt.toISOString(),
          reportedByName: log.reportedBy.name,
        })),
      }))}
    />
  );
}
