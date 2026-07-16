"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listInspectionsAction, submitInspectionResultAction } from "../actions";
import { useToast, Toast } from "@/components/toast";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChevronDownIcon } from "@/components/ui/icons";

type QualityInspection = {
  id: string;
  inspectionType: "INCOMING" | "IN_PROCESS" | "FINAL";
  sourceType: string;
  sourceId: string;
  status: "PENDING" | "PASSED" | "FAILED";
  quantityInspected: number;
  quantityPassed: number;
  quantityFailed: number;
  notes: string | null;
  createdAt: string;
  inspector: { name: string };
};

const INSPECTION_TYPE_LABEL: Record<string, string> = {
  INCOMING: "QC Bahan Masuk",
  IN_PROCESS: "QC Proses Produksi",
  FINAL: "QC Produk Akhir",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  PASSED: "success",
  FAILED: "danger",
};

export default function QualityControlPage() {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "PASSED" | "FAILED">("PENDING");
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form input states
  const [passedQty, setPassedQty] = useState<number>(0);
  const [failedQty, setFailedQty] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    fetchInspections();
  }, []);

  function fetchInspections() {
    listInspectionsAction().then((res) => {
      if (res.data) {
        setInspections(res.data as any);
      } else if (res.error) {
        showToast(res.error);
      }
    });
  }

  function handleProcessClick(inspection: QualityInspection) {
    setProcessingId(inspection.id);
    setPassedQty(inspection.quantityInspected);
    setFailedQty(0);
    setNotes("");
  }

  function handleCancelProcess() {
    setProcessingId(null);
  }

  function submitResult(inspection: QualityInspection) {
    if (passedQty + failedQty !== inspection.quantityInspected) {
      showToast(`Jumlah Lolos + Gagal harus sama dengan ${inspection.quantityInspected}.`);
      return;
    }

    startTransition(async () => {
      const res = await submitInspectionResultAction(inspection.id, passedQty, failedQty, notes);
      if (res.error) {
        showToast(res.error);
        return;
      }
      showToast("Hasil inspeksi QC berhasil disimpan.");
      setProcessingId(null);
      fetchInspections();
      router.refresh();
    });
  }

  const filtered = inspections.filter((ins) => {
    if (activeTab === "ALL") return true;
    return ins.status === activeTab;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Quality Control (QC)
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Kelola inspeksi mutu bahan masuk dan hasil produksi barang jadi.
          </p>
        </div>
        <Link
          href="/produksi"
          className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          Kembali ke Produksi
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        {(["PENDING", "PASSED", "FAILED", "ALL"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setProcessingId(null);
            }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab
                ? "border-[var(--color-primary)] text-[var(--color-primary)] font-semibold"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab === "ALL" ? "Semua" : tab === "PENDING" ? "Menunggu QC" : tab === "PASSED" ? "Lolos" : "Gagal"}
          </button>
        ))}
      </div>

      {/* Inspections List */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">Tidak ada data inspeksi QC ditemukan.</p>
          </div>
        ) : (
          filtered.map((ins) => (
            <div
              key={ins.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      {INSPECTION_TYPE_LABEL[ins.inspectionType] ?? ins.inspectionType}
                    </span>
                    <StatusBadge variant={STATUS_VARIANT[ins.status] ?? "neutral"}>
                      {ins.status === "PENDING" ? "Menunggu QC" : ins.status === "PASSED" ? "Lolos" : "Gagal"}
                    </StatusBadge>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[var(--color-text)]">
                    Jumlah diinspeksi: {ins.quantityInspected} unit
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Dibuat pada: {new Date(ins.createdAt).toLocaleString("id-ID")} · Inspektur: {ins.inspector.name}
                  </p>
                  {ins.status !== "PENDING" && (
                    <p className="mt-2 text-sm text-[var(--color-text)] font-medium">
                      Hasil: Lolos {ins.quantityPassed} · Gagal {ins.quantityFailed}
                      {ins.notes && <span className="block text-xs font-normal text-[var(--color-text-secondary)] mt-1">Catatan: {ins.notes}</span>}
                    </p>
                  )}
                </div>

                {ins.status === "PENDING" && processingId !== ins.id && (
                  <button
                    onClick={() => handleProcessClick(ins)}
                    className="self-start sm:self-center min-h-[36px] rounded-lg bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-on-primary)]"
                  >
                    Proses QC
                  </button>
                )}
              </div>

              {/* Inline QC Input Form */}
              {processingId === ins.id && (
                <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                  <h4 className="text-xs font-bold text-[var(--color-text)]">Masukkan Hasil Pengujian Mutu</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[var(--color-text)]">Lolos (Passed Qty)</label>
                      <input
                        type="number"
                        min="0"
                        max={ins.quantityInspected}
                        value={passedQty}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPassedQty(val);
                          setFailedQty(ins.quantityInspected - val);
                        }}
                        className="min-h-[40px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[var(--color-text)]">Gagal (Failed Qty)</label>
                      <input
                        type="number"
                        min="0"
                        max={ins.quantityInspected}
                        value={failedQty}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFailedQty(val);
                          setPassedQty(ins.quantityInspected - val);
                        }}
                        className="min-h-[40px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--color-text)]">Catatan Inspeksi</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Masukkan detail cacat, parameter pengujian, dll..."
                      className="min-h-[60px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      onClick={handleCancelProcess}
                      disabled={isPending}
                      className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => submitResult(ins)}
                      disabled={isPending}
                      className="min-h-[36px] rounded-lg bg-[var(--color-success)] px-4 text-xs font-bold text-white disabled:opacity-55"
                    >
                      {isPending ? "Menyimpan..." : "Simpan & Terapkan"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
