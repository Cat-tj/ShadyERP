import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/require-session";
import { getSaleById } from "@/server/services/sale-service";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatTanggal, formatJam } from "@/lib/format";
import { PrintButton } from "@/components/kasir/print-button";

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
  DEPOSIT: "Saldo deposit",
};

export default async function StrukPage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const { saleId } = await params;
  const user = await requireSession();
  const [sale, tenant, setting] = await Promise.all([
    getSaleById(user.tenantId, saleId),
    prisma.tenant.findUnique({ where: { id: user.tenantId } }),
    prisma.tenantSetting.findUnique({ where: { tenantId: user.tenantId } }),
  ]);

  if (!sale) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-sm">
      <div id="struk" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        {sale.status === "VOIDED" && (
          <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-2 text-center text-sm font-semibold text-[var(--color-warning-text)]">
            Transaksi ini sudah dibatalkan
          </div>
        )}

        <div className="text-center">
          <p className="text-lg font-bold text-[var(--color-text)]">{tenant?.name}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{sale.outlet.name}</p>
        </div>

        <div className="my-4 border-t border-dashed border-[var(--color-border)]" />

        <div className="flex flex-col gap-1 text-sm text-[var(--color-text-secondary)]">
          <div className="flex justify-between">
            <span>No. struk</span>
            <span className="font-medium text-[var(--color-text)]">{sale.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal</span>
            <span>
              {formatTanggal(sale.createdAt)}, {formatJam(sale.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Kasir</span>
            <span>{sale.cashier.name}</span>
          </div>
          {sale.member && (
            <div className="flex justify-between">
              <span>Member</span>
              <span>{sale.member.name}</span>
            </div>
          )}
        </div>

        <div className="my-4 border-t border-dashed border-[var(--color-border)]" />

        <div className="flex flex-col gap-2">
          {sale.items.map((item) => (
            <div key={item.id} className="text-sm">
              <div className="flex justify-between text-[var(--color-text)]">
                <span>
                  {item.productName}
                  {item.variantLabel && (
                    <span className="text-[var(--color-text-secondary)]"> · {item.variantLabel}</span>
                  )}
                </span>
                <span className="tabular-nums">{formatRupiah(item.subtotal)}</span>
              </div>
              <p className="tabular-nums text-xs text-[var(--color-text-secondary)]">
                {item.qty} x {formatRupiah(item.price)}
                {item.discountAmount > 0 ? ` (diskon ${formatRupiah(item.discountAmount)})` : ""}
              </p>
              {item.returnedQty > 0 && (
                <p className="text-xs text-[var(--color-warning-text)]">
                  {item.returnedQty} item sudah diretur
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-[var(--color-border)]" />

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatRupiah(sale.subtotal)}</span>
          </div>
          {sale.discountAmount > 0 && (
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Diskon</span>
              <span className="tabular-nums">-{formatRupiah(sale.discountAmount)}</span>
            </div>
          )}
          {sale.taxAmount > 0 && (
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Pajak</span>
              <span className="tabular-nums">{formatRupiah(sale.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-[var(--color-text)]">
            <span>Total</span>
            <span className="tabular-nums">{formatRupiah(sale.total)}</span>
          </div>
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>{PAYMENT_LABEL[sale.paymentMethod]}</span>
            <span className="tabular-nums">{formatRupiah(sale.amountPaid)}</span>
          </div>
          {sale.paymentMethod === "CASH" && (
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Kembalian</span>
              <span className="tabular-nums">{formatRupiah(sale.changeAmount)}</span>
            </div>
          )}
        </div>

        {sale.saleReturns.length > 0 && (
          <>
            <div className="my-4 border-t border-dashed border-[var(--color-border)]" />
            <div className="flex flex-col gap-2 print:hidden">
              <p className="text-sm font-bold text-[var(--color-text)]">Riwayat retur</p>
              {sale.saleReturns.map((saleReturn) => (
                <div key={saleReturn.id} className="rounded-lg bg-[var(--color-bg)] p-2 text-xs text-[var(--color-text-secondary)]">
                  <div className="flex justify-between text-[var(--color-text)]">
                    <span>{formatTanggal(saleReturn.createdAt)}, {formatJam(saleReturn.createdAt)}</span>
                    <span className="tabular-nums font-semibold">-{formatRupiah(saleReturn.totalRefund)}</span>
                  </div>
                  <p>Oleh {saleReturn.processedBy.name} · {saleReturn.reason}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {setting?.receiptFooter && (
          <>
            <div className="my-4 border-t border-dashed border-[var(--color-border)]" />
            <p className="text-center text-sm text-[var(--color-text-secondary)]">
              {setting.receiptFooter}
            </p>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 print:hidden">
        <PrintButton />
        <Link
          href="/kasir"
          className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)]"
        >
          Transaksi baru
        </Link>
      </div>
    </div>
  );
}
