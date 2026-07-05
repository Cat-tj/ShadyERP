import { Metadata } from "next";
import { requireRole } from "@/server/require-session";
import { listPromos } from "@/server/services/promo-service";
import { listCategories } from "@/server/services/product-service";
import { PromoManager } from "@/components/pengaturan/promo-manager";

export const metadata: Metadata = {
  title: "Kelola Program Promo & Diskon Otomatis - Altora",
  description: "Kelola promo penjualan, program loyalitas pelanggan, diskon hari tertentu, minimal belanja, dan durasi jam aktif promo toko.",
};

export default async function PromoPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const [promos, categories] = await Promise.all([
    listPromos(user.tenantId),
    listCategories(user.tenantId),
  ]);

  return (
    <PromoManager
      promos={promos.map((promo) => ({
        id: promo.id,
        name: promo.name,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        scope: promo.scope,
        categoryId: promo.categoryId,
        categoryName: promo.category?.name ?? null,
        minSpend: promo.minSpend,
        daysOfWeek: promo.daysOfWeek,
        startTime: promo.startTime,
        endTime: promo.endTime,
        isActive: promo.isActive,
      }))}
      categories={categories.map((category) => ({ id: category.id, name: category.name }))}
    />
  );
}
