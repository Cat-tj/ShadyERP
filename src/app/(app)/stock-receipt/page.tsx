import { requireRole } from "@/server/require-session";
import { getStockReceipts } from "@/server/services/stock-receipt-service";
import { getPurchaseOrders } from "@/server/services/purchase-order-service";
import { listAllOutlets } from "@/server/services/outlet-service";
import { listProductsFull } from "@/server/services/product-service";
import { getSuppliers } from "@/server/services/supplier-service";
import { StockReceiptManager, type StockReceiptRow } from "@/components/stock-receipt/stock-receipt-manager";

export default async function StockReceiptPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [receipts, purchaseOrders, outlets, products, suppliers] = await Promise.all([
    getStockReceipts(user.tenantId),
    getPurchaseOrders(user.tenantId),
    listAllOutlets(user.tenantId),
    listProductsFull(user.tenantId),
    getSuppliers(user.tenantId, "ACTIVE", 200),
  ]);

  const formattedReceipts = receipts as StockReceiptRow[];

  return (
    <StockReceiptManager
      receipts={formattedReceipts}
      purchaseOrders={purchaseOrders}
      outlets={outlets}
      products={products.filter((product) => product.trackStock)}
      suppliers={suppliers}
    />
  );
}
