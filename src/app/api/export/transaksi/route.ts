import { requireSession } from "@/server/require-session";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { listSales } from "@/server/services/sale-service";
import { toCsv, csvResponse } from "@/lib/csv";
import { formatTanggal, formatJam } from "@/lib/format";

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
  DEPOSIT: "Saldo deposit",
};

export async function GET() {
  const user = await requireSession();
  const outlets = await listOutletsForUser(user.tenantId, user.id, user.role);
  const sales = await listSales(
    user.tenantId,
    outlets.map((outlet) => outlet.id),
    1000
  );

  const rows = sales.map((sale) => ({
    invoiceNumber: sale.invoiceNumber,
    tanggal: `${formatTanggal(sale.createdAt)} ${formatJam(sale.createdAt)}`,
    outlet: sale.outlet.name,
    kasir: sale.cashier.name,
    member: sale.member?.name ?? "",
    metodeBayar: PAYMENT_LABEL[sale.paymentMethod] ?? sale.paymentMethod,
    subtotal: sale.subtotal,
    diskon: sale.discountAmount,
    pajak: sale.taxAmount,
    total: sale.total,
    status: sale.status === "VOIDED" ? "Dibatalkan" : "Selesai",
  }));

  const csv = toCsv(rows, [
    { key: "invoiceNumber", label: "No. Invoice" },
    { key: "tanggal", label: "Tanggal" },
    { key: "outlet", label: "Outlet" },
    { key: "kasir", label: "Kasir" },
    { key: "member", label: "Member" },
    { key: "metodeBayar", label: "Metode Bayar" },
    { key: "subtotal", label: "Subtotal" },
    { key: "diskon", label: "Diskon" },
    { key: "pajak", label: "Pajak" },
    { key: "total", label: "Total" },
    { key: "status", label: "Status" },
  ]);

  return csvResponse(csv, `transaksi-${new Date().toISOString().slice(0, 10)}.csv`);
}
