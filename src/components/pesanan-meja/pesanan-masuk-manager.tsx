"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TableOrderStatus } from "@prisma/client";
import { formatRupiah, formatJam } from "@/lib/format";
import { updateOrderStatusAction } from "@/app/(app)/pesanan-meja/actions";
import { useToast, Toast } from "@/components/toast";

export type OrderItemRow = {
  id: string;
  productName: string;
  price: number;
  qty: number;
  note: string | null;
};

export type OrderRow = {
  id: string;
  status: TableOrderStatus;
  customerName: string | null;
  note: string | null;
  createdAt: string;
  tableName: string;
  outletName: string;
  items: OrderItemRow[];
};

const STATUS_LABEL: Record<TableOrderStatus, string> = {
  PENDING: "Pesanan baru",
  ACCEPTED: "Sedang diproses",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",
};

const REFRESH_INTERVAL_MS = 15000;

export function PesananMasukManager({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  function updateStatus(order: OrderRow, status: TableOrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(`${order.tableName}: ${STATUS_LABEL[status]}`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Pesanan Masuk</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Pesanan yang dikirim pelanggan lewat QR meja. Proses pembayaran tetap dilakukan manual di kasir.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Belum ada pesanan masuk. Pesanan baru akan muncul di sini secara otomatis.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const total = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
            return (
              <div
                key={order.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      {order.tableName}
                      {order.customerName ? ` · ${order.customerName}` : ""}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {order.outletName} · {formatJam(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      order.status === "PENDING"
                        ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
                        : "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate text-[var(--color-text)]">
                        {item.qty}× {item.productName}
                        {item.note && (
                          <span className="text-[var(--color-text-secondary)]"> ({item.note})</span>
                        )}
                      </span>
                      <span className="shrink-0 tabular-nums text-[var(--color-text-secondary)]">
                        {formatRupiah(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                  {order.note && (
                    <p className="mt-1 text-xs italic text-[var(--color-text-secondary)]">
                      &quot;{order.note}&quot;
                    </p>
                  )}
                  <div className="mt-1 flex justify-between border-t border-[var(--color-border)] pt-2 text-sm font-bold text-[var(--color-text)]">
                    <span>Total</span>
                    <span className="tabular-nums">{formatRupiah(total)}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => updateStatus(order, "ACCEPTED")}
                      disabled={isPending}
                      className="min-h-[40px] flex-1 rounded-lg bg-[var(--color-primary)] px-3 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
                    >
                      Terima
                    </button>
                  )}
                  {order.status === "ACCEPTED" && (
                    <button
                      onClick={() => updateStatus(order, "DONE")}
                      disabled={isPending}
                      className="min-h-[40px] flex-1 rounded-lg bg-[var(--color-primary)] px-3 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
                    >
                      Selesai
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(order, "CANCELLED")}
                    disabled={isPending}
                    className="min-h-[40px] rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40"
                  >
                    Batalkan
                  </button>
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
