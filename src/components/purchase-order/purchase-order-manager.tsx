"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product, Supplier } from "@prisma/client";
import {
  createPurchaseOrderAction,
  approvePurchaseOrderAction,
  rejectPurchaseOrderAction,
  confirmPurchaseOrderAction,
} from "@/app/(app)/purchase-order/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon, PackageIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

export type PurchaseOrderRow = {
  id: string;
  poNumber: string;
  supplier: Supplier;
  status: "DRAFT" | "SENT" | "CONFIRMED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  sentAt?: Date;
  expectedAt?: Date;
  createdAt: Date;
  items: Array<{
    id: string;
    productId: string;
    product: Product;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }>;
};

type POFormItem = {
  productId: string;
  qty: number;
  unitPrice: number;
};

function PurchaseOrderFormModal({
  po,
  suppliers,
  products,
  onClose,
  onSaved,
}: {
  po: PurchaseOrderRow | null;
  suppliers: Supplier[];
  products: Product[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState(po?.supplier.id ?? "");
  const [items, setItems] = useState<POFormItem[]>(
    po?.items.map((i) => ({ productId: i.productId, qty: i.qty, unitPrice: i.unitPrice })) ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addItem() {
    setItems([...items, { productId: "", qty: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof POFormItem, value: string | number) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: field === "productId" ? value : Number(value) };
    setItems(newItems);
  }

  function handleSubmit() {
    setError(null);
    if (!supplierId.trim()) return setError("Supplier wajib dipilih.");
    if (items.length === 0) return setError("Minimal ada 1 item dalam PO.");

    startTransition(async () => {
      const result = await createPurchaseOrderAction(supplierId, items);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Pemesanan dibuat");
      router.refresh();
      onClose();
    });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {po ? "Ubah pemesanan" : "Buat pemesanan"}
          </h2>
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
            <label className="text-sm font-medium text-[var(--color-text)]">Supplier*</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={!!po}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-60"
            >
              <option value="">Pilih supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Item pemesanan</h3>
              <button
                onClick={addItem}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                + Tambah
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3">
                  <div className="flex gap-2">
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(idx, "productId", e.target.value)}
                      className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="">Pilih produk</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeItem(idx)}
                      className="rounded border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, "qty", e.target.value)}
                      placeholder="Jumlah"
                      className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                      placeholder="Harga"
                      className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div className="text-right text-xs text-[var(--color-text-secondary)]">
                    Subtotal: Rp {(item.qty * item.unitPrice).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text)]">Total</span>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                Rp {totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Buat pemesanan"}
        </button>
      </div>
    </div>
  );
}

export function PurchaseOrderManager({
  purchaseOrders,
  suppliers,
  products,
}: {
  purchaseOrders: PurchaseOrderRow[];
  suppliers: Supplier[];
  products: Product[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const statusLabels: Record<
    "DRAFT" | "SENT" | "CONFIRMED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED",
    string
  > = {
    DRAFT: "Draft",
    SENT: "Terkirim",
    CONFIRMED: "Dikonfirmasi",
    PARTIALLY_RECEIVED: "Sebagian Diterima",
    RECEIVED: "Diterima",
    CANCELLED: "Dibatalkan",
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-[var(--color-bg)] text-[var(--color-text)]",
    SENT: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-green-100 text-green-800",
    PARTIALLY_RECEIVED: "bg-yellow-100 text-yellow-800",
    RECEIVED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  function approvePO(po: PurchaseOrderRow) {
    startTransition(async () => {
      const result = await approvePurchaseOrderAction(po.id);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Pemesanan disetujui");
      router.refresh();
    });
  }

  function rejectPO(po: PurchaseOrderRow) {
    const reason = prompt("Alasan penolakan?");
    if (!reason) return;

    startTransition(async () => {
      const result = await rejectPurchaseOrderAction(po.id, reason);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Pemesanan ditolak");
      router.refresh();
    });
  }

  function confirmPO(po: PurchaseOrderRow) {
    const expectedDateStr = prompt("Tanggal pengiriman diharapkan? (YYYY-MM-DD)");
    if (!expectedDateStr) return;

    startTransition(async () => {
      const result = await confirmPurchaseOrderAction(po.id, expectedDateStr);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Pemesanan dikonfirmasi");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Pembelian</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Kelola pesanan pembelian ke supplier</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="min-h-[44px] w-full rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] sm:w-auto"
        >
          + Buat pemesanan
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {purchaseOrders.length === 0 ? (
          <EmptyState
            icon={PackageIcon}
            title="Belum ada pemesanan"
            description="Buat pesanan ke supplier untuk mencatat stok yang dipesan, estimasi biaya, dan status penerimaan."
            action={{
              label: "+ Buat Pemesanan",
              onClick: () => {
                setModalOpen(true);
              },
            }}
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {po.poNumber}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[po.status]}`}>
                      {statusLabels[po.status]}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{po.supplier.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {po.items.length} item · Rp {po.totalAmount.toLocaleString("id-ID")}
                  </p>
                  {po.expectedAt && (
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      Diharapkan: {new Date(po.expectedAt).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {po.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => approvePO(po)}
                        disabled={isPending}
                        className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40 sm:flex-none"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => rejectPO(po)}
                        disabled={isPending}
                        className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 sm:flex-none"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                  {po.status === "SENT" && (
                    <button
                      onClick={() => confirmPO(po)}
                      disabled={isPending}
                      className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40 sm:flex-none"
                    >
                      Konfirmasi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <PurchaseOrderFormModal
          po={null}
          suppliers={suppliers}
          products={products}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
