"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BusinessType, Plan } from "@prisma/client";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { setTenantActiveAction, setTenantModulesAction } from "@/app/superadmin/(protected)/actions";
import { useToast, Toast } from "@/components/toast";
import { TOGGLEABLE_MODULES, type ModuleKey } from "@/lib/modules";

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  plan: Plan;
  isActive: boolean;
  disabledModules: string[];
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
  const [moduleTenantId, setModuleTenantId] = useState<string | null>(null);
  const [moduleDraft, setModuleDraft] = useState<Record<string, ModuleKey[]>>({});

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

  function enabledModulesFor(tenant: TenantRow) {
    return new Set<ModuleKey>(
      moduleDraft[tenant.id] ??
        TOGGLEABLE_MODULES.filter((module) => !tenant.disabledModules.includes(module.key)).map(
          (module) => module.key
        )
    );
  }

  function toggleModule(tenant: TenantRow, key: ModuleKey) {
    const next = enabledModulesFor(tenant);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setModuleDraft((prev) => ({ ...prev, [tenant.id]: Array.from(next) }));
  }

  function saveModules(tenant: TenantRow) {
    startTransition(async () => {
      const enabled = enabledModulesFor(tenant);
      const disabled = TOGGLEABLE_MODULES.map((module) => module.key).filter((key) => !enabled.has(key));
      const result = await setTenantModulesAction(tenant.id, disabled);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(`Modul ${tenant.name} disimpan`);
      setModuleTenantId(null);
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
            {filtered.map((tenant) => {
              const isModuleOpen = moduleTenantId === tenant.id;
              const enabled = enabledModulesFor(tenant);

              return (
                <div key={tenant.id} className="flex flex-col gap-3 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                      <p className="mt-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                        {enabled.size}/{TOGGLEABLE_MODULES.length} modul aktif
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                        {formatRupiah(tenant.totalOmzet)}
                      </span>
                      <button
                        onClick={() => setModuleTenantId(isModuleOpen ? null : tenant.id)}
                        disabled={isPending}
                        className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 sm:flex-none"
                      >
                        Modul
                      </button>
                      <button
                        onClick={() => toggleActive(tenant)}
                        disabled={isPending}
                        className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 sm:flex-none"
                      >
                        {tenant.isActive ? "Suspend" : "Aktifkan"}
                      </button>
                    </div>
                  </div>

                  {isModuleOpen && (
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Fitur aktif untuk client
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {TOGGLEABLE_MODULES.map((module) => {
                          const isOn = enabled.has(module.key);
                          return (
                            <button
                              key={module.key}
                              type="button"
                              onClick={() => toggleModule(tenant, module.key)}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                                isOn
                                  ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                                  : "border-dashed border-[var(--color-border)] bg-transparent opacity-60"
                              }`}
                            >
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: isOn ? module.color : "var(--color-border)" }}
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-bold text-[var(--color-text)]">
                                  {module.label}
                                </span>
                                <span className="block truncate text-[10px] text-[var(--color-text-secondary)]">
                                  {isOn ? "Aktif" : "Nonaktif"}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => saveModules(tenant)}
                        disabled={isPending}
                        className="mt-3 min-h-[40px] rounded-lg bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
                      >
                        {isPending ? "Menyimpan..." : "Simpan modul"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
