import { redirect } from "next/navigation";
import { requireRole } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { getTrialBalance } from "@/server/services/accounting-service";
import { TrialBalance } from "@/components/finance/trial-balance";
import { formatTanggal } from "@/lib/format";

export default async function NeracaSaldoPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const setting = await getTenantSetting(user.tenantId);
  if (setting?.accountingMode !== "ADVANCED") redirect("/finance");

  const asOf = new Date();
  const { rows, totalDebit, totalCredit, isBalanced } = await getTrialBalance(user.tenantId, asOf);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Neraca Saldo</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Snapshot saldo semua akun per {formatTanggal(asOf)} — total debit harus sama dengan total kredit.
        </p>
      </div>

      <TrialBalance
        rows={rows.map((r) => ({ code: r.code, name: r.name, type: r.type, debit: r.debit, credit: r.credit }))}
        totalDebit={totalDebit}
        totalCredit={totalCredit}
        isBalanced={isBalanced}
      />
    </div>
  );
}
