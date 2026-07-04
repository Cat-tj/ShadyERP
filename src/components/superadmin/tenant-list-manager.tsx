"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BusinessType, Plan } from "@prisma/client";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { setTenantActiveAction } from "@/app/superadmin/(protected)/actions";
import { useToast, Toast } from "@/components/toast";

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  plan: Plan;
  isActive: boolean;
  createdAt: string;
  outletCount: number;
  userCount: number;
  totalOmzet: number;
};

export function TenantListManager({ tenants }: { tenants: TenantRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q));
  }, [tenants, search]);

  const totalOmzetAll = tenants.reduce((sum, t) => sum + t.totalOmzet, 0);
  const activeCount = tenants.filter((t) => t.isActive).length;

  function toggleActive(tenant: TenantRow) {
    startTransition(async () => {
      const result = await setTenantActiveAction(tenant.id, !tenant.isActive);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(tenant.isActive ? `${tenant.name} disuspend` : `${tenant.name} diaktifkan`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text)]">{tenants.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Total tenant</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text)]">{activeCount}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Tenant aktif</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="tabular-nums text-2xl font-bold text-[var(--color-text)]">
            {formatRupiah(totalOmzetAll)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Omzet agregat semua tenant</p>
        </div>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cari nama atau slug tenant..."
        className="min-h-[48px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
      />

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">Tidak ada tenant ditemukan.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((tenant) => (
              <div key={tenant.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {tenant.name}
                    {!tenant.isActive && (
                      <span className="ml-2 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-warning-text)]">
                        Disuspend
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {tenant.slug} · {tenant.plan} · {tenant.outletCount} outlet · {tenant.userCount} user ·
                    sejak {formatTanggalPendek(tenant.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                    {formatRupiah(tenant.totalOmzet)}
                  </span>
                  <button
                    onClick={() => toggleActive(tenant)}
                    disabled={isPending}
                    className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 sm:flex-none"
                  >
                    {tenant.isActive ? "Suspend" : "Aktifkan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
