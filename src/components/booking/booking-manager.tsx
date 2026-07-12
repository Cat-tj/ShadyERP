"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BookingType, BookingStatus } from "@prisma/client";
import { formatTanggal, formatJam } from "@/lib/format";
import {
  createBookingAction,
  updateBookingAction,
  updateBookingStatusAction,
  deleteBookingAction,
} from "@/app/(app)/booking/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon, CalendarIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/empty-state";

export type OutletOption = { id: string; name: string };
export type StaffOption = { id: string; name: string };

export type BookingRow = {
  id: string;
  outletId: string;
  outletName: string;
  type: BookingType;
  customerName: string;
  customerPhone: string | null;
  memberName: string | null;
  serviceName: string;
  scheduledAt: string;
  durationMinutes: number;
  staffUserId: string | null;
  staffName: string | null;
  pax: number | null;
  eventAddress: string | null;
  quotedAmount: number | null;
  transportFee: number;
  staffFee: number;
  depositAmount: number;
  status: BookingStatus;
  note: string | null;
};

const TYPE_LABEL: Record<BookingType, string> = {
  APPOINTMENT: "Janji temu",
  DELIVERY: "Diantar/acara",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Menunggu konfirmasi",
  CONFIRMED: "Terkonfirmasi",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",
};

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function groupByDate(bookings: BookingRow[]): { dateLabel: string; bookings: BookingRow[] }[] {
  const groups = new Map<string, BookingRow[]>();
  for (const booking of bookings) {
    const key = formatTanggal(booking.scheduledAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(booking);
  }
  return Array.from(groups.entries()).map(([dateLabel, bookings]) => ({ dateLabel, bookings }));
}

export function BookingManager({
  outlets,
  staff,
  bookings,
}: {
  outlets: OutletOption[];
  staff: StaffOption[];
  bookings: BookingRow[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BookingRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function changeStatus(booking: BookingRow, status: BookingStatus) {
    startTransition(async () => {
      const result = await updateBookingStatusAction(booking.id, status);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(`${booking.customerName}: ${STATUS_LABEL[status]}`);
      router.refresh();
    });
  }

  function remove(booking: BookingRow) {
    if (!confirm(`Hapus booking ${booking.customerName}?`)) return;
    startTransition(async () => {
      const result = await deleteBookingAction(booking.id);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Booking dihapus");
      router.refresh();
    });
  }

  const groups = groupByDate(bookings);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Booking</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Janji temu (mis. potong rambut) & pesanan diantar/dibawa ke acara.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="min-h-[44px] shrink-0 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)]"
        >
          + Booking
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <EmptyState
            icon={CalendarIcon}
            title="Belum ada booking"
            description="Buat booking pertama untuk janji temu, pesanan event, atau layanan terjadwal."
            action={{
              label: "+ Booking",
              onClick: () => {
                setEditing(null);
                setModalOpen(true);
              },
            }}
          />
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.dateLabel} className="flex flex-col gap-2">
            <p className="text-sm font-bold text-[var(--color-text)]">{group.dateLabel}</p>
            {group.bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      {formatJam(booking.scheduledAt)} · {booking.customerName}
                      {booking.memberName && (
                        <span className="ml-1.5 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                          Member: {booking.memberName}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {booking.serviceName} · {TYPE_LABEL[booking.type]} · {booking.durationMinutes} menit
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {booking.outletName}
                      {booking.staffName ? ` · ${booking.staffName}` : ""}
                      {booking.customerPhone ? ` · ${booking.customerPhone}` : ""}
                    </p>
                    {booking.note && (
                      <p className="mt-1 text-xs italic text-[var(--color-text-secondary)]">
                        &quot;{booking.note}&quot;
                      </p>
                    )}
                    {booking.type === "DELIVERY" && (
                      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                        {booking.pax ? `${booking.pax} pax · ` : ""}
                        {booking.eventAddress ? `${booking.eventAddress} · ` : ""}
                        {booking.quotedAmount
                          ? `Deal Rp${booking.quotedAmount.toLocaleString("id-ID")}`
                          : "Belum ada nominal deal"}
                        {booking.depositAmount ? ` · DP Rp${booking.depositAmount.toLocaleString("id-ID")}` : ""}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      booking.status === "PENDING"
                        ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
                        : booking.status === "CANCELLED"
                          ? "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                          : "bg-[var(--color-bg)] text-[var(--color-primary)]"
                    }`}
                  >
                    {STATUS_LABEL[booking.status]}
                  </span>
                </div>

                {booking.status !== "DONE" && booking.status !== "CANCELLED" && (
                  <div className="flex flex-wrap gap-2">
                    {booking.status === "PENDING" && (
                      <button
                        onClick={() => changeStatus(booking, "CONFIRMED")}
                        disabled={isPending}
                        className="min-h-[36px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
                      >
                        Konfirmasi
                      </button>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <button
                        onClick={() => changeStatus(booking, "DONE")}
                        disabled={isPending}
                        className="min-h-[36px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
                      >
                        Selesai
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditing(booking);
                        setModalOpen(true);
                      }}
                      className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => changeStatus(booking, "CANCELLED")}
                      disabled={isPending}
                      className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40"
                    >
                      Batalkan
                    </button>
                  </div>
                )}
                {(booking.status === "DONE" || booking.status === "CANCELLED") && (
                  <button
                    onClick={() => remove(booking)}
                    disabled={isPending}
                    className="self-start text-xs font-medium text-[var(--color-danger)] disabled:opacity-40"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </div>
        ))
      )}

      {modalOpen && (
        <BookingFormModal
          booking={editing}
          outlets={outlets}
          staff={staff}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}

function BookingFormModal({
  booking,
  outlets,
  staff,
  onClose,
  onSaved,
}: {
  booking: BookingRow | null;
  outlets: OutletOption[];
  staff: StaffOption[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(booking?.outletId ?? outlets[0]?.id ?? "");
  const [type, setType] = useState<BookingType>(booking?.type ?? "APPOINTMENT");
  const [customerName, setCustomerName] = useState(booking?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(booking?.customerPhone ?? "");
  const [serviceName, setServiceName] = useState(booking?.serviceName ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    booking ? toDatetimeLocalValue(booking.scheduledAt) : ""
  );
  const [durationMinutes, setDurationMinutes] = useState(String(booking?.durationMinutes ?? 60));
  const [staffUserId, setStaffUserId] = useState(booking?.staffUserId ?? "");
  const [pax, setPax] = useState(booking?.pax ? String(booking.pax) : "");
  const [eventAddress, setEventAddress] = useState(booking?.eventAddress ?? "");
  const [quotedAmount, setQuotedAmount] = useState(booking?.quotedAmount ? String(booking.quotedAmount) : "");
  const [transportFee, setTransportFee] = useState(String(booking?.transportFee ?? 0));
  const [staffFee, setStaffFee] = useState(String(booking?.staffFee ?? 0));
  const [depositAmount, setDepositAmount] = useState(String(booking?.depositAmount ?? 0));
  const [note, setNote] = useState(booking?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!outletId) return setError("Pilih outlet dulu.");
    if (!customerName.trim()) return setError("Nama pelanggan wajib diisi.");
    if (!serviceName.trim()) return setError("Nama layanan/pesanan wajib diisi.");
    if (!scheduledAt) return setError("Tanggal & jam wajib diisi.");
    const duration = Number(durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) return setError("Durasi tidak valid.");
    const parsedPax = pax ? Number(pax) : null;
    const parsedQuoted = quotedAmount ? Number(quotedAmount) : null;
    const parsedTransport = Number(transportFee) || 0;
    const parsedStaffFee = Number(staffFee) || 0;
    const parsedDeposit = Number(depositAmount) || 0;
    if (
      [parsedPax, parsedQuoted, parsedTransport, parsedStaffFee, parsedDeposit].some(
        (value) => value !== null && (!Number.isFinite(value) || value < 0)
      )
    ) {
      return setError("Nominal/jumlah event tidak valid.");
    }

    startTransition(async () => {
      const input = {
        outletId,
        type,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        serviceName: serviceName.trim(),
        scheduledAt,
        durationMinutes: duration,
        staffUserId: staffUserId || null,
        pax: type === "DELIVERY" ? parsedPax : null,
        eventAddress: type === "DELIVERY" ? eventAddress.trim() || null : null,
        quotedAmount: type === "DELIVERY" ? parsedQuoted : null,
        transportFee: type === "DELIVERY" ? parsedTransport : 0,
        staffFee: type === "DELIVERY" ? parsedStaffFee : 0,
        depositAmount: type === "DELIVERY" ? parsedDeposit : 0,
        note: note.trim() || null,
      };
      const result = booking
        ? await updateBookingAction(booking.id, input)
        : await createBookingAction(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(result.warning ?? (booking ? "Booking disimpan" : "Booking ditambahkan"));
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {booking ? "Ubah booking" : "Booking baru"}
          </h2>
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

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Outlet</label>
              <select
                value={outletId}
                onChange={(event) => setOutletId(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Jenis</label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as BookingType)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="APPOINTMENT">Janji temu</option>
                <option value="DELIVERY">Diantar/acara</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama pelanggan</label>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Nama pelanggan"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">No. HP (opsional)</label>
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="08xxxxxxxxxx"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Layanan / pesanan</label>
            <input
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              placeholder="mis. Potong rambut, Nasi kotak 50 pcs"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Tanggal & jam</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Durasi (menit)</label>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Staff (opsional)</label>
            <select
              value={staffUserId}
              onChange={(event) => setStaffUserId(event.target.value)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Belum ditentukan</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {type === "DELIVERY" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Pax / item</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={pax}
                    onChange={(event) => setPax(event.target.value)}
                    placeholder="0"
                    className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Nominal deal</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={quotedAmount}
                    onChange={(event) => setQuotedAmount(event.target.value)}
                    placeholder="0"
                    className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Alamat acara</label>
                <input
                  value={eventAddress}
                  onChange={(event) => setEventAddress(event.target.value)}
                  placeholder="Alamat venue / titik antar"
                  className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Transport</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={transportFee}
                    onChange={(event) => setTransportFee(event.target.value)}
                    className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Barista</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={staffFee}
                    onChange={(event) => setStaffFee(event.target.value)}
                    className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">DP</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={depositAmount}
                    onChange={(event) => setDepositAmount(event.target.value)}
                    className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Catatan (opsional)</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="mis. alamat antar, request khusus"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Menyimpan..." : "Simpan booking"}
        </button>
      </div>
    </div>
  );
}
