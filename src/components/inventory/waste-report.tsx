import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { WASTE_REASON_LABEL, type WasteSummary } from "@/server/services/waste-service";

type RecentWasteRow = {
  id: string;
  createdAt: Date;
  delta: number;
  reason: string | null;
  note: string | null;
  product: { name: string };
  outlet: { name: string };
  changedBy: { name: string };
};

export function WasteReport({
  summary,
  recentWaste,
}: {
  summary: WasteSummary;
  recentWaste: RecentWasteRow[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">Total item terbuang</p>
          <p className="mt-1 text-xl font-bold text-[var(--color-text)]">{summary.totalLossQty}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">Estimasi nilai kerugian</p>
          <p className="mt-1 text-xl font-bold text-[var(--color-danger)]">{formatRupiah(summary.totalLossValue)}</p>
        </div>
      </div>

      {summary.byReason.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="mb-2 text-sm font-bold text-[var(--color-text)]">Berdasarkan alasan</p>
          <div className="flex flex-col gap-2">
            {summary.byReason
              .sort((a, b) => b.value - a.value)
              .map((r) => (
                <div key={r.reason} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">
                    {WASTE_REASON_LABEL[r.reason]} ({r.qty})
                  </span>
                  <span className="tabular-nums font-medium text-[var(--color-text)]">{formatRupiah(r.value)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {summary.topProducts.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="mb-2 text-sm font-bold text-[var(--color-text)]">Produk paling banyak terbuang</p>
          <div className="flex flex-col gap-2">
            {summary.topProducts.map((p) => (
              <div key={p.productId} className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">
                  {p.productName} ({p.qty})
                </span>
                <span className="tabular-nums font-medium text-[var(--color-text)]">{formatRupiah(p.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <p className="border-b border-[var(--color-border)] px-4 py-3 text-sm font-bold text-[var(--color-text)]">
          Riwayat catatan kerugian
        </p>
        {recentWaste.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada catatan kerugian.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {recentWaste.map((row) => (
              <div key={row.id} className="flex flex-col gap-1 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--color-text)]">
                    {row.product.name} x{Math.abs(row.delta)}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {formatTanggalPendek(row.createdAt.toISOString())}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {row.reason ? WASTE_REASON_LABEL[row.reason as keyof typeof WASTE_REASON_LABEL] : "-"} ·{" "}
                  {row.outlet.name} · dicatat oleh {row.changedBy.name}
                  {row.note ? ` · ${row.note}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
