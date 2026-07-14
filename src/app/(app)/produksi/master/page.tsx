import { requireRole } from "@/server/require-session";
import { listAllOutlets } from "@/server/services/outlet-service";
import { listActiveProductsForPicker } from "@/server/services/product-service";
import { listWorkCenters } from "@/server/services/routing-service";
import { listAllBomVersionsForTenant } from "@/server/services/bom-service";
import { listAllRoutingVersionsForTenant } from "@/server/services/routing-service";
import { MasterDataManager } from "@/components/produksi/master-data-manager";

export default async function ProduksiMasterPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [outlets, products, workCenters, bomVersions, routingVersions] = await Promise.all([
    listAllOutlets(user.tenantId),
    listActiveProductsForPicker(user.tenantId),
    listWorkCenters(user.tenantId),
    listAllBomVersionsForTenant(user.tenantId),
    listAllRoutingVersionsForTenant(user.tenantId),
  ]);

  return (
    <MasterDataManager
      outlets={outlets.map((o) => ({ id: o.id, name: o.name }))}
      products={products}
      workCenters={workCenters}
      bomVersions={bomVersions}
      routingVersions={routingVersions}
    />
  );
}
