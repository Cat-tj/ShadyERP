"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { transferStockAction } from "@/app/(app)/produk/actions";
import { useToast, Toast } from "@/components/toast";

export type OutletOption = { id: string; name: string };
export type ProductOption = {
  id: string;
  name: string;
  stockByOutlet: Record<string, number>;
};

export function TransferStokManager({
  outlets,
  products,
}: {
  outlets: OutletOption[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [fromOutletId, setFromOutletId] = useState(outlets[0]?.id ?? "");
  const [toOutletId, setToOutletId] = useState(outlets[1]?.id ?? outlets[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  );
  const availableQty = selectedProduct?.stockByOutlet[fromOutletId] ?? 0;

  function handleSubmit() {
    setError(null);
    const qtyNumber = Number(qty);
    if (!productId) {
      setError("Pilih produk terlebih dahulu.");
      return;
    }
    if (fromOutletId === toOutletId) {
      setError("Outlet asal dan tujuan tidak boleh sama.");
      return;
    }
    if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) {
      setError("Jumlah transfer tidak valid.");
      return;
    }
    if (qtyNumber > availableQty) {
      setError(`Stok di outlet asal tidak cukup. Tersedia ${availableQty}.`);
      return;
    }

    startTransition(async () => {
      const result = await transferStockAction(
        productId,
        fromOutletId,
        toOutletId,
        qtyNumber,
        note.trim() || undefined
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Stok berhasil dipindah");
      setQty("");
      setNote("");
      router.refresh();
    });
  }

  if (outlets.length < 2) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
        Transfer stok butuh minimal 2 outlet aktif.
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
        Belum ada produk dengan pelacakan stok aktif.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      {error && (
        <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Produk</label>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Dari outlet</label>
            <select
              value={fromOutletId}
              onChange={(event) => setFromOutletId(event.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--color-text-secondary)]">Stok tersedia: {availableQty}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Ke outlet</label>
            <select
              value={toOutletId}
              onChange={(event) => setToOutletId(event.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Jumlah</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            placeholder="0"
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Catatan (opsional)</label>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="mis. kirim stok untuk stok outlet baru"
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
        )}
        {isPending ? "Memindahkan..." : "Transfer stok"}
      </button>

      <Toast message={toastMessage} />
    </div>
  );
}
