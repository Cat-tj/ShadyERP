import { Metadata } from "next";
import { requireRole } from "@/server/require-session";
import { listTables } from "@/server/services/table-service";
import { listAllOutlets } from "@/server/services/outlet-service";
import { MejaManager } from "@/components/pengaturan/meja-manager";

export const metadata: Metadata = {
  title: "Desain & Tata Letak Meja Kustom - Altora",
  description: "Desain denah meja restoran secara interaktif, atur kapasitas kursi, letak lantai, koordinat grid, dan bentuk meja fisik sesuai tata letak outlet.",
};

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
