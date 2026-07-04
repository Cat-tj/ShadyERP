import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listExpenses, getExpenseSummary } from "@/server/services/expense-service";
import { PeriodFilter } from "@/components/laporan/period-filter";
import { StatTile } from "@/components/laporan/stat-tile";
import { PengeluaranManager } from "@/components/pengeluaran/pengeluaran-manager";
import { formatRupiah } from "@/lib/format";
import { TrendingDownIcon } from "@/components/ui/icons";

const VALID_DAYS = [7, 30, 90];

export default async function PengeluaranPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const { days: daysParam } = await searchParams;
  const days = VALID_DAYS.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((o) => o.id);

  const [expenses, summary] = await Promise.all([
    listExpenses(user.tenantId, outletIds, days),
    getExpenseSummary(user.tenantId, outletIds, days),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Pengeluaran
        </h1>
        <PeriodFilter activeDays={days} basePath="/pengeluaran" />
      </div>

      <StatTile
        label={`Total pengeluaran ${days} hari`}
        value={formatRupiah(summary.totalExpense)}
        icon={TrendingDownIcon}
      />

      <PengeluaranManager
        outlets={outlets.map((o) => ({ id: o.id, name: o.name }))}
        expenses={expenses.map((e) => ({
          id: e.id,
          category: e.category,
          amount: e.amount,
          note: e.note,
          spentAt: e.spentAt.toISOString(),
          outletName: e.outlet.name,
          createdByName: e.createdBy.name,
        }))}
      />
    </div>
  );
}
