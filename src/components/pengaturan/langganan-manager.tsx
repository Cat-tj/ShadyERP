"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Plan, SubscriptionRequestStatus } from "@prisma/client";
import { PLAN_LIMITS, PLAN_ORDER, formatLimit } from "@/lib/plan-limits";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { requestUpgradeAction } from "@/app/(app)/pengaturan/langganan/actions";
import { useToast, Toast } from "@/components/toast";

export type Usage = {
  plan: Plan;
  outletCount: number;
  userCount: number;
  productCount: number;
};

export type PendingRequest = { id: string; requestedPlan: Plan; createdAt: string };

export type HistoryRow = {
  id: string;
  requestedPlan: Plan;
  status: SubscriptionRequestStatus;
  createdAt: string;
  reviewNote: string | null;
};

const STATUS_LABEL: Record<SubscriptionRequestStatus, string> = {
  PENDING: "Menunggu konfirmasi",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max === Infinity ? 0 : Math.min(100, Math.round((used / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span className="tabular-nums font-medium text-[var(--color-text)]">
          {used} / {formatLimit(max)}
        </span>
      </div>
      {max !== Infinity && (
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-secondary)]">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pct >= 90
                ? "bg-[var(--color-danger)]"
                : pct >= 70
                  ? "bg-[var(--color-warning)]"
                  : "bg-[var(--color-primary)]"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function LanggananManager({
  usage,
  pendingRequest,
  history,
}: {
  usage: Usage;
  pendingRequest: PendingRequest | null;
  history: HistoryRow[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirmingPlan, setConfirmingPlan] = useState<Plan | null>(null);

  function submitUpgrade(plan: Plan) {
    startTransition(async () => {
      const result = await requestUpgradeAction(plan);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(`Permintaan upgrade ke ${PLAN_LIMITS[plan].label} terkirim`);
      setConfirmingPlan(null);
      router.refresh();
    });
  }

  const currentLimits = PLAN_LIMITS[usage.plan];
  const currentIndex = PLAN_ORDER.indexOf(usage.plan);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-sm text-[var(--color-text-secondary)]">Paket saat ini</p>
        <p className="font-display text-2xl font-semibold text-[var(--color-text)]">
          {currentLimits.label}
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <UsageBar label="Outlet" used={usage.outletCount} max={currentLimits.maxOutlets} />
          <UsageBar label="Karyawan" used={usage.userCount} max={currentLimits.maxUsers} />
          <UsageBar label="Produk" used={usage.productCount} max={currentLimits.maxProducts} />
        </div>
      </div>

      {pendingRequest && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-warning-bg)] p-4">
          <p className="text-sm font-semibold text-[var(--color-warning-text)]">
            Permintaan upgrade ke {PLAN_LIMITS[pendingRequest.requestedPlan].label} sedang diproses
          </p>
          <p className="mt-1 text-xs text-[var(--color-warning-text)]">
            Diajukan {formatTanggal(pendingRequest.createdAt)}. Admin Altora akan mengonfirmasi setelah
            pembayaran diverifikasi.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PLAN_ORDER.map((plan, index) => {
          const limits = PLAN_LIMITS[plan];
          const isCurrent = plan === usage.plan;
          const isDowngrade = index < currentIndex;
          return (
            <div
              key={plan}
              className={`flex flex-col gap-2 rounded-xl border p-4 ${
                isCurrent ? "border-[var(--color-primary)]" : "border-[var(--color-border)]"
              } bg-[var(--color-surface)]`}
            >
              <p className="text-sm font-bold text-[var(--color-text)]">{limits.label}</p>
              <p className="tabular-nums text-xl font-bold text-[var(--color-text)]">
                {limits.priceMonthly === 0 ? "Gratis" : `${formatRupiah(limits.priceMonthly)}/bln`}
              </p>
              <ul className="flex flex-col gap-1 text-xs text-[var(--color-text-secondary)]">
                <li>{formatLimit(limits.maxOutlets)} outlet</li>
                <li>{formatLimit(limits.maxUsers)} karyawan</li>
                <li>{formatLimit(limits.maxProducts)} produk</li>
              </ul>
              {isCurrent ? (
                <span className="mt-2 rounded-lg bg-[var(--color-bg)] px-3 py-2 text-center text-xs font-medium text-[var(--color-text-secondary)]">
                  Paket aktif
                </span>
              ) : (
                <button
                  onClick={() => setConfirmingPlan(plan)}
                  disabled={isPending || Boolean(pendingRequest) || isDowngrade}
                  className="mt-2 min-h-[40px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
                >
                  {isDowngrade ? "Hubungi admin" : "Ajukan upgrade"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-bold text-[var(--color-text)]">Riwayat permintaan</h2>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
            {history.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    Upgrade ke {PLAN_LIMITS[row.requestedPlan].label}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {formatTanggal(row.createdAt)}
                    {row.reviewNote ? ` · ${row.reviewNote}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    row.status === "APPROVED"
                      ? "bg-[var(--color-bg)] text-[var(--color-primary)]"
                      : row.status === "REJECTED"
                        ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
                        : "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {STATUS_LABEL[row.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmingPlan && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-[var(--color-bg)] p-5 sm:rounded-2xl">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Upgrade ke {PLAN_LIMITS[confirmingPlan].label}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Transfer {formatRupiah(PLAN_LIMITS[confirmingPlan].priceMonthly)} ke rekening berikut, lalu
              tekan &quot;Sudah transfer&quot;. Tim Altora akan mengaktifkan paketmu setelah dana masuk
              dikonfirmasi.
            </p>
            <div className="mt-3 rounded-lg bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)]">
              <p className="font-semibold">Bank Contoh · 1234567890</p>
              <p className="text-[var(--color-text-secondary)]">a.n. PT Altora Teknologi Indonesia</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirmingPlan(null)}
                className="min-h-[48px] flex-1 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)]"
              >
                Batal
              </button>
              <button
                onClick={() => submitUpgrade(confirmingPlan)}
                disabled={isPending}
                className="min-h-[48px] flex-1 rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
              >
                {isPending ? "Mengirim..." : "Sudah transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
