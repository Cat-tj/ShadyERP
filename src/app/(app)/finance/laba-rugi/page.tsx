import { requireRole } from "@/server/require-session";
import { getProfitAndLoss, getProfitByCategory, getExpenseSummary } from "@/server/services/finance-analytics-service";
import { ProfitLossSummary } from "@/components/finance/profit-loss-summary";
import { RankingBarChart } from "@/components/laporan/ranking-bar-chart";
import { StatTile } from "@/components/laporan/stat-tile";
import { formatRupiah } from "@/lib/format";
import { WalletIcon, TrendingDownIcon, TrendingUpIcon, BarChartIcon } from "@/components/ui/icons";

export default async function LabaRugiPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const [pnl, profitByCategory, expenseSummary] = await Promise.all([
    getProfitAndLoss(user.tenantId),
    getProfitByCategory(user.tenantId),
    getExpenseSummary(user.tenantId, undefined, 30),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Laba Rugi Simple</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ringkasan omzet, HPP estimasi, pengeluaran, dan laba bersih bulan {pnl.period}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Omzet bulan ini" value={formatRupiah(pnl.revenue)} icon={WalletIcon} />
        <StatTile label="Laba kotor" value={formatRupiah(pnl.grossProfit)} icon={TrendingUpIcon} />
        <StatTile label="Pengeluaran" value={formatRupiah(pnl.operatingExpenses)} icon={TrendingDownIcon} />
        <StatTile label="Laba bersih" value={formatRupiah(pnl.netIncome)} icon={BarChartIcon} />
      </div>

      <ProfitLossSummary
        period={pnl.period}
        revenue={pnl.revenue}
        cogs={pnl.cogs}
        grossProfit={pnl.grossProfit}
        grossMargin={pnl.grossMargin}
        operatingExpenses={pnl.operatingExpenses}
        netIncome={pnl.netIncome}
        netMargin={pnl.netMargin}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Laba per kategori produk</h2>
          <RankingBarChart
            items={profitByCategory.map((category) => ({
              label: category.categoryName,
              value: category.grossProfit,
              sublabel: `Margin ${category.margin}% · ${category.qtySold} terjual`,
            }))}
          />
        </section>

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Pengeluaran 30 hari</h2>
          <RankingBarChart
            items={expenseSummary.map((expense) => ({
              label: expense.category,
              value: expense.amount,
              sublabel: `${expense.percentage}% dari total · ${expense.count}x`,
            }))}
          />
        </section>
      </div>

      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        Catatan: HPP masih estimasi dari modal produk. Untuk cafe yang memakai resep bahan baku,
        akurasi margin akan naik setelah Inventory v2 punya bahan baku dan resep.
      </p>
    </div>
  );
}
