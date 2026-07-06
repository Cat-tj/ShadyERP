import Link from "next/link";
import { requireSessionWithTenant } from "@/server/require-session";
import { listCategories, listProductsFull } from "@/server/services/product-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getExpiringBatches, getLowStockProducts } from "@/server/services/inventory-service";
import { ProdukManager } from "@/components/produk/produk-manager";
import { LowStockAlert } from "@/components/inventory/low-stock-alert";
import { formatTanggalPendek } from "@/lib/format";
import { normalizeBusinessMode } from "@/lib/business-modes";
import { redirect } from "next/navigation";

export default async function ProdukPage() {
  const { user, tenant } = await requireSessionWithTenant();
  if (user.role === "STAFF") redirect("/pilih-aplikasi");
  const businessMode = normalizeBusinessMode(tenant?.businessType);

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
      {(businessMode === "TOKO" || businessMode === "COMPANY") && (
        <RetailWorkflowPanel lowStockCount={lowStockItems.length} expiringCount={expiringBatches.length} />
      )}
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

function RetailWorkflowPanel({
  lowStockCount,
  expiringCount,
}: {
  lowStockCount: number;
  expiringCount: number;
}) {
  const cards = [
    { title: "Barang masuk", body: "Ganti catatan WA dengan PO + penerimaan + QC.", href: "/stock-receipt", status: "Siap" },
    { title: "Barcode & varian", body: "SKU/barcode internal bisa dibuat dari form produk.", href: "/inventory", status: "Siap" },
    { title: "Stok minimum", body: `${lowStockCount} item perlu perhatian di outlet aktif.`, href: "/inventory", status: "Aktif" },
    { title: "Expired", body: `${expiringCount} batch mendekati expired dalam 14 hari.`, href: "/inventory", status: "Aktif" },
    { title: "Closing bayar", body: "Metode bayar terlihat di riwayat dan tutup shift.", href: "/kasir/tutup", status: "Siap" },
    { title: "Shopee import", body: "Roadmap: CSV import dulu, API belakangan.", href: "/kasir/riwayat", status: "Roadmap" },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
          Altora Toko
        </p>
        <h1 className="text-xl font-bold text-[var(--color-text)]">Retail Control</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Fokus retail: penerimaan barang, barcode, stok minimum, expired, closing kasir, dan marketplace.
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 hover:bg-[var(--color-surface)]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-[var(--color-text)]">{card.title}</p>
              <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                {card.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">{card.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
