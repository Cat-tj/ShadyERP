"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Outlet, PurchaseOrder } from "@prisma/client";
import {
  createStockReceiptAction,
  performQCAction,
  completeStockReceiptAction,
  rejectStockReceiptAction,
} from "@/app/(app)/stock-receipt/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type StockReceiptRow = {
  id: string;
  receiptNumber: string;
  po: PurchaseOrder & { supplier: any };
  outlet: Outlet;
  status: "PENDING" | "PARTIAL_QC" | "COMPLETED" | "REJECTED";
  receivedAt?: Date;
  completedAt?: Date;
  items: Array<{
    id: string;
    productId: string;
    product: any;
    qtyReceived: number;
    qtyAccepted: number;
    qtyDefect: number;
    qcStatus: "PENDING" | "PASSED" | "PARTIAL_DEFECT" | "REJECTED";
    qcNotes?: string;
  }>;
};

type ReceiptFormItem = {
  productId: string;
  qtyReceived: number;
};

type QCFormItem = {
  receiptItemId: string;
  qtyAccepted: number;
  qtyDefect: number;
  qcNotes?: string;
};

function StockReceiptFormModal({
  po,
  outlets,
  onClose,
  onSaved,
}: {
  po: PurchaseOrder & { items: any[] };
  outlets: Outlet[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [outletId, setOutletId] = useState("");
  const [items, setItems] = useState<ReceiptFormItem[]>(
    po.items.map((i) => ({ productId: i.productId, qtyReceived: i.qty }))
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!outletId.trim()) return setError("Outlet wajib dipilih.");

    startTransition(async () => {
      const result = await createStockReceiptAction(po.id, outletId, items);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Barang masuk dibuat");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Terima barang</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Outlet*</label>
            <select
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              <option value="">Pilih outlet</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">Item pemesanan</h3>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => {
                const product = po.items.find((i) => i.productId === item.productId)?.product;
                return (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] p-2">
                    <div className="text-xs">
                      <p className="font-medium text-[var(--color-text)]">{product?.name}</p>
                      <p className="text-[var(--color-text-secondary)]">Jumlah: {item.qtyReceived}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Buat penerimaan"}
        </button>
      </div>
    </div>
  );
}

function StockReceiptQCModal({
  receipt,
  onClose,
  onSaved,
}: {
  receipt: StockReceiptRow;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [qcItems, setQCItems] = useState<QCFormItem[]>(
    receipt.items.map((i) => ({
      receiptItemId: i.id,
      qtyAccepted: i.qtyAccepted,
      qtyDefect: i.qtyDefect,
      qcNotes: i.qcNotes,
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateQC(index: number, field: keyof QCFormItem, value: string | number) {
    const newItems = [...qcItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setQCItems(newItems);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await performQCAction(receipt.id, qcItems);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Pemeriksaan kualitas selesai");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Pemeriksaan Kualitas</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {qcItems.map((qc, idx) => {
            const item = receipt.items[idx];
            return (
              <div key={idx} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">{item.product.name}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-[var(--color-text-secondary)]">Diterima</label>
                      <input
                        type="number"
                        min="0"
                        max={item.qtyReceived}
                        value={qc.qtyAccepted}
                        onChange={(e) => updateQC(idx, "qtyAccepted", parseInt(e.target.value))}
                        className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-[var(--color-text-secondary)]">Cacat</label>
                      <input
                        type="number"
                        min="0"
                        max={item.qtyReceived}
                        value={qc.qtyDefect}
                        onChange={(e) => updateQC(idx, "qtyDefect", parseInt(e.target.value))}
                        className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={qc.qcNotes || ""}
                    onChange={(e) => updateQC(idx, "qcNotes", e.target.value)}
                    placeholder="Catatan pemeriksaan"
                    className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                  />
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Pesanan: {item.qtyReceived} · Diterima: {qc.qtyAccepted} · Cacat: {qc.qtyDefect}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Simpan pemeriksaan"}
        </button>
      </div>
    </div>
  );
}

export function StockReceiptManager({
  receipts,
  purchaseOrders,
  outlets,
}: {
  receipts: StockReceiptRow[];
  purchaseOrders: (PurchaseOrder & { items: any[] })[];
  outlets: Outlet[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [qcModalOpen, setQCModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<(PurchaseOrder & { items: any[] }) | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<StockReceiptRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const statusLabels: Record<"PENDING" | "PARTIAL_QC" | "COMPLETED" | "REJECTED", string> = {
    PENDING: "Menunggu QC",
    PARTIAL_QC: "Sebagian QC",
    COMPLETED: "Selesai",
    REJECTED: "Ditolak",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PARTIAL_QC: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  function completeReceipt(receipt: StockReceiptRow) {
    startTransition(async () => {
      const result = await completeStockReceiptAction(receipt.id);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Barang masuk disimpan");
      router.refresh();
    });
  }

  function rejectReceipt(receipt: StockReceiptRow) {
    const reason = prompt("Alasan penolakan?");
    if (!reason) return;

    startTransition(async () => {
      const result = await rejectStockReceiptAction(receipt.id, reason);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Barang masuk ditolak");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Barang Masuk</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Penerimaan & pemeriksaan kualitas barang</p>
        </div>
        <button
          onClick={() => {
            setSelectedPO(null);
            setModalOpen(true);
          }}
          className="min-h-[44px] w-full rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] sm:w-auto"
        >
          + Terima barang
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {receipts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada penerimaan barang. Terima barang pertamamu →
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {receipt.receiptNumber}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[receipt.status]}`}>
                      {statusLabels[receipt.status]}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {receipt.po?.supplier?.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {receipt.items.length} item · {receipt.outlet.name}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {receipt.status === "PENDING" && (
                    <button
                      onClick={() => {
                        setSelectedReceipt(receipt);
                        setQCModalOpen(true);
                      }}
                      className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 sm:flex-none"
                    >
                      QC
                    </button>
                  )}
                  {receipt.status === "PARTIAL_QC" && (
                    <>
                      <button
                        onClick={() => completeReceipt(receipt)}
                        disabled={isPending}
                        className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40 sm:flex-none"
                      >
                        Selesaikan
                      </button>
                      <button
                        onClick={() => rejectReceipt(receipt)}
                        disabled={isPending}
                        className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 sm:flex-none"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && selectedPO && (
        <StockReceiptFormModal
          po={selectedPO}
          outlets={outlets}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      {qcModalOpen && selectedReceipt && (
        <StockReceiptQCModal
          receipt={selectedReceipt}
          onClose={() => setQCModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
