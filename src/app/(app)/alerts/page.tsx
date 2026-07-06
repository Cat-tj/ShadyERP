import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getSimpleAlerts } from "@/server/services/simple-dashboard-service";

export default async function AlertCenterPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((o) => o.id);

  const alerts = await getSimpleAlerts(user.tenantId, outletIds);

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const warningCount = alerts.filter((a) => a.severity === "WARNING").length;
  const infoCount = alerts.filter((a) => a.severity === "INFO").length;

  const categoryLabels: Record<string, string> = {
    STOCK: "Stok",
    EXPIRED: "Kedaluwarsa",
    SHIFT: "Shift Kasir",
    CASH: "Selisih Kas",
    DEBT: "Hutang",
    SALES: "Produk Sepi",
    ORDER: "Pesanan Meja",
    OFFLINE: "Offline Sync",
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Pusat Peringatan (Alert Center)</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Satu tempat untuk memantau semua isu operasional dan keuangan toko Anda.
          </p>
        </div>
        <Link
          href="/simple/hari-ini"
          className="flex min-h-[38px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          Kembali ke Beranda
        </Link>
      </div>

      {/* Summary Stats cards */}
      <div className="grid gap-3 grid-cols-3">
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 shadow-sm text-center">
          <p className="text-3xl font-black text-red-600">{criticalCount}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-red-800">Kritis</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm text-center">
          <p className="text-3xl font-black text-amber-600">{warningCount}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">Peringatan</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm text-center">
          <p className="text-3xl font-black text-blue-600">{infoCount}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-blue-800">Informasi</p>
        </div>
      </div>

      {/* Alerts List */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Semua Peringatan Aktif ({alerts.length})</h2>

        {alerts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">Luar biasa! Tidak ada isu operasional yang perlu diperbaiki saat ini.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => {
              let badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
              if (alert.severity === "CRITICAL") {
                badgeColor = "bg-red-100 text-red-800 border-red-200";
              } else if (alert.severity === "WARNING") {
                badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
              }

              return (
                <div
                  key={alert.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 hover:border-[var(--color-primary)]/40 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-secondary)]">
                      {alert.category.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${badgeColor}`}>
                          {alert.severity}
                        </span>
                        <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[9px] font-bold border border-slate-200">
                          {categoryLabels[alert.category] || alert.category}
                        </span>
                        <h3 className="font-bold text-sm text-[var(--color-text)]">{alert.title}</h3>
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        {alert.body}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={alert.href}
                    className="flex min-h-[36px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-bg)] shrink-0"
                  >
                    Selesaikan Isu
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
