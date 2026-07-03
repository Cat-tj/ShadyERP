"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TableOrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/app/(app)/pesanan-meja/actions";
import { useToast, Toast } from "@/components/toast";

export type KitchenItemRow = {
  id: string;
  productName: string;
  variantLabel: string | null;
  qty: number;
  note: string | null;
};

export type KitchenOrderRow = {
  id: string;
  status: TableOrderStatus;
  customerName: string | null;
  note: string | null;
  createdAt: string;
  tableName: string;
  outletName: string;
  items: KitchenItemRow[];
};

const REFRESH_INTERVAL_MS = 15000;
const TICK_INTERVAL_MS = 30000;
const WARN_AFTER_MIN = 5;
const URGENT_AFTER_MIN = 15;

function minutesSince(iso: string, now: number) {
  return Math.floor((now - new Date(iso).getTime()) / 60000);
}

export function KitchenDisplay({ orders }: { orders: KitchenOrderRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refreshInterval = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    const tickInterval = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => {
      clearInterval(refreshInterval);
      clearInterval(tickInterval);
    };
  }, [router]);

  function advance(order: KitchenOrderRow, status: TableOrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      if (result.error) {
        showToast(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Dapur</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Pesanan meja yang menunggu dimasak. Layar ini otomatis menyegarkan setiap 15 detik.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-24 text-center">
          <p className="text-lg text-[var(--color-text-secondary)]">Tidak ada pesanan yang perlu dimasak 🎉</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const minutes = minutesSince(order.createdAt, now);
            const isUrgent = minutes >= URGENT_AFTER_MIN;
            const isWarn = !isUrgent && minutes >= WARN_AFTER_MIN;
            return (
              <div
                key={order.id}
                className={`flex flex-col gap-3 rounded-2xl border-2 bg-[var(--color-surface)] p-4 ${
                  isUrgent
                    ? "border-[var(--color-danger)] animate-pulse"
                    : isWarn
                      ? "border-[var(--color-warning-text)]"
                      : "border-[var(--color-border)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-[var(--color-text)]">{order.tableName}</p>
                    {order.customerName && (
                      <p className="text-sm text-[var(--color-text-secondary)]">{order.customerName}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold tabular-nums ${
                      isUrgent
                        ? "bg-[var(--color-danger)] text-white"
                        : isWarn
                          ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
                          : "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {minutes} mnt
                  </span>
                </div>

                <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-base text-[var(--color-text)]">
                      <span className="font-bold">{item.qty}×</span> {item.productName}
                      {item.variantLabel && (
                        <span className="text-[var(--color-text-secondary)]"> · {item.variantLabel}</span>
                      )}
                      {item.note && (
                        <p className="text-sm italic text-[var(--color-text-secondary)]">&quot;{item.note}&quot;</p>
                      )}
                    </div>
                  ))}
                  {order.note && (
                    <p className="text-sm italic text-[var(--color-text-secondary)]">&quot;{order.note}&quot;</p>
                  )}
                </div>

                <div className="mt-auto flex gap-2 pt-2">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => advance(order, "ACCEPTED")}
                      disabled={isPending}
                      className="min-h-[52px] flex-1 rounded-xl bg-[var(--color-primary)] text-base font-bold text-[var(--color-on-primary)] disabled:opacity-40"
                    >
                      Mulai Masak
                    </button>
                  )}
                  {order.status === "ACCEPTED" && (
                    <button
                      onClick={() => advance(order, "READY")}
                      disabled={isPending}
                      className="min-h-[52px] flex-1 rounded-xl bg-[var(--color-primary)] text-base font-bold text-[var(--color-on-primary)] disabled:opacity-40"
                    >
                      Siap Disajikan
                    </button>
                  )}
                  {order.status === "READY" && (
                    <div className="flex min-h-[52px] flex-1 items-center justify-center rounded-xl bg-[var(--color-bg)] text-base font-bold text-[var(--color-primary)]">
                      Siap diantar
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
