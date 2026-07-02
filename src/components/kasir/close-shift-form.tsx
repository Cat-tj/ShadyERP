"use client";

import { useActionState } from "react";
import { closeShiftAction, type CloseShiftResult } from "@/app/(app)/kasir/actions";
import { formatRupiah } from "@/lib/format";

const initialState: CloseShiftResult = {};

export function CloseShiftForm({
  shiftId,
  outletName,
  openingCash,
  totalPenjualanCash,
  jumlahTransaksiCash,
}: {
  shiftId: string;
  outletName: string;
  openingCash: number;
  totalPenjualanCash: number;
  jumlahTransaksiCash: number;
}) {
  const [state, formAction, isPending] = useActionState(closeShiftAction, initialState);
  const expectedCash = openingCash + totalPenjualanCash;

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h1 className="text-lg font-bold text-[var(--color-text)]">Tutup shift — {outletName}</h1>

      <div className="mt-4 flex flex-col gap-2 rounded-lg bg-[var(--color-bg)] p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Modal awal</span>
          <span className="tabular-nums font-medium">{formatRupiah(openingCash)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Penjualan tunai ({jumlahTransaksiCash} transaksi)</span>
          <span className="tabular-nums font-medium">{formatRupiah(totalPenjualanCash)}</span>
        </div>
        <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
          <span className="font-semibold text-[var(--color-text)]">Uang seharusnya di laci</span>
          <span className="tabular-nums font-bold text-[var(--color-text)]">{formatRupiah(expectedCash)}</span>
        </div>
      </div>

      <form action={formAction} className="mt-5 flex flex-col gap-4">
        <input type="hidden" name="shiftId" value={shiftId} />
        {state.error && (
          <div className="rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="closingCash" className="text-sm font-medium text-[var(--color-text)]">
            Uang yang dihitung sekarang
          </label>
          <input
            id="closingCash"
            name="closingCash"
            type="number"
            inputMode="numeric"
            min={0}
            required
            placeholder="0"
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-danger)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Menutup shift..." : "Tutup shift"}
        </button>
      </form>
    </div>
  );
}
