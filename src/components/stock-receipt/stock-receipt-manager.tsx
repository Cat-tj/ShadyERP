"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Outlet, Product, PurchaseOrder, PurchaseOrderItem, Supplier } from "@prisma/client";
import {
  createDirectStockReceiptAction,
  createStockReceiptAction,
  performQCAction,
  completeStockReceiptAction,
  rejectStockReceiptAction,
} from "@/app/(app)/stock-receipt/actions";
import { BarcodeScannerModal } from "@/components/shared/barcode-scanner-modal";
import { useToast, Toast } from "@/components/toast";
import { CameraIcon, XIcon, PackageIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah } from "@/lib/format";

type PurchaseOrderSummary = PurchaseOrder & {
  supplier?: Pick<Supplier, "id" | "name"> | null;
};

type PurchaseOrderWithItems = PurchaseOrderSummary & {
  items: Array<PurchaseOrderItem & { product: Pick<Product, "id" | "name"> }>;
};

export type StockReceiptRow = {
  id: string;
  receiptNumber: string;
  po: PurchaseOrderSummary;
  outlet: Outlet;
  status: "PENDING" | "PARTIAL_QC" | "COMPLETED" | "REJECTED";
  shippingCost: number;
  otherCost: number;
  receivedAt?: Date;
  completedAt?: Date;
  items: Array<{
    id: string;
    productId: string;
    product: Pick<Product, "id" | "name">;
    qtyReceived: number;
    qtyAccepted: number;
    qtyDefect: number;
    batchNumber?: string | null;
    expirationDate?: Date | null;
    qcStatus: "PENDING" | "PASSED" | "PARTIAL_DEFECT" | "REJECTED";
    qcNotes?: string;
  }>;
};

type DirectReceiptItem = {
  productId: string;
  qtyReceived: string;
  unitPrice: string;
  batchNumber: string;
  expirationDate: string;
  /** Satu nomor seri/IMEI per baris teks — dipakai kalau produknya trackSerial. */
  serialNumbersText: string;
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
  po: PurchaseOrderWithItems;
  outlets: Outlet[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [outletId, setOutletId] = useState("");
  const [items] = useState<ReceiptFormItem[]>(
    po.items.map((i) => ({ productId: i.productId, qtyReceived: i.qty }))
  );
  const [shippingCost, setShippingCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!outletId.trim()) return setError("Outlet wajib dipilih.");

    startTransition(async () => {
      const result = await createStockReceiptAction(po.id, outletId, items, {
        shippingCost: Math.max(0, Math.round(Number(shippingCost) || 0)),
        otherCost: Math.max(0, Math.round(Number(otherCost) || 0)),
      });
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

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">Ongkos kirim & biaya lain (opsional)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
                Ongkos kirim
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  placeholder="Rp0"
                  className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
                Biaya lain (bongkar, dll)
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={otherCost}
                  onChange={(e) => setOtherCost(e.target.value)}
                  placeholder="Rp0"
                  className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Biaya ini dibagi otomatis ke modal tiap produk (sesuai porsi nilainya) saat penerimaan diselesaikan.
            </p>
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

function DirectStockReceiptModal({
  products,
  suppliers,
  outlets,
  onClose,
  onSaved,
}: {
  products: Product[];
  suppliers: Supplier[];
  outlets: Outlet[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [skuInput, setSkuInput] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [items, setItems] = useState<DirectReceiptItem[]>([
    { productId: products[0]?.id ?? "", qtyReceived: "1", unitPrice: String(products[0]?.cost ?? 0), batchNumber: "", expirationDate: "", serialNumbersText: "" },
  ]);
  const [shippingCost, setShippingCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateItem(index: number, patch: Partial<DirectReceiptItem>) {
    setError(null);
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setError(null);
    setItems((prev) => [
      ...prev,
      { productId: products[0]?.id ?? "", qtyReceived: "1", unitPrice: String(products[0]?.cost ?? 0), batchNumber: "", expirationDate: "", serialNumbersText: "" },
    ]);
  }

  function addBySku(value = skuInput) {
    const query = value.trim().toLowerCase();
    if (!query) return;
    const product = products.find(
      (item) => item.sku?.toLowerCase() === query || item.name.toLowerCase().includes(query)
    );
    if (!product) {
      setError("Produk tidak ditemukan dari SKU/nama itu.");
      return;
    }
    setError(null);
    setItems((prev) => [
      ...prev,
      { productId: product.id, qtyReceived: "1", unitPrice: String(product.cost ?? 0), batchNumber: "", expirationDate: "", serialNumbersText: "" },
    ]);
    setSkuInput("");
  }

  function handleSubmit() {
    setError(null);
    if (!outletId) return setError("Outlet wajib dipilih.");
    const parsed = items
      .map((item) => ({
        productId: item.productId,
        qtyReceived: Number(item.qtyReceived),
        unitPrice: Math.max(0, Math.round(Number(item.unitPrice) || 0)),
        batchNumber: item.batchNumber.trim() || null,
        expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
        serialNumbers: item.serialNumbersText
          .split(/\r?\n|,/)
          .map((s) => s.trim())
          .filter(Boolean),
      }))
      .filter((item) => item.productId && item.qtyReceived > 0);

    const serialMismatch = parsed.find((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product?.trackSerial && item.serialNumbers.length !== item.qtyReceived;
    });
    if (serialMismatch) {
      const product = products.find((p) => p.id === serialMismatch.productId);
      return setError(
        `${product?.name}: jumlah serial/IMEI yang diisi (${serialMismatch.serialNumbers.length}) harus sama dengan qty (${serialMismatch.qtyReceived}).`
      );
    }
    if (parsed.length === 0) return setError("Isi minimal satu produk dengan jumlah valid.");

    startTransition(async () => {
      const result = await createDirectStockReceiptAction(outletId, supplierId || null, parsed, note.trim() || null, {
        shippingCost: Math.max(0, Math.round(Number(shippingCost) || 0)),
        otherCost: Math.max(0, Math.round(Number(otherCost) || 0)),
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Penerimaan langsung dibuat. Lanjut QC untuk memasukkan stok.");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[92vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Barang datang</h2>
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

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
            Outlet
            <select
              value={outletId}
              onChange={(event) => setOutletId(event.target.value)}
              className="min-h-[46px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-base outline-none focus:border-[var(--color-primary)]"
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
            Supplier
            <select
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="min-h-[46px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-base outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Supplier Umum</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <label className="text-sm font-medium text-[var(--color-text)]">Scan / ketik SKU produk</label>
          <div className="mt-2 flex gap-2">
            <input
              value={skuInput}
              onChange={(event) => setSkuInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addBySku();
                }
              }}
              placeholder="Scan barcode atau ketik nama produk"
              className="min-h-[42px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              aria-label="Scan barcode produk dengan kamera"
              className="flex min-h-[42px] w-11 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              <CameraIcon aria-hidden className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => addBySku()}
              className="min-h-[42px] rounded-lg border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text)]"
            >
              Tambah
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <div className="grid gap-2 sm:grid-cols-[1.5fr_0.7fr_0.8fr]">
                <select
                  value={item.productId}
                  onChange={(event) => {
                    const product = products.find((p) => p.id === event.target.value);
                    updateItem(index, { productId: event.target.value, unitPrice: String(product?.cost ?? 0) });
                  }}
                  className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={item.qtyReceived}
                  onChange={(event) => updateItem(index, { qtyReceived: event.target.value })}
                  placeholder="Qty"
                  className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={item.unitPrice}
                  onChange={(event) => updateItem(index, { unitPrice: event.target.value })}
                  placeholder="Modal/unit"
                  className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <input
                  value={item.batchNumber}
                  onChange={(event) => updateItem(index, { batchNumber: event.target.value })}
                  placeholder="Batch/lot (opsional)"
                  className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <input
                  type="date"
                  value={item.expirationDate}
                  onChange={(event) => updateItem(index, { expirationDate: event.target.value })}
                  className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              {products.find((p) => p.id === item.productId)?.trackSerial && (
                <div className="mt-2">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    Serial/IMEI (satu per baris, jumlahnya harus sama dengan qty)
                  </label>
                  <textarea
                    value={item.serialNumbersText}
                    onChange={(event) => updateItem(index, { serialNumbersText: event.target.value })}
                    placeholder={`IMEI1\nIMEI2\n...`}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              )}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== index))}
                  className="mt-2 text-xs font-semibold text-[var(--color-danger)]"
                >
                  Hapus baris
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addItem} className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
          + Tambah item
        </button>

        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Ongkos kirim & biaya lain (opsional)</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
              Ongkos kirim
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                placeholder="Rp0"
                className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
              Biaya lain (bongkar, dll)
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={otherCost}
                onChange={(e) => setOtherCost(e.target.value)}
                placeholder="Rp0"
                className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            Biaya ini dibagi otomatis ke modal tiap produk (sesuai porsi nilainya) saat penerimaan diselesaikan.
          </p>
        </div>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Catatan/foto nota masih manual dulu. Tulis nomor nota atau catatan barang di sini."
          rows={3}
          className="mt-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />

        <button
          onClick={handleSubmit}
          disabled={isPending || products.length === 0}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Buat penerimaan"}
        </button>
      </div>
      {scannerOpen && (
        <BarcodeScannerModal
          title="Scan barang masuk"
          description="Barcode/QR yang cocok dengan SKU akan ditambahkan ke daftar penerimaan."
          onDetected={(value) => addBySku(value)}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}

export function StockReceiptManager({
  receipts,
  products,
  suppliers,
  outlets,
}: {
  receipts: StockReceiptRow[];
  purchaseOrders: PurchaseOrderWithItems[];
  products: Product[];
  suppliers: Supplier[];
  outlets: Outlet[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [qcModalOpen, setQCModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderWithItems | null>(null);
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
          <EmptyState
            icon={PackageIcon}
            title="Belum ada penerimaan barang"
            description="Catat barang masuk dari supplier agar stok dan riwayat pembelian tetap akurat."
            action={{
              label: "+ Terima Barang",
              onClick: () => {
                setSelectedPO(null);
                setModalOpen(true);
              },
            }}
          />
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
                  {receipt.shippingCost + receipt.otherCost > 0 && (
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Ongkir & biaya lain: {formatRupiah(receipt.shippingCost + receipt.otherCost)}
                    </p>
                  )}
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

      {modalOpen && (
        <DirectStockReceiptModal
          products={products}
          suppliers={suppliers}
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
