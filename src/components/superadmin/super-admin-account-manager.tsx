"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSuperAdminAccountAction, changeSuperAdminPasswordAction } from "@/app/superadmin/(protected)/actions";
import { formatTanggalPendek } from "@/lib/format";
import { Toast, useToast } from "@/components/toast";

export type SuperAdminRow = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export function SuperAdminAccountManager({ admins }: { admins: SuperAdminRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordDraft, setPasswordDraft] = useState<Record<string, string>>({});

  function createAccount(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createSuperAdminAccountAction({ email, name, password });
      if (result.error) return showToast(result.error);
      setEmail("");
      setName("");
      setPassword("");
      showToast("Akun superadmin disimpan");
      router.refresh();
    });
  }

  function resetPassword(admin: SuperAdminRow) {
    const nextPassword = passwordDraft[admin.id] ?? "";
    startTransition(async () => {
      const result = await changeSuperAdminPasswordAction(admin.id, nextPassword);
      if (result.error) return showToast(result.error);
      setPasswordDraft((prev) => ({ ...prev, [admin.id]: "" }));
      showToast(`Password ${admin.email} direset`);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={createAccount} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Tambah / Reset Superadmin</h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Jika email sudah ada, nama dan password akan diperbarui.
        </p>
        <label className="mt-4 block text-xs font-bold text-[var(--color-text-secondary)]">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 min-h-[42px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
          />
        </label>
        <label className="mt-3 block text-xs font-bold text-[var(--color-text-secondary)]">
          Nama
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 min-h-[42px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
          />
        </label>
        <label className="mt-3 block text-xs font-bold text-[var(--color-text-secondary)]">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 min-h-[42px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
          />
        </label>
        <button
          disabled={isPending}
          className="mt-4 min-h-[42px] w-full rounded-lg bg-[var(--color-primary)] px-4 text-sm font-bold text-[var(--color-on-primary)] disabled:opacity-50"
        >
          Simpan akun
        </button>
      </form>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Daftar Superadmin</h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {admins.map((admin) => (
            <div key={admin.id} className="grid gap-3 p-4">
              <div>
                <p className="font-bold text-[var(--color-text)]">{admin.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {admin.email} · sejak {formatTanggalPendek(admin.createdAt)}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="password"
                  value={passwordDraft[admin.id] ?? ""}
                  onChange={(event) => setPasswordDraft((prev) => ({ ...prev, [admin.id]: event.target.value }))}
                  placeholder="Password baru"
                  className="min-h-[38px] flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]"
                />
                <button
                  type="button"
                  onClick={() => resetPassword(admin)}
                  disabled={isPending}
                  className="min-h-[38px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-text)] disabled:opacity-50"
                >
                  Reset password
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Toast message={toastMessage} />
    </div>
  );
}
