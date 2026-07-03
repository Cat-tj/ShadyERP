import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listIncomingOrders } from "@/server/services/table-order-service";
import { KitchenDisplay } from "@/components/dapur/kitchen-display";

export default async function DapurPage() {
  const user = await requireSession();

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const orders = await listIncomingOrders(
    user.tenantId,
    outlets.map((o) => o.id)
  );

  return (
    <KitchenDisplay
      orders={orders.map((order) => ({
          id: order.id,
          status: order.status,
          customerName: order.customerName,
          note: order.note,
          createdAt: order.createdAt.toISOString(),
          tableName: order.table.name,
          outletName: order.outlet.name,
          items: order.items.map((item) => ({
            id: item.id,
            productName: item.productName,
            variantLabel: item.variantLabel,
            qty: item.qty,
            note: item.note,
          })),
        }))}
    />
  );
}
