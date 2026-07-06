import { requireRole } from "@/server/require-session";
import {
  getProfitAndLoss,
  getProfitByCategory,
  getCashFlowTrend,
  getFinancialRatios,
  getExpenseSummary,
} from "@/server/services/finance-analytics-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getProductSalesPerformance } from "@/server/services/report-service";
import { StatTile } from "@/components/laporan/stat-tile";
import { RankingBarChart } from "@/components/laporan/ranking-bar-chart";
import { formatRupiah } from "@/lib/format";
import { WalletIcon, TrendingUpIcon, TrendingDownIcon, BarChartIcon } from "@/components/ui/icons";

type ProductSalesRow = {
  productId: string;
  productName: string;
  categoryName: string;
  qty: number;
  omzet: number;
  stockQty: number;
  trackStock: boolean;
};

function ProductSalesTable({ title, hint, items }: { title: string; hint: string; items: ProductSalesRow[] }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[var(--color-text)]">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">{hint}</p>
      </div>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
          Belum ada produk untuk dianalisis.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-2 pr-3 font-semibold">Produk</th>
                <th className="py-2 px-3 font-semibold">Kategori</th>
                <th className="py-2 px-3 text-right font-semibold">Terjual</th>
                <th className="py-2 px-3 text-right font-semibold">Omzet</th>
                <th className="py-2 pl-3 text-right font-semibold">Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <tr key={item.productId}>
                  <td className="max-w-52 py-3 pr-3">
                    <p className="truncate font-semibold text-[var(--color-text)]">{item.productName}</p>
                  </td>
                  <td className="py-3 px-3 text-xs text-[var(--color-text-secondary)]">{item.categoryName}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-[var(--color-text)]">
                    {item.qty}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[var(--color-text)]">
                    {formatRupiah(item.omzet)}
                  </td>
                  <td className="py-3 pl-3 text-right tabular-nums text-[var(--color-text-secondary)]">
                    {item.trackStock ? item.stockQty : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function FinanceAnalitikPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((outlet) => outlet.id);

  const [pnl, profitByCategory, cashFlow, ratios, expenseSummary, productSales] = await Promise.all([
    getProfitAndLoss(user.tenantId),
    getProfitByCategory(user.tenantId),
    getCashFlowTrend(user.tenantId, undefined, 6),
    getFinancialRatios(user.tenantId),
    getExpenseSummary(user.tenantId, undefined, 30),
    getProductSalesPerformance(user.tenantId, outletIds, 30, 10),
  ]);

  const maxCashFlow = Math.max(1, ...cashFlow.map((c) => Math.max(c.cashIn, c.cashOut)));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Analitik Keuangan</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Laba rugi, arus kas, dan rasio keuangan bulan {pnl.period}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Omzet bulan ini" value={formatRupiah(pnl.revenue)} icon={WalletIcon} />
        <StatTile label="Laba kotor" value={formatRupiah(pnl.grossProfit)} icon={TrendingUpIcon} />
        <StatTile label="Beban operasional" value={formatRupiah(pnl.operatingExpenses)} icon={TrendingDownIcon} />
        <StatTile label="Laba bersih" value={formatRupiah(pnl.netIncome)} icon={BarChartIcon} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Margin kotor" value={`${pnl.grossMargin}%`} icon={TrendingUpIcon} />
        <StatTile label="Margin bersih" value={`${pnl.netMargin}%`} icon={TrendingUpIcon} />
        <StatTile label="Rasio beban" value={`${ratios.expenseRatio}%`} icon={TrendingDownIcon} />
        <StatTile
          label="Pertumbuhan bulanan"
          value={`${ratios.monthlyGrowth > 0 ? "+" : ""}${ratios.monthlyGrowth}%`}
          icon={ratios.monthlyGrowth >= 0 ? TrendingUpIcon : TrendingDownIcon}
        />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-base font-bold text-[var(--color-text)]">Arus kas 6 bulan terakhir</h2>
        <div className="flex flex-col gap-3">
          {cashFlow.map((c) => (
            <div key={c.month}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-medium text-[var(--color-text)]">{c.month}</span>
                <span
                  className={`tabular-nums font-semibold ${c.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {c.netCashFlow >= 0 ? "+" : ""}
                  {formatRupiah(c.netCashFlow)}
                </span>
              </div>
              <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-[var(--color-bg)]">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${Math.max(1, (c.cashIn / maxCashFlow) * 50)}%` }}
                  title={`Masuk: ${formatRupiah(c.cashIn)}`}
                />
                <div
                  className="h-full rounded-full bg-red-400"
                  style={{ width: `${Math.max(1, (c.cashOut / maxCashFlow) * 50)}%` }}
                  title={`Keluar: ${formatRupiah(c.cashOut)}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Laba per kategori produk</h2>
        <RankingBarChart
          items={profitByCategory.map((c) => ({
            label: c.categoryName,
            value: c.grossProfit,
            sublabel: `Margin ${c.margin}% · ${c.qtySold} terjual`,
          }))}
        />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Pengeluaran per kategori (30 hari)</h2>
        <RankingBarChart
          items={expenseSummary.map((e) => ({
            label: e.category,
            value: e.amount,
            sublabel: `${e.percentage}% dari total · ${e.count}x`,
          }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProductSalesTable
          title="Top sale produk (30 hari)"
          hint="Produk paling sering dibeli. Pakai ini untuk siapin stok bahan yang bergerak cepat."
          items={productSales.topSales}
        />
        <ProductSalesTable
          title="Worst sale produk (30 hari)"
          hint="Produk paling lambat bergerak, termasuk yang belum terjual. Cocok untuk evaluasi menu dan promo."
          items={productSales.worstSales}
        />
      </div>
    </div>
  );
}
