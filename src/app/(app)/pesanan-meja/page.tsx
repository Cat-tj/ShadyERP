import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listIncomingOrders } from "@/server/services/table-order-service";
import { listTables } from "@/server/services/table-service";
import { PesananMasukManager } from "@/components/pesanan-meja/pesanan-masuk-manager";

export default async function PesananMejaPage() {
  const user = await requireSession();

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((o) => o.id);

  const [orders, tables] = await Promise.all([
    listIncomingOrders(user.tenantId, outletIds),
    listTables(user.tenantId, outletIds),
  ]);

  return (
    <PesananMasukManager
      tables={tables.map((t) => ({
        id: t.id,
        name: t.name,
        posX: t.posX,
        posY: t.posY,
        isActive: t.isActive,
        floor: t.floor,
        shape: t.shape,
        capacity: t.capacity,
      }))}
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
          price: item.price,
          qty: item.qty,
          note: item.note,
        })),
      }))}
    />
  );
}
