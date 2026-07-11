import { redirect } from "next/navigation";
import { requireRole } from "@/server/require-session";
import { getTenantSetting } from "@/server/services/tenant-service";
import { getGeneralLedger } from "@/server/services/accounting-service";
import { GeneralLedger } from "@/components/finance/general-ledger";
import { PeriodFilter } from "@/components/laporan/period-filter";
import { daysAgoRangeJakarta } from "@/lib/date-range";

const VALID_DAYS = [7, 30, 90];

export default async function BukuBesarPage({
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
  const accounts = await getGeneralLedger(user.tenantId, { start, end });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Buku Besar</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Saldo berjalan per akun — bongkaran dari jurnal umum, dikelompokkan per akun.
          </p>
        </div>
        <PeriodFilter activeDays={days} basePath="/finance/buku-besar" />
      </div>

      <GeneralLedger
        accounts={accounts.map((a) => ({
          code: a.code,
          name: a.name,
          type: a.type,
          openingBalance: a.openingBalance,
          closingBalance: a.closingBalance,
          lines: a.lines.map((line) => ({
            date: line.date.toISOString(),
            description: line.description,
            reference: line.reference,
            debit: line.debit,
            credit: line.credit,
            runningBalance: line.runningBalance,
          })),
        }))}
      />
    </div>
  );
}
