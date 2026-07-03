import { requireSession } from "@/server/require-session";
import { getOpenShift } from "@/server/services/shift-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listProductsWithStock, listCategories } from "@/server/services/product-service";
import { prisma } from "@/lib/prisma";
import { OpenShiftForm } from "@/components/kasir/open-shift-form";
import { PosScreen } from "@/components/kasir/pos-screen";

export default async function KasirPage() {
  const user = await requireSession();
  const shift = await getOpenShift(user.tenantId, user.id);

  if (!shift) {
    const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
    return (
      <div className="mx-auto max-w-5xl">
        <OpenShiftForm outlets={outlets} />
      </div>
    );
  }

  const [products, categories, setting] = await Promise.all([
    listProductsWithStock(user.tenantId, shift.outletId),
    listCategories(user.tenantId),
    prisma.tenantSetting.findUnique({ where: { tenantId: user.tenantId } }),
  ]);

  const activeProducts = products.filter((product) => product.isActive);

  return (
    <PosScreen
      outletName={shift.outlet.name}
      taxPercent={setting?.taxPercent ?? 0}
      products={activeProducts.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        categoryName: product.category?.name ?? null,
        trackStock: product.trackStock,
        stockQty: product.stockQty,
        variantGroups: product.variantGroups.map((group) => ({
          id: group.id,
          name: group.name,
          type: group.type,
          required: group.required,
          options: group.options.map((option) => ({
            id: option.id,
            name: option.name,
            priceDelta: option.priceDelta,
          })),
        })),
      }))}
      categories={categories.map((category) => ({ id: category.id, name: category.name }))}
    />
  );
}
