"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createTableAction,
  updateTableAction,
  toggleTableActiveAction,
} from "@/app/(app)/pengaturan/meja/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type OutletOption = { id: string; name: string };

export type TableRow = {
  id: string;
  name: string;
  outletId: string;
  outletName: string;
  isActive: boolean;
};

function TableFormModal({
  outlets,
  table,
  onClose,
  onSaved,
}: {
  outlets: OutletOption[];
  table: TableRow | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(table?.outletId ?? outlets[0]?.id ?? "");
  const [name, setName] = useState(table?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama meja wajib diisi.");
    if (!outletId) return setError("Pilih outlet terlebih dahulu.");

    startTransition(async () => {
      const result = table
        ? await updateTableAction(table.id, name.trim())
        : await createTableAction(outletId, name.trim());

      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(table ? "Meja disimpan" : "Meja ditambahkan");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {table ? "Ubah meja" : "Tambah meja"}
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
          {!table && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Outlet</label>
              <select
                value={outletId}
                onChange={(event) => setOutletId(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama meja</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Meja 1"
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
          {isPending ? "Menyimpan..." : "Simpan meja"}
        </button>
      </div>
    </div>
  );
}

export function MejaManager({ outlets, tables }: { outlets: OutletOption[]; tables: TableRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TableRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleActive(table: TableRow) {
    startTransition(async () => {
      const result = await toggleTableActiveAction(table.id, !table.isActive);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(table.isActive ? "Meja dinonaktifkan" : "Meja diaktifkan");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Setiap meja punya QR code unik untuk halaman pesan mandiri pelanggan. Pesanan masuk bisa
        dilihat di menu &quot;Pesanan Masuk&quot;.
      </p>

      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          disabled={outlets.length === 0}
          className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
        >
          + Tambah meja
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {tables.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada meja. Tambahkan meja pertamamu →
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {tables.map((table) => (
              <div key={table.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {table.name}
                    {!table.isActive && (
                      <span className="ml-2 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-warning-text)]">
                        Nonaktif
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">{table.outletName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/pengaturan/meja/${table.id}`}
                    className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] flex items-center hover:bg-[var(--color-bg)]"
                  >
                    Lihat QR
                  </Link>
                  <button
                    onClick={() => {
                      setEditing(table);
                      setModalOpen(true);
                    }}
                    className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => toggleActive(table)}
                    disabled={isPending}
                    className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40"
                  >
                    {table.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <TableFormModal
          outlets={outlets}
          table={editing}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
