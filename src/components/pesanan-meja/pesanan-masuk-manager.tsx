"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TableOrderStatus, PaymentMethod } from "@prisma/client";
import { formatRupiah, formatJam } from "@/lib/format";
import { updateOrderStatusAction, completeOrderPaymentAction } from "@/app/(app)/pesanan-meja/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type OrderItemRow = {
  id: string;
  productName: string;
  variantLabel: string | null;
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
  ACCEPTED: "Sedang dimasak",
  READY: "Siap disajikan",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",
};

const REFRESH_INTERVAL_MS = 15000;

export function PesananMasukManager({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [payingOrder, setPayingOrder] = useState<OrderRow | null>(null);

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
          Pesanan yang dikirim pelanggan lewat QR meja. Stok sudah dipotong sejak pesanan dibuat — tekan
          &quot;Proses Pembayaran&quot; saat pelanggan bayar, transaksi otomatis tercatat.
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
                        {item.variantLabel && (
                          <span className="text-[var(--color-text-secondary)]"> · {item.variantLabel}</span>
                        )}
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
                  {(order.status === "ACCEPTED" || order.status === "READY") && (
                    <button
                      onClick={() => setPayingOrder(order)}
                      disabled={isPending}
                      className="min-h-[40px] flex-1 rounded-lg bg-[var(--color-primary)] px-3 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
                    >
                      Proses Pembayaran
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

      {payingOrder && (
        <PaymentSheet
          order={payingOrder}
          onClose={() => setPayingOrder(null)}
          onSuccess={() => {
            showToast(`${payingOrder.tableName}: pembayaran berhasil dicatat`);
            setPayingOrder(null);
            router.refresh();
          }}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}

const QUICK_CASH = [20000, 50000, 100000];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Tunai" },
  { value: "QRIS", label: "QRIS" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "EWALLET", label: "E-Wallet" },
];

function PaymentSheet({
  order,
  onClose,
  onSuccess,
}: {
  order: OrderRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const total = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amountInput, setAmountInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [splitCount, setSplitCount] = useState("");

  const splitN = Math.max(0, Math.floor(Number(splitCount) || 0));
  const perPerson = splitN > 1 ? Math.ceil(total / splitN) : 0;

  const amountPaid = method === "CASH" ? Number(amountInput) || 0 : total;
  const change = method === "CASH" ? Math.max(0, amountPaid - total) : 0;
  const isCashInsufficient = method === "CASH" && amountPaid < total;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await completeOrderPaymentAction(order.id, method, amountPaid);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Bayar · {order.tableName}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Total tagihan</p>
          <p className="tabular-nums text-3xl font-bold text-[var(--color-text)]">{formatRupiah(total)}</p>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <label htmlFor="splitCount" className="shrink-0 text-sm text-[var(--color-text-secondary)]">
            Patungan untuk
          </label>
          <input
            id="splitCount"
            type="number"
            inputMode="numeric"
            min={0}
            value={splitCount}
            onChange={(event) => setSplitCount(event.target.value)}
            placeholder="0"
            className="h-9 w-16 rounded-md border border-[var(--color-border)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
          />
          <span className="shrink-0 text-sm text-[var(--color-text-secondary)]">orang</span>
          {splitN > 1 && (
            <span className="ml-auto shrink-0 tabular-nums text-sm font-bold text-[var(--color-primary)]">
              {formatRupiah(perPerson)}/orang
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Hanya kalkulator pembagian — pembayaran tetap dicatat sebagai satu transaksi.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="mt-4">
          <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">Metode pembayaran</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setMethod(option.value);
                  setAmountInput("");
                }}
                className={`min-h-[48px] rounded-lg border text-sm font-medium ${
                  method === option.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {method === "CASH" ? (
          <div className="mt-4">
            <label htmlFor="amountPaid" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Uang diterima
            </label>
            <input
              id="amountPaid"
              type="number"
              inputMode="numeric"
              min={0}
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              placeholder="0"
              className="min-h-[52px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-xl font-bold tabular-nums text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setAmountInput(String(total))}
                className="min-h-[40px] rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text)]"
              >
                Uang pas
              </button>
              {QUICK_CASH.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setAmountInput(String(amount))}
                  className="min-h-[40px] rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text)]"
                >
                  {formatRupiah(amount)}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-[var(--color-surface)] px-4 py-3">
              <span className="text-sm text-[var(--color-text-secondary)]">Kembalian</span>
              <span className="tabular-nums text-lg font-bold text-[var(--color-text)]">
                {formatRupiah(change)}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            Pastikan pembayaran {formatRupiah(total)} sudah diterima lewat{" "}
            {PAYMENT_METHODS.find((m) => m.value === method)?.label} sebelum lanjut.
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending || isCashInsufficient}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Menyimpan..." : `Selesaikan — ${formatRupiah(total)}`}
        </button>
      </div>
    </div>
  );
}
