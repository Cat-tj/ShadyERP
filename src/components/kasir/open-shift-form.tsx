"use client";

import { useActionState, useState } from "react";
import { openShiftAction, type ActionResult } from "@/app/(app)/kasir/actions";

const initialState: ActionResult = {};

export function OpenShiftForm({
  outlets,
}: {
  outlets: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(openShiftAction, initialState);
  const [displayValue, setDisplayValue] = useState("");
  const [rawCash, setRawCash] = useState(0);

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

  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
