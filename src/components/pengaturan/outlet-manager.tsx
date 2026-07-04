"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createOutletAction,
  updateOutletAction,
  toggleOutletActiveAction,
} from "@/app/(app)/pengaturan/outlet/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type OutletRow = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama outlet wajib diisi.");

    startTransition(async () => {
      const input = { name: name.trim(), address: address.trim() || null, phone: phone.trim() || null };
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
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {outlet ? "Ubah outlet" : "Tambah outlet"}
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
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
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
                    {!outlet.isActive && (
                      <span className="ml-2 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-warning-text)]">
                        Nonaktif
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">
                    {outlet.address ?? "Alamat belum diisi"}
                    {outlet.phone ? ` · ${outlet.phone}` : ""}
                  </p>
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
