import { requireRole } from "@/server/require-session";
import { getStockCounts } from "@/server/services/stock-count-service";
import { listAllOutlets } from "@/server/services/outlet-service";
import { StockCountManager } from "@/components/stock-count/stock-count-manager";

export default async function StockCountPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [counts, outlets] = await Promise.all([
    getStockCounts(user.tenantId),
    listAllOutlets(user.tenantId),
  ]);

  return (
    <StockCountManager
      counts={counts.map((count) => ({
        id: count.id,
        countNumber: count.countNumber,
        outlet: count.outlet,
        status: count.status,
        countDate: count.countDate,
        items: count.items,
      }))}
      outlets={outlets}
    />
  );
}
