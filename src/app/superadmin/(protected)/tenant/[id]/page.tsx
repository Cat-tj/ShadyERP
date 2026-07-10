import Link from "next/link";
import { requireSuperAdmin } from "@/server/require-super-admin";
import { getTenantDetailForSuperAdmin } from "@/server/services/super-admin-service";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";

export default async function SuperAdminTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;
  const tenant = await getTenantDetailForSuperAdmin(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/superadmin" className="text-sm font-semibold text-[var(--color-primary)]">
            ← Kembali
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-[var(--color-text)]">{tenant.name}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {tenant.slug} · {tenant.businessType} · {tenant.plan} · {tenant.accountingMode}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            tenant.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {tenant.isActive ? "Aktif" : "Disuspend"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Outlet" value={`${tenant.outletCount}`} />
        <Tile label="User" value={`${tenant.userCount}`} />
        <Tile label="Produk" value={`${tenant.productCount}`} />
        <Tile label="Omzet 30 hari" value={formatRupiah(tenant.omzet30d)} />
      </div>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Modul Nonaktif</h2>
        </div>
        <div className="p-4">
          {tenant.disabledModules.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Semua modul toggleable aktif.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tenant.disabledModules.map((key) => (
                <span key={key} className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                  {key}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Riwayat Langganan</h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {tenant.subscriptionRequests.length === 0 ? (
            <p className="p-4 text-sm text-[var(--color-text-secondary)]">Belum ada permintaan langganan.</p>
          ) : (
            tenant.subscriptionRequests.map((request) => (
              <div key={request.id} className="grid gap-2 p-4 text-sm sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-bold text-[var(--color-text)]">Request paket {request.requestedPlan}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {formatTanggalPendek(request.createdAt)}
                    {request.note ? ` · ${request.note}` : ""}
                  </p>
                </div>
                <span className="text-xs font-bold text-[var(--color-text-secondary)]">{request.status}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}
