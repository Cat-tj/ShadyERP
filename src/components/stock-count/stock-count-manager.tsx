"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Outlet, Product } from "@prisma/client";
import {
  createStockCountAction,
  updateCountItemsAction,
  completeStockCountAction,
  verifyStockCountAction,
} from "@/app/(app)/stock-count/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type StockCountRow = {
  id: string;
  countNumber: string;
  outlet: Outlet;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED";
  countDate: Date;
  items: Array<{
    id: string;
    productId: string;
    product: Product;
    systemQty: number;
    physicalQty: number;
    variance: number;
    varianceValue: number;
    notes?: string;
  }>;
};

type CountItemInput = {
  stockCountItemId: string;
  physicalQty: number;
  notes?: string;
};

function StockCountFormModal({
  outlet,
  onClose,
  onSaved,
}: {
  outlet: Outlet;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createStockCountAction(outlet.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Opname dimulai");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Mulai opname stok</h2>
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
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Sistem akan membuat lembar opname untuk seluruh stok di:
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">{outlet.name}</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
        >
          {isPending ? "Membuat..." : "Mulai opname"}
        </button>
      </div>
    </div>
  );
}

function StockCountPhysicalModal({
  count,
  onClose,
  onSaved,
}: {
  count: StockCountRow;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [countItems, setCountItems] = useState<CountItemInput[]>(
    count.items.map((i) => ({
      stockCountItemId: i.id,
      physicalQty: i.physicalQty,
      notes: i.notes,
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<"input" | "confirm">("input");

  function updateItem(index: number, field: string, value: number | string) {
    const newItems = [...countItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setCountItems(newItems);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateCountItemsAction(count.id, countItems);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Opname disimpan");
      router.refresh();
      onClose();
    });
  }

  function handleComplete() {
    setError(null);
    startTransition(async () => {
      const result = await completeStockCountAction(count.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Opname diselesaikan");
      router.refresh();
      onClose();
    });
  }

  const totalVariance = count.items.reduce((sum, item) => sum + item.variance, 0);
  const totalVarianceValue = count.items.reduce((sum, item) => sum + item.varianceValue, 0);

  if (currentStep === "confirm") {
    return (
      <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
        <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-text)]">Konfirmasi opname</h2>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
            >
              <XIcon aria-hidden className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">Ringkasan varians</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Total item dengan varians:</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {countItems.filter((c) => count.items.find((i) => i.id === c.stockCountItemId)?.variance !== 0).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Total varians (unit):</span>
                  <span className={`font-semibold ${totalVariance < 0 ? "text-red-600" : "text-green-600"}`}>
                    {totalVariance < 0 ? "-" : "+"}{Math.abs(totalVariance)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2">
                  <span className="text-[var(--color-text)]">Nilai varians (Rp):</span>
                  <span className={`text-lg font-bold ${totalVarianceValue < 0 ? "text-red-600" : "text-green-600"}`}>
                    {totalVarianceValue < 0 ? "-" : "+"}Rp {Math.abs(totalVarianceValue).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)]">
              Apakah data opname sudah benar? Setelah dikonfirmasi, varians akan diterapkan ke stok sistem.
            </p>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setCurrentStep("input")}
              className="flex min-h-[52px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] text-base font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Kembali
            </button>
            <button
              onClick={handleComplete}
              disabled={isPending}
              className="flex min-h-[52px] flex-1 items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
            >
              {isPending ? "Memproses..." : "Konfirmasi"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Input opname stok</h2>
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

        <div className="flex flex-col gap-3">
          {countItems.map((countItem, idx) => {
            const item = count.items[idx];
            const variance = countItem.physicalQty - item.systemQty;
            return (
              <div key={idx} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">{item.product.name}</p>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[var(--color-text-secondary)]">Sistem</label>
                      <p className="font-mono text-sm font-semibold text-[var(--color-text)]">{item.systemQty}</p>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--color-text-secondary)]">Fisik</label>
                      <input
                        type="number"
                        min="0"
                        value={countItem.physicalQty}
                        onChange={(e) => updateItem(idx, "physicalQty", parseInt(e.target.value))}
                        placeholder="0"
                        className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm font-mono outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </div>
                  {variance !== 0 && (
                    <p className={`text-xs font-medium ${variance > 0 ? "text-green-600" : "text-red-600"}`}>
                      Varians: {variance > 0 ? "+" : ""}{variance}
                    </p>
                  )}
                  <input
                    type="text"
                    value={countItem.notes || ""}
                    onChange={(e) => updateItem(idx, "notes", e.target.value)}
                    placeholder="Catatan"
                    className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] text-base font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-60"
          >
            {isPending ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            onClick={() => setCurrentStep("confirm")}
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)]"
          >
            Lanjut
          </button>
        </div>
      </div>
    </div>
  );
}

export function StockCountManager({ counts, outlets }: { counts: StockCountRow[]; outlets: Outlet[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [physicalModalOpen, setPhysicalModalOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [selectedCount, setSelectedCount] = useState<StockCountRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const statusLabels: Record<"DRAFT" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED", string> = {
    DRAFT: "Draft",
    IN_PROGRESS: "Sedang Input",
    COMPLETED: "Selesai",
    VERIFIED: "Terverifikasi",
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-[var(--color-bg)] text-[var(--color-text)]",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-yellow-100 text-yellow-800",
    VERIFIED: "bg-green-100 text-green-800",
  };

  function verifyCount(count: StockCountRow) {
    startTransition(async () => {
      const result = await verifyStockCountAction(count.id);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Opname terverifikasi");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Opname Stok</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Perhitungan fisik & varians stok</p>
        </div>
        <button
          onClick={() => {
            setSelectedOutlet(null);
            setFormModalOpen(true);
          }}
          className="min-h-[44px] w-full rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] sm:w-auto"
        >
          + Mulai opname
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {counts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada opname. Mulai opname pertamamu →
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {counts.map((count) => (
              <div key={count.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {count.countNumber}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[count.status]}`}>
                      {statusLabels[count.status]}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{count.outlet.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {count.items.length} produk · Varians: {count.items.reduce((sum, i) => sum + i.variance, 0)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(count.status === "DRAFT" || count.status === "IN_PROGRESS") && (
                    <button
                      onClick={() => {
                        setSelectedCount(count);
                        setPhysicalModalOpen(true);
                      }}
                      className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 sm:flex-none"
                    >
                      Input
                    </button>
                  )}
                  {count.status === "COMPLETED" && (
                    <button
                      onClick={() => verifyCount(count)}
                      disabled={isPending}
                      className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40 sm:flex-none"
                    >
                      Verifikasi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formModalOpen && (
        <StockCountFormModal
          outlet={selectedOutlet || outlets[0]!}
          onClose={() => setFormModalOpen(false)}
          onSaved={showToast}
        />
      )}

      {physicalModalOpen && selectedCount && (
        <StockCountPhysicalModal
          count={selectedCount}
          onClose={() => setPhysicalModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
