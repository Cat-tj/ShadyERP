import { requireRole } from "@/server/require-session";
import { getStockCounts } from "@/server/services/stock-count-service";
import { listAllOutlets } from "@/server/services/outlet-service";
import { StockCountManager, type StockCountRow } from "@/components/stock-count/stock-count-manager";

export default async function StockCountPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [counts, outlets] = await Promise.all([
    getStockCounts(user.tenantId),
    listAllOutlets(user.tenantId),
  ]);

  const formattedCounts = counts as StockCountRow[];

  return (
    <StockCountManager
      counts={formattedCounts}
      outlets={outlets}
    />
  );
}
