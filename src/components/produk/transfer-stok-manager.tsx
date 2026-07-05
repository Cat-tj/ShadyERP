"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  receiveStockTransferAction,
  rejectStockTransferAction,
  requestStockTransferAction,
  sendStockTransferAction,
} from "@/app/(app)/produk/actions";
import { useToast, Toast } from "@/components/toast";

export type OutletOption = { id: string; name: string };
export type ProductOption = {
  id: string;
  name: string;
  stockByOutlet: Record<string, number>;
};
export type StockTransferStatus = "REQUESTED" | "SENT" | "RECEIVED" | "REJECTED" | "CANCELLED";
export type TransferOption = {
  id: string;
  productName: string;
  fromOutletName: string;
  toOutletName: string;
  requestedByName: string;
  sentByName?: string | null;
  receivedByName?: string | null;
  status: StockTransferStatus;
  qty: number;
  sentQty?: number | null;
  receivedQty?: number | null;
  note?: string | null;
  rejectReason?: string | null;
  createdLabel: string;
};

const statusCopy: Record<StockTransferStatus, { label: string; className: string }> = {
  REQUESTED: {
    label: "Menunggu dikirim",
    className: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
  },
  SENT: {
    label: "Dalam perjalanan",
    className: "bg-blue-50 text-blue-700",
  },
  RECEIVED: {
    label: "Selesai",
    className: "bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Ditolak",
    className: "bg-red-50 text-red-700",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-[var(--color-muted)] text-[var(--color-text-secondary)]",
  },
};

export function TransferStokManager({
  outlets,
  products,
  transfers,
}: {
  outlets: OutletOption[];
  products: ProductOption[];
  transfers: TransferOption[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [fromOutletId, setFromOutletId] = useState(outlets[0]?.id ?? "");
  const [toOutletId, setToOutletId] = useState(outlets[1]?.id ?? outlets[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTransferId, setActiveTransferId] = useState<string | null>(null);
  const [receiveQtyById, setReceiveQtyById] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  );
  const availableQty = selectedProduct?.stockByOutlet[fromOutletId] ?? 0;

  function handleSubmit() {
    setError(null);
    const qtyNumber = Number(qty);
    if (!productId) {
      setError("Pilih produk terlebih dahulu.");
      return;
    }
    if (fromOutletId === toOutletId) {
      setError("Outlet asal dan tujuan tidak boleh sama.");
      return;
    }
    if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) {
      setError("Jumlah transfer tidak valid.");
      return;
    }
    startTransition(async () => {
      const result = await requestStockTransferAction(
        productId,
        fromOutletId,
        toOutletId,
        qtyNumber,
        note.trim() || undefined
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Request transfer stok dibuat");
      setQty("");
      setNote("");
      router.refresh();
    });
  }

  function handleSendTransfer(transfer: TransferOption) {
    setError(null);
    setActiveTransferId(transfer.id);
    startTransition(async () => {
      const result = await sendStockTransferAction(transfer.id, transfer.qty);
      setActiveTransferId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Stok sudah dikirim dari cabang asal");
      router.refresh();
    });
  }

  function handleReceiveTransfer(transfer: TransferOption) {
    setError(null);
    const sentQty = transfer.sentQty ?? transfer.qty;
    const rawQty = receiveQtyById[transfer.id] ?? String(sentQty);
    const receivedQty = Number(rawQty);
    if (!Number.isFinite(receivedQty) || receivedQty < 0) {
      setError("Jumlah terima tidak valid.");
      return;
    }
    if (receivedQty > sentQty) {
      setError("Jumlah terima tidak boleh lebih besar dari jumlah kirim.");
      return;
    }

    setActiveTransferId(transfer.id);
    startTransition(async () => {
      const result = await receiveStockTransferAction(transfer.id, receivedQty);
      setActiveTransferId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Stok sudah diterima cabang tujuan");
      router.refresh();
    });
  }

  function handleRejectTransfer(transfer: TransferOption) {
    setError(null);
    setActiveTransferId(transfer.id);
    startTransition(async () => {
      const result = await rejectStockTransferAction(transfer.id, "Request ditolak dari halaman transfer stok.");
      setActiveTransferId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Request transfer ditolak");
      router.refresh();
    });
  }

  if (outlets.length < 2) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
        Transfer stok butuh minimal 2 outlet aktif.
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
        Belum ada produk dengan pelacakan stok aktif.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      {error && (
        <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Produk</label>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Dari outlet</label>
            <select
              value={fromOutletId}
              onChange={(event) => setFromOutletId(event.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Stok tersedia saat ini: {availableQty}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Ke outlet</label>
            <select
              value={toOutletId}
              onChange={(event) => setToOutletId(event.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Jumlah</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            placeholder="0"
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Catatan (opsional)</label>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="mis. kirim stok untuk stok outlet baru"
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
        )}
        {isPending && !activeTransferId ? "Membuat request..." : "Buat request transfer"}
      </button>

      <Toast message={toastMessage} />
    </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Request & riwayat transfer</h2>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          {transfers.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-[var(--color-text-secondary)]">
              Belum ada transfer stok. Request antar cabang akan muncul di sini.
            </p>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {transfers.map((transfer) => {
                const status = statusCopy[transfer.status];
                const sentQty = transfer.sentQty ?? transfer.qty;
                const receivedQty = transfer.receivedQty ?? sentQty;
                const isActive = activeTransferId === transfer.id && isPending;

                return (
                  <div key={transfer.id} className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {transfer.productName}
                          </p>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          {transfer.fromOutletName} → {transfer.toOutletName} · dibuat oleh{" "}
                          {transfer.requestedByName} · {transfer.createdLabel}
                        </p>
                        {transfer.sentByName && (
                          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            Dikirim oleh {transfer.sentByName}
                          </p>
                        )}
                        {transfer.receivedByName && (
                          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            Diterima oleh {transfer.receivedByName}
                          </p>
                        )}
                        {transfer.note && (
                          <p className="mt-2 text-xs italic text-[var(--color-text-secondary)]">
                            &quot;{transfer.note}&quot;
                          </p>
                        )}
                        {transfer.rejectReason && (
                          <p className="mt-2 text-xs text-red-700">{transfer.rejectReason}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <p className="tabular-nums text-sm font-bold text-[var(--color-primary)]">
                          Request {transfer.qty} unit
                        </p>
                        {transfer.status !== "REQUESTED" && (
                          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            Kirim {sentQty} · Terima {transfer.status === "RECEIVED" ? receivedQty : "-"}
                          </p>
                        )}
                      </div>
                    </div>

                    {transfer.status === "REQUESTED" && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          onClick={() => handleSendTransfer(transfer)}
                          disabled={isPending}
                          className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                          {isActive ? "Mengirim..." : "Kirim dari cabang asal"}
                        </button>
                        <button
                          onClick={() => handleRejectTransfer(transfer)}
                          disabled={isPending}
                          className="min-h-[44px] rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-60"
                        >
                          Tolak request
                        </button>
                      </div>
                    )}

                    {transfer.status === "SENT" && (
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={sentQty}
                          value={receiveQtyById[transfer.id] ?? String(sentQty)}
                          onChange={(event) =>
                            setReceiveQtyById((current) => ({
                              ...current,
                              [transfer.id]: event.target.value,
                            }))
                          }
                          className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        <button
                          onClick={() => handleReceiveTransfer(transfer)}
                          disabled={isPending}
                          className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                          {isActive ? "Menerima..." : "Terima di cabang tujuan"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
