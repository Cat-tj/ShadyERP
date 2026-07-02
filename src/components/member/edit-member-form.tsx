"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMemberAction } from "@/app/(app)/member/[id]/actions";

export function EditMemberForm({
  memberId,
  initialName,
  initialPhone,
  initialEmail,
  onDone,
}: {
  memberId: string;
  initialName: string;
  initialPhone: string;
  initialEmail: string | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await updateMemberAction(memberId, { name, phone, email });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-[var(--color-bg)] p-3">
      {error && (
        <p className="rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-xs text-[var(--color-warning-text)]">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">Nama</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">Nomor HP</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
          inputMode="numeric"
          className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">Email (opsional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending || !name.trim() || !phone.trim()}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          onClick={onDone}
          disabled={isPending}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)]"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
