import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import {
  getSalesVelocityByHour,
  getStockTurnoverByProduct,
  getMemberRetentionRate,
  getRevenueByCategory,
  getTopProductsByRevenue,
  getOutletComparison,
  getSplitPaymentUsage,
  getFavoriteAttributionStats,
  getRevenueByOutletType,
} from "@/server/services/kpi-service";
import { getFrequentlyUnavailableProducts } from "@/server/services/product-service";
import { StatTile } from "@/components/laporan/stat-tile";
import { RankingBarChart } from "@/components/laporan/ranking-bar-chart";
import { formatRupiah } from "@/lib/format";
import { UsersIcon, TrendingUpIcon, PackageIcon, BarChartIcon } from "@/components/ui/icons";

const METHOD_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
  DEPOSIT: "Saldo",
  GIFT_CARD: "Voucher",
};

const OUTLET_TYPE_LABEL: Record<string, string> = {
  PERMANENT: "Cabang tetap",
  POPUP: "Pop-up",
  EVENT: "Event",
};

export default async function KpiAnalitikPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const primaryOutletId = outlets[0]?.id;

  const [velocity, retention, revenueByCategory, topProducts, outletComparison, stockTurnover, splitPaymentUsage, frequentlyUnavailable, favoriteAttribution, revenueByOutletType] = await Promise.all([
    getSalesVelocityByHour(user.tenantId),
    getMemberRetentionRate(user.tenantId, 30),
    getRevenueByCategory(user.tenantId, undefined, 30),
    getTopProductsByRevenue(user.tenantId, undefined, 10, 30),
    getOutletComparison(user.tenantId, 30),
    primaryOutletId ? getStockTurnoverByProduct(user.tenantId, primaryOutletId, 30) : Promise.resolve([]),
    getSplitPaymentUsage(user.tenantId, 30),
    getFrequentlyUnavailableProducts(user.tenantId, outlets.map((o) => o.id), 30),
    getFavoriteAttributionStats(user.tenantId, 30),
    getRevenueByOutletType(user.tenantId, 30),
  ]);

  const peakHour = velocity.reduce((best, h) => (h.sales > best.sales ? h : best), velocity[0]);
  const activeHours = velocity.filter((h) => h.count > 0);
  const maxHourSales = Math.max(1, ...velocity.map((h) => h.sales));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Analitik Lanjutan</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Peak hours, produk terlaris, dan retensi member.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Jam tersibuk hari ini"
          value={peakHour && peakHour.sales > 0 ? `${String(peakHour.hour).padStart(2, "0")}.00` : "-"}
          icon={BarChartIcon}
        />
        <StatTile label="Retensi member" value={`${retention.retentionRate}%`} icon={UsersIcon} />
        <StatTile label="Member aktif (30 hari)" value={String(retention.activeMembers)} icon={UsersIcon} />
        <StatTile label="Total member" value={String(retention.totalMembers)} icon={UsersIcon} />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-base font-bold text-[var(--color-text)]">Omzet per jam hari ini</h2>
        {activeHours.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">Belum ada transaksi hari ini.</p>
        ) : (
          <div className="flex h-32 items-end gap-0.5">
            {velocity.map((h) => (
              <div key={h.hour} className="group relative flex-1">
                <div
                  className="w-full rounded-t bg-[var(--color-primary)] transition-opacity group-hover:opacity-80"
                  style={{ height: `${Math.max(2, (h.sales / maxHourSales) * 100)}%` }}
                  title={`${String(h.hour).padStart(2, "0")}.00 — ${formatRupiah(h.sales)}`}
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-1 flex text-[10px] text-[var(--color-text-secondary)]">
          {velocity.map((h) => (
            <div key={h.hour} className="flex-1 text-center">
              {h.hour % 6 === 0 ? h.hour : ""}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Produk terlaris (30 hari)</h2>
        <RankingBarChart
          items={topProducts.map((p) => ({
            label: p.productName ?? "Produk dihapus",
            value: p.revenue,
            sublabel: `${p.qtySold} terjual · rata-rata ${formatRupiah(p.avgPrice)}`,
          }))}
        />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Omzet per kategori (30 hari)</h2>
        <RankingBarChart
          items={revenueByCategory.map((c) => ({
            label: c.categoryName,
            value: c.revenue,
            sublabel: `${c.qtySold} terjual`,
          }))}
        />
      </div>

      {stockTurnover.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <PackageIcon aria-hidden className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-base font-bold text-[var(--color-text)]">Perputaran stok — {outlets[0]?.name}</h2>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {stockTurnover.slice(0, 10).map((item) => (
              <div key={item.productId} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--color-text)]">{item.productName ?? "Produk dihapus"}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Terjual {item.qtySold} · Sisa stok {item.currentStock}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums font-semibold text-[var(--color-text)]">
                  {item.turnoverRate}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {outletComparison.length > 1 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Perbandingan outlet (30 hari)</h2>
          <RankingBarChart
            items={outletComparison.map((o) => ({
              label: o.outletName,
              value: o.revenue,
              sublabel: `${o.outletType !== "PERMANENT" ? `${OUTLET_TYPE_LABEL[o.outletType]} · ` : ""}${o.transactionCount} transaksi · rata-rata ${formatRupiah(o.avgTransaction)}`,
            }))}
          />
        </div>
      )}

      {revenueByOutletType.length > 1 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Omzet per jenis outlet (30 hari)</h2>
          <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
            Bandingin kontribusi cabang tetap vs pop-up vs event.
          </p>
          <RankingBarChart
            items={revenueByOutletType.map((item) => ({
              label: OUTLET_TYPE_LABEL[item.outletType] ?? item.outletType,
              value: item.revenue,
              sublabel: `${item.outletCount} outlet · ${item.transactionCount} transaksi`,
            }))}
          />
        </div>
      )}

      {frequentlyUnavailable.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Produk sering habis (30 hari)</h2>
          <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
            Produk yang otomatis disembunyikan dari kasir karena bahan resepnya habis, minimal 3 hari berbeda.
          </p>
          <div className="divide-y divide-[var(--color-border)]">
            {frequentlyUnavailable.slice(0, 10).map((item) => (
              <div key={item.productId} className="flex items-center justify-between py-2 text-sm">
                <p className="truncate font-medium text-[var(--color-text)]">{item.productName}</p>
                <span className="shrink-0 tabular-nums font-semibold text-[var(--color-danger)]">
                  {item.daysUnavailable} hari
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {splitPaymentUsage.splitSaleCount > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--color-text)]">Pemakaian split payment (30 hari)</h2>
            <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
              {splitPaymentUsage.splitRatePercent}% dari semua transaksi
            </span>
          </div>
          <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
            {splitPaymentUsage.splitSaleCount} dari {splitPaymentUsage.totalSaleCount} transaksi dibayar pakai lebih dari 1 metode.
          </p>
          <RankingBarChart
            items={splitPaymentUsage.methodBreakdown.map((m) => ({
              label: METHOD_LABEL[m.method] ?? m.method,
              value: m.amount,
              sublabel: `${m.count} baris pembayaran`,
            }))}
          />
        </div>
      )}

      {favoriteAttribution.itemCount > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--color-text)]">Kontribusi menu favorit member (30 hari)</h2>
            <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
              {favoriteAttribution.contributionPercent}% dari omzet
            </span>
          </div>
          <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
            Omzet dari item yang ditambahkan lewat chip ⭐ menu favorit member di kasir: {formatRupiah(favoriteAttribution.favoriteRevenue)} dari total {formatRupiah(favoriteAttribution.totalRevenue)}.
          </p>
          <RankingBarChart
            items={favoriteAttribution.topProducts.map((p) => ({
              label: p.productName,
              value: p.revenue,
              sublabel: `${p.qty} terjual`,
            }))}
          />
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <TrendingUpIcon aria-hidden className="h-4 w-4" />
        Data dihitung dari 30 hari terakhir kecuali disebutkan lain.
      </div>
    </div>
  );
}
