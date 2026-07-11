"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { sellGiftCardAction, voidGiftCardAction } from "@/app/(app)/voucher/actions";
import { useToast, Toast } from "@/components/toast";

export type GiftCardRow = {
  id: string;
  code: string;
  initialValue: number;
  balance: number;
  status: string;
  buyerName: string | null;
  buyerPhone: string | null;
  soldByName: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif",
  REDEEMED: "Sudah habis dipakai",
  VOIDED: "Dibatalkan",
};

export function VoucherManager({ giftCards, canVoid }: { giftCards: GiftCardRow[]; canVoid: boolean }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastSoldCode, setLastSoldCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function sell() {
    setError(null);
    setLastSoldCode(null);
    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Nilai voucher tidak valid.");
      return;
    }
    startTransition(async () => {
      const result = await sellGiftCardAction({
        amount: amountNumber,
        buyerName: buyerName.trim() || undefined,
        buyerPhone: buyerPhone.trim() || undefined,
        note: note.trim() || undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setLastSoldCode(result.code ?? null);
      setAmount("");
      setBuyerName("");
      setBuyerPhone("");
      setNote("");
      router.refresh();
    });
  }

  function voidCard(giftCardId: string) {
    const reason = window.prompt("Alasan pembatalan voucher ini?");
    if (!reason?.trim()) return;
    startTransition(async () => {
      const result = await voidGiftCardAction(giftCardId, reason.trim());
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Voucher dibatalkan");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Voucher / Gift Card</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Jual voucher senilai tertentu di muka — pelanggan bisa tukar kodenya sebagai metode bayar saat checkout
          di kasir.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        {error && (
          <div className="mb-3 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}
        {lastSoldCode && (
          <div className="mb-3 rounded-lg bg-[var(--color-good-bg)] px-4 py-3 text-sm text-[var(--color-good-text)]">
            Voucher berhasil dibuat — kode: <span className="font-mono font-bold">{lastSoldCode}</span>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nilai voucher (Rp)</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="mis. 100000"
              className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama pembeli (opsional)</label>
            <input
              value={buyerName}
              onChange={(event) => setBuyerName(event.target.value)}
              className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nomor HP pembeli (opsional)</label>
            <input
              value={buyerPhone}
              onChange={(event) => setBuyerPhone(event.target.value)}
              className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Catatan (opsional)</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        <button
          onClick={sell}
          disabled={isPending}
          className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {isPending ? "Menyimpan..." : "Jual voucher"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <p className="border-b border-[var(--color-border)] px-4 py-3 text-sm font-bold text-[var(--color-text)]">
          Daftar voucher
        </p>
        {giftCards.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada voucher terjual.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {giftCards.map((gc) => (
              <div key={gc.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-mono font-bold text-[var(--color-text)]">{gc.code}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {gc.buyerName ?? "Tanpa nama"} · dijual oleh {gc.soldByName} ·{" "}
                    {formatTanggalPendek(gc.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="tabular-nums font-semibold text-[var(--color-text)]">
                      {formatRupiah(gc.balance)} / {formatRupiah(gc.initialValue)}
                    </p>
                    <p
                      className={`text-xs ${
                        gc.status === "ACTIVE"
                          ? "text-[var(--color-good-text)]"
                          : gc.status === "VOIDED"
                            ? "text-[var(--color-danger)]"
                            : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {STATUS_LABEL[gc.status] ?? gc.status}
                    </p>
                  </div>
                  {canVoid && gc.status === "ACTIVE" && (
                    <button
                      onClick={() => voidCard(gc.id)}
                      disabled={isPending}
                      className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-surface)] disabled:opacity-40"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
