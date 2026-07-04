import { requireRole } from "@/server/require-session";
import { getPurchaseOrders } from "@/server/services/purchase-order-service";
import { getSuppliers } from "@/server/services/supplier-service";
import { listAllProducts } from "@/server/services/product-service";
import { PurchaseOrderManager } from "@/components/purchase-order/purchase-order-manager";

export default async function PurchaseOrderPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [purchaseOrders, suppliers, products] = await Promise.all([
    getPurchaseOrders(user.tenantId),
    getSuppliers(user.tenantId),
    listAllProducts(user.tenantId),
  ]);

  return (
    <PurchaseOrderManager
      purchaseOrders={purchaseOrders.map((po) => ({
        id: po.id,
        poNumber: po.poNumber,
        supplier: po.supplier,
        status: po.status,
        totalAmount: po.totalAmount,
        sentAt: po.sentAt,
        expectedAt: po.expectedAt,
        createdAt: po.createdAt,
        items: po.items,
      }))}
      suppliers={suppliers}
      products={products}
    />
  );
}
