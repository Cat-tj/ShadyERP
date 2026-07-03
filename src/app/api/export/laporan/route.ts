import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getDailyTrend, getTopProducts, getOutletComparison } from "@/server/services/report-service";
import { toCsv, csvResponse } from "@/lib/csv";

const VALID_DAYS = [7, 30, 90];

export async function GET(request: Request) {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const { searchParams } = new URL(request.url);
  const daysParam = Number(searchParams.get("days"));
  const days = VALID_DAYS.includes(daysParam) ? daysParam : 30;

  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((o) => o.id);

  const [trend, topProducts, outletComparison] = await Promise.all([
    getDailyTrend(user.tenantId, outletIds, days),
    getTopProducts(user.tenantId, outletIds, days, 50),
    getOutletComparison(user.tenantId, outletIds, days),
  ]);

  const trendCsv = toCsv(trend, [
    { key: "date", label: "Tanggal" },
    { key: "omzet", label: "Omzet" },
  ]);
  const productsCsv = toCsv(topProducts, [
    { key: "productName", label: "Produk" },
    { key: "qty", label: "Qty Terjual" },
    { key: "omzet", label: "Omzet" },
  ]);
  const outletCsv = toCsv(outletComparison, [
    { key: "outletName", label: "Outlet" },
    { key: "omzet", label: "Omzet" },
    { key: "transaksi", label: "Jumlah Transaksi" },
  ]);

  const csv = [
    `Laporan ${days} hari terakhir`,
    "",
    "OMZET HARIAN",
    trendCsv,
    "",
    "PRODUK TERLARIS",
    productsCsv,
    "",
    "PERBANDINGAN OUTLET",
    outletCsv,
  ].join("\r\n");

  return csvResponse(csv, `laporan-${days}hari-${new Date().toISOString().slice(0, 10)}.csv`);
}
