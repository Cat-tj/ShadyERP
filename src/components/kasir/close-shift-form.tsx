"use client";

import { useActionState, useState } from "react";
import { closeShiftAction, type CloseShiftResult } from "@/app/(app)/kasir/actions";
import { formatRupiah } from "@/lib/format";

const initialState: CloseShiftResult = {};

const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100];

const METHOD_LABEL: Record<string, string> = {
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
  DEPOSIT: "Saldo member",
  DEBIT_CARD: "Kartu debit",
  CREDIT_CARD: "Kartu kredit",
};

type MethodBreakdown = { method: string; amount: number; count: number };

export function CloseShiftForm({
  shiftId,
  outletName,
  openingCash,
  totalPenjualanCash,
  jumlahTransaksiCash,
  totalPenjualanDigital,
  jumlahTransaksiDigital,
  totalCashback,
  totalGesekTunai,
  totalTagihanGesekTunai,
  jumlahGesekTunai,
  digitalSalesByMethod,
  cashOutByMethod,
  totalRefundCash,
  totalRefundDigital,
  jumlahRetur,
}: {
  shiftId: string;
  outletName: string;
  openingCash: number;
  totalPenjualanCash: number;
  jumlahTransaksiCash: number;
  totalPenjualanDigital: number;
  jumlahTransaksiDigital: number;
  totalCashback: number;
  totalGesekTunai: number;
  totalTagihanGesekTunai: number;
  jumlahGesekTunai: number;
  digitalSalesByMethod: MethodBreakdown[];
  cashOutByMethod: MethodBreakdown[];
  totalRefundCash: number;
  totalRefundDigital: number;
  jumlahRetur: number;
}) {
  const [state, formAction, isPending] = useActionState(closeShiftAction, initialState);
  const [displayValue, setDisplayValue] = useState("Rp 0");
  const [rawCash, setRawCash] = useState(0);
  const [mode, setMode] = useState<"breakdown" | "manual">("breakdown");
  const [counts, setCounts] = useState<Record<number, string>>({});

  const formatNumber = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(clean));
  };

  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanNum = Number(rawValue.replace(/\D/g, ""));
    setRawCash(cleanNum);
    setDisplayValue(formatNumber(rawValue));
  };

  const breakdownTotal = DENOMINATIONS.reduce(
    (sum, denom) => sum + denom * (Number(counts[denom]) || 0),
    0
  );

  const handleCountChange = (denom: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    setCounts((prev) => ({ ...prev, [denom]: clean }));
  };

  const breakdownForSubmit = Object.fromEntries(
    DENOMINATIONS.filter((denom) => Number(counts[denom]) > 0).map((denom) => [
      String(denom),
      Number(counts[denom]),
    ])
  );

  const expectedCash = openingCash + totalPenjualanCash - totalCashback - totalGesekTunai - totalRefundCash;
  const expectedDigital = totalPenjualanDigital + totalTagihanGesekTunai - totalRefundDigital;

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h1 className="text-lg font-bold text-[var(--color-text)]">Tutup shift — {outletName}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Hitung hanya uang fisik di laci. QRIS, transfer, e-wallet, dan kartu dicatat terpisah sebagai digital.
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-lg bg-[var(--color-bg)] p-4 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Laci cash</p>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Modal awal</span>
            <span className="tabular-nums font-medium">{formatRupiah(openingCash)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Penjualan tunai ({jumlahTransaksiCash} transaksi)</span>
            <span className="tabular-nums font-medium">{formatRupiah(totalPenjualanCash)}</span>
          </div>
          {totalCashback > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Cashback</span>
              <span className="tabular-nums font-medium text-[var(--color-danger)]">
                -{formatRupiah(totalCashback)}
              </span>
            </div>
          )}
          {totalGesekTunai > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Cash keluar gesek tunai ({jumlahGesekTunai})</span>
              <span className="tabular-nums font-medium text-[var(--color-danger)]">
                -{formatRupiah(totalGesekTunai)}
              </span>
            </div>
          )}
          {totalRefundCash > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Cash keluar retur/refund ({jumlahRetur})</span>
              <span className="tabular-nums font-medium text-[var(--color-danger)]">
                -{formatRupiah(totalRefundCash)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
            <span className="font-semibold text-[var(--color-text)]">Harus ada di laci</span>
            <span className="tabular-nums font-bold text-[var(--color-text)]">{formatRupiah(expectedCash)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Digital / non-tunai</p>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Penjualan digital</span>
            <span className="tabular-nums font-medium">{jumlahTransaksiDigital} transaksi</span>
          </div>
          {digitalSalesByMethod.length === 0 && cashOutByMethod.length === 0 && totalRefundDigital === 0 ? (
            <p className="text-[var(--color-text-secondary)]">Belum ada transaksi digital di shift ini.</p>
          ) : (
            <>
              {digitalSalesByMethod.map((item) => (
                <div key={`sale-${item.method}`} className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    {METHOD_LABEL[item.method] ?? item.method} ({item.count})
                  </span>
                  <span className="tabular-nums font-medium">{formatRupiah(item.amount)}</span>
                </div>
              ))}
              {cashOutByMethod.map((item) => (
                <div key={`cashout-${item.method}`} className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Gesek tunai {METHOD_LABEL[item.method] ?? item.method} ({item.count})
                  </span>
                  <span className="tabular-nums font-medium">{formatRupiah(item.amount)}</span>
                </div>
              ))}
              {totalRefundDigital > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Retur/refund digital</span>
                  <span className="tabular-nums font-medium text-[var(--color-danger)]">
                    -{formatRupiah(totalRefundDigital)}
                  </span>
                </div>
              )}
            </>
          )}
          <div className="mt-auto flex justify-between border-t border-[var(--color-border)] pt-2">
            <span className="font-semibold text-[var(--color-text)]">Digital tercatat</span>
            <span className="tabular-nums font-bold text-[var(--color-text)]">{formatRupiah(expectedDigital)}</span>
          </div>
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Nominal ini tidak perlu ada di laci. Cocokkan dengan mutasi QRIS, bank, e-wallet, atau settlement provider.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-5 flex flex-col gap-4">
        <input type="hidden" name="shiftId" value={shiftId} />
        {state.error && (
          <div className="rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--color-text)]">Uang yang dihitung sekarang</label>
            <button
              type="button"
              onClick={() => setMode(mode === "breakdown" ? "manual" : "breakdown")}
              className="text-xs font-semibold text-[var(--color-primary)]"
            >
              {mode === "breakdown" ? "Isi total langsung" : "Pakai kalkulator pecahan uang"}
            </button>
          </div>

          {mode === "breakdown" ? (
            <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DENOMINATIONS.map((denom) => (
                  <div key={denom} className="flex flex-col gap-1 rounded-md bg-[var(--color-surface)] p-2">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      {formatRupiah(denom)}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={counts[denom] ?? ""}
                      onChange={(e) => handleCountChange(denom, e.target.value)}
                      placeholder="0"
                      className="min-h-[38px] rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-sm">
                <span className="font-semibold text-[var(--color-text)]">Total hitungan</span>
                <span className="tabular-nums font-bold text-[var(--color-text)]">
                  {formatRupiah(breakdownTotal)}
                </span>
              </div>
              <input type="hidden" name="closingCash" value={breakdownTotal} />
              <input type="hidden" name="closingCashBreakdown" value={JSON.stringify(breakdownForSubmit)} />
            </div>
          ) : (
            <input
              id="displayClosingCash"
              type="text"
              inputMode="numeric"
              required
              value={displayValue}
              onChange={handleCashChange}
              placeholder="Rp 0"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          )}
          {mode === "manual" && <input type="hidden" name="closingCash" value={rawCash} />}
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
