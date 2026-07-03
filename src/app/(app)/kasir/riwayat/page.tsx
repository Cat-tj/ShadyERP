import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listSales } from "@/server/services/sale-service";
import { RiwayatList, type SaleRow } from "@/components/kasir/riwayat-list";

export default async function RiwayatPage() {
  const user = await requireSession();
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const sales = await listSales(
    user.tenantId,
    outlets.map((outlet) => outlet.id)
  );

  const rows: SaleRow[] = sales.map((sale) => ({
    id: sale.id,
    invoiceNumber: sale.invoiceNumber,
    outletName: sale.outlet.name,
    cashierName: sale.cashier.name,
    memberName: sale.member?.name ?? null,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    status: sale.status,
    voidReason: sale.voidReason,
    createdAt: sale.createdAt.toISOString(),
    items: sale.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      qty: item.qty,
      returnedQty: item.returnedQty,
      subtotal: item.subtotal,
    })),
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Riwayat transaksi</h1>
        <a
          href="/api/export/transaksi"
          className="flex min-h-[40px] items-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          Ekspor CSV
        </a>
      </div>
      <RiwayatList sales={rows} canVoid={user.role === "OWNER" || user.role === "MANAGER"} />
    </div>
  );
}
