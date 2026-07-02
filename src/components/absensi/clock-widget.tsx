"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clockInAction, clockOutAction } from "@/app/(app)/absensi/actions";
import { compressImageFile } from "@/lib/compress-image";
import { formatJam } from "@/lib/format";

export type AttendanceInfo = {
  clockInAt: string | null;
  clockOutAt: string | null;
  status: "PRESENT" | "LATE" | "ABSENT";
  clockInPhotoUrl: string | null;
} | null;

const STATUS_LABEL: Record<string, string> = {
  PRESENT: "Tepat waktu",
  LATE: "Terlambat",
  ABSENT: "Tidak hadir",
};

export function ClockWidget({
  outlets,
  attendance,
  scheduleLabel,
}: {
  outlets: { id: string; name: string }[];
  attendance: AttendanceInfo;
  scheduleLabel: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCapturing, setIsCapturing] = useState(false);

  function getLocation(): Promise<{ lat: number | null; lng: number | null }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: null, lng: null });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null }),
        { timeout: 5000 }
      );
    });
  }

  async function handlePhotoSelected(file: File) {
    setError(null);
    setIsCapturing(true);
    try {
      const photoUrl = await compressImageFile(file);
      const { lat, lng } = await getLocation();
      startTransition(async () => {
        const result = await clockInAction({ outletId, photoUrl, lat, lng });
        setIsCapturing(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      });
    } catch (err) {
      setIsCapturing(false);
      setError(err instanceof Error ? err.message : "Gagal memproses foto.");
    }
  }

  function handleClockOut() {
    setError(null);
    startTransition(async () => {
      const result = await clockOutAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const busy = isPending || isCapturing;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      {scheduleLabel && (
        <p className="mb-3 text-sm text-[var(--color-text-secondary)]">Jadwal hari ini: {scheduleLabel}</p>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {error}
        </div>
      )}

      {!attendance ? (
        <>
          {outlets.length > 1 && (
            <div className="mb-3 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Outlet</label>
              <select
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
              >
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
            Ambil foto selfie untuk absen masuk. Lokasimu akan dicatat otomatis kalau diizinkan.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoSelected(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy || !outletId}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
          >
            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />}
            {busy ? "Memproses..." : "📸 Absen masuk"}
          </button>
        </>
      ) : !attendance.clockOutAt ? (
        <>
          <div className="mb-4 flex items-center gap-3">
            {attendance.clockInPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={attendance.clockInPhotoUrl}
                alt="Foto absen masuk"
                className="h-14 w-14 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Masuk {formatJam(attendance.clockInAt!)}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">{STATUS_LABEL[attendance.status]}</p>
            </div>
          </div>
          <button
            onClick={handleClockOut}
            disabled={busy}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-danger)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-60"
          >
            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />}
            {busy ? "Memproses..." : "Absen pulang"}
          </button>
        </>
      ) : (
        <div className="flex items-center gap-3">
          {attendance.clockInPhotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attendance.clockInPhotoUrl}
              alt="Foto absen masuk"
              className="h-14 w-14 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Masuk {formatJam(attendance.clockInAt!)} · Pulang {formatJam(attendance.clockOutAt)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {STATUS_LABEL[attendance.status]} · Absensi hari ini selesai
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
