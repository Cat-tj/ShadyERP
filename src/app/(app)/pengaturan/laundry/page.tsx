import { requireModule } from "@/server/require-session";
import {
  ensureDefaultLaundryServices,
  listLaundryServices,
} from "@/server/services/laundry-service";
import { LaundryServiceManager } from "@/components/pengaturan/laundry-service-manager";

export default async function LaundrySettingsPage() {
  const user = await requireModule("laundry");
  await ensureDefaultLaundryServices(user.tenantId);
  const services = await listLaundryServices(user.tenantId, { includeInactive: true });

  return (
    <LaundryServiceManager
      services={services.map((service) => ({
        id: service.id,
        name: service.name,
        serviceType: service.serviceType,
        pricePerKg: service.pricePerKg,
        servicePrice: service.servicePrice,
        isActive: service.isActive,
      }))}
    />
  );
}
