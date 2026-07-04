import { requireRole } from "@/server/require-session";
import { getStockReceipts } from "@/server/services/stock-receipt-service";
import { getPurchaseOrders } from "@/server/services/purchase-order-service";
import { listAllOutlets } from "@/server/services/outlet-service";
import { StockReceiptManager } from "@/components/stock-receipt/stock-receipt-manager";

export default async function StockReceiptPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [receipts, purchaseOrders, outlets] = await Promise.all([
    getStockReceipts(user.tenantId),
    getPurchaseOrders(user.tenantId),
    listAllOutlets(user.tenantId),
  ]);

  return (
    <StockReceiptManager
      receipts={receipts.map((receipt) => ({
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        po: receipt.po,
        outlet: receipt.outlet,
        status: receipt.status,
        receivedAt: receipt.receivedAt,
        completedAt: receipt.completedAt,
        items: receipt.items,
      }))}
      purchaseOrders={purchaseOrders.map((po) => ({
        id: po.id,
        poNumber: po.poNumber,
        supplier: po.supplier,
        status: po.status,
        totalAmount: po.totalAmount,
        createdAt: po.createdAt,
        items: po.items,
        sentAt: po.sentAt,
        expectedAt: po.expectedAt,
      }))}
      outlets={outlets}
    />
  );
}
