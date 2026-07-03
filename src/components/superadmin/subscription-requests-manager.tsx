"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@prisma/client";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { formatTanggal } from "@/lib/format";
import { reviewSubscriptionRequestAction } from "@/app/superadmin/(protected)/actions";
import { useToast, Toast } from "@/components/toast";

export type SubscriptionRequestRow = {
  id: string;
  tenantName: string;
  currentPlan: Plan;
  requestedPlan: Plan;
  createdAt: string;
  note: string | null;
};

export function SubscriptionRequestsManager({ requests }: { requests: SubscriptionRequestRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function review(request: SubscriptionRequestRow, approve: boolean) {
    startTransition(async () => {
      const result = await reviewSubscriptionRequestAction(request.id, approve);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(
        approve
          ? `${request.tenantName} diupgrade ke ${PLAN_LIMITS[request.requestedPlan].label}`
          : `Permintaan ${request.tenantName} ditolak`
      );
      router.refresh();
    });
  }

  return (
    <div>
      <h2 className="mb-2 text-sm font-bold text-[var(--color-text)]">
        Permintaan langganan ({requests.length})
      </h2>
      <div className="flex flex-col gap-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {request.tenantName}: {PLAN_LIMITS[request.currentPlan].label} →{" "}
                {PLAN_LIMITS[request.requestedPlan].label}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Diajukan {formatTanggal(request.createdAt)}
                {request.note ? ` · ${request.note}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => review(request, true)}
                disabled={isPending}
                className="min-h-[36px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
              >
                Setujui
              </button>
              <button
                onClick={() => review(request, false)}
                disabled={isPending}
                className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40"
              >
                Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
      <Toast message={toastMessage} />
    </div>
  );
}
