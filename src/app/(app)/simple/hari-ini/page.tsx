import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getSimpleTodaySummary } from "@/server/services/simple-dashboard-service";
import { formatRupiah } from "@/lib/format";

export default async function SimpleHariIniPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((outlet) => outlet.id);

  const summary = await getSimpleTodaySummary(user.tenantId, outletIds);
  const delta = summary.delta;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Hari Ini</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Dashboard pantauan cepat bisnis Anda.</p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Omzet Hari Ini</p>
          <p className="mt-2 font-mono-data text-2xl font-bold text-[var(--color-text)]">
            {formatRupiah(summary.todaySales)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Kemarin: {formatRupiah(summary.yesterdaySales)}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Tunai di Laci</p>
          <p className="mt-2 font-mono-data text-2xl font-bold text-[var(--color-text)]">
            {formatRupiah(summary.estimatedCash)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Non-Tunai/Digital: {formatRupiah(summary.digitalSales)}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Shift Aktif & Perubahan</p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
            {summary.openShiftCount} Staf Buka
          </p>
          <p className={`mt-1 text-xs font-semibold ${delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {delta >= 0 ? "▲ Naik " : "▼ Turun "}{formatRupiah(Math.abs(delta))}
          </p>
        </div>
      </div>

      {/* Alerts / Peringatan Operasional */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Peringatan Operasional</h2>
          {summary.alerts.length > 0 && (
            <Link href="/alerts" className="text-xs font-bold text-[var(--color-primary)]">
              Buka Alert Center ({summary.alerts.length})
            </Link>
          )}
        </div>
        {summary.alerts.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Semua operasional berjalan aman dan lancar.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {summary.alerts.map((alert) => {
              let badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
              if (alert.severity === "CRITICAL") {
                badgeColor = "bg-red-100 text-red-800 border-red-200";
              } else if (alert.severity === "WARNING") {
                badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
              }

              return (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 transition-colors hover:bg-white/60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                        {alert.severity}
                      </span>
                      <span className="font-semibold text-sm text-[var(--color-text)]">{alert.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{alert.body}</p>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-primary)] shrink-0">Buka →</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Top Products Today */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-3">Produk Terlaris Hari Ini</h2>
        <div className="flex flex-col gap-3">
          {summary.topProducts.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Belum ada transaksi penjualan hari ini.</p>
          ) : (
            summary.topProducts.map((product, idx) => (
              <div key={product.productName} className="flex items-center justify-between gap-3 text-sm py-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-bg)] font-bold text-[var(--color-text)]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-[var(--color-text)]">{product.productName}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono-data font-bold text-[var(--color-text)]">{formatRupiah(product.omzet)}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{product.qty} item terjual</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
