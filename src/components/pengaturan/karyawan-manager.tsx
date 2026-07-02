"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleUserActiveAction } from "@/app/(app)/pengaturan/karyawan/actions";
import { UserFormModal, type EditingUser, type OutletOption } from "@/components/pengaturan/user-form-modal";
import { useToast, Toast } from "@/components/toast";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "STAFF";
  pin: string | null;
  isActive: boolean;
  outletNames: string[];
  outletIds: string[];
};

const ROLE_LABEL: Record<UserRow["role"], string> = {
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  STAFF: "Staf",
};

export function KaryawanManager({
  outlets,
  users,
}: {
  outlets: OutletOption[];
  users: UserRow[];
}) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditingUser | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(user: UserRow) {
    setEditing({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      pin: user.pin,
      outletIds: user.outletIds,
    });
    setModalOpen(true);
  }

  function toggleActive(user: UserRow) {
    startTransition(async () => {
      const result = await toggleUserActiveAction(user.id, !user.isActive);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(user.isActive ? "Karyawan dinonaktifkan" : "Karyawan diaktifkan");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
        >
          + Tambah karyawan
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {users.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada karyawan. Tambahkan karyawan pertamamu →
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {user.name}
                    {!user.isActive && (
                      <span className="ml-2 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-warning-text)]">
                        Nonaktif
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">
                    {user.email} · {ROLE_LABEL[user.role]}
                    {user.outletNames.length > 0 ? ` · ${user.outletNames.join(", ")}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => openEdit(user)}
                    className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => toggleActive(user)}
                    disabled={isPending}
                    className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40"
                  >
                    {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <UserFormModal outlets={outlets} user={editing} onClose={() => setModalOpen(false)} onSaved={showToast} />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
