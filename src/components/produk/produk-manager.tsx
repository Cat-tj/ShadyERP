"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import { toggleProductActiveAction } from "@/app/(app)/produk/actions";
import { KategoriManager, type CategoryOption } from "@/components/produk/kategori-manager";
import {
  ProductFormModal,
  type EditingProduct,
  type OutletOption,
} from "@/components/produk/product-form-modal";
import { useToast, Toast } from "@/components/toast";

export type ProductRow = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  price: number;
  cost: number | null;
  trackStock: boolean;
  isActive: boolean;
  stockByOutlet: Record<string, number>;
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
  const [editing, setEditing] = useState<EditingProduct | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: ProductRow) {
    setEditing({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      cost: product.cost,
      trackStock: product.trackStock,
      stockByOutlet: product.stockByOutlet,
    });
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Produk</h1>
        <button
          onClick={openCreate}
          className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
        >
          + Tambah produk
        </button>
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
              <div key={product.id} className="flex items-center justify-between gap-3 p-4">
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
                    {product.trackStock ? ` · Stok ${totalStock(product)}` : " · Tanpa stok"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                    {formatRupiah(product.price)}
                  </span>
                  <button
                    onClick={() => openEdit(product)}
                    className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => toggleActive(product)}
                    disabled={isPending}
                    className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40"
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
