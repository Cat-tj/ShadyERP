"use client";

import { useMemo, useState, useTransition } from "react";
import { createCashOutAction } from "@/app/(app)/kasir/actions";
import { formatRupiah } from "@/lib/format";
import { Toast, useToast } from "@/components/toast";
import type { CashOutMethod } from "@prisma/client";

const METHOD_OPTIONS: { value: CashOutMethod; label: string }[] = [
  { value: "DEBIT_CARD", label: "Kartu debit" },
  { value: "CREDIT_CARD", label: "Kartu kredit" },
  { value: "QRIS", label: "QRIS" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "EWALLET", label: "E-Wallet" },
];

export function CashOutModal({ onClose }: { onClose: () => void }) {
  const { toastMessage, showToast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("100000");
  const [adminFee, setAdminFee] = useState("5000");
  const [method, setMethod] = useState<CashOutMethod>("DEBIT_CARD");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const withdraw = Number(withdrawAmount || 0);
    const fee = Number(adminFee || 0);
    return {
      withdraw: Number.isFinite(withdraw) ? Math.max(0, Math.round(withdraw)) : 0,
      fee: Number.isFinite(fee) ? Math.max(0, Math.round(fee)) : 0,
    };
  }, [adminFee, withdrawAmount]);

  const totalCharged = totals.withdraw + totals.fee;

  function submit() {
    if (totals.withdraw <= 0) {
      setError("Nominal cash yang diberikan wajib lebih dari 0.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await createCashOutAction({
        customerName,
        customerPhone,
        withdrawAmount: totals.withdraw,
        adminFee: totals.fee,
        method,
        note,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast(`Gesek tunai tersimpan: ${result.referenceNumber}`);
      window.setTimeout(onClose, 550);
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">Gesek tunai</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Catat cash yang keluar dari laci dan total yang dibayar customer via non-tunai.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-xl leading-none text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
              aria-label="Tutup"
            >
              x
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
              {error}
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-[var(--color-text)]">
              Nama customer
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Opsional"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            <label className="text-sm font-medium text-[var(--color-text)]">
              No. HP
              <input
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Opsional"
                inputMode="tel"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            <label className="text-sm font-medium text-[var(--color-text)]">
              Cash diberikan
              <input
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                inputMode="numeric"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            <label className="text-sm font-medium text-[var(--color-text)]">
              Admin fee
              <input
                value={adminFee}
                onChange={(event) => setAdminFee(event.target.value)}
                inputMode="numeric"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            <label className="text-sm font-medium text-[var(--color-text)] sm:col-span-2">
              Metode bayar customer
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value as CashOutMethod)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-[var(--color-text)] sm:col-span-2">
              Catatan
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="Opsional, mis. nomor approval mesin EDC"
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[var(--color-text-secondary)]">Cash keluar dari laci</span>
              <span className="font-semibold tabular-nums text-[var(--color-danger)]">
                -{formatRupiah(totals.withdraw)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-[var(--color-text-secondary)]">Admin fee</span>
              <span className="font-semibold tabular-nums text-[var(--color-text)]">
                {formatRupiah(totals.fee)}
              </span>
            </div>
            <div className="mt-3 border-t border-[var(--color-border)] pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[var(--color-text)]">Customer bayar</span>
                <span className="text-lg font-bold tabular-nums text-[var(--color-primary)]">
                  {formatRupiah(totalCharged)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] flex-1 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending}
              className="min-h-[48px] flex-1 rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} />
    </>
  );
}
