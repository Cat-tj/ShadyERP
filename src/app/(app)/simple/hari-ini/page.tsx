import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getSimpleTodaySummary } from "@/server/services/simple-dashboard-service";
import { formatRupiah } from "@/lib/format";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUpIcon, TrendingDownIcon, AlertCircleIcon, AwardIcon } from "@/components/ui/icons";

export default async function SimpleHariIniPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((outlet) => outlet.id);

  const summary = await getSimpleTodaySummary(user.tenantId, outletIds);
  const delta = summary.delta;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">Hari Ini</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Dashboard pantauan cepat bisnis Anda.</p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <div className="col-span-2 md:col-span-1">
          <StatCard
            title="Omzet Hari Ini"
            value={formatRupiah(summary.todaySales)}
            description={`Kemarin: ${formatRupiah(summary.yesterdaySales)}`}
            variant="primary"
            trend={{
              value: formatRupiah(Math.abs(summary.todaySales - summary.yesterdaySales)),
              isPositive: summary.todaySales >= summary.yesterdaySales,
            }}
          />
        </div>

        <StatCard
          title="Tunai di Laci"
          value={formatRupiah(summary.estimatedCash)}
          description={`Digital: ${formatRupiah(summary.digitalSales)}`}
        />

        <StatCard
          title="Shift Aktif & Perubahan"
          value={`${summary.openShiftCount} Staf Buka`}
          description={delta >= 0 ? "Kenaikan omzet" : "Penurunan omzet"}
          trend={{
            value: formatRupiah(Math.abs(delta)),
            isPositive: delta >= 0,
          }}
        />
      </div>

      {/* Alerts / Peringatan Operasional */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Peringatan Operasional</h2>
          {summary.alerts.length > 0 && (
            <Link href="/alerts" className="text-xs font-bold text-[var(--color-primary)] hover:underline">
              Buka Alert Center ({summary.alerts.length})
            </Link>
          )}
        </div>
        {summary.alerts.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Semua operasional berjalan aman dan lancar.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {summary.alerts.map((alert) => {
              let borderStyle = "border-l-[var(--color-info)]";
              let badgeColor = "bg-[var(--color-info-surface)] text-[var(--color-info)]";
              
              if (alert.severity === "CRITICAL") {
                borderStyle = "border-l-[var(--color-danger)]";
                badgeColor = "bg-[var(--color-danger-surface)] text-[var(--color-danger)]";
              } else if (alert.severity === "WARNING") {
                borderStyle = "border-l-[var(--color-warning)]";
                badgeColor = "bg-[var(--color-warning-surface)] text-[var(--color-warning)]";
              }

              return (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] border-l-4 ${borderStyle} bg-[var(--color-bg)] p-3.5 transition-colors hover:bg-white`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                        {alert.severity}
                      </span>
                      <span className="font-bold text-sm text-[var(--color-text)]">{alert.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{alert.body}</p>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-primary)] shrink-0 sm:inline-flex items-center gap-1">
                    Buka <span className="text-[10px]">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Top Products Today */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">Produk Terlaris Hari Ini</h2>
        <div>
          {summary.topProducts.length === 0 ? (
            <EmptyState
              icon={AwardIcon}
              title="Belum ada penjualan hari ini"
              description="Transaksi penjualan di Kasir akan tercatat secara langsung di sini."
              compact
              action={{ label: "Buka Kasir POS", href: "/kasir" }}
            />
          ) : (
            <div className="flex flex-col divide-y divide-[var(--color-border)]">
              {summary.topProducts.map((product, idx) => (
                <div key={product.productName} className="flex items-center justify-between gap-3 text-sm py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--color-bg-secondary)] text-xs font-bold text-[var(--color-text-secondary)]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[var(--color-text)]">{product.productName}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono-data font-bold text-[var(--color-text)]">{formatRupiah(product.omzet)}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{product.qty} item terjual</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
