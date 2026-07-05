import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { getSupplierDebtSummary } from "@/server/services/finance-operational-service";
import { StatTile } from "@/components/laporan/stat-tile";
import { RankingBarChart } from "@/components/laporan/ranking-bar-chart";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { ReceiptIcon, UsersIcon, BarChartIcon } from "@/components/ui/icons";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Dikirim",
  CONFIRMED: "Dikonfirmasi",
  PARTIALLY_RECEIVED: "Diterima sebagian",
  RECEIVED: "Diterima",
  CANCELLED: "Dibatalkan",
};

export default async function HutangSupplierPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const supplierDebt = await getSupplierDebtSummary(user.tenantId);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Hutang Supplier</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Pantauan sederhana dari PO aktif. Pembayaran supplier detail bisa jadi tahap berikutnya.
          </p>
        </div>
        <Link
          href="/purchase-order"
          className="flex min-h-[40px] items-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          Buka Pembelian
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile
          label="Estimasi perlu dibayar"
          value={formatRupiah(supplierDebt.totalEstimatedPayable)}
          icon={ReceiptIcon}
        />
        <StatTile label="PO aktif" value={String(supplierDebt.activeCount)} icon={BarChartIcon} />
        <StatTile label="PO draft" value={String(supplierDebt.draftCount)} icon={UsersIcon} />
      </div>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Supplier terbesar</h2>
        <RankingBarChart
          items={supplierDebt.bySupplier.map((item) => ({
            label: item.supplierName,
            value: item.amount,
            sublabel: `${item.count} PO aktif`,
          }))}
        />
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] p-5">
          <h2 className="text-base font-bold text-[var(--color-text)]">PO terbaru</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Gunakan ini sebagai daftar pantau sampai modul pembayaran supplier dibuat.
          </p>
        </div>
        {supplierDebt.recent.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-text-secondary)]">Belum ada purchase order.</p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {supplierDebt.recent.map((po) => (
              <div key={po.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--color-text)]">{po.poNumber}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{po.supplierName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Dibuat {formatTanggalPendek(po.createdAt)}
                    {po.expectedAt ? ` · Estimasi datang ${formatTanggalPendek(po.expectedAt)}` : ""}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="rounded-lg bg-[var(--color-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
                    {STATUS_LABEL[po.status] ?? po.status}
                  </span>
                  <span className="shrink-0 font-mono-data tabular-nums text-sm font-bold text-[var(--color-text)]">
                    {formatRupiah(po.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
