"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OutletType } from "@prisma/client";
import {
  createOutletAction,
  updateOutletAction,
  toggleOutletActiveAction,
} from "@/app/(app)/pengaturan/outlet/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";

export type OutletRow = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  receiptPaperWidth: number;
  isActive: boolean;
  outletType: OutletType;
  eventName: string | null;
  eventStartDate: string | null;
  eventEndDate: string | null;
  eventFee: number | null;
};

const OUTLET_TYPE_OPTIONS: { value: OutletType; label: string; description: string }[] = [
  { value: "PERMANENT", label: "Cabang tetap", description: "Cabang biasa, buka terus-menerus." },
  { value: "POPUP", label: "Pop-up", description: "Cabang kecil & portable, gampang dipindah-pindah (mis. lapak/booth)." },
  { value: "EVENT", label: "Event", description: "Cabang kecil khusus satu acara — biasanya bayar biaya sewa tempat/booth." },
];

const OUTLET_TYPE_BADGE_LABEL: Record<OutletType, string | null> = {
  PERMANENT: null,
  POPUP: "Pop-up",
  EVENT: "Event",
};

function OutletFormModal({
  outlet,
  onClose,
  onSaved,
}: {
  outlet: OutletRow | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(outlet?.name ?? "");
  const [address, setAddress] = useState(outlet?.address ?? "");
  const [phone, setPhone] = useState(outlet?.phone ?? "");
  const [paperWidth, setPaperWidth] = useState<58 | 80>(outlet?.receiptPaperWidth === 80 ? 80 : 58);
  const [outletType, setOutletType] = useState<OutletType>(outlet?.outletType ?? "PERMANENT");
  const [eventName, setEventName] = useState(outlet?.eventName ?? "");
  const [eventStartDate, setEventStartDate] = useState(outlet?.eventStartDate?.slice(0, 10) ?? "");
  const [eventEndDate, setEventEndDate] = useState(outlet?.eventEndDate?.slice(0, 10) ?? "");
  const [eventFee, setEventFee] = useState(outlet?.eventFee ? String(outlet.eventFee) : "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isNewEventOutlet = !outlet && outletType === "EVENT";

  function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama outlet wajib diisi.");

    startTransition(async () => {
      const input = {
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        receiptPaperWidth: paperWidth,
        outletType,
        eventName: eventName.trim() || null,
        eventStartDate: eventStartDate ? new Date(eventStartDate) : null,
        eventEndDate: eventEndDate ? new Date(eventEndDate) : null,
        eventFee: eventFee ? Number(eventFee) : null,
      };
      const result = outlet
        ? await updateOutletAction(outlet.id, input)
        : await createOutletAction(input);

      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(outlet ? "Outlet disimpan" : "Outlet ditambahkan");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl rounded-t-3xl p-6 sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {outlet ? "Ubah outlet" : "Tambah outlet"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama outlet</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cabang Kemang"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Alamat (opsional)</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Contoh No. 1"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">No. telepon (opsional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Lebar kertas printer struk</label>
            <select
              value={paperWidth}
              onChange={(e) => setPaperWidth(Number(e.target.value) === 80 ? 80 : 58)}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              <option value={58}>58mm (umum, kasir portable)</option>
              <option value={80}>80mm (printer meja/counter)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Jenis outlet</label>
            <div className="grid grid-cols-3 gap-2">
              {OUTLET_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOutletType(option.value)}
                  className={`min-h-[44px] rounded-lg border px-2 text-xs font-semibold transition-colors ${
                    outletType === option.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {OUTLET_TYPE_OPTIONS.find((option) => option.value === outletType)?.description}
            </p>
          </div>

          {outletType === "EVENT" && (
            <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Nama event (opsional)</label>
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Bazar Ramadhan 2026"
                  className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Tanggal mulai</label>
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Tanggal selesai</label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Biaya event (opsional)</label>
                <input
                  type="number"
                  value={eventFee}
                  onChange={(e) => setEventFee(e.target.value)}
                  placeholder="Sewa tempat/booth"
                  className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                {isNewEventOutlet && (
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Otomatis dicatat sebagai pengeluaran outlet ini begitu disimpan.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Menyimpan..." : "Simpan outlet"}
        </button>
      </div>
    </div>
  );
}

export function OutletManager({ outlets }: { outlets: OutletRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OutletRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleActive(outlet: OutletRow) {
    startTransition(async () => {
      const result = await toggleOutletActiveAction(outlet.id, !outlet.isActive);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(outlet.isActive ? "Outlet dinonaktifkan" : "Outlet diaktifkan");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)]"
        >
          + Tambah outlet
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {outlets.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada outlet. Tambahkan outlet pertamamu →
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {outlets.map((outlet) => (
              <div key={outlet.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {outlet.name}
                    {OUTLET_TYPE_BADGE_LABEL[outlet.outletType] && (
                      <span className="ml-2 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                        {OUTLET_TYPE_BADGE_LABEL[outlet.outletType]}
                      </span>
                    )}
                    {!outlet.isActive && (
                      <span className="ml-2 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-warning-text)]">
                        Nonaktif
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">
                    {outlet.address ?? "Alamat belum diisi"}
                    {outlet.phone ? ` · ${outlet.phone}` : ""}
                    {` · Kertas ${outlet.receiptPaperWidth}mm`}
                  </p>
                  {outlet.outletType === "EVENT" && (outlet.eventName || outlet.eventStartDate || outlet.eventFee) && (
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {outlet.eventName ?? "Event"}
                      {outlet.eventStartDate ? ` · ${formatTanggalPendek(outlet.eventStartDate)}` : ""}
                      {outlet.eventEndDate ? ` – ${formatTanggalPendek(outlet.eventEndDate)}` : ""}
                      {outlet.eventFee ? ` · Biaya ${formatRupiah(outlet.eventFee)}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setEditing(outlet);
                      setModalOpen(true);
                    }}
                    className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] sm:flex-none"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => toggleActive(outlet)}
                    disabled={isPending}
                    className="min-h-[36px] flex-1 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 sm:flex-none"
                  >
                    {outlet.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <OutletFormModal outlet={editing} onClose={() => setModalOpen(false)} onSaved={showToast} />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
