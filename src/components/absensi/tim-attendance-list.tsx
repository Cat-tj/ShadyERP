import { formatTanggal, formatJam } from "@/lib/format";

export type TeamAttendanceRow = {
  id: string;
  userName: string;
  outletName: string;
  createdAt: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  status: "PRESENT" | "LATE" | "ABSENT";
  lat: number | null;
  lng: number | null;
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
        <div key={row.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)]">{row.userName}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {formatTanggal(row.createdAt)} · {row.outletName} ·{" "}
              {row.clockInAt ? formatJam(row.clockInAt) : "-"}–{row.clockOutAt ? formatJam(row.clockOutAt) : "belum pulang"}
            </p>
            {row.lat != null && row.lng != null ? (
              <a
                href={`https://www.google.com/maps?q=${row.lat},${row.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                Lihat lokasi absen
              </a>
            ) : (
              <p className="text-xs text-[var(--color-text-secondary)]">Lokasi tidak tercatat</p>
            )}
          </div>
          <span
            className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
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
