"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerMemberAction } from "@/app/q/[uid]/actions";
import { GlassPanel } from "@/components/ui/glass-panel";

export function RegisterMemberForm({ uid, tenantName }: { uid: string; tenantName: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await registerMemberAction(uid, { name, phone, email });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <GlassPanel strong className="w-full max-w-sm rounded-xl p-6">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] font-display text-xl font-semibold text-[var(--color-on-primary)]">
          {tenantName.slice(0, 1).toUpperCase()}
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          Daftar member {tenantName}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Kartu ini belum aktif. Isi data di bawah untuk mulai kumpulkan poin.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Nama lengkap</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Nomor HP</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="081234567890"
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base tabular-nums outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Email (opsional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-white/70 px-4 text-base outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {isPending ? "Mendaftar..." : "Daftar sekarang"}
      </button>
    </GlassPanel>
  );
}
