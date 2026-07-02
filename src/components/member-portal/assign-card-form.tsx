"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignCardAction } from "@/app/(app)/member/[id]/actions";

export function AssignCardForm({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [serialNumber, setSerialNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await assignCardAction(memberId, serialNumber);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSerialNumber("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg bg-[var(--color-warning-bg)] p-4">
      <p className="mb-2 text-sm font-medium text-[var(--color-warning-text)]">
        Member ini belum punya kartu QR.
      </p>
      {error && <p className="mb-2 text-xs text-[var(--color-warning-text)]">{error}</p>}
      <div className="flex gap-2">
        <input
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
          placeholder="Nomor seri, mis. MBR-0001"
          className="min-h-[44px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <button
          onClick={handleSubmit}
          disabled={isPending || !serialNumber.trim()}
          className="min-h-[44px] rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-50"
        >
          {isPending ? "..." : "Hubungkan"}
        </button>
      </div>
    </div>
  );
}
