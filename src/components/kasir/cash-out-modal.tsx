"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { createCashOutAction } from "@/app/(app)/kasir/actions";
import { compressImageFile } from "@/lib/compress-image";
import { formatRupiah } from "@/lib/format";
import { Toast, useToast } from "@/components/toast";
import { CameraIcon } from "@/components/ui/icons";
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
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState<string | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelected(file: File) {
    setIsCapturingPhoto(true);
    try {
      const url = await compressImageFile(file);
      setReceiptPhotoUrl(url);
    } catch {
      setError("Gagal memproses foto struk.");
    } finally {
      setIsCapturingPhoto(false);
    }
  }

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
    if (!note.trim() && !receiptPhotoUrl) {
      setError("Isi catatan atau foto struk sebagai bukti transaksi ini.");
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
        receiptPhotoUrl: receiptPhotoUrl ?? undefined,
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
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto scrollbar-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)]">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-b border-[var(--color-border)]/50">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">Gesek tunai</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Catat cash keluar dari laci dan total dibayar customer via non-tunai.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
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
              Catatan (wajib isi ini atau foto struk)
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="mis. nomor approval mesin EDC"
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            <div className="sm:col-span-2">
              <span className="text-sm font-medium text-[var(--color-text)]">Foto struk (wajib isi ini atau catatan)</span>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handlePhotoSelected(file);
                }}
              />
              {receiptPhotoUrl ? (
                <div className="mt-1 flex items-center gap-3">
                  <img src={receiptPhotoUrl} alt="Foto struk" className="h-16 w-16 rounded-lg border border-[var(--color-border)] object-cover" />
                  <button
                    type="button"
                    onClick={() => setReceiptPhotoUrl(null)}
                    className="text-xs font-semibold text-[var(--color-danger)]"
                  >
                    Hapus foto
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isCapturingPhoto}
                  className="mt-1 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] disabled:opacity-60"
                >
                  <CameraIcon aria-hidden className="h-4 w-4" />
                  {isCapturingPhoto ? "Memproses foto..." : "Ambil foto struk"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
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

          </div>

          <div className="sticky bottom-0 z-10 flex gap-3 bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-t border-[var(--color-border)]/50">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] flex-1 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
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
