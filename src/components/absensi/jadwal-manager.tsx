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
  workType: "REGULAR" | "OVERTIME" | "CASUAL";
  payType: "MONTHLY" | "PER_SHIFT";
  shiftPay: number | null;
  holidayBonus: number;
  note: string | null;
};

const WORK_TYPE_LABEL: Record<ScheduleRow["workType"], string> = {
  REGULAR: "Reguler",
  OVERTIME: "Lembur",
  CASUAL: "Casual",
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
  const [workType, setWorkType] = useState<ScheduleRow["workType"]>("REGULAR");
  const [shiftPay, setShiftPay] = useState("");
  const [holidayBonus, setHolidayBonus] = useState("");
  const [note, setNote] = useState("");
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
    const shiftPayNumber = shiftPay ? Number(shiftPay) : null;
    const holidayBonusNumber = holidayBonus ? Number(holidayBonus) : 0;
    if (shiftPayNumber !== null && (!Number.isFinite(shiftPayNumber) || shiftPayNumber < 0)) {
      setError("Bayaran shift tidak valid.");
      return;
    }
    if (!Number.isFinite(holidayBonusNumber) || holidayBonusNumber < 0) {
      setError("Bonus tanggal merah tidak valid.");
      return;
    }

    startTransition(async () => {
      const result = await createScheduleAction({
        userId,
        outletId,
        startAt,
        endAt,
        workType,
        payType: workType === "CASUAL" ? "PER_SHIFT" : "MONTHLY",
        shiftPay: shiftPayNumber,
        holidayBonus: holidayBonusNumber,
        overtimeNote: workType === "OVERTIME" ? note.trim() || null : null,
        note: note.trim() || null,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Jadwal ditambahkan");
      setDate("");
      setShiftPay("");
      setHolidayBonus("");
      setNote("");
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
          <div className="col-span-2 grid grid-cols-3 gap-2">
            {(["REGULAR", "OVERTIME", "CASUAL"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setWorkType(type)}
                className={`min-h-[44px] rounded-lg border px-3 text-sm font-semibold ${
                  workType === type
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                }`}
              >
                {WORK_TYPE_LABEL[type]}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Bayaran shift</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={shiftPay}
              onChange={(e) => setShiftPay(e.target.value)}
              placeholder="0"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Bonus libur</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={holidayBonus}
              onChange={(e) => setHolidayBonus(e.target.value)}
              placeholder="0"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Catatan shift</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="mis. casual lebaran, tembus 2 shift, runner kosong"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
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
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {WORK_TYPE_LABEL[s.workType]} · {s.payType === "PER_SHIFT" ? "Per shift" : "Bulanan"}
                    {s.shiftPay ? ` · Rp${s.shiftPay.toLocaleString("id-ID")}` : ""}
                    {s.holidayBonus ? ` · bonus Rp${s.holidayBonus.toLocaleString("id-ID")}` : ""}
                  </p>
                  {s.note && (
                    <p className="mt-1 text-xs italic text-[var(--color-text-secondary)]">
                      &quot;{s.note}&quot;
                    </p>
                  )}
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
