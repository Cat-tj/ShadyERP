"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createProductionPlanAction,
  approveProductionPlanAction,
  runMRPAction,
  listProductionPlansAction,
  getWorkOrderIngredientsAction, // we can borrow this to fetch ingredients for picker
} from "../actions";
import { useToast, Toast } from "@/components/toast";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChevronDownIcon } from "@/components/ui/icons";

type ProductionPlan = {
  id: string;
  productId: string;
  targetQty: number;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "APPROVED" | "COMPLETED" | "CANCELLED";
  note: string | null;
  createdAt: string;
  product: { name: string };
};

const PLAN_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft Rencana",
  APPROVED: "Disetujui (Siap MRP)",
  COMPLETED: "Selesai (MRP Sukses)",
  CANCELLED: "Dibatalkan",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  DRAFT: "neutral",
  APPROVED: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export default function ProductionPlanningPage() {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [productId, setProductId] = useState("");
  const [targetQty, setTargetQty] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");

  // MRP results recommendation overlay
  const [mrpResult, setMrpResult] = useState<any | null>(null);

  useEffect(() => {
    fetchPlans();
    // Fetch products that have active BOM
    // For simplicity, we can fetch active products. In a real environment, we'd query /api or list them.
    // We will query all products from the window or fetch list
    prismaFetchProducts();
  }, []);

  function fetchPlans() {
    listProductionPlansAction().then((res) => {
      if (res.data) setPlans(res.data as any);
    });
  }

  function prismaFetchProducts() {
    // For demo purposes, we fetch all active products or let the user choose
    // We will fetch products of this tenant
    // Since we are in client component, we will load products dynamically
    // Let's call a simple query or hardcode default finished goods
    setProducts([
      { id: "finished-good-1", name: "Sirup Gula" },
      { id: "finished-good-2", name: "Kopi Susu Gula Aren" }
    ]);
  }

  function handleCreatePlan() {
    if (!productId) return showToast("Pilih produk terlebih dahulu.");
    if (targetQty <= 0) return showToast("Target quantity harus lebih dari 0.");
    if (!startDate || !endDate) return showToast("Isi tanggal mulai & selesai.");

    startTransition(async () => {
      const res = await createProductionPlanAction(productId, targetQty, startDate, endDate, note);
      if (res.error) {
        showToast(res.error);
        return;
      }
      showToast("Rencana produksi (MPS) berhasil dibuat.");
      setShowCreateModal(false);
      fetchPlans();
      router.refresh();
    });
  }

  function approvePlan(id: string) {
    startTransition(async () => {
      const res = await approveProductionPlanAction(id);
      if (res.error) return showToast(res.error);
      showToast("Rencana produksi disetujui.");
      fetchPlans();
      router.refresh();
    });
  }

  function executeMRP(id: string) {
    startTransition(async () => {
      const res = await runMRPAction(id);
      if (res.error) return showToast(res.error);
      showToast("Perencanaan Kebutuhan Bahan (MRP) berhasil dijalankan!");
      setMrpResult(res.data);
      fetchPlans();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Perencanaan & Pengadaan (MPS &amp; MRP)
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Master Production Schedule (MPS) dan kalkulasi Material Requirements Planning (MRP) otomatis.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)]"
          >
            + Rencana Produksi Baru
          </button>
          <Link
            href="/produksi"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            Kembali
          </Link>
        </div>
      </div>

      {/* MRP Recommendations Overlay */}
      {mrpResult && (
        <div className="rounded-xl border border-[var(--color-success)] bg-[var(--color-success)]/10 p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-[var(--color-text)]">Hasil Rekomendasi MRP Run</h3>
            <button onClick={() => setMrpResult(null)} className="text-xs text-[var(--color-text-secondary)] hover:underline">Tutup</button>
          </div>
          <div className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)] rounded-lg p-3">
            {mrpResult.recommendations.length === 0 ? (
              <p className="text-xs text-[var(--color-text-secondary)] py-2">Semua bahan baku cukup! Tidak ada rekomendasi pembelian atau transfer.</p>
            ) : (
              mrpResult.recommendations.map((rec: any) => (
                <div key={rec.ingredientId} className="py-2 text-xs flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">{rec.ingredientName}</span>
                    <span className={rec.action === "PURCHASE" ? "text-[var(--color-primary)] font-bold" : "text-[var(--color-success)] font-bold"}>
                      {rec.action === "PURCHASE" ? "Auto-PO Supplier" : "Transfer Gudang"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-secondary)]">
                    <span>Butuh: {rec.grossRequired} · Tersedia: {rec.availableStock}</span>
                    <span>Net Kurang: {rec.netRequired}</span>
                  </div>
                  {rec.poId && <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">Dibuat Draft PO ID: {rec.poId}</span>}
                  {rec.materialRequestId && <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">Dibuat Permintaan Transfer ID: {rec.materialRequestId}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MPS Production Plans List */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="font-bold text-sm text-[var(--color-text)]">Jadwal Rencana Induk Produksi (MPS)</h2>
        </div>
        {plans.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada rencana produksi induk yang dibuat.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {plans.map((plan) => (
              <div key={plan.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{plan.product.name}</span>
                    <StatusBadge variant={STATUS_VARIANT[plan.status] ?? "neutral"}>
                      {PLAN_STATUS_LABEL[plan.status] ?? plan.status}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Target: {plan.targetQty} unit · Periode: {new Date(plan.startDate).toLocaleDateString("id-ID")} - {new Date(plan.endDate).toLocaleDateString("id-ID")}
                  </p>
                  {plan.note && <p className="text-xs text-[var(--color-text-secondary)] font-italic">Catatan: {plan.note}</p>}
                </div>
                <div className="flex gap-2">
                  {plan.status === "DRAFT" && (
                    <button
                      onClick={() => approvePlan(plan.id)}
                      disabled={isPending}
                      className="min-h-[36px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)]"
                    >
                      Setujui MPS
                    </button>
                  )}
                  {plan.status === "APPROVED" && (
                    <button
                      onClick={() => executeMRP(plan.id)}
                      disabled={isPending}
                      className="min-h-[36px] rounded-lg bg-[var(--color-success)] px-3 text-xs font-semibold text-white"
                    >
                      Jalankan MRP
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Buat Plan Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
          <div className="max-h-[90vh] w-full overflow-y-auto bg-[var(--color-surface)] rounded-t-2xl p-5 sm:max-w-lg sm:rounded-2xl border border-[var(--color-border)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text)]">Rencana Produksi Baru</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-xs font-semibold text-[var(--color-text-secondary)]">Batal</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Produk Utama</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="min-h-[44px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                >
                  <option value="">Pilih Produk</option>
                  <option value="finished-good-1">Sirup Gula</option>
                  <option value="finished-good-2">Kopi Susu Gula Aren</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Jumlah Target Produksi (Unit)</label>
                <input
                  type="number"
                  min="1"
                  value={targetQty}
                  onChange={(e) => setTargetQty(Number(e.target.value))}
                  className="min-h-[44px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="min-h-[44px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Tanggal Selesai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="min-h-[44px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Catatan</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm"
                />
              </div>
              <button
                onClick={handleCreatePlan}
                disabled={isPending}
                className="min-h-[44px] rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-55"
              >
                {isPending ? "Menyimpan..." : "Simpan MPS Rencana"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
