import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listProductsWithStock } from "@/server/services/product-service";
import { getWasteSummary, listRecentWaste } from "@/server/services/waste-service";
import { WasteEntryForm } from "@/components/inventory/waste-entry-form";
import { WasteReport } from "@/components/inventory/waste-report";
import { PeriodFilter } from "@/components/laporan/period-filter";

const VALID_DAYS = [7, 30, 90];

export default async function WastePage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; outletId?: string }>;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const { days: daysParam, outletId: outletIdParam } = await searchParams;
  const days = VALID_DAYS.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((o) => o.id);
  const activeOutletId = outletIdParam && outletIds.includes(outletIdParam) ? outletIdParam : outlets[0]?.id;

  const [products, summary, recentWaste] = await Promise.all([
    activeOutletId ? listProductsWithStock(user.tenantId, activeOutletId) : Promise.resolve([]),
    getWasteSummary(user.tenantId, outletIds, days),
    listRecentWaste(user.tenantId, outletIds, 20),
  ]);

  const wasteableProducts = products
    .filter((p) => p.trackStock && p.stockQty > 0)
    .map((p) => ({ id: p.id, name: p.name, stockQty: p.stockQty }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Catat Kerugian Bahan</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Catat stok yang terbuang, kadaluarsa, atau rusak — supaya kelihatan berapa kerugiannya, bukan cuma
          hilang diam-diam dari stok.
        </p>
      </div>

      {activeOutletId && (
        <WasteEntryForm outlets={outlets} activeOutletId={activeOutletId} products={wasteableProducts} />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[var(--color-text)]">Laporan kerugian</h2>
        <PeriodFilter activeDays={days} basePath="/inventory/waste" />
      </div>

      <WasteReport summary={summary} recentWaste={recentWaste} />
    </div>
  );
}
