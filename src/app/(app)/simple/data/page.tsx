import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { prisma } from "@/lib/prisma";
import { todayRangeJakarta } from "@/lib/date-range";
import { formatRupiah } from "@/lib/format";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getProductSalesPerformance, getTopProducts } from "@/server/services/report-service";
import { getExpiringBatches, getLowStockProducts } from "@/server/services/inventory-service";

export default async function SimpleDataPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((outlet) => outlet.id);
  const { start: todayStart, end: todayEnd } = todayRangeJakarta();
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const [todaySales, yesterdaySales, topProducts, performance, lowStock, expiringBatches] = await Promise.all([
    getOmzet(user.tenantId, outletIds, todayStart, todayEnd),
    getOmzet(user.tenantId, outletIds, yesterdayStart, todayStart),
    getTopProducts(user.tenantId, outletIds, 30, 5),
    getProductSalesPerformance(user.tenantId, outletIds, 30, 5),
    outletIds[0] ? getLowStockProducts(user.tenantId, outletIds[0]) : Promise.resolve([]),
    outletIds[0] ? getExpiringBatches(user.tenantId, outletIds[0], 14) : Promise.resolve([]),
  ]);

  const maxTopOmzet = Math.max(1, ...topProducts.map((product) => product.omzet));
  const delta = todaySales - yesterdaySales;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Data</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Insight cepat tanpa laporan rumit.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Tile label="Omzet hari ini" value={formatRupiah(todaySales)} />
        <Tile label="Omzet kemarin" value={formatRupiah(yesterdaySales)} />
        <Tile
          label="Selisih"
          value={`${delta >= 0 ? "+" : ""}${formatRupiah(delta)}`}
          tone={delta >= 0 ? "good" : "bad"}
        />
      </div>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">5 Produk Terlaris</h2>
          <Link href="/kpi/analitik" className="text-xs font-bold text-[var(--color-primary)]">
            Detail
          </Link>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {topProducts.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Belum ada penjualan produk.</p>
          ) : (
            topProducts.map((product) => (
              <div key={product.productName}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-[var(--color-text)]">{product.productName}</span>
                  <span className="font-mono-data font-bold text-[var(--color-text)]">{formatRupiah(product.omzet)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${Math.max(5, (product.omzet / maxTopOmzet) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Terjual {product.qty} item</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Produk Sepi</h2>
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">30 hari</span>
        </div>
        <div className="mt-3 divide-y divide-[var(--color-border)]">
          {performance.worstSales.length === 0 ? (
            <p className="py-3 text-sm text-[var(--color-text-secondary)]">Belum ada data produk.</p>
          ) : (
            performance.worstSales.map((product) => (
              <div key={product.productId} className="flex justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--color-text)]">{product.productName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{product.categoryName}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono-data font-bold text-[var(--color-text)]">{product.qty} terjual</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">stok {product.stockQty}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Stok Menipis</h2>
          <Link href="/inventory" className="text-xs font-bold text-[var(--color-primary)]">
            Buka stok
          </Link>
        </div>
        <div className="mt-3 divide-y divide-[var(--color-border)]">
          {lowStock.length === 0 ? (
            <p className="py-3 text-sm text-[var(--color-text-secondary)]">Aman, tidak ada stok di bawah batas minimal.</p>
          ) : (
            lowStock.slice(0, 8).map((item) => (
              <div key={item.productId} className="flex justify-between gap-3 py-3 text-sm">
                <span className="font-semibold text-[var(--color-text)]">{item.productName}</span>
                <span className="font-mono-data font-bold text-red-600">
                  {item.currentStock} / min {item.reorderPoint}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Perlu Disiapkan</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Insight
            title="Restock"
            body={
              lowStock.length > 0
                ? `${lowStock[0].productName} paling urgent, kurang ${Math.max(0, lowStock[0].deficit)} dari batas minimum.`
                : "Belum ada item yang melewati batas minimum stok."
            }
          />
          <Insight
            title="Expired"
            body={
              expiringBatches.length > 0
                ? `${expiringBatches[0].product.name} punya batch yang expired dekat.`
                : "Tidak ada batch yang expired dalam 14 hari."
            }
          />
        </div>
      </section>
    </div>
  );
}

async function getOmzet(tenantId: string, outletIds: string[], start: Date, end: Date) {
  const sales = await prisma.sale.findMany({
    where: { tenantId, outletId: { in: outletIds }, status: "COMPLETED", createdAt: { gte: start, lt: end } },
    select: { total: true, saleReturns: { select: { totalRefund: true } } },
  });
  return sales.reduce((sum, sale) => sum + sale.total - sale.saleReturns.reduce((refund, item) => refund + item.totalRefund, 0), 0);
}

function Tile({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "bad" }) {
  const toneClass = tone === "good" ? "text-emerald-600" : tone === "bad" ? "text-red-600" : "text-[var(--color-text)]";
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-xs font-semibold text-[var(--color-text-secondary)]">{label}</p>
      <p className={`mt-2 font-mono-data text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function Insight({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">{title}</p>
      <p className="mt-1 text-sm font-semibold leading-snug text-[var(--color-text)]">{body}</p>
    </div>
  );
}
