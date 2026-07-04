import { requireRole } from "@/server/require-session";
import { getStockReceipts } from "@/server/services/stock-receipt-service";
import { getPurchaseOrders } from "@/server/services/purchase-order-service";
import { listAllOutlets } from "@/server/services/outlet-service";
import { StockReceiptManager, type StockReceiptRow } from "@/components/stock-receipt/stock-receipt-manager";

export default async function StockReceiptPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [receipts, purchaseOrders, outlets] = await Promise.all([
    getStockReceipts(user.tenantId),
    getPurchaseOrders(user.tenantId),
    listAllOutlets(user.tenantId),
  ]);

  const formattedReceipts = receipts as StockReceiptRow[];

  return (
    <StockReceiptManager
      receipts={formattedReceipts}
      purchaseOrders={purchaseOrders}
      outlets={outlets}
    />
  );
}
