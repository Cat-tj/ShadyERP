import { formatTanggal, formatJam } from "@/lib/format";

export type TeamAttendanceRow = {
  id: string;
  userName: string;
  outletName: string;
  createdAt: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  status: "PRESENT" | "LATE" | "ABSENT";
};

const STATUS_LABEL: Record<string, string> = {
  PRESENT: "Tepat waktu",
  LATE: "Terlambat",
  ABSENT: "Tidak hadir",
};

export function TimAttendanceList({ rows }: { rows: TeamAttendanceRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">Belum ada absensi tim dalam 7 hari terakhir.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">{row.userName}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {formatTanggal(row.createdAt)} · {row.outletName} ·{" "}
              {row.clockInAt ? formatJam(row.clockInAt) : "-"}–{row.clockOutAt ? formatJam(row.clockOutAt) : "belum pulang"}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              row.status === "LATE"
                ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
                : "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
            }`}
          >
            {STATUS_LABEL[row.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
