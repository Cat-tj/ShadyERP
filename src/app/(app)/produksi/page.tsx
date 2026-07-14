import { requireRole } from "@/server/require-session";
import { listWorkOrders } from "@/server/services/work-order-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listActiveProductsForPicker } from "@/server/services/product-service";
import { listActiveBomVersions } from "@/server/services/bom-service";
import { listActiveRoutingVersions } from "@/server/services/routing-service";
import { ensureDefaultWarehouses } from "@/server/services/warehouse-service";
import { WorkOrderManager, type ProductionReadyProduct } from "@/components/produksi/work-order-manager";

export default async function ProduksiPage() {
  const user = await requireRole(["OWNER", "MANAGER", "STAFF"]);

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);

  // Isi otomatis gudang standar tiap outlet biar Owner gak perlu setup manual
  // sebelum bisa bikin Work Order pertamanya (AGENTS.md: jangan suruh input manual).
  await Promise.all(outlets.map((o) => ensureDefaultWarehouses(user.tenantId, o.id)));

  const [workOrders, products, activeBoms, activeRoutings] = await Promise.all([
    listWorkOrders(user.tenantId),
    listActiveProductsForPicker(user.tenantId),
    listActiveBomVersions(user.tenantId),
    listActiveRoutingVersions(user.tenantId),
  ]);

  const bomByProduct = new Map(activeBoms.map((b) => [b.productId, b.id]));
  const routingByProduct = new Map(activeRoutings.map((r) => [r.productId, r.id]));

  const productionReadyProducts: ProductionReadyProduct[] = products
    .filter((p) => bomByProduct.has(p.id) && routingByProduct.has(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      activeBomVersionId: bomByProduct.get(p.id)!,
      activeRoutingVersionId: routingByProduct.get(p.id)!,
    }));

  return (
    <WorkOrderManager
      workOrders={workOrders}
      outlets={outlets.map((o) => ({ id: o.id, name: o.name }))}
      products={productionReadyProducts}
      canManage={user.role === "OWNER" || user.role === "MANAGER"}
    />
  );
}
