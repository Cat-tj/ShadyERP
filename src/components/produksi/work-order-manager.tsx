"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { WorkOrderWithOperations } from "@/server/services/work-order-service";
import { createWorkOrderAction, submitForApprovalAction, approveWorkOrderAction, cancelWorkOrderAction } from "@/app/(app)/produksi/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon, BuildingIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";

export type ProductionReadyProduct = {
  id: string;
  name: string;
  activeBomVersionId: string;
  activeRoutingVersionId: string;
};

type Outlet = { id: string; name: string };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  PENDING_APPROVAL: "Menunggu Persetujuan",
  APPROVED: "Disetujui",
  MATERIAL_SHORTAGE: "Bahan Kurang",
  MATERIAL_RESERVED: "Bahan Siap",
  SCHEDULED: "Terjadwal",
  RELEASED: "Dirilis",
  IN_PROGRESS: "Sedang Diproses",
  PAUSED: "Dijeda",
  AWAITING_QC: "Menunggu QC",
  COMPLETED: "Selesai Produksi",
  CLOSED: "Ditutup",
  CANCELLED: "Dibatalkan",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "neutral" | "primary"> = {
  DRAFT: "neutral",
  PENDING_APPROVAL: "warning",
  APPROVED: "info",
  MATERIAL_SHORTAGE: "danger",
  MATERIAL_RESERVED: "info",
  SCHEDULED: "info",
  RELEASED: "primary",
  IN_PROGRESS: "primary",
  PAUSED: "warning",
  AWAITING_QC: "warning",
  COMPLETED: "success",
  CLOSED: "success",
  CANCELLED: "danger",
};

const CANCELLABLE_STATUSES = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED", "MATERIAL_SHORTAGE", "MATERIAL_RESERVED", "SCHEDULED"]);

function CreateWorkOrderModal({
  outlets,
  products,
  onClose,
  onSaved,
}: {
  outlets: Outlet[];
  products: ProductionReadyProduct[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [productId, setProductId] = useState("");
  const [targetQty, setTargetQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!outletId) return setError("Outlet wajib dipilih.");
    if (!productId) return setError("Produk wajib dipilih.");
    if (targetQty <= 0) return setError("Jumlah target produksi harus lebih dari 0.");

    const product = products.find((p) => p.id === productId);
    if (!product) return setError("Produk tidak valid.");

    startTransition(async () => {
      const result = await createWorkOrderAction(
        outletId,
        productId,
        product.activeBomVersionId,
        product.activeRoutingVersionId,
        targetQty,
        note.trim() || undefined
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved("Work Order dibuat");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Buat Work Order</h2>
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

        {products.length === 0 ? (
          <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
            Belum ada produk yang siap diproduksi — produk butuh resep (BOM) dan alur proses (routing) yang sudah
            aktif dulu. Atur di halaman{" "}
            <Link href="/produksi/master" className="font-medium text-[var(--color-primary)] hover:underline">
              Data Produksi
            </Link>
            .
          </p>
        ) : (
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

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Produk yang diproduksi*</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                <option value="">Pilih produk</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Resep (BOM) dan alur proses yang sedang aktif untuk produk ini akan dipakai otomatis.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Jumlah target produksi*</label>
              <input
                type="number"
                min="1"
                value={targetQty}
                onChange={(e) => setTargetQty(Number(e.target.value))}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Catatan (opsional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending || products.length === 0}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Buat Work Order"}
        </button>
      </div>
    </div>
  );
}

export function WorkOrderManager({
  workOrders,
  outlets,
  products,
  canManage,
}: {
  workOrders: WorkOrderWithOperations[];
  outlets: Outlet[];
  products: ProductionReadyProduct[];
  canManage: boolean;
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submitForApproval(id: string) {
    startTransition(async () => {
      const result = await submitForApprovalAction(id);
      if (result.error) return showToast(result.error);
      showToast("Diajukan untuk persetujuan");
      router.refresh();
    });
  }

  function approve(id: string) {
    startTransition(async () => {
      const result = await approveWorkOrderAction(id);
      if (result.error) return showToast(result.error);
      showToast("Work Order disetujui");
      router.refresh();
    });
  }

  function cancel(id: string) {
    if (!confirm("Batalkan Work Order ini?")) return;
    startTransition(async () => {
      const result = await cancelWorkOrderAction(id);
      if (result.error) return showToast(result.error);
      showToast("Work Order dibatalkan");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Produksi</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Daftar Work Order dan status produksi</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link
              href="/produksi/planning"
              className="flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Perencanaan (MPS/MRP)
            </Link>
            <Link
              href="/produksi/qc"
              className="flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Quality Control (QC)
            </Link>
            <Link
              href="/produksi/master"
              className="flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Data Produksi
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="min-h-[44px] flex-1 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] sm:flex-none"
            >
              + Buat Work Order
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {workOrders.length === 0 ? (
          <EmptyState
            icon={BuildingIcon}
            title="Belum ada Work Order"
            description="Buat Work Order untuk mulai mencatat proses produksi — dari pemakaian bahan sampai barang jadi."
            action={
              canManage
                ? {
                    label: "+ Buat Work Order",
                    onClick: () => setModalOpen(true),
                  }
                : undefined
            }
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {workOrders.map((wo) => (
              <div key={wo.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/produksi/${wo.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {wo.code}
                    <StatusBadge variant={STATUS_VARIANT[wo.status] ?? "neutral"} className="ml-2">
                      {STATUS_LABEL[wo.status] ?? wo.status}
                    </StatusBadge>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {wo.product.name} · Target {wo.targetQty} · {wo.outlet.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {wo.operations.filter((o) => o.status === "COMPLETED").length}/{wo.operations.length} proses selesai
                  </p>
                </Link>
                {canManage && (
                  <div className="flex flex-wrap items-center gap-2">
                    {wo.status === "DRAFT" && (
                      <button
                        onClick={() => submitForApproval(wo.id)}
                        disabled={isPending}
                        className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40 sm:flex-none"
                      >
                        Ajukan
                      </button>
                    )}
                    {wo.status === "PENDING_APPROVAL" && (
                      <button
                        onClick={() => approve(wo.id)}
                        disabled={isPending}
                        className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40 sm:flex-none"
                      >
                        Setujui
                      </button>
                    )}
                    {CANCELLABLE_STATUSES.has(wo.status) && (
                      <button
                        onClick={() => cancel(wo.id)}
                        disabled={isPending}
                        className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 sm:flex-none"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <CreateWorkOrderModal outlets={outlets} products={products} onClose={() => setModalOpen(false)} onSaved={showToast} />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
