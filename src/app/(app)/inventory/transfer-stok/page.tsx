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
      />

      <div>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Riwayat transfer</h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {transfers.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-[var(--color-text-secondary)]">
              Belum ada transfer stok. Riwayat akan muncul di sini setiap kali stok dipindah antar outlet.
            </p>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {transfer.product.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {transfer.fromOutlet.name} → {transfer.toOutlet.name} · oleh{" "}
                      {transfer.transferredBy.name} · {formatTanggal(transfer.createdAt)},{" "}
                      {formatJam(transfer.createdAt)}
                    </p>
                    {transfer.note && (
                      <p className="mt-1 text-xs italic text-[var(--color-text-secondary)]">
                        &quot;{transfer.note}&quot;
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular-nums text-sm font-bold text-[var(--color-primary)]">
                      {transfer.qty} unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
