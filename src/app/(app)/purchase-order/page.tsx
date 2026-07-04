import { requireRole } from "@/server/require-session";
import { getPurchaseOrders } from "@/server/services/purchase-order-service";
import { getSuppliers } from "@/server/services/supplier-service";
import { listProductsFull } from "@/server/services/product-service";
import { PurchaseOrderManager, type PurchaseOrderRow } from "@/components/purchase-order/purchase-order-manager";

export default async function PurchaseOrderPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [purchaseOrders, suppliers, products] = await Promise.all([
    getPurchaseOrders(user.tenantId),
    getSuppliers(user.tenantId),
    listProductsFull(user.tenantId),
  ]);

  const formattedPOs = purchaseOrders as PurchaseOrderRow[];

  return (
    <PurchaseOrderManager
      purchaseOrders={formattedPOs}
      suppliers={suppliers}
      products={products}
    />
  );
}
