"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
  updateStockAction,
} from "@/app/(app)/produk/actions";
import type { CategoryOption } from "@/components/produk/kategori-manager";

export type OutletOption = { id: string; name: string };

export type EditingProduct = {
  id: string;
  name: string;
  categoryId: string | null;
  price: number;
  cost: number | null;
  trackStock: boolean;
  stockByOutlet: Record<string, number>;
};

export function ProductFormModal({
  categories,
  outlets,
  product,
  onClose,
  onSaved,
}: {
  categories: CategoryOption[];
  outlets: OutletOption[];
  product: EditingProduct | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [cost, setCost] = useState(product?.cost ? String(product.cost) : "");
  const [trackStock, setTrackStock] = useState(product?.trackStock ?? true);
  const [stockByOutlet, setStockByOutlet] = useState<Record<string, string>>(
    Object.fromEntries(outlets.map((outlet) => [outlet.id, String(product?.stockByOutlet[outlet.id] ?? 0)]))
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    const priceNumber = Number(price);
    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("Harga tidak valid.");
      return;
    }

    startTransition(async () => {
      const input = {
        name: name.trim(),
        categoryId: categoryId || null,
        price: priceNumber,
        cost: cost ? Number(cost) : null,
        trackStock,
      };

      const result = product
        ? await updateProductAction(product.id, input)
        : await createProductAction(input);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (trackStock) {
        let productId = product?.id;
        if (!productId) {
          // Produk baru: cari id-nya lewat revalidate tidak memberi id langsung,
          // jadi stok awal untuk produk baru diatur lewat menu "Kelola stok" setelah tersimpan.
          productId = undefined;
        }
        if (productId) {
          for (const outlet of outlets) {
            const qty = Number(stockByOutlet[outlet.id] ?? 0);
            if (Number.isFinite(qty) && qty >= 0) {
              await updateStockAction(productId, outlet.id, qty);
            }
          }
        }
      }

      onSaved(product ? "Produk disimpan" : "Produk ditambahkan");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--color-bg)] p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {product ? "Ubah produk" : "Tambah produk"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama produk</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Kopi Susu"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Kategori</label>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              <option value="">Tanpa kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Harga jual</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0"
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Modal (opsional)</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={cost}
                onChange={(event) => setCost(event.target.value)}
                placeholder="0"
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={trackStock}
              onChange={(event) => setTrackStock(event.target.checked)}
              className="h-5 w-5 rounded border-[var(--color-border)]"
            />
            Catat stok produk ini
          </label>

          {trackStock && product && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-[var(--color-text)]">Stok per outlet</p>
              {outlets.map((outlet) => (
                <div key={outlet.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--color-text-secondary)]">{outlet.name}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={stockByOutlet[outlet.id] ?? "0"}
                    onChange={(event) =>
                      setStockByOutlet((prev) => ({ ...prev, [outlet.id]: event.target.value }))
                    }
                    className="h-10 w-24 rounded-md border border-[var(--color-border)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              ))}
            </div>
          )}
          {trackStock && !product && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Simpan produk dulu, lalu atur stok awal lewat tombol &quot;Ubah&quot; pada produk ini.
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {isPending ? "Menyimpan..." : "Simpan produk"}
        </button>
      </div>
    </div>
  );
}
