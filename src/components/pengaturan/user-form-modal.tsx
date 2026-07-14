"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "@/components/ui/icons";
import { createUserAction, updateUserAction } from "@/app/(app)/pengaturan/karyawan/actions";

export type OutletOption = { id: string; name: string };

export type EditingUser = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "STAFF";
  outletIds: string[];
  jobTitle?: string | null;
};

const ROLE_OPTIONS: { value: EditingUser["role"]; label: string }[] = [
  { value: "OWNER", label: "Pemilik" },
  { value: "MANAGER", label: "Manajer" },
  { value: "STAFF", label: "Staf" },
];

const JOB_PRESETS = ["Kasir", "Inventory", "Finance", "HR", "Manager Cabang", "Dapur", "Laundry", "Runner"];

export function UserFormModal({
  outlets,
  user,
  onClose,
  onSaved,
}: {
  outlets: OutletOption[];
  user: EditingUser | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<EditingUser["role"]>(user?.role ?? "STAFF");
  const [pin, setPin] = useState("");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");
  const [password, setPassword] = useState("");
  const [outletIds, setOutletIds] = useState<string[]>(user?.outletIds ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleOutlet(id: string) {
    setOutletIds((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));
  }

  function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama wajib diisi.");
    if (!user && !email.trim()) return setError("Email wajib diisi.");

    startTransition(async () => {
      const result = user
        ? await updateUserAction(user.id, {
            name: name.trim(),
            email: user.email,
            role,
            outletIds,
            pin: pin.trim() || undefined,
            password: password.trim() || undefined,
            jobTitle: jobTitle.trim() || null,
          })
        : await createUserAction({
            name: name.trim(),
            email: email.trim(),
            role,
            outletIds,
            pin: pin.trim() || undefined,
            password: password.trim(),
            jobTitle: jobTitle.trim() || null,
          });

      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(user ? "Karyawan disimpan" : "Karyawan ditambahkan");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto scrollbar-none bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-modal)] rounded-t-3xl sm:max-w-md sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-b border-[var(--color-border)]/50">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {user ? "Ubah karyawan" : "Tambah karyawan"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Pekerjaan / Spesialisasi</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Misal: Waitress, Barista, Chef, Kasir"
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <div className="flex flex-wrap gap-1.5">
              {JOB_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setJobTitle(preset);
                    if (preset === "Manager Cabang") setRole("MANAGER");
                    if (["Kasir", "Inventory", "Dapur", "Laundry", "Runner"].includes(preset)) setRole("STAFF");
                  }}
                  className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@usaha.id"
              disabled={!!user}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:bg-[var(--color-bg)] disabled:text-[var(--color-text-secondary)]"
            />
            {user && (
              <p className="text-xs text-[var(--color-text-secondary)]">Email tidak bisa diubah.</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">
              {user ? "Kata sandi baru (opsional)" : "Kata sandi"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={user ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Peran</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as EditingUser["role"])}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">
              {user ? "PIN kasir baru (opsional, 6 digit)" : "PIN kasir (opsional, 6 digit)"}
            </label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder={user ? "Kosongkan jika tidak diubah" : "6 angka"}
              className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[var(--color-text)]">Ditugaskan ke outlet</p>
            {outlets.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">Belum ada outlet.</p>
            ) : (
              outlets.map((outlet) => (
                <label key={outlet.id} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                  <input
                    type="checkbox"
                    checked={outletIds.includes(outlet.id)}
                    onChange={() => toggleOutlet(outlet.id)}
                    className="h-5 w-5 rounded border-[var(--color-border)]"
                  />
                  {outlet.name}
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-t border-[var(--color-border)]/50">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            {isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
            )}
            {isPending ? "Menyimpan..." : "Simpan karyawan"}
          </button>
        </div>
      </div>
    </div>
  );
}
