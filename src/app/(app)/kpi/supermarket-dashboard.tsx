import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { KpiTrendCard } from "@/components/dashboard/kpi-trend-card";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { ActionCenterCard, type ActionCenterItem } from "@/components/dashboard/action-center-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CurrencyIcon, ReceiptIcon, TrendingUpIcon, BarChartIcon, PackageIcon } from "@/components/ui/icons";
import type { getTodayVsYesterday, getOutletPerformanceToday, getTopProducts } from "@/server/services/report-service";
import type { getOverduePurchaseOrders } from "@/server/services/purchase-order-service";
import type { getLowStockProducts } from "@/server/services/inventory-service";

type TodayVsYesterday = Awaited<ReturnType<typeof getTodayVsYesterday>>;
type OutletPerformance = Awaited<ReturnType<typeof getOutletPerformanceToday>>;
type TopProducts = Awaited<ReturnType<typeof getTopProducts>>;
type OverduePOs = Awaited<ReturnType<typeof getOverduePurchaseOrders>>;
type LowStockItems = Awaited<ReturnType<typeof getLowStockProducts>>;
type TrendPoint = { date: string; omzet: number };

function pctChange(today: number, yesterday: number): number | null {
  if (yesterday === 0) return null;
  return ((today - yesterday) / yesterday) * 100;
}

function shortDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00+07:00`);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(d);
}

export function SupermarketDashboard({
  ownerFirstName,
  todayVsYesterday,
  dailyTrend,
  topProducts,
  lowStockItems,
  overduePOs,
  outletPerformance,
  lowStockOutletName,
}: {
  ownerFirstName: string;
  todayVsYesterday: TodayVsYesterday;
  dailyTrend: TrendPoint[];
  topProducts: TopProducts;
  lowStockItems: LowStockItems;
  overduePOs: OverduePOs;
  outletPerformance: OutletPerformance;
  lowStockOutletName?: string;
}) {
  const { today, yesterday } = todayVsYesterday;

  const actionItems: ActionCenterItem[] = [];
  if (lowStockItems.length > 0) {
    actionItems.push({
      label: `${lowStockItems.length} SKU berada di bawah stok minimum`,
      tone: "warning",
      cta: { label: "Lihat stok", href: "/inventory" },
    });
  }
  if (overduePOs.length > 0) {
    actionItems.push({
      label: `${overduePOs.length} purchase order melewati jadwal tiba`,
      tone: "danger",
      cta: { label: "Tinjau PO", href: "/purchase-order" },
    });
  }
  for (const outlet of outletPerformance) {
    if (outlet.changePercent != null && outlet.changePercent <= -15) {
      actionItems.push({
        label: `Outlet ${outlet.outletName} turun ${Math.abs(Math.round(outlet.changePercent))}% hari ini`,
        tone: "info",
        cta: { label: "Lihat analisis", href: "/kpi/analitik" },
      });
    }
  }

  const trendFirst = dailyTrend[0]?.omzet ?? 0;
  const trendLast = dailyTrend[dailyTrend.length - 1]?.omzet ?? 0;
  const trendInsight =
    dailyTrend.length > 1
      ? trendLast > trendFirst
        ? "Tren omzet naik dibanding awal pekan ini."
        : trendLast < trendFirst
          ? "Tren omzet turun dibanding awal pekan ini — cek stok & promo."
          : "Omzet relatif stabil sepanjang pekan ini."
      : undefined;

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          Halo, {ownerFirstName}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pantau penjualan, stok, dan aktivitas outlet Anda.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTrendCard
          label="Penjualan hari ini"
          value={formatRupiah(today.totalOmzet)}
          icon={CurrencyIcon}
          trendPercent={pctChange(today.totalOmzet, yesterday.totalOmzet)}
        />
        <KpiTrendCard
          label="Jumlah transaksi"
          value={String(today.totalTransaksi)}
          icon={ReceiptIcon}
          trendPercent={pctChange(today.totalTransaksi, yesterday.totalTransaksi)}
        />
        <KpiTrendCard
          label="Rata-rata transaksi"
          value={formatRupiah(today.rataRataTransaksi)}
          icon={TrendingUpIcon}
          trendPercent={pctChange(today.rataRataTransaksi, yesterday.rataRataTransaksi)}
        />
        <KpiTrendCard
          label="Margin estimasi"
          value={formatRupiah(today.estimasiUntung)}
          icon={BarChartIcon}
          trendPercent={pctChange(today.estimasiUntung, yesterday.estimasiUntung)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <SectionCard title="Tren penjualan · 7 hari terakhir">
          <SalesTrendChart
            data={dailyTrend.map((d) => ({ label: shortDateLabel(d.date), value: d.omzet }))}
            insight={trendInsight}
          />
        </SectionCard>
        <ActionCenterCard items={actionItems} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Produk terlaris"
          action={
            <Link href="/kpi/analitik" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
              Lihat semua
            </Link>
          }
        >
          {topProducts.length === 0 ? (
            <EmptyState compact title="Belum ada transaksi" description="Produk terlaris akan muncul di sini." />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {topProducts.slice(0, 5).map((p) => (
                  <tr key={p.productName} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2 pr-2 text-[var(--color-text)]">{p.productName}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">{p.qty}x</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-[var(--color-text)]">
                      {formatRupiah(p.omzet)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        <SectionCard
          title={`Stok prioritas${lowStockOutletName ? ` · ${lowStockOutletName}` : ""}`}
          action={
            <Link href="/inventory" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
              Lihat semua
            </Link>
          }
        >
          {lowStockItems.length === 0 ? (
            <EmptyState compact title="Semua stok aman" description="Tidak ada produk di bawah stok minimum." />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {lowStockItems.slice(0, 5).map((item) => (
                  <tr key={item.productId} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2 pr-2 text-[var(--color-text)]">{item.productName}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">
                      {item.currentStock} / min {item.reorderPoint}
                    </td>
                    <td className="py-2 text-right">
                      <StatusBadge variant={item.currentStock <= 0 ? "danger" : "warning"}>
                        {item.currentStock <= 0 ? "Kritis" : "Menipis"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        <SectionCard
          title="Purchase order"
          action={
            <Link href="/purchase-order" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
              Lihat semua
            </Link>
          }
        >
          {overduePOs.length === 0 ? (
            <EmptyState compact icon={PackageIcon} title="Tidak ada PO terlambat" description="Semua PO on-track." />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {overduePOs.slice(0, 5).map((po) => (
                  <tr key={po.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2 pr-2 text-[var(--color-text)]">{po.supplier.name}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">
                      {formatRupiah(po.totalAmount)}
                    </td>
                    <td className="py-2 text-right">
                      <StatusBadge variant="danger">Terlambat</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        <SectionCard
          title="Performa cabang"
          action={
            <Link href="/kpi/analitik" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
              Lihat semua
            </Link>
          }
        >
          {outletPerformance.length === 0 ? (
            <EmptyState compact title="Belum ada outlet" description="Tambahkan outlet untuk melihat performa cabang." />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {outletPerformance.slice(0, 5).map((o) => (
                  <tr key={o.outletId} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2 pr-2 text-[var(--color-text)]">{o.outletName}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">
                      {formatRupiah(o.todayOmzet)}
                    </td>
                    <td className="py-2 text-right tabular-nums font-semibold">
                      {o.changePercent == null ? (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      ) : (
                        <span style={{ color: o.changePercent >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                          {o.changePercent >= 0 ? "↑" : "↓"} {Math.abs(Math.round(o.changePercent))}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
