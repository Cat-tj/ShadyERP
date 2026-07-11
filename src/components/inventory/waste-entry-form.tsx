"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { recordWasteAction } from "@/app/(app)/inventory/actions";
import type { StockAdjustmentReason } from "@prisma/client";

const REASON_OPTIONS: { value: StockAdjustmentReason; label: string }[] = [
  { value: "WASTE", label: "Waste/Terbuang" },
  { value: "EXPIRED", label: "Kadaluarsa" },
  { value: "DAMAGED", label: "Rusak" },
  { value: "OTHER", label: "Lainnya" },
];

export function WasteEntryForm({
  outlets,
  activeOutletId,
  products,
}: {
  outlets: { id: string; name: string }[];
  activeOutletId: string;
  products: { id: string; name: string; stockQty: number }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState<StockAdjustmentReason>("WASTE");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function changeOutlet(nextOutletId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("outletId", nextOutletId);
    router.push(`/inventory/waste?${params.toString()}`);
  }

  function submit() {
    setError(null);
    setSuccess(null);
    const qtyNumber = Number(qty);
    if (!productId) {
      setError("Pilih produk dulu.");
      return;
    }
    if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }
    startTransition(async () => {
      const result = await recordWasteAction({
        productId,
        outletId: activeOutletId,
        qty: qtyNumber,
        reason,
        note: note.trim() || undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      const productName = products.find((p) => p.id === productId)?.name ?? "Produk";
      setSuccess(`Kerugian ${productName} x${qtyNumber} berhasil dicatat.`);
      setProductId("");
      setQty("1");
      setNote("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      {outlets.length > 1 && (
        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Outlet</label>
          <select
            value={activeOutletId}
            onChange={(event) => changeOutlet(event.target.value)}
            className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 rounded-lg bg-[var(--color-good-bg)] px-4 py-3 text-sm text-[var(--color-good-text)]">
          {success}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-[var(--color-text)]">Produk</label>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Pilih produk...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (stok {product.stockQty})
              </option>
            ))}
          </select>
          {products.length === 0 && (
            <p className="text-xs text-[var(--color-text-secondary)]">Tidak ada produk dengan stok di outlet ini.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Jumlah</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Alasan</label>
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value as StockAdjustmentReason)}
            className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            {REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-[var(--color-text)]">Catatan (opsional)</label>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="mis. Susu basi karena kulkas mati"
            className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      <button
        onClick={submit}
        disabled={isPending || products.length === 0}
        className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--color-danger)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {isPending ? "Menyimpan..." : "Catat kerugian"}
      </button>
    </div>
  );
}
