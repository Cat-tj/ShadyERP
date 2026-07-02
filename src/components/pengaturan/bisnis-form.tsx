"use client";

import { useState, useTransition } from "react";
import { updateTenantSettingAction } from "@/app/(app)/pengaturan/bisnis/actions";
import { useToast, Toast } from "@/components/toast";

export function BisnisForm({
  taxPercent,
  pointsPerAmount,
  receiptFooter,
}: {
  taxPercent: number;
  pointsPerAmount: number;
  receiptFooter: string | null;
}) {
  const { toastMessage, showToast } = useToast();
  const [tax, setTax] = useState(String(taxPercent));
  const [points, setPoints] = useState(String(pointsPerAmount));
  const [footer, setFooter] = useState(receiptFooter ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await updateTenantSettingAction({
        taxPercent: Number(tax) || 0,
        pointsPerAmount: Number(points) || 10000,
        receiptFooter: footer.trim() || null,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Pengaturan disimpan");
    });
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      {error && (
        <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Pajak transaksi (%)</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className="min-h-[48px] w-full max-w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <p className="text-xs text-[var(--color-text-secondary)]">Isi 0 kalau tidak pakai pajak.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Rasio poin member</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-secondary)]">Setiap belanja Rp</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="min-h-[48px] w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">dapat 1 poin</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Catatan kaki struk (opsional)</label>
          <textarea
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="Terima kasih sudah berbelanja!"
            rows={3}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {isPending ? "Menyimpan..." : "Simpan pengaturan"}
      </button>

      <Toast message={toastMessage} />
    </div>
  );
}
