import { requireRole } from "@/server/require-session";
import { listCategories, listProductsFull } from "@/server/services/product-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getExpiringBatches, getLowStockProducts } from "@/server/services/inventory-service";
import { ProdukManager } from "@/components/produk/produk-manager";
import { LowStockAlert } from "@/components/inventory/low-stock-alert";
import { formatTanggalPendek } from "@/lib/format";

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
  const expiringBatches = firstOutletId
    ? await getExpiringBatches(user.tenantId, firstOutletId, 14)
    : [];

  return (
    <div className="flex flex-col gap-6">
      {expiringBatches.length > 0 && (
        <div className="mx-auto w-full max-w-5xl rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800">Batch mendekati expired ({outlets[0]?.name})</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {expiringBatches.slice(0, 6).map((batch) => (
              <div key={batch.id} className="rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--color-text)]">{batch.product.name}</p>
                    <p className="text-amber-700">Batch {batch.batchNumber} · Sisa {batch.qtyRemaining}</p>
                  </div>
                  <span className="shrink-0 tabular-nums font-bold text-amber-800">
                    {batch.expirationDate ? formatTanggalPendek(batch.expirationDate.toISOString()) : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {expiringBatches.length > 6 && (
            <p className="mt-2 text-xs text-amber-700">+{expiringBatches.length - 6} batch lain perlu dicek.</p>
          )}
        </div>
      )}
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
          sku: product.sku,
          categoryId: product.categoryId,
          categoryName: product.category?.name ?? null,
          price: product.price,
          cost: product.cost,
          kind: product.kind,
          trackStock: product.trackStock,
          trackExpiry: product.trackExpiry,
          shelfLifeDays: product.shelfLifeDays,
          warrantyDays: product.warrantyDays,
          serviceDurationMin: product.serviceDurationMin,
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
