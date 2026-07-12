import { notFound } from "next/navigation";
import { requireSessionWithTenant } from "@/server/require-session";
import { getCateringOrder } from "@/server/services/catering-order-service";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { PrintButton } from "@/components/kasir/print-button";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu konfirmasi",
  CONFIRMED: "Terkonfirmasi",
  DONE: "Selesai",
  CANCELLED: "Batal",
};

export default async function CateringNotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, tenant } = await requireSessionWithTenant();
  const order = await getCateringOrder(user.tenantId, id);
  if (!order) notFound();

  const remaining = order.total - order.paidAmount;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="print:hidden">
        <PrintButton label="Cetak nota" />
      </div>

      <div id="print-area" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <p className="font-display text-xl font-bold text-[var(--color-text)]">{tenant?.name ?? "Toko"}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{order.outlet.name}</p>
            {order.outlet.address && <p className="text-xs text-[var(--color-text-secondary)]">{order.outlet.address}</p>}
            {order.outlet.phone && <p className="text-xs text-[var(--color-text-secondary)]">{order.outlet.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--color-text)]">NOTA PESANAN KATERING</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{order.orderNumber}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{formatTanggalPendek(order.createdAt)}</p>
            <p className="mt-1 text-xs font-semibold text-[var(--color-primary)]">{STATUS_LABEL[order.status] ?? order.status}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-b border-[var(--color-border)] pb-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Pemesan</p>
            <p className="mt-1 font-medium text-[var(--color-text)]">{order.customerName}</p>
            {order.customerPhone && <p className="text-[var(--color-text-secondary)]">{order.customerPhone}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Acara</p>
            <p className="mt-1 font-medium text-[var(--color-text)]">{order.eventName ?? "-"}</p>
            {order.eventAddress && <p className="text-[var(--color-text-secondary)]">{order.eventAddress}</p>}
            {order.eventDate && <p className="text-[var(--color-text-secondary)]">{formatTanggalPendek(order.eventDate)}</p>}
          </div>
        </div>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
              <th className="py-2">Produk</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Harga satuan</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--color-border)]">
                <td className="py-2 text-[var(--color-text)]">{item.productName}</td>
                <td className="py-2 text-right text-[var(--color-text)]">{item.qty}</td>
                <td className="py-2 text-right text-[var(--color-text)]">{formatRupiah(item.unitPrice)}</td>
                <td className="py-2 text-right font-medium text-[var(--color-text)]">{formatRupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Total tagihan</span>
            <span className="font-bold text-[var(--color-text)]">{formatRupiah(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Sudah dibayar</span>
            <span className="font-medium text-[var(--color-text)]">{formatRupiah(order.paidAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Sisa tagihan</span>
            <span className={`font-bold ${remaining > 0 ? "text-[var(--color-danger)]" : "text-[var(--color-text)]"}`}>
              {formatRupiah(Math.max(0, remaining))}
            </span>
          </div>
        </div>

        {order.note && (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Catatan</p>
            <p className="mt-1 text-[var(--color-text)]">{order.note}</p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-[var(--color-text-secondary)]">Terima kasih atas kepercayaannya.</p>
      </div>
    </div>
  );
}
