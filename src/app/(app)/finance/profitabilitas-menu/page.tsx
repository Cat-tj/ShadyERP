import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getMenuProfitability } from "@/server/services/menu-profitability-service";
import { MenuProfitability } from "@/components/finance/menu-profitability";
import { PeriodFilter } from "@/components/laporan/period-filter";

const VALID_DAYS = [7, 30, 90];

export default async function ProfitabilitasMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const { days: daysParam } = await searchParams;
  const days = VALID_DAYS.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((o) => o.id);

  const rows = await getMenuProfitability(user.tenantId, outletIds, days);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Profitabilitas Menu</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            HPP vs harga jual per menu, margin, dan kontribusi untung dari histori penjualan.
          </p>
        </div>
        <PeriodFilter activeDays={days} basePath="/finance/profitabilitas-menu" />
      </div>

      <MenuProfitability rows={rows} />
    </div>
  );
}
