"use client";

import { useActionState, useState } from "react";
import { openShiftAction, type ActionResult } from "@/app/(app)/kasir/actions";

const initialState: ActionResult = {};

export function OpenShiftForm({
  outlets,
}: {
  outlets: { id: string; name: string; suggestedOpeningCash?: number | null }[];
}) {
  const [state, formAction, isPending] = useActionState(openShiftAction, initialState);
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");

  const formatNumber = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(clean));
  };

  const suggestedCash = outlets.find((o) => o.id === outletId)?.suggestedOpeningCash ?? null;
  const [displayValue, setDisplayValue] = useState(() =>
    suggestedCash ? formatNumber(String(suggestedCash)) : "Rp 0"
  );
  const [rawCash, setRawCash] = useState(suggestedCash ?? 0);
  const [touchedCash, setTouchedCash] = useState(false);

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOutletId = e.target.value;
    setOutletId(newOutletId);
    if (touchedCash) return;
    const next = outlets.find((o) => o.id === newOutletId)?.suggestedOpeningCash ?? null;
    setRawCash(next ?? 0);
    setDisplayValue(next ? formatNumber(String(next)) : "Rp 0");
  };

  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouchedCash(true);
    const rawValue = e.target.value;
    const cleanNum = Number(rawValue.replace(/\D/g, ""));
    setRawCash(cleanNum);
    setDisplayValue(formatNumber(rawValue));
  };

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h1 className="text-lg font-bold text-[var(--color-text)]">Buka shift kasir</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Masukkan modal awal di laci kasir untuk mulai berjualan.
      </p>

      <form action={formAction} className="mt-5 flex flex-col gap-4">
        {state.error && (
          <div className="rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {state.error}
          </div>
        )}

        {outlets.length === 0 ? (
          <div className="rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            Kamu belum ditugaskan ke outlet manapun. Minta pemilik toko menugaskanmu dulu.
          </div>
        ) : (
          <>
            {outlets.length > 1 ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="outletId" className="text-sm font-medium text-[var(--color-text)]">
                  Outlet
                </label>
                <select
                  id="outletId"
                  name="outletId"
                  required
                  value={outletId}
                  onChange={handleOutletChange}
                  className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <input type="hidden" name="outletId" value={outlets[0].id} />
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="displayOpeningCash" className="text-sm font-medium text-[var(--color-text)]">
                Modal awal
              </label>
              {suggestedCash !== null && !touchedCash && (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Disarankan dari sisa kas penutupan shift terakhir — ubah kalau hasil hitung ulang beda.
                </p>
              )}
              <input
                id="displayOpeningCash"
                type="text"
                inputMode="numeric"
                required
                value={displayValue}
                onChange={handleCashChange}
                placeholder="Rp 0"
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              <input type="hidden" name="openingCash" value={rawCash} />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
              )}
              {isPending ? "Membuka shift..." : "Buka shift & mulai jualan"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
