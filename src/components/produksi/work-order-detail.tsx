"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { WorkOrderWithOperations } from "@/server/services/work-order-service";
import {
  submitForApprovalAction,
  approveWorkOrderAction,
  cancelWorkOrderAction,
  reserveMaterialsAction,
  scheduleWorkOrderAction,
  releaseWorkOrderAction,
  startOperationAction,
  pauseOperationAction,
  resumeOperationAction,
  recordOutputAction,
  completeOperationAction,
  markWorkOrderCompletedAction,
  closeWorkOrderAction,
  getWorkOrderIngredientsAction,
  returnMaterialAction,
} from "@/app/(app)/produksi/actions";
import { useToast, Toast } from "@/components/toast";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChevronDownIcon } from "@/components/ui/icons";

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

const OP_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu proses sebelumnya",
  READY: "Siap dimulai",
  IN_PROGRESS: "Sedang berjalan",
  PAUSED: "Dijeda",
  BLOCKED: "Terhambat",
  COMPLETED: "Selesai",
  SKIPPED: "Dilewati",
  CANCELLED: "Dibatalkan",
};

type Availability = { ingredientId: string; ingredientName: string; requiredQty: number; availableQty: number; sufficient: boolean };

function RecordOutputForm({ operationId, onDone }: { operationId: string; onDone: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [goodQty, setGoodQty] = useState(0);
  const [rejectQty, setRejectQty] = useState(0);
  const [reworkQty, setReworkQty] = useState(0);
  const [scrapQty, setScrapQty] = useState(0);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (goodQty + rejectQty + reworkQty + scrapQty <= 0) {
      showToast("Isi minimal salah satu jumlah hasil.");
      return;
    }
    startTransition(async () => {
      const result = await recordOutputAction(operationId, {
        goodQty,
        rejectQty,
        reworkQty,
        scrapQty,
        idempotencyKey: crypto.randomUUID(),
      });
      if (result.error) return showToast(result.error);
      showToast("Hasil produksi dicatat");
      router.refresh();
      onDone();
    });
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--color-text)]">Lolos (jadi produk)</label>
        <input type="number" min="0" value={goodQty} onChange={(e) => setGoodQty(Number(e.target.value))} className="min-h-[40px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--color-text)]">Reject</label>
        <input type="number" min="0" value={rejectQty} onChange={(e) => setRejectQty(Number(e.target.value))} className="min-h-[40px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--color-text)]">Rework (diproses ulang)</label>
        <input type="number" min="0" value={reworkQty} onChange={(e) => setReworkQty(Number(e.target.value))} className="min-h-[40px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--color-text)]">Scrap (rusak/dibuang)</label>
        <input type="number" min="0" value={scrapQty} onChange={(e) => setScrapQty(Number(e.target.value))} className="min-h-[40px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm" />
      </div>
      <button
        onClick={submit}
        disabled={isPending}
        className="col-span-2 mt-1 min-h-[40px] rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
      >
        {isPending ? "Menyimpan..." : "Simpan Hasil"}
      </button>
    </div>
  );
}

function OperationRow({ operation }: { operation: WorkOrderWithOperations["operations"][number] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [recording, setRecording] = useState(false);

  function run(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) return showToast(result.error);
      router.refresh();
    });
  }

  const totalRecorded = operation.goodQty + operation.rejectQty + operation.reworkQty + operation.scrapQty;

  return (
    <div className="rounded-lg border border-[var(--color-border)] p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {operation.sequence}. {operation.name}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">{OP_STATUS_LABEL[operation.status] ?? operation.status}</p>
          {totalRecorded > 0 && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              Lolos {operation.goodQty} · Reject {operation.rejectQty} · Rework {operation.reworkQty} · Scrap {operation.scrapQty}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {operation.status === "READY" && (
            <button
              onClick={() => run(() => startOperationAction(operation.id))}
              disabled={isPending}
              className="min-h-[36px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
            >
              Mulai
            </button>
          )}
          {operation.status === "IN_PROGRESS" && (
            <>
              <button
                onClick={() => setRecording((v) => !v)}
                disabled={isPending}
                className="min-h-[36px] rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40"
              >
                Catat Hasil
              </button>
              <button
                onClick={() => run(() => pauseOperationAction(operation.id))}
                disabled={isPending}
                className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40"
              >
                Jeda
              </button>
              <button
                onClick={() => run(() => completeOperationAction(operation.id))}
                disabled={isPending || totalRecorded <= 0}
                title={totalRecorded <= 0 ? "Catat hasil dulu sebelum menyelesaikan" : undefined}
                className="min-h-[36px] rounded-lg bg-[var(--color-success)] px-3 text-xs font-semibold text-white disabled:opacity-40"
              >
                Selesaikan
              </button>
            </>
          )}
          {operation.status === "PAUSED" && (
            <>
              <button
                onClick={() => run(() => resumeOperationAction(operation.id))}
                disabled={isPending}
                className="min-h-[36px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
              >
                Lanjutkan
              </button>
              <button
                onClick={() => setRecording((v) => !v)}
                disabled={isPending}
                className="min-h-[36px] rounded-lg border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40"
              >
                Catat Hasil
              </button>
            </>
          )}
        </div>
      </div>
      {recording && <RecordOutputForm operationId={operation.id} onDone={() => setRecording(false)} />}
    </div>
  );
}

export function WorkOrderDetail({ workOrder, canManage }: { workOrder: WorkOrderWithOperations; canManage: boolean }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [availability, setAvailability] = useState<Availability[] | null>(null);
  const [ingredients, setIngredients] = useState<{ id: string; name: string }[]>([]);
  const [isReturning, setIsReturning] = useState(false);
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>({});

  function run(action: () => Promise<{ error?: string }>, successMessage?: string) {
    startTransition(async () => {
      const result = await action();
      if (result.error) return showToast(result.error);
      if (successMessage) showToast(successMessage);
      router.refresh();
    });
  }

  function checkMaterials() {
    startTransition(async () => {
      const result = await reserveMaterialsAction(workOrder.id);
      if (result.error) return showToast(result.error);
      setAvailability(result.data!.availability);
      showToast(result.data!.status === "MATERIAL_RESERVED" ? "Bahan cukup — siap dijadwalkan" : "Bahan kurang, lihat rincian di bawah");
      router.refresh();
    });
  }

  const cancellable = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "MATERIAL_SHORTAGE", "MATERIAL_RESERVED", "SCHEDULED"].includes(workOrder.status);
  const showOperations = ["RELEASED", "IN_PROGRESS", "PAUSED", "AWAITING_QC", "COMPLETED", "CLOSED"].includes(workOrder.status);

  useEffect(() => {
    if (showOperations) {
      getWorkOrderIngredientsAction(workOrder.id).then((res) => {
        if (res.data) {
          setIngredients(res.data);
          const initialQtys: Record<string, number> = {};
          res.data.forEach((ing) => {
            initialQtys[ing.id] = 0;
          });
          setReturnQtys(initialQtys);
        }
      });
    }
  }, [workOrder.id, showOperations]);

  function handleReturnMaterial() {
    const items = Object.entries(returnQtys)
      .map(([ingredientId, qty]) => ({ ingredientId, qty }))
      .filter((item) => item.qty > 0);

    if (items.length === 0) {
      showToast("Isi minimal salah satu jumlah bahan yang akan dikembalikan.");
      return;
    }

    startTransition(async () => {
      const res = await returnMaterialAction(workOrder.id, items);
      if (res.error) return showToast(res.error);
      showToast("Bahan sisa berhasil dikembalikan ke gudang.");
      const resetQtys: Record<string, number> = {};
      ingredients.forEach((ing) => {
        resetQtys[ing.id] = 0;
      });
      setReturnQtys(resetQtys);
      setIsReturning(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/produksi" className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
        <ChevronDownIcon aria-hidden className="h-4 w-4 rotate-90" />
        Kembali ke daftar Work Order
      </Link>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl font-semibold text-[var(--color-text)]">{workOrder.code}</h2>
          <StatusBadge variant={STATUS_VARIANT[workOrder.status] ?? "neutral"}>{STATUS_LABEL[workOrder.status] ?? workOrder.status}</StatusBadge>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {workOrder.product.name} · Target {workOrder.targetQty} · {workOrder.outlet.name}
        </p>
        {workOrder.dueDate && (
          <p className="text-xs text-[var(--color-text-secondary)]">Target selesai: {new Date(workOrder.dueDate).toLocaleDateString("id-ID")}</p>
        )}
        {workOrder.note && <p className="mt-2 text-sm text-[var(--color-text)]">{workOrder.note}</p>}
      </div>

      {canManage && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">Alur persetujuan &amp; bahan</h3>
          <div className="flex flex-wrap gap-2">
            {workOrder.status === "DRAFT" && (
              <button onClick={() => run(() => submitForApprovalAction(workOrder.id), "Diajukan untuk persetujuan")} disabled={isPending} className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40">
                Ajukan Persetujuan
              </button>
            )}
            {workOrder.status === "PENDING_APPROVAL" && (
              <button onClick={() => run(() => approveWorkOrderAction(workOrder.id), "Work Order disetujui")} disabled={isPending} className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40">
                Setujui
              </button>
            )}
            {(workOrder.status === "APPROVED" || workOrder.status === "MATERIAL_SHORTAGE") && (
              <button onClick={checkMaterials} disabled={isPending} className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40">
                Cek Ketersediaan Bahan
              </button>
            )}
            {workOrder.status === "MATERIAL_RESERVED" && (
              <button onClick={() => run(() => scheduleWorkOrderAction(workOrder.id), "Work Order dijadwalkan")} disabled={isPending} className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40">
                Jadwalkan
              </button>
            )}
            {workOrder.status === "SCHEDULED" && (
              <button onClick={() => run(() => releaseWorkOrderAction(workOrder.id), "Work Order dirilis — bahan sudah dipindah ke area proses")} disabled={isPending} className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40">
                Rilis (Mulai Produksi)
              </button>
            )}
            {workOrder.status === "AWAITING_QC" && (
              <button onClick={() => run(() => markWorkOrderCompletedAction(workOrder.id), "Work Order ditandai selesai")} disabled={isPending} className="min-h-[44px] rounded-lg bg-[var(--color-success)] px-4 text-sm font-semibold text-white disabled:opacity-40">
                Tandai Selesai
              </button>
            )}
            {workOrder.status === "COMPLETED" && (
              <button onClick={() => run(() => closeWorkOrderAction(workOrder.id), "Work Order ditutup")} disabled={isPending} className="min-h-[44px] rounded-lg bg-[var(--color-success)] px-4 text-sm font-semibold text-white disabled:opacity-40">
                Tutup Work Order
              </button>
            )}
            {cancellable && (
              <button
                onClick={() => {
                  if (confirm("Batalkan Work Order ini?")) run(() => cancelWorkOrderAction(workOrder.id), "Work Order dibatalkan");
                }}
                disabled={isPending}
                className="min-h-[44px] rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40"
              >
                Batalkan
              </button>
            )}
          </div>

          {availability && (
            <div className="mt-3 flex flex-col gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              {availability.map((a) => (
                <div key={a.ingredientId} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text)]">{a.ingredientName}</span>
                  <span className={a.sufficient ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>
                    {a.availableQty} / {a.requiredQty} {a.sufficient ? "cukup" : "kurang"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showOperations && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">Proses produksi</h3>
          <div className="flex flex-col gap-2">
            {workOrder.operations.map((op) => (
              <OperationRow key={op.id} operation={op} />
            ))}
          </div>
        </div>
      )}

      {showOperations && ingredients.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Retur Sisa Bahan Baku</h3>
            <button
              onClick={() => setIsReturning((v) => !v)}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              {isReturning ? "Batal" : "Form Retur"}
            </button>
          </div>
          {isReturning && (
            <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Kembalikan sisa bahan yang tidak terpakai dari area WIP ke gudang bahan baku.
              </p>
              <div className="space-y-3">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-[var(--color-text)]">{ing.name}</span>
                    <input
                      type="number"
                      min="0"
                      value={returnQtys[ing.id] ?? 0}
                      onChange={(e) =>
                        setReturnQtys((prev) => ({
                          ...prev,
                          [ing.id]: Number(e.target.value),
                        }))
                      }
                      className="w-24 min-h-[36px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm text-right"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleReturnMaterial}
                disabled={isPending}
                className="mt-2 min-h-[40px] rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
              >
                {isPending ? "Mengirim..." : "Kirim Pengembalian"}
              </button>
            </div>
          )}
        </div>
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
