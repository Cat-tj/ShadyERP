import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { listProductsFull, getStockTransfers } from "@/server/services/product-service";
import { listOutletsForUser } from "@/server/services/outlet-service";
import { TransferStokManager } from "@/components/produk/transfer-stok-manager";
import { formatTanggal, formatJam } from "@/lib/format";

export default async function TransferStokPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);

  const [products, outlets, transfers] = await Promise.all([
    listProductsFull(user.tenantId),
    listOutletsForUser(user.tenantId, user.id, user.role),
    getStockTransfers(user.tenantId),
  ]);

  const trackedProducts = products.filter((product) => product.trackStock && product.isActive);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/produk" className="text-sm font-medium text-[var(--color-primary)]">
        ← Kembali ke Produk
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Transfer stok antar outlet
        </h1>
      </div>

      <TransferStokManager
        outlets={outlets.map((outlet) => ({ id: outlet.id, name: outlet.name }))}
        products={trackedProducts.map((product) => ({
          id: product.id,
          name: product.name,
          stockByOutlet: Object.fromEntries(
            product.stocks.map((stock) => [stock.outletId, stock.qty])
          ),
        }))}
        transfers={transfers.map((transfer) => ({
          id: transfer.id,
          productName: transfer.product.name,
          fromOutletName: transfer.fromOutlet.name,
          toOutletName: transfer.toOutlet.name,
          requestedByName: transfer.transferredBy.name,
          sentByName: transfer.sentBy?.name ?? null,
          receivedByName: transfer.receivedBy?.name ?? null,
          status: transfer.status,
          qty: transfer.qty,
          sentQty: transfer.sentQty,
          receivedQty: transfer.receivedQty,
          note: transfer.note,
          rejectReason: transfer.rejectReason,
          createdLabel: `${formatTanggal(transfer.createdAt)}, ${formatJam(transfer.createdAt)}`,
        }))}
      />
    </div>
  );
}
