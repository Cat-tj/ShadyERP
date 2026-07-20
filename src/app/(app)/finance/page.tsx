import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { getSalesSummary, getDailyTrend, getTopProducts } from "@/server/services/report-service";
import {
  getCashOutletSummary,
  getPaymentMethodSummary,
  getSupplierDebtSummary,
} from "@/server/services/finance-operational-service";
import { StatTile } from "@/components/laporan/stat-tile";
import { RankingBarChart } from "@/components/laporan/ranking-bar-chart";
import { TrendBarChart } from "@/components/laporan/trend-bar-chart";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { WalletIcon, TrendingDownIcon, TrendingUpIcon, ReceiptIcon } from "@/components/ui/icons";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { SectionCard } from "@/components/ui/section-card";

const FINANCE_SHORTCUTS = [
  { href: "/finance/pengeluaran", label: "Catat pengeluaran", description: "Sewa, gaji, bahan baku, listrik, dan biaya lain." },
  { href: "/finance/kas", label: "Cek kas outlet", description: "Lihat estimasi kas tunai dan selisih tutup shift." },
  { href: "/finance/hutang-supplier", label: "Pantau supplier", description: "PO aktif yang perlu dipantau pembayarannya." },
  { href: "/finance/laba-rugi", label: "Lihat laba rugi", description: "Omzet, HPP, pengeluaran, dan laba bersih simple." },
];

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
  DEPOSIT: "Deposit member",
};

export default async function FinanceHomePage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((outlet) => outlet.id);

  const [summary, paymentMethods, cashOutlets, supplierDebt, trend, topProducts] = await Promise.all([
    getSalesSummary(user.tenantId, outletIds, 30),
    getPaymentMethodSummary(user.tenantId, outletIds, 30),
    getCashOutletSummary(user.tenantId, outletIds, 30),
    getSupplierDebtSummary(user.tenantId),
    getDailyTrend(user.tenantId, outletIds, 30),
    getTopProducts(user.tenantId, outletIds, 30, 6),
  ]);

  const estimatedCash = cashOutlets.reduce((sum, outlet) => sum + outlet.estimatedCash, 0);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <EyebrowBadge>{formatTanggal(new Date())}</EyebrowBadge>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          Ringkasan Finance
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Gambaran sederhana uang masuk, pengeluaran, kas outlet, dan tagihan supplier.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Omzet 30 hari" value={formatRupiah(summary.totalOmzet)} icon={WalletIcon} />
        <StatTile label="Pengeluaran 30 hari" value={formatRupiah(summary.totalExpense)} icon={TrendingDownIcon} />
        <StatTile label="Estimasi laba bersih" value={formatRupiah(summary.untungBersih)} icon={TrendingUpIcon} />
        <StatTile label="Estimasi kas outlet" value={formatRupiah(estimatedCash)} icon={ReceiptIcon} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="30 hari terakhir" title="Metode bayar">
          <RankingBarChart
            items={paymentMethods.map((item) => ({
              label: PAYMENT_LABEL[item.method] ?? item.method,
              value: item.amount,
              sublabel: `${item.count} transaksi · ${item.percentage}% dari omzet tercatat`,
            }))}
          />
        </SectionCard>

        <SectionCard eyebrow="PO aktif" title="Hutang supplier simple">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Berdasarkan PO aktif. Status pembayaran detail bisa ditambah setelah alur invoice supplier dibuat.
          </p>
          <p className="mt-5 font-mono-data tabular-nums text-3xl font-semibold text-[var(--color-text)]">
            {formatRupiah(supplierDebt.totalEstimatedPayable)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {supplierDebt.activeCount} PO aktif · {supplierDebt.draftCount} draft
          </p>
          <Link
            href="/finance/hutang-supplier"
            className="mt-5 flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            Lihat detail supplier
          </Link>
        </SectionCard>
      </div>

      <SectionCard eyebrow="30 hari terakhir" title="Tren omzet">
        <TrendBarChart data={trend} />
      </SectionCard>

      <SectionCard eyebrow="30 hari terakhir" title="Produk terlaris">
        <RankingBarChart
          items={topProducts.map((p) => ({
            label: p.productName,
            value: p.omzet,
            sublabel: `${p.qty} terjual`,
          }))}
        />
      </SectionCard>

      <SectionCard eyebrow="Harian" title="Aksi finance harian">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FINANCE_SHORTCUTS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-[var(--color-border)] p-4 text-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
            >
              <span className="font-semibold text-[var(--color-text)]">{item.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {item.description}
              </span>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
