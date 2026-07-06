import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { getSupplierDebtSummary } from "@/server/services/finance-operational-service";
import { StatTile } from "@/components/laporan/stat-tile";
import { RankingBarChart } from "@/components/laporan/ranking-bar-chart";
import { formatRupiah } from "@/lib/format";
import { ReceiptIcon, UsersIcon, BarChartIcon } from "@/components/ui/icons";
import { prisma } from "@/lib/prisma";
import { SupplierDebtManager, type SupplierInvoiceRow } from "@/components/finance/supplier-debt-manager";

export default async function HutangSupplierPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  
  // Load analytic summary for POs
  const supplierDebt = await getSupplierDebtSummary(user.tenantId);

  // Load real invoices & suppliers from Supabase
  const rawInvoices = await prisma.supplierInvoice.findMany({
    where: { tenantId: user.tenantId },
    include: { supplier: { select: { name: true } } },
    orderBy: { invoiceDate: "desc" },
  });

  const suppliers = await prisma.supplier.findMany({
    where: { tenantId: user.tenantId, status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const invoices = rawInvoices.map((inv: any) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    invoiceDate: inv.invoiceDate.toISOString(),
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    total: inv.total,
    paidAmount: inv.paidAmount,
    status: inv.status,
    notes: inv.notes,
    supplier: {
      name: inv.supplier.name,
    },
  })) as SupplierInvoiceRow[];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Hutang & Tagihan Supplier</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Catat cicilan, pelunasan hutang, serta invoice operasional dari supplier Anda secara otomatis maupun manual.
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
          label="Estimasi PO Aktif"
          value={formatRupiah(supplierDebt.totalEstimatedPayable)}
          icon={ReceiptIcon}
        />
        <StatTile label="PO Aktif" value={String(supplierDebt.activeCount)} icon={BarChartIcon} />
        <StatTile label="PO Draft" value={String(supplierDebt.draftCount)} icon={UsersIcon} />
      </div>

      {/* Main Autopilot Debt Manager UI */}
      <SupplierDebtManager invoices={invoices} suppliers={suppliers} />

      {/* Analytic section */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Distribusi Hutang Terbesar</h2>
        <RankingBarChart
          items={supplierDebt.bySupplier.map((item) => ({
            label: item.supplierName,
            value: item.amount,
            sublabel: `${item.count} PO aktif`,
          }))}
        />
      </section>
    </div>
  );
}
