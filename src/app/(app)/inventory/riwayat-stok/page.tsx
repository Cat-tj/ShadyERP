import Link from "next/link";
import { requireRole } from "@/server/require-session";
import { getStockAdjustments } from "@/server/services/product-service";
import { formatTanggal, formatJam } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { ClockIcon } from "@/components/ui/icons";

export default async function RiwayatStokPage() {
  const user = await requireRole(["OWNER", "MANAGER"]);
  const adjustments = await getStockAdjustments(user.tenantId);

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <Link href="/produk" className="text-xs font-bold text-[var(--color-primary)] hover:underline">
        ← Kembali ke Produk
      </Link>

      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
        Riwayat Perubahan Stok
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Catatan setiap kali stok produk diubah manual lewat halaman detail Produk.
      </p>

      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        {adjustments.length === 0 ? (
          <EmptyState
            icon={ClockIcon}
            title="Belum ada perubahan stok manual"
            description="Setiap penyesuaian stok dari halaman detail produk akan tercatat otomatis di sini."
            action={{
              label: "Kembali ke Produk",
              href: "/produk",
            }}
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {adjustments.map((adj) => (
              <div key={adj.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{adj.product.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {adj.outlet.name} · oleh {adj.changedBy.name} · {formatTanggal(adj.createdAt)},{" "}
                    {formatJam(adj.createdAt)}
                  </p>
                  {adj.note && (
                    <p className="mt-1 text-xs italic text-[var(--color-text-secondary)]">&quot;{adj.note}&quot;</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm tabular-nums text-[var(--color-text-secondary)]">
                    {adj.previousQty} → {adj.newQty}
                  </p>
                  <p
                    className={`tabular-nums text-sm font-bold ${
                      adj.delta >= 0 ? "text-[var(--color-primary)]" : "text-[var(--color-danger)]"
                    }`}
                  >
                    {adj.delta > 0 ? "+" : ""}
                    {adj.delta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
