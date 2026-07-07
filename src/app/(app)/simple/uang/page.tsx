import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getCashOutletSummary } from "@/server/services/finance-operational-service";
import { listCashFlows } from "@/server/services/cashflow-service";
import { formatRupiah } from "@/lib/format";
import { SimpleCashflowForm, type SimpleCashFlowRow } from "@/components/simple/simple-cashflow-form";

export default async function SimpleUangPage() {
  const user = await requireRole(["OWNER", "MANAGER", "STAFF"]);
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((outlet) => outlet.id);
  const [cashOutlets, rawFlows] = await Promise.all([
    getCashOutletSummary(user.tenantId, outletIds, 1),
    listCashFlows(user.tenantId, outletIds, 7),
  ]);

  const totals = cashOutlets.reduce(
    (sum, outlet) => ({
      cashSales: sum.cashSales + outlet.cashSales,
      expenses: sum.expenses + outlet.expenses,
      estimatedCash: sum.estimatedCash + outlet.estimatedCash,
      openShiftCount: sum.openShiftCount + outlet.openShiftCount,
    }),
    { cashSales: 0, expenses: 0, estimatedCash: 0, openShiftCount: 0 }
  );

  const flows: SimpleCashFlowRow[] = rawFlows.map((flow) => ({
    id: flow.id,
    outletName: flow.outlet.name,
    type: flow.type,
    category: flow.category,
    amount: flow.amount,
    note: flow.note,
    spentAt: flow.spentAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Uang</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Kas harian, uang keluar, dan uang masuk tambahan.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Tunai POS hari ini" value={formatRupiah(totals.cashSales)} />
        <Tile label="Uang keluar shift" value={formatRupiah(totals.expenses)} />
        <Tile label="Estimasi laci" value={formatRupiah(totals.estimatedCash)} />
        <Tile label="Shift terbuka" value={`${totals.openShiftCount}`} />
      </div>

      <SimpleCashflowForm outlets={outlets.map((outlet) => ({ id: outlet.id, name: outlet.name }))} flows={flows} />
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-xs font-semibold text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-2 font-mono-data text-xl font-bold text-[var(--color-text)]">{value}</p>
    </div>
  );
}
