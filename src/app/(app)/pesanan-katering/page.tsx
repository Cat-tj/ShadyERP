import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listActiveProductsForPicker } from "@/server/services/product-service";
import { listCateringOrders } from "@/server/services/catering-order-service";
import { CateringOrderManager } from "@/components/kasir/catering-order-manager";

export default async function CateringOrderPage() {
  const user = await requireSession();
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const [products, orders] = await Promise.all([
    listActiveProductsForPicker(user.tenantId),
    listCateringOrders(user.tenantId, outlets.map((outlet) => outlet.id)),
  ]);

  return (
    <CateringOrderManager
      outlets={outlets.map((outlet) => ({ id: outlet.id, name: outlet.name }))}
      products={products.map((product) => ({ id: product.id, name: product.name, price: product.price }))}
      orders={orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        outletName: order.outlet.name,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        memberName: order.member?.name ?? null,
        eventName: order.eventName,
        eventAddress: order.eventAddress,
        eventDate: order.eventDate?.toISOString() ?? null,
        total: order.total,
        paidAmount: order.paidAmount,
        operationalCost: order.operationalCost,
        status: order.status,
        note: order.note,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          qty: item.qty,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      }))}
    />
  );
}
