import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import {
  getSalesSummary,
  getDailyTrend,
  getTopProducts,
  getOutletComparison,
} from "@/server/services/report-service";
import { StatTile } from "@/components/laporan/stat-tile";
import { TrendBarChart } from "@/components/laporan/trend-bar-chart";
import { RankingBarChart } from "@/components/laporan/ranking-bar-chart";
import { PeriodFilter } from "@/components/laporan/period-filter";
import { formatRupiah } from "@/lib/format";
import {
  WalletIcon,
  ReceiptIcon,
  BarChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "@/components/ui/icons";

const VALID_DAYS = [7, 30, 90];

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const { days: daysParam } = await searchParams;
  const days = VALID_DAYS.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((o) => o.id);

  const [summary, trend, topProducts, outletComparison] = await Promise.all([
    getSalesSummary(user.tenantId, outletIds, days),
    getDailyTrend(user.tenantId, outletIds, days),
    getTopProducts(user.tenantId, outletIds, days),
    getOutletComparison(user.tenantId, outletIds, days),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Laporan</h1>
        <div className="flex items-center gap-2">
          <PeriodFilter activeDays={days} />
          <a
            href={`/api/export/laporan?days=${days}`}
            className="flex min-h-[40px] items-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            Ekspor CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label={`Omzet ${days} hari`} value={formatRupiah(summary.totalOmzet)} icon={WalletIcon} />
        <StatTile label="Jumlah transaksi" value={String(summary.totalTransaksi)} icon={ReceiptIcon} />
        <StatTile label="Rata-rata per transaksi" value={formatRupiah(summary.rataRataTransaksi)} icon={BarChartIcon} />
        <StatTile label="Estimasi untung kotor" value={formatRupiah(summary.estimasiUntung)} icon={TrendingUpIcon} />
        <StatTile label="Pengeluaran operasional" value={formatRupiah(summary.totalExpense)} icon={TrendingDownIcon} />
        <StatTile label="Estimasi untung bersih" value={formatRupiah(summary.untungBersih)} icon={TrendingUpIcon} />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Tren omzet</h2>
        <TrendBarChart data={trend} />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Produk terlaris</h2>
        <RankingBarChart
          items={topProducts.map((p) => ({
            label: p.productName,
            value: p.omzet,
            sublabel: `${p.qty} terjual`,
          }))}
        />
      </div>

      {outletComparison.length > 1 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Perbandingan outlet</h2>
          <RankingBarChart
            items={outletComparison.map((o) => ({
              label: o.outletName,
              value: o.omzet,
              sublabel: `${o.transaksi} transaksi`,
            }))}
          />
        </div>
      )}
    </div>
  );
}
