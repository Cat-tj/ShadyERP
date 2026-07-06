"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { toggleProductActiveAction } from "@/app/(app)/produk/actions";
import { KategoriManager, type CategoryOption } from "@/components/produk/kategori-manager";
import {
  ProductFormModal,
  type EditingProduct,
  type OutletOption,
  type VariantGroupRow,
} from "@/components/produk/product-form-modal";
import { useToast, Toast } from "@/components/toast";

export type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string | null;
  categoryName: string | null;
  price: number;
  cost: number | null;
  kind: "GOODS" | "SERVICE" | "ASSEMBLY" | "NON_INVENTORY" | "COST";
  trackStock: boolean;
  trackExpiry: boolean;
  shelfLifeDays: number | null;
  warrantyDays: number | null;
  serviceDurationMin: number | null;
  isActive: boolean;
  stockByOutlet: Record<string, number>;
  reorderPointByOutlet: Record<string, number>;
  variantGroups: VariantGroupRow[];
};

const PRODUCT_KIND_LABEL: Record<ProductRow["kind"], string> = {
  GOODS: "Barang",
  SERVICE: "Jasa",
  ASSEMBLY: "Rakitan",
  NON_INVENTORY: "Non-Stok",
  COST: "Biaya",
};

export function ProdukManager({
  categories,
  outlets,
  products,
}: {
  categories: CategoryOption[];
  outlets: OutletOption[];
  products: ProductRow[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Diambil ulang dari `products` (bukan snapshot) supaya varian/topping tetap
  // sinkron begitu router.refresh() jalan setelah CRUD varian di dalam modal.
  const editingProduct = editingId ? (products.find((p) => p.id === editingId) ?? null) : null;
  const editing: EditingProduct | null = editingProduct
    ? {
        id: editingProduct.id,
        name: editingProduct.name,
        sku: editingProduct.sku,
        categoryId: editingProduct.categoryId,
        price: editingProduct.price,
        cost: editingProduct.cost,
        kind: editingProduct.kind,
        trackStock: editingProduct.trackStock,
        trackExpiry: editingProduct.trackExpiry,
        shelfLifeDays: editingProduct.shelfLifeDays,
        warrantyDays: editingProduct.warrantyDays,
        serviceDurationMin: editingProduct.serviceDurationMin,
        stockByOutlet: editingProduct.stockByOutlet,
        reorderPointByOutlet: editingProduct.reorderPointByOutlet,
        variantGroups: editingProduct.variantGroups,
      }
    : null;

  function openCreate() {
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(product: ProductRow) {
    setEditingId(product.id);
    setModalOpen(true);
  }

  function toggleActive(product: ProductRow) {
    startTransition(async () => {
      const result = await toggleProductActiveAction(product.id, !product.isActive);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(product.isActive ? "Produk disembunyikan dari kasir" : "Produk diaktifkan");
      router.refresh();
    });
  }

  function totalStock(product: ProductRow) {
    return Object.values(product.stockByOutlet).reduce((sum, qty) => sum + qty, 0);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Produk</h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/produk/riwayat-stok"
            className="flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            Riwayat stok
          </Link>
          <Link
            href="/produk/transfer-stok"
            className="flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            Transfer stok
          </Link>
          <Link
            href="/inventory/import"
            className="flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            Import CSV
          </Link>
          <button
            onClick={openCreate}
            className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)]"
          >
            + Tambah produk
          </button>
        </div>
      </div>

      <KategoriManager categories={categories} onNotify={showToast} />

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada produk. Tambahkan produk pertamamu →
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {product.name}
                    {!product.isActive && (
                      <span className="ml-2 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-warning-text)]">
                        Nonaktif
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {product.categoryName ?? "Tanpa kategori"}
                    {product.sku ? ` · SKU ${product.sku}` : ""}
                    {product.kind === "SERVICE"
                      ? ` · Jasa ${product.serviceDurationMin ?? 0} menit`
                      : product.trackStock
                        ? ` · Stok ${totalStock(product)}`
                        : ` · ${PRODUCT_KIND_LABEL[product.kind]}`}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {product.kind !== "GOODS" && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {PRODUCT_KIND_LABEL[product.kind]}
                      </span>
                    )}
                    {product.trackExpiry && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Expired
                      </span>
                    )}
                    {product.warrantyDays != null && product.warrantyDays > 0 && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Garansi {product.warrantyDays} hari
                      </span>
                    )}
                    {product.shelfLifeDays != null && product.shelfLifeDays > 0 && (
                      <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                        Simpan {product.shelfLifeDays} hari
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                    {formatRupiah(product.price)}
                  </span>
                  <button
                    onClick={() => openEdit(product)}
                    className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] sm:flex-none"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => toggleActive(product)}
                    disabled={isPending}
                    className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 sm:flex-none"
                  >
                    {product.isActive ? "Sembunyikan" : "Aktifkan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <ProductFormModal
          categories={categories}
          outlets={outlets}
          product={editing}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
