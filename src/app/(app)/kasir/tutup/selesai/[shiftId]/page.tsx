import { notFound } from "next/navigation";
import { requireSession } from "@/server/require-session";
import { getShiftSummary } from "@/server/services/shift-service";
import { formatRupiah } from "@/lib/format";
import { CheckCircleIcon, AlertTriangleIcon } from "@/components/ui/icons";

export default async function ShiftSelesaiPage({
  params,
}: {
  params: Promise<{ shiftId: string }>;
}) {
  const { shiftId } = await params;
  const user = await requireSession();
  const summary = await getShiftSummary(user.tenantId, shiftId);

  if (!summary || summary.shift.status !== "CLOSED") {
    notFound();
  }

  const { shift } = summary;
  const expectedCash = shift.expectedCash ?? 0;
  const closingCash = shift.closingCash ?? 0;
  const selisih = closingCash - expectedCash;
  const isPas = selisih === 0;

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
          {isPas ? <CheckCircleIcon aria-hidden className="h-6 w-6" /> : <AlertTriangleIcon aria-hidden className="h-6 w-6" />}
        </div>
        <h1 className="mt-3 text-lg font-bold text-[var(--color-text)]">Shift ditutup</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{shift.outlet.name}</p>

        <div className="mt-4 flex flex-col gap-2 rounded-lg bg-[var(--color-bg)] p-4 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Uang seharusnya</span>
            <span className="tabular-nums font-medium">{formatRupiah(expectedCash)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Uang dihitung</span>
            <span className="tabular-nums font-medium">{formatRupiah(closingCash)}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
            <span className="font-semibold text-[var(--color-text)]">Selisih</span>
            <span
              className={`tabular-nums font-bold ${
                isPas ? "text-[var(--color-text)]" : "text-[var(--color-danger)]"
              }`}
            >
              {selisih > 0 ? "+" : ""}
              {formatRupiah(selisih)}
            </span>
          </div>
        </div>

        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          {isPas
            ? "Uangnya pas, terima kasih sudah menghitung dengan teliti."
            : selisih > 0
              ? "Uang di laci lebih banyak dari catatan. Coba periksa lagi hitungannya."
              : "Uang di laci kurang dari catatan. Coba periksa lagi hitungannya."}
        </p>

        <a
          href="/kasir"
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)]"
        >
          Kembali ke kasir
        </a>
      </div>
    </div>
  );
}
