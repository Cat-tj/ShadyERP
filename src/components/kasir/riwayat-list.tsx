"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, formatJam, formatTanggal } from "@/lib/format";
import { voidSaleAction, processReturnAction } from "@/app/(app)/kasir/riwayat/actions";
import { Toast, useToast } from "@/components/toast";

export type SaleRow = {
  id: string;
  invoiceNumber: string;
  outletName: string;
  cashierName: string;
  memberName: string | null;
  total: number;
  paymentMethod: string;
  status: "COMPLETED" | "VOIDED";
  voidReason: string | null;
  createdAt: string;
  items: { id: string; productName: string; qty: number; returnedQty: number; subtotal: number }[];
};

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
  DEPOSIT: "Deposit",
};

export function RiwayatList({
  sales,
  canVoid,
}: {
  sales: SaleRow[];
  canVoid: boolean;
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [voidTarget, setVoidTarget] = useState<SaleRow | null>(null);
  const [returnTarget, setReturnTarget] = useState<SaleRow | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleVoid() {
    if (!voidTarget) return;
    if (!reason.trim()) {
      setError("Alasan pembatalan wajib diisi.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await voidSaleAction(voidTarget.id, reason.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Transaksi dibatalkan, stok dikembalikan");
      setVoidTarget(null);
      setReason("");
      router.refresh();
    });
  }

  if (sales.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Belum ada transaksi. Transaksi dari layar kasir akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{sale.invoiceNumber}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {formatTanggal(sale.createdAt)}, {formatJam(sale.createdAt)} · {sale.outletName} ·{" "}
                  {sale.cashierName}
                  {sale.memberName ? ` · ${sale.memberName}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                  {formatRupiah(sale.total)}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {PAYMENT_LABEL[sale.paymentMethod] ?? sale.paymentMethod}
                </p>
              </div>
            </div>

            {sale.status === "VOIDED" ? (
              <p className="mt-2 rounded-lg bg-[var(--color-warning-bg)] px-3 py-1.5 text-xs text-[var(--color-warning-text)]">
                Dibatalkan: {sale.voidReason}
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href={`/kasir/struk/${sale.id}`}
                  className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                >
                  Lihat struk
                </a>
                {sale.items.some((item) => item.qty > item.returnedQty) && (
                  <button
                    onClick={() => setReturnTarget(sale)}
                    className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg)]"
                  >
                    Retur sebagian
                  </button>
                )}
                {canVoid && (
                  <button
                    onClick={() => setVoidTarget(sale)}
                    className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-bg)]"
                  >
                    Batalkan
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {voidTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-[var(--color-bg)] p-5">
            <h2 className="text-base font-bold text-[var(--color-text)]">
              Batalkan transaksi {voidTarget.invoiceNumber}?
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Stok produk akan dikembalikan{voidTarget.memberName ? " dan poin member akan ditarik kembali" : ""}.
            </p>

            {error && (
              <div className="mt-3 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
                {error}
              </div>
            )}

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Alasan pembatalan (wajib diisi)"
              rows={3}
              className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setVoidTarget(null);
                  setReason("");
                  setError(null);
                }}
                className="min-h-[48px] flex-1 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)]"
              >
                Batal
              </button>
              <button
                onClick={handleVoid}
                disabled={isPending}
                className="min-h-[48px] flex-1 rounded-lg bg-[var(--color-danger)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
              >
                {isPending ? "Memproses..." : "Ya, batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {returnTarget && (
        <ReturnModal
          sale={returnTarget}
          onClose={() => setReturnTarget(null)}
          onSuccess={() => {
            setReturnTarget(null);
            showToast("Retur berhasil diproses, stok dikembalikan");
            router.refresh();
          }}
        />
      )}

      <Toast message={toastMessage} />
    </>
  );
}

function ReturnModal({
  sale,
  onClose,
  onSuccess,
}: {
  sale: SaleRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [qtyById, setQtyById] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const returnableItems = sale.items.filter((item) => item.qty > item.returnedQty);

  function handleSubmit() {
    if (!reason.trim()) {
      setError("Alasan retur wajib diisi.");
      return;
    }
    const items = returnableItems
      .map((item) => ({ saleItemId: item.id, qty: Number(qtyById[item.id] || 0) }))
      .filter((item) => item.qty > 0);

    if (items.length === 0) {
      setError("Isi jumlah retur untuk minimal satu item.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await processReturnAction(sale.id, items, reason.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-xl bg-[var(--color-bg)] p-5">
        <h2 className="text-base font-bold text-[var(--color-text)]">
          Retur sebagian — {sale.invoiceNumber}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Isi jumlah item yang mau diretur. Stok akan dikembalikan otomatis.
        </p>

        {error && (
          <div className="mt-3 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="mt-3 flex flex-col gap-3">
          {returnableItems.map((item) => {
            const sisa = item.qty - item.returnedQty;
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--color-surface)] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">{item.productName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Dibeli {item.qty}{item.returnedQty > 0 ? `, sudah diretur ${item.returnedQty}` : ""} · sisa bisa retur {sisa}
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={sisa}
                  inputMode="numeric"
                  value={qtyById[item.id] ?? ""}
                  onChange={(event) =>
                    setQtyById((prev) => ({ ...prev, [item.id]: event.target.value }))
                  }
                  placeholder="0"
                  className="h-10 w-16 shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-center text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            );
          })}
        </div>

        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Alasan retur (wajib diisi)"
          rows={3}
          className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="min-h-[48px] flex-1 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)]"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="min-h-[48px] flex-1 rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
          >
            {isPending ? "Memproses..." : "Proses retur"}
          </button>
        </div>
      </div>
    </div>
  );
}
