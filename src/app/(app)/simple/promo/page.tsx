import { requireRole } from "@/server/require-session";
import { listPromos } from "@/server/services/promo-service";
import { SimplePromoManager } from "@/components/simple/simple-promo-manager";

export default async function SimplePromoPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const promos = await listPromos(user.tenantId);

  return (
    <SimplePromoManager
      promos={promos.map((promo) => ({
        id: promo.id,
        name: promo.name,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        scope: promo.scope,
        categoryId: promo.categoryId,
        minSpend: promo.minSpend,
        daysOfWeek: promo.daysOfWeek,
        startTime: promo.startTime,
        endTime: promo.endTime,
        isActive: promo.isActive,
      }))}
    />
  );
}
