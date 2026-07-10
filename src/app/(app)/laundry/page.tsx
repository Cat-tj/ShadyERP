import { requireModule } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import {
  ensureDefaultLaundryServices,
  listLaundryOrders,
  listLaundryServices,
} from "@/server/services/laundry-service";
import { LaundryManager } from "@/components/laundry/laundry-manager";

export default async function LaundryPage() {
  const user = await requireModule("laundry");
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  await ensureDefaultLaundryServices(user.tenantId);
  const [orders, services] = await Promise.all([
    listLaundryOrders(user.tenantId, outlets.map((outlet) => outlet.id)),
    listLaundryServices(user.tenantId),
  ]);

  return (
    <LaundryManager
      outlets={outlets.map((outlet) => ({ id: outlet.id, name: outlet.name }))}
      services={services.map((service) => ({
        id: service.id,
        name: service.name,
        serviceType: service.serviceType,
        pricePerKg: service.pricePerKg,
        servicePrice: service.servicePrice,
      }))}
      orders={orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        outletName: order.outlet.name,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        serviceName: order.serviceName,
        serviceType: order.serviceType,
        weightGram: order.weightGram,
        itemQty: order.itemQty,
        total: order.total,
        paidAmount: order.paidAmount,
        dueAt: order.dueAt?.toISOString() ?? null,
        pickupDelivery: order.pickupDelivery,
        status: order.status,
      }))}
    />
  );
}
