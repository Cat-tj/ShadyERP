import { Metadata } from "next";
import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listIncomingOrders } from "@/server/services/table-order-service";
import { listTables } from "@/server/services/table-service";
import { getLowStockProducts } from "@/server/services/inventory-service";
import { KitchenDisplay } from "@/components/dapur/kitchen-display";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Command Center Operasional Dapur & Layanan Meja - Altora",
  description: "Dasbor pemantauan real-time dapur, monitor antrean pesanan masak, status ketersediaan meja makan, dan stok bahan baku resto.",
};

export default async function CommandCenterPage() {
  const user = await requireSession();

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((o) => o.id);
  const firstOutletId = outletIds[0];

  const [orders, activeAttendances, tables, lowStockItems] = await Promise.all([
    listIncomingOrders(user.tenantId, outletIds),
    prisma.attendance.findMany({
      where: {
        tenantId: user.tenantId,
        outletId: { in: outletIds },
        clockInAt: { not: null },
        clockOutAt: null,
      },
      include: {
        user: true,
      },
    }),
    listTables(user.tenantId, outletIds),
    firstOutletId ? getLowStockProducts(user.tenantId, firstOutletId) : Promise.resolve([]),
  ]);

  const activeStaff = activeAttendances.map((att) => ({
    id: att.id,
    name: att.user.name,
    jobTitle: att.user.jobTitle ?? "Staff",
  }));

  return (
    <KitchenDisplay
      activeStaff={activeStaff}
      lowStockItems={lowStockItems}
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
          qty: item.qty,
          note: item.note,
        })),
      }))}
    />
  );
}
