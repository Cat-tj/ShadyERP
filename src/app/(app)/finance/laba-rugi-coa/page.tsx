import { redirect } from "next/navigation";
import { requireRole } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { getIncomeStatement } from "@/server/services/accounting-service";
import { IncomeStatement } from "@/components/finance/income-statement";
import { PeriodFilter } from "@/components/laporan/period-filter";
import { daysAgoRangeJakarta } from "@/lib/date-range";

const VALID_DAYS = [7, 30, 90];

export default async function LabaRugiCoaPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const setting = await getTenantSetting(user.tenantId);
  if (setting?.accountingMode !== "ADVANCED") redirect("/finance");

  const { days: daysParam } = await searchParams;
  const days = VALID_DAYS.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const { start, end } = daysAgoRangeJakarta(days);
  const { revenue, expense, netIncome } = await getIncomeStatement(user.tenantId, { start, end });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Laba Rugi (COA)</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Ditarik dari jurnal yang sudah diposting resmi — beda dari Laba Rugi Simple yang hitung langsung dari
            transaksi mentah.
          </p>
        </div>
        <PeriodFilter activeDays={days} basePath="/finance/laba-rugi-coa" />
      </div>

      <IncomeStatement revenue={revenue} expense={expense} netIncome={netIncome} />
    </div>
  );
}
