import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/require-session";
import { getShiftSummary } from "@/server/services/shift-service";
import { formatRupiah } from "@/lib/format";
import { CheckCircleIcon, AlertTriangleIcon } from "@/components/ui/icons";

const METHOD_LABEL: Record<string, string> = {
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
  DEPOSIT: "Saldo member",
  DEBIT_CARD: "Kartu debit",
  CREDIT_CARD: "Kartu kredit",
};

export default async function ShiftSelesaiPage({
  params,
}: {
  params: Promise<{ shiftId: string }>;
}) {
  const { shiftId } = await params;
  const user = await requireSession();
  const summary = await getShiftSummary(user.tenantId, shiftId);

  if (!summary || summary.shift.status !== "CLOSED") {
    notFound();
  }

  const { shift } = summary;
  const expectedCash = shift.expectedCash ?? 0;
  const closingCash = shift.closingCash ?? 0;
  const selisih = closingCash - expectedCash;
  const isPas = selisih === 0;
  const expectedDigital = summary.totalPenjualanDigital + summary.totalTagihanGesekTunai - summary.totalRefundDigital;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
          {isPas ? <CheckCircleIcon aria-hidden className="h-6 w-6" /> : <AlertTriangleIcon aria-hidden className="h-6 w-6" />}
        </div>
        <h1 className="mt-3 text-lg font-bold text-[var(--color-text)]">Shift ditutup</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{shift.outlet.name}</p>

        <div className="mt-4 grid gap-3 text-left text-sm lg:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-lg bg-[var(--color-bg)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Laci cash</p>
            {summary.jumlahGesekTunai > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">
                  Cash keluar gesek tunai ({summary.jumlahGesekTunai})
                </span>
                <span className="tabular-nums font-medium text-[var(--color-danger)]">
                  -{formatRupiah(summary.totalGesekTunai)}
                </span>
              </div>
            )}
            {summary.totalRefundCash > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">
                  Cash keluar retur/refund ({summary.jumlahRetur})
                </span>
                <span className="tabular-nums font-medium text-[var(--color-danger)]">
                  -{formatRupiah(summary.totalRefundCash)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Uang seharusnya</span>
              <span className="tabular-nums font-medium">{formatRupiah(expectedCash)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Uang dihitung</span>
              <span className="tabular-nums font-medium">{formatRupiah(closingCash)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
              <span className="font-semibold text-[var(--color-text)]">Selisih cash</span>
              <span
                className={`tabular-nums font-bold ${
                  isPas ? "text-[var(--color-text)]" : "text-[var(--color-danger)]"
                }`}
              >
                {selisih > 0 ? "+" : ""}
                {formatRupiah(selisih)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Digital / non-tunai</p>
            {summary.digitalSalesByMethod.length === 0 && summary.cashOutByMethod.length === 0 && summary.totalRefundDigital === 0 ? (
              <p className="text-[var(--color-text-secondary)]">Tidak ada transaksi digital.</p>
            ) : (
              <>
                {summary.digitalSalesByMethod.map((item) => (
                  <div key={`sale-${item.method}`} className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      {METHOD_LABEL[item.method] ?? item.method} ({item.count})
                    </span>
                    <span className="tabular-nums font-medium">{formatRupiah(item.amount)}</span>
                  </div>
                ))}
                {summary.cashOutByMethod.map((item) => (
                  <div key={`cashout-${item.method}`} className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      Gesek tunai {METHOD_LABEL[item.method] ?? item.method} ({item.count})
                    </span>
                    <span className="tabular-nums font-medium">{formatRupiah(item.amount)}</span>
                  </div>
                ))}
                {summary.totalRefundDigital > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      Retur/refund digital
                    </span>
                    <span className="tabular-nums font-medium text-[var(--color-danger)]">
                      -{formatRupiah(summary.totalRefundDigital)}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="mt-auto flex justify-between border-t border-[var(--color-border)] pt-2">
              <span className="font-semibold text-[var(--color-text)]">Digital tercatat</span>
              <span className="tabular-nums font-bold text-[var(--color-text)]">{formatRupiah(expectedDigital)}</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          {isPas
            ? "Uangnya pas, terima kasih sudah menghitung dengan teliti."
            : selisih > 0
              ? "Uang di laci lebih banyak dari catatan. Coba periksa lagi hitungannya."
              : "Uang di laci kurang dari catatan. Coba periksa lagi hitungannya."}
        </p>

        {shift.varianceNote && (
          <div className="mt-3 rounded-lg bg-[var(--color-warning-bg)] p-3 text-left text-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-warning-text)]">
              Catatan alasan selisih
            </p>
            <p className="mt-1 text-[var(--color-text)]">{shift.varianceNote}</p>
          </div>
        )}

        <Link
          href="/kasir"
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)]"
        >
          Kembali ke kasir
        </Link>
      </div>
    </div>
  );
}
