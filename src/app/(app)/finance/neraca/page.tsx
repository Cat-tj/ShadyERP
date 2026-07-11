import { redirect } from "next/navigation";
import { requireRole } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { getBalanceSheet } from "@/server/services/accounting-service";
import { BalanceSheet } from "@/components/finance/balance-sheet";
import { formatTanggal } from "@/lib/format";

export default async function NeracaPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const setting = await getTenantSetting(user.tenantId);
  if (setting?.accountingMode !== "ADVANCED") redirect("/finance");

  const asOf = new Date();
  const { assets, liabilities, equity, totalLiabilitiesAndEquity, isBalanced } = await getBalanceSheet(
    user.tenantId,
    asOf
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Neraca</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Per {formatTanggal(asOf)}.</p>
      </div>

      <BalanceSheet
        assets={assets}
        liabilities={liabilities}
        equity={equity}
        totalLiabilitiesAndEquity={totalLiabilitiesAndEquity}
        isBalanced={isBalanced}
      />
    </div>
  );
}
