"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { disposeExpiredBatchAction } from "@/app/(app)/inventory/actions";
import { Toast, useToast } from "@/components/toast";

export function ExpiredBatchActions({ batchId }: { batchId: string }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  function dispose() {
    const ok = window.confirm("Tandai batch ini dibuang/rusak dan kurangi stok outlet?");
    if (!ok) return;
    startTransition(async () => {
      const result = await disposeExpiredBatchAction(batchId, note);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast("Batch ditandai dibuang/rusak");
      setNote("");
      router.refresh();
    });
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Catatan buang/rusak"
        className="min-h-[34px] rounded border border-amber-200 bg-white/80 px-2 text-xs outline-none focus:border-amber-400"
      />
      <button
        type="button"
        onClick={dispose}
        disabled={isPending}
        className="min-h-[34px] rounded bg-amber-600 px-3 text-xs font-bold text-white disabled:opacity-50"
      >
        {isPending ? "Memproses..." : "Buang/rusak"}
      </button>
      <Toast message={toastMessage} />
    </div>
  );
}
