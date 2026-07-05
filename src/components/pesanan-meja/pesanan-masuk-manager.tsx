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

export type TableItem = {
  id: string;
  name: string;
  posX: number;
  posY: number;
  isActive: boolean;
  floor: number;
  shape: string;
  capacity: number;
};

export function PesananMasukManager({
  orders,
  tables = [],
}: {
  orders: OrderRow[];
  tables?: TableItem[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [payingOrder, setPayingOrder] = useState<OrderRow | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "layout">("list");
  const [activeFloor, setActiveFloor] = useState(1);

  const [gridCols, setGridCols] = useState(() => Math.max(6, ...tables.map((t) => t.posX)));
  const [gridRows, setGridRows] = useState(() => Math.max(6, ...tables.map((t) => t.posY)));

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

  // Grid coordinates
  const rows = Array.from({ length: gridRows }, (_, i) => i + 1);
  const cols = Array.from({ length: gridCols }, (_, i) => i + 1);

  function getTableAt(x: number, y: number) {
    const table = tables.find((t) => t.posX === x && t.posY === y && t.floor === activeFloor);
    if (!table) return null;

    const order = orders.find(
      (o) =>
        o.tableName.toLowerCase() === table.name.toLowerCase() &&
        o.status !== "DONE" &&
        o.status !== "CANCELLED"
    );

    let status: "EMPTY" | "ORDERED" | "EATING" = "EMPTY";
    if (order) {
      if (order.status === "PENDING") {
        status = "ORDERED";
      } else {
        status = "EATING";
      }
    }

    return { table, order, status };
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Pesanan Masuk</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Pesanan yang dikirim pelanggan lewat QR meja. Kelola pesanan di sini secara list atau visual layout.
        </p>
      </div>

      {/* Mode Selector Tab */}
      <div className="flex rounded-lg bg-[var(--color-bg)] p-0.5 border border-[var(--color-border)] self-start mb-2">
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
            viewMode === "list"
              ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          }`}
        >
          Daftar Pesanan
        </button>
        <button
          type="button"
          onClick={() => setViewMode("layout")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
            viewMode === "layout"
              ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          }`}
        >
          Peta Layout Meja
        </button>
      </div>

      {viewMode === "layout" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4 flex-wrap border-b border-[var(--color-border)] pb-2">
            {/* Floor selector */}
            <div className="flex gap-1.5">
              {[1, 2, 3].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFloor(f)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeFloor === f
                      ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  Lantai {f}
                </button>
              ))}
            </div>

            {/* Grid Size Controllers */}
            <div className="flex gap-4 items-center flex-wrap text-xs bg-[var(--color-surface)] p-2 px-3 rounded-lg border border-[var(--color-border)]">
              <span className="font-bold text-[var(--color-text-secondary)]">Area Grid:</span>
              <div className="flex items-center gap-1.5">
                <span>Kolom (X):</span>
                <button
                  type="button"
                  disabled={gridCols <= 4}
                  onClick={() => setGridCols((c) => Math.max(4, c - 1))}
                  className="w-6 h-6 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold w-4 text-center">{gridCols}</span>
                <button
                  type="button"
                  disabled={gridCols >= 12}
                  onClick={() => setGridCols((c) => Math.min(12, c + 1))}
                  className="w-6 h-6 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Baris (Y):</span>
                <button
                  type="button"
                  disabled={gridRows <= 4}
                  onClick={() => setGridRows((r) => Math.max(4, r - 1))}
                  className="w-6 h-6 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold w-4 text-center">{gridRows}</span>
                <button
                  type="button"
                  disabled={gridRows >= 12}
                  onClick={() => setGridRows((r) => Math.min(12, r + 1))}
                  className="w-6 h-6 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] inline-block" />
              <span>Kosong</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-amber-500/20 border border-amber-500 inline-block" />
              <span>Baru Pesan (Belum Makan)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-indigo-500/20 border border-indigo-500 inline-block" />
              <span>Sedang Makan</span>
            </div>
          </div>

          <div
            className="grid gap-2 bg-[var(--color-surface)]/20 p-4 rounded-2xl border border-[var(--color-border)]"
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
          >
            {rows.flatMap((y) =>
              cols.map((x) => {
                const cell = getTableAt(x, y);
                if (!cell) {
                  return (
                    <div
                      key={`empty-${x}-${y}`}
                      className="aspect-square rounded-xl border border-dashed border-[var(--color-border)]/20 bg-transparent flex items-center justify-center text-[var(--color-text-secondary)]/10 text-[9px] select-none"
                    >
                      {x},{y}
                    </div>
                  );
                }

                const { table, order, status } = cell;
                let bgClass = "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]";
                let badgeLabel = "Kosong";
                let badgeClass = "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]";

                if (status === "ORDERED") {
                  bgClass = "bg-amber-500/5 border-amber-500/80 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10";
                  badgeLabel = "Baru Pesan";
                  badgeClass = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
                } else if (status === "EATING") {
                  bgClass = "bg-indigo-500/5 border-indigo-500/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10";
                  badgeLabel = "Makan";
                  badgeClass = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20";
                }

                let shapeClass = "rounded-xl aspect-square";
                if (table.shape === "ROUND") {
                  shapeClass = "rounded-full aspect-square";
                } else if (table.shape === "RECTANGLE") {
                  shapeClass = "rounded-lg w-[95%] h-[75%] aspect-[1.6/1]";
                }

                return (
                  <div key={table.id} className="aspect-square flex items-center justify-center">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (order) {
                          setPayingOrder(order);
                        } else {
                          showToast(`${table.name} sedang kosong.`);
                        }
                      }}
                      className={`border-2 flex flex-col items-center justify-center p-1.5 transition-all text-center ${shapeClass} ${bgClass} cursor-pointer`}
                    >
                      <span className="text-xs font-bold truncate max-w-full">{table.name}</span>
                      <span className={`text-[7px] font-semibold px-1 py-0.5 rounded border mt-0.5 max-w-full truncate ${badgeClass}`}>
                        {badgeLabel} · {table.capacity}p
                      </span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {viewMode === "list" && orders.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Belum ada pesanan masuk. Pesanan baru akan muncul di sini secara otomatis.
          </p>
        </div>
      ) : viewMode === "list" && (
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
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl rounded-t-3xl p-6 sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Bayar · {order.tableName}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
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
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
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
