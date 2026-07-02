"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, formatJam, formatTanggal } from "@/lib/format";
import { voidSaleAction } from "@/app/(app)/kasir/riwayat/actions";
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
              <div className="mt-2 flex gap-2">
                <a
                  href={`/kasir/struk/${sale.id}`}
                  className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                >
                  Lihat struk
                </a>
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

      <Toast message={toastMessage} />
    </>
  );
}
