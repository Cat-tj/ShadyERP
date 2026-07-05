import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getCashOutletSummary } from "@/server/services/finance-operational-service";
import { PeriodFilter } from "@/components/laporan/period-filter";
import { StatTile } from "@/components/laporan/stat-tile";
import { formatRupiah } from "@/lib/format";
import { WalletIcon, TrendingUpIcon, TrendingDownIcon, BarChartIcon } from "@/components/ui/icons";

const VALID_DAYS = [7, 30, 90];

export default async function KasOutletPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const { days: daysParam } = await searchParams;
  const days = VALID_DAYS.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((outlet) => outlet.id);
  const cashOutlets = await getCashOutletSummary(user.tenantId, outletIds, days);

  const totals = cashOutlets.reduce(
    (sum, outlet) => ({
      openingCash: sum.openingCash + outlet.openingCash,
      cashSales: sum.cashSales + outlet.cashSales,
      expenses: sum.expenses + outlet.expenses,
      estimatedCash: sum.estimatedCash + outlet.estimatedCash,
      discrepancy: sum.discrepancy + outlet.discrepancy,
    }),
    { openingCash: 0, cashSales: 0, expenses: 0, estimatedCash: 0, discrepancy: 0 }
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Kas Outlet</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Ringkasan kas tunai dari shift, penjualan tunai, dan pengeluaran.
          </p>
        </div>
        <PeriodFilter activeDays={days} basePath="/finance/kas" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Modal kas shift" value={formatRupiah(totals.openingCash)} icon={WalletIcon} />
        <StatTile label="Penjualan tunai" value={formatRupiah(totals.cashSales)} icon={TrendingUpIcon} />
        <StatTile label="Pengeluaran" value={formatRupiah(totals.expenses)} icon={TrendingDownIcon} />
        <StatTile label="Estimasi kas" value={formatRupiah(totals.estimatedCash)} icon={BarChartIcon} />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {cashOutlets.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-text-secondary)]">Belum ada outlet yang bisa ditampilkan.</p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {cashOutlets.map((outlet) => (
              <div key={outlet.outletId} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_2fr]">
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{outlet.outletName}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {outlet.openShiftCount} shift buka · {outlet.closedShiftCount} shift tutup ·{" "}
                    {outlet.cashTransactionCount} transaksi tunai
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <Metric label="Modal" value={formatRupiah(outlet.openingCash)} />
                  <Metric label="Tunai masuk" value={formatRupiah(outlet.cashSales)} />
                  <Metric label="Keluar" value={formatRupiah(outlet.expenses)} />
                  <Metric label="Estimasi" value={formatRupiah(outlet.estimatedCash)} strong />
                  {outlet.closedShiftCount > 0 && (
                    <Metric
                      label="Selisih tutup"
                      value={formatRupiah(outlet.discrepancy)}
                      tone={outlet.discrepancy === 0 ? "neutral" : outlet.discrepancy > 0 ? "good" : "bad"}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        Estimasi kas ini belum menggantikan buku kas/bank formal. Angka dihitung dari modal shift,
        transaksi tunai, dan pengeluaran yang dicatat di periode ini.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  strong,
  tone = "neutral",
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "neutral" | "good" | "bad";
}) {
  const toneClass =
    tone === "good" ? "text-green-600" : tone === "bad" ? "text-red-600" : "text-[var(--color-text)]";
  return (
    <div>
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      <p className={`mt-1 font-mono-data tabular-nums leading-tight ${strong ? "font-bold" : "font-semibold"} ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}
