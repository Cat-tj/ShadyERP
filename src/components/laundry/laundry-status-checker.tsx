"use client";

import { useState, useTransition } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { checkLaundryStatusAction, type PublicLaundryStatus } from "@/app/cucian/actions";

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Diterima",
  WASHING: "Dicuci",
  DRYING: "Dikeringkan",
  IRONING: "Disetrika",
  READY: "Siap diambil",
  PICKED_UP: "Selesai diambil",
  CANCELLED: "Dibatalkan",
};

const STATUS_STEP: Record<string, number> = {
  RECEIVED: 1,
  WASHING: 2,
  DRYING: 3,
  IRONING: 4,
  READY: 5,
  PICKED_UP: 6,
};

const STEPS = ["Diterima", "Dicuci", "Dikeringkan", "Disetrika", "Siap diambil"];

export function LaundryStatusChecker() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<PublicLaundryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    startTransition(async () => {
      const result = await checkLaundryStatusAction(orderNumber, phone);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOrder(result.order ?? null);
    });
  }

  const currentStep = order ? STATUS_STEP[order.status] : 0;

  return (
    <GlassPanel strong className="w-full max-w-sm rounded-xl p-6">
      <h1 className="text-center font-display text-lg font-semibold text-[var(--color-text)]">
        Cek status cucian
      </h1>
      <p className="mt-1 text-center text-sm text-[var(--color-text-secondary)]">
        Masukkan nomor order dari struk & nomor HP yang kamu kasih ke kasir.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Nomor order (mis. LDY-...)"
          className="min-h-[48px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nomor HP"
          className="min-h-[48px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Mencari..." : "Cek status"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-center text-sm font-medium text-[var(--color-danger)]">{error}</p>
      )}

      {order && (
        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="text-center">
            <p className="text-xs text-[var(--color-text-secondary)]">{order.orderNumber}</p>
            <p className="text-base font-bold text-[var(--color-text)]">{order.customerName}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{order.outletName}</p>
          </div>

          {order.status === "CANCELLED" ? (
            <p className="text-center text-sm font-semibold text-[var(--color-danger)]">
              Order ini sudah dibatalkan.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {STEPS.map((label, index) => {
                const stepNumber = index + 1;
                const done = currentStep >= stepNumber;
                return (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        done
                          ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                          : "bg-[var(--color-border)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {done ? "✓" : stepNumber}
                    </span>
                    <span className={done ? "font-semibold text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-sm">
            <span className="text-[var(--color-text-secondary)]">Status saat ini</span>
            <span className="font-semibold text-[var(--color-text)]">{STATUS_LABEL[order.status] ?? order.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">Total tagihan</span>
            <span className="font-semibold text-[var(--color-text)]">{formatRupiah(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">Sudah dibayar</span>
            <span className="font-semibold text-[var(--color-text)]">{formatRupiah(order.paidAmount)}</span>
          </div>
          {order.dueAt && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Estimasi selesai</span>
              <span className="font-semibold text-[var(--color-text)]">{formatTanggal(order.dueAt)}</span>
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
