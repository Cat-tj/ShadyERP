"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createScheduleAction, deleteScheduleAction } from "@/app/(app)/absensi/tim/actions";
import { formatTanggal, formatJam } from "@/lib/format";
import { useToast, Toast } from "@/components/toast";

export type StaffOption = { id: string; name: string };
export type OutletOption = { id: string; name: string };
export type ScheduleRow = {
  id: string;
  userName: string;
  outletName: string;
  startAt: string;
  endAt: string;
};

export function JadwalManager({
  staff,
  outlets,
  schedules,
}: {
  staff: StaffOption[];
  outlets: OutletOption[];
  schedules: ScheduleRow[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [userId, setUserId] = useState(staff[0]?.id ?? "");
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setError(null);
    if (!userId || !outletId || !date) {
      setError("Lengkapi karyawan, outlet, dan tanggal dulu.");
      return;
    }
    const startAt = new Date(`${date}T${startTime}:00+07:00`);
    const endAt = new Date(`${date}T${endTime}:00+07:00`);

    startTransition(async () => {
      const result = await createScheduleAction({ userId, outletId, startAt, endAt });
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Jadwal ditambahkan");
      setDate("");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteScheduleAction(id);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Jadwal dihapus");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">Tambah jadwal</h2>

        {error && (
          <div className="mb-3 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-sm font-medium text-[var(--color-text)]">Karyawan</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-sm font-medium text-[var(--color-text)]">Outlet</label>
            <select
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Jam mulai</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Jam selesai</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={isPending}
          className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {isPending ? "Menyimpan..." : "Tambah jadwal"}
        </button>
      </div>

      <div>
        <h2 className="mb-2 text-base font-bold text-[var(--color-text)]">Jadwal mendatang</h2>
        {schedules.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">Belum ada jadwal dibuat.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{s.userName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {formatTanggal(s.startAt)}, {formatJam(s.startAt)}–{formatJam(s.endAt)} · {s.outletName}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-bg)]"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
