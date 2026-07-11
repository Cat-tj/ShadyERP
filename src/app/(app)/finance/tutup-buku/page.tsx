import { redirect } from "next/navigation";
import { requireRole } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { getPeriodLockDate, getTrialBalance } from "@/server/services/accounting-service";
import { PeriodLockManager } from "@/components/finance/period-lock-manager";

export default async function TutupBukuPage() {
  const user = await requireRole(["OWNER"]);

  const setting = await getTenantSetting(user.tenantId);
  if (setting?.accountingMode !== "ADVANCED") redirect("/finance");

  const [lockDate, trialBalance] = await Promise.all([
    getPeriodLockDate(user.tenantId),
    getTrialBalance(user.tenantId, new Date()),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Tutup Buku Periode</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Kunci pembukuan sampai tanggal tertentu supaya transaksi lama tidak bisa berubah lagi — praktik
          standar tutup buku bulanan/tahunan.
        </p>
      </div>

      <PeriodLockManager
        currentLockDate={lockDate ? lockDate.toISOString().split("T")[0] : null}
        isBalanced={trialBalance.isBalanced}
      />
    </div>
  );
}
