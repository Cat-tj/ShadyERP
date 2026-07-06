import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listSales } from "@/server/services/sale-service";
import { listCashOutTransactions } from "@/server/services/cash-out-service";
import { RiwayatList, type SaleRow } from "@/components/kasir/riwayat-list";
import { formatJam, formatRupiah, formatTanggal } from "@/lib/format";

const CASH_OUT_METHOD_LABEL: Record<string, string> = {
  DEBIT_CARD: "Kartu debit",
  CREDIT_CARD: "Kartu kredit",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
};

export default async function RiwayatPage() {
  const user = await requireSession();
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const outletIds = outlets.map((outlet) => outlet.id);
  const [sales, cashOutTransactions] = await Promise.all([
    listSales(user.tenantId, outletIds),
    listCashOutTransactions(user.tenantId, outletIds),
  ]);

  const rows: SaleRow[] = sales.map((sale) => ({
    id: sale.id,
    invoiceNumber: sale.invoiceNumber,
    outletName: sale.outlet.name,
    cashierName: sale.cashier.name,
    memberName: sale.member?.name ?? null,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    orderType: sale.orderType,
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

      <section className="mt-8">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Riwayat gesek tunai</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Cash keluar dari laci dicatat terpisah dari penjualan produk.
          </p>
        </div>

        {cashOutTransactions.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada transaksi gesek tunai.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cashOutTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {transaction.referenceNumber}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {formatTanggal(transaction.createdAt.toISOString())},{" "}
                      {formatJam(transaction.createdAt.toISOString())} · {transaction.outlet.name} ·{" "}
                      {transaction.cashier.name}
                    </p>
                    {(transaction.customerName || transaction.customerPhone) && (
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        {transaction.customerName ?? "Customer"}
                        {transaction.customerPhone ? ` · ${transaction.customerPhone}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                      {formatRupiah(transaction.totalCharged)}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {CASH_OUT_METHOD_LABEL[transaction.method] ?? transaction.method}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 rounded-lg bg-[var(--color-bg)] p-3 text-xs sm:grid-cols-3">
                  <div>
                    <p className="text-[var(--color-text-secondary)]">Cash keluar</p>
                    <p className="font-semibold tabular-nums text-[var(--color-danger)]">
                      -{formatRupiah(transaction.withdrawAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-secondary)]">Admin fee</p>
                    <p className="font-semibold tabular-nums text-[var(--color-text)]">
                      {formatRupiah(transaction.adminFee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-secondary)]">Status</p>
                    <p className="font-semibold text-[var(--color-text)]">{transaction.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
