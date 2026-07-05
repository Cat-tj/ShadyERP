"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EquipmentStatus, MaintenanceStatus } from "@prisma/client";
import {
  createEquipmentAction,
  reportMaintenanceAction,
  updateMaintenanceStatusAction,
} from "@/app/(app)/maintenance/actions";
import { formatTanggal, formatJam } from "@/lib/format";
import { useToast, Toast } from "@/components/toast";

export type OutletOption = { id: string; name: string };
export type EquipmentRow = {
  id: string;
  outletId: string;
  outletName: string;
  name: string;
  category: string;
  serialNumber: string | null;
  status: EquipmentStatus;
  note: string | null;
  logs: {
    id: string;
    status: MaintenanceStatus;
    issue: string;
    actionTaken: string | null;
    cost: number;
    reportedAt: string;
    reportedByName: string;
  }[];
};

const EQUIPMENT_STATUS: Record<EquipmentStatus, string> = {
  ACTIVE: "Aktif",
  NEEDS_REPAIR: "Rusak",
  REPAIRING: "Diservis",
  RETIRED: "Pensiun",
};

const MAINTENANCE_STATUS: Record<MaintenanceStatus, string> = {
  OPEN: "Baru",
  IN_PROGRESS: "Diproses",
  RESOLVED: "Selesai",
};

export function EquipmentManager({
  outlets,
  equipment,
}: {
  outlets: OutletOption[];
  equipment: EquipmentRow[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Timbangan");
  const [serialNumber, setSerialNumber] = useState("");
  const [note, setNote] = useState("");
  const [reportEquipmentId, setReportEquipmentId] = useState(equipment[0]?.id ?? "");
  const [issue, setIssue] = useState("");
  const [actionTakenByLog, setActionTakenByLog] = useState<Record<string, string>>({});
  const [costByLog, setCostByLog] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addEquipment() {
    setError(null);
    if (!outletId) return setError("Pilih outlet dulu.");
    if (!name.trim()) return setError("Nama alat wajib diisi.");
    if (!category.trim()) return setError("Kategori alat wajib diisi.");

    startTransition(async () => {
      const result = await createEquipmentAction({
        outletId,
        name: name.trim(),
        category: category.trim(),
        serialNumber: serialNumber.trim() || null,
        note: note.trim() || null,
      });
      if (result.error) return setError(result.error);
      showToast("Alat ditambahkan");
      setName("");
      setSerialNumber("");
      setNote("");
      router.refresh();
    });
  }

  function reportIssue() {
    setError(null);
    if (!reportEquipmentId) return setError("Pilih alat dulu.");
    if (!issue.trim()) return setError("Isi masalah alat dulu.");

    startTransition(async () => {
      const result = await reportMaintenanceAction({
        equipmentId: reportEquipmentId,
        issue: issue.trim(),
      });
      if (result.error) return setError(result.error);
      showToast("Laporan maintenance dibuat");
      setIssue("");
      router.refresh();
    });
  }

  function updateLog(logId: string, status: MaintenanceStatus) {
    setError(null);
    const costText = costByLog[logId] ?? "";
    const cost = costText ? Number(costText) : undefined;
    if (cost !== undefined && (!Number.isFinite(cost) || cost < 0)) {
      setError("Biaya maintenance tidak valid.");
      return;
    }
    setActiveId(logId);
    startTransition(async () => {
      const result = await updateMaintenanceStatusAction(
        logId,
        status,
        actionTakenByLog[logId] || null,
        cost
      );
      setActiveId(null);
      if (result.error) return setError(result.error);
      showToast(status === "RESOLVED" ? "Maintenance selesai" : "Status maintenance diubah");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Maintenance alat
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Catat timbangan, grinder, mesin kopi, kulkas, atau alat cabang yang rusak dan butuh tindak lanjut.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Tambah alat</h2>
          <div className="grid gap-3">
            <select
              value={outletId}
              onChange={(event) => setOutletId(event.target.value)}
              className="min-h-[46px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama alat"
              className="min-h-[46px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Kategori"
                className="min-h-[46px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
              />
              <input
                value={serialNumber}
                onChange={(event) => setSerialNumber(event.target.value)}
                placeholder="Serial/kode"
                className="min-h-[46px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
              />
            </div>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Catatan opsional"
              className="min-h-[46px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
            />
            <button
              onClick={addEquipment}
              disabled={isPending}
              className="min-h-[46px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
            >
              Tambah alat
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Lapor rusak</h2>
          {equipment.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Tambahkan alat dulu untuk membuat laporan.</p>
          ) : (
            <div className="grid gap-3">
              <select
                value={reportEquipmentId}
                onChange={(event) => setReportEquipmentId(event.target.value)}
                className="min-h-[46px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
              >
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.outletName}
                  </option>
                ))}
              </select>
              <input
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
                placeholder="mis. timbangan error, angka loncat"
                className="min-h-[46px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
              />
              <button
                onClick={reportIssue}
                disabled={isPending}
                className="min-h-[46px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
              >
                Buat laporan
              </button>
            </div>
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Daftar alat</h2>
        {equipment.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada alat tercatat.
          </div>
        ) : (
          <div className="grid gap-3">
            {equipment.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text)]">{item.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {item.category} · {item.outletName}
                      {item.serialNumber ? ` · ${item.serialNumber}` : ""}
                    </p>
                    {item.note && (
                      <p className="mt-1 text-xs italic text-[var(--color-text-secondary)]">
                        &quot;{item.note}&quot;
                      </p>
                    )}
                  </div>
                  <span className="self-start rounded-full bg-[var(--color-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    {EQUIPMENT_STATUS[item.status]}
                  </span>
                </div>

                {item.logs.length > 0 && (
                  <div className="mt-4 divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
                    {item.logs.map((log) => (
                      <div key={log.id} className="grid gap-3 p-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{log.issue}</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {MAINTENANCE_STATUS[log.status]} · {log.reportedByName} ·{" "}
                            {formatTanggal(log.reportedAt)}, {formatJam(log.reportedAt)}
                          </p>
                          {log.actionTaken && (
                            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                              {log.actionTaken}
                            </p>
                          )}
                        </div>
                        {log.status !== "RESOLVED" && (
                          <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto_auto]">
                            <input
                              value={actionTakenByLog[log.id] ?? ""}
                              onChange={(event) =>
                                setActionTakenByLog((current) => ({ ...current, [log.id]: event.target.value }))
                              }
                              placeholder="Tindakan"
                              className="min-h-[40px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
                            />
                            <input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              value={costByLog[log.id] ?? ""}
                              onChange={(event) =>
                                setCostByLog((current) => ({ ...current, [log.id]: event.target.value }))
                              }
                              placeholder="Biaya"
                              className="min-h-[40px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums"
                            />
                            <button
                              onClick={() => updateLog(log.id, "IN_PROGRESS")}
                              disabled={isPending}
                              className="min-h-[40px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] disabled:opacity-60"
                            >
                              Proses
                            </button>
                            <button
                              onClick={() => updateLog(log.id, "RESOLVED")}
                              disabled={isPending}
                              className="min-h-[40px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
                            >
                              {activeId === log.id && isPending ? "Simpan..." : "Selesai"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <Toast message={toastMessage} />
    </div>
  );
}
