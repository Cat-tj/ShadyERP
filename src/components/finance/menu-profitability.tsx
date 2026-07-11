import { formatRupiah } from "@/lib/format";
import type { MenuProfitabilityRow } from "@/server/services/menu-profitability-service";

export function MenuProfitability({ rows }: { rows: MenuProfitabilityRow[] }) {
  const soldRows = rows.filter((r) => r.qtyTerjual > 0);
  const thinMargin = soldRows.filter((r) => r.marginPercent < 20);

  return (
    <div className="flex flex-col gap-4">
      {thinMargin.length > 0 && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          ⚠ {thinMargin.length} menu marginnya di bawah 20% — cek harga jual atau modalnya.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {soldRows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada menu yang terjual di periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-left text-xs text-[var(--color-text-secondary)]">
                  <th className="px-4 py-2.5 font-medium">Menu</th>
                  <th className="px-4 py-2.5 text-right font-medium">Harga Jual</th>
                  <th className="px-4 py-2.5 text-right font-medium">HPP</th>
                  <th className="px-4 py-2.5 text-right font-medium">Margin</th>
                  <th className="px-4 py-2.5 text-right font-medium">Terjual</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total Untung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {soldRows.map((row) => (
                  <tr key={row.productId}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-[var(--color-text)]">{row.productName}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {row.categoryName}
                        {row.hppSource === "resep" && " · HPP dari resep"}
                        {row.hppSource === "belum-ada" && " · Modal belum diisi"}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-data tabular-nums text-[var(--color-text)]">
                      {formatRupiah(row.price)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-data tabular-nums text-[var(--color-text-secondary)]">
                      {formatRupiah(row.hpp)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-mono-data tabular-nums font-semibold ${
                        row.marginPercent < 0
                          ? "text-[var(--color-danger)]"
                          : row.marginPercent < 20
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-[var(--color-good-text)]"
                      }`}
                    >
                      {formatRupiah(row.marginRp)} ({row.marginPercent}%)
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-data tabular-nums text-[var(--color-text)]">
                      {row.qtyTerjual}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-data tabular-nums font-semibold text-[var(--color-text)]">
                      {formatRupiah(row.totalProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
