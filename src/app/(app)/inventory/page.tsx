import { requireRole } from "@/server/require-session";
import { listCategories, listProductsFull } from "@/server/services/product-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getLowStockProducts } from "@/server/services/inventory-service";
import { ProdukManager } from "@/components/produk/produk-manager";
import { LowStockAlert } from "@/components/inventory/low-stock-alert";

export default async function ProdukPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [categories, products, outlets] = await Promise.all([
    listCategories(user.tenantId),
    listProductsFull(user.tenantId),
    listOutletsForUser(user.tenantId, user.id, user.role),
  ]);

  const firstOutletId = outlets[0]?.id;
  const lowStockItems = firstOutletId
    ? await getLowStockProducts(user.tenantId, firstOutletId)
    : [];

  return (
    <div className="flex flex-col gap-6">
      {lowStockItems.length > 0 && (
        <div className="mx-auto w-full max-w-5xl">
          <p className="mb-2 text-xs font-semibold text-[var(--color-text-secondary)]">
            Peringatan Stok ({outlets[0]?.name})
          </p>
          <LowStockAlert items={lowStockItems} />
        </div>
      )}
      <ProdukManager
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        outlets={outlets.map((outlet) => ({ id: outlet.id, name: outlet.name }))}
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          categoryName: product.category?.name ?? null,
          price: product.price,
          cost: product.cost,
          trackStock: product.trackStock,
          isActive: product.isActive,
          stockByOutlet: Object.fromEntries(
            product.stocks.map((stock) => [stock.outletId, stock.qty])
          ),
          reorderPointByOutlet: Object.fromEntries(
            product.reorderPoints.map((rp) => [rp.outletId, rp.minQty])
          ),
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
      />
    </div>
  );
}
