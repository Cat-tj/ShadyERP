"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import {
  addWholesalePriceTierAction,
  updateWholesalePriceTierAction,
  removeWholesalePriceTierAction,
} from "@/app/(app)/produk/actions";
import { XIcon } from "@/components/ui/icons";

export type WholesaleTierRow = { id: string; minQty: number; price: number };

function TierLine({ tier, onNotify }: { tier: WholesaleTierRow; onNotify: (message: string) => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [minQty, setMinQty] = useState(String(tier.minQty));
  const [price, setPrice] = useState(String(tier.price));
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateWholesalePriceTierAction(tier.id, Number(minQty), Number(price));
      if (result.error) {
        onNotify(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeWholesalePriceTierAction(tier.id);
      if (result.error) {
        onNotify(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)]">Min.</span>
        <input
          type="number"
          inputMode="numeric"
          value={minQty}
          onChange={(event) => setMinQty(event.target.value)}
          className="h-9 w-16 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
        />
        <span className="text-xs text-[var(--color-text-secondary)]">Rp</span>
        <input
          type="number"
          inputMode="numeric"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="h-9 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
        />
        <button
          onClick={save}
          disabled={isPending}
          className="h-9 shrink-0 rounded-md bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
        >
          Simpan
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-[var(--color-bg)] px-3 py-2">
      <button onClick={() => setEditing(true)} className="min-w-0 flex-1 text-left text-sm text-[var(--color-text)]">
        Beli {tier.minQty}+ &rarr; <span className="tabular-nums font-semibold">{formatRupiah(tier.price)}</span>/unit
      </button>
      <button
        onClick={remove}
        disabled={isPending}
        aria-label={`Hapus tingkatan harga ${tier.minQty}+`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] disabled:opacity-40"
      >
        <XIcon aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

export function WholesaleTierEditor({
  productId,
  tiers,
  onNotify,
}: {
  productId: string;
  tiers: WholesaleTierRow[];
  onNotify: (message: string) => void;
}) {
  const router = useRouter();
  const [newMinQty, setNewMinQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [isPending, startTransition] = useTransition();

  function addTier() {
    const minQtyNumber = Number(newMinQty);
    const priceNumber = Number(newPrice);
    if (!Number.isFinite(minQtyNumber) || minQtyNumber <= 1) {
      onNotify("Jumlah minimum harus lebih dari 1.");
      return;
    }
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      onNotify("Harga grosir harus lebih dari 0.");
      return;
    }
    startTransition(async () => {
      const result = await addWholesalePriceTierAction(productId, minQtyNumber, priceNumber);
      if (result.error) {
        onNotify(result.error);
        return;
      }
      setNewMinQty("");
      setNewPrice("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">Harga grosir (opsional)</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Makin banyak dibeli, makin murah per unit — otomatis kepakai saat qty di kasir memenuhi jumlah minimum.
          Cuma berlaku buat produk tanpa varian.
        </p>
      </div>

      {tiers.map((tier) => (
        <TierLine key={tier.id} tier={tier} onNotify={onNotify} />
      ))}

      <div className="flex items-center gap-2 rounded-lg bg-[var(--color-bg)] p-3">
        <span className="text-xs text-[var(--color-text-secondary)]">Min. qty</span>
        <input
          type="number"
          inputMode="numeric"
          min={2}
          value={newMinQty}
          onChange={(event) => setNewMinQty(event.target.value)}
          placeholder="mis. 12"
          className="h-9 w-20 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
        />
        <span className="text-xs text-[var(--color-text-secondary)]">Harga/unit</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={newPrice}
          onChange={(event) => setNewPrice(event.target.value)}
          placeholder="mis. 15000"
          className="h-9 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
        />
        <button
          onClick={addTier}
          disabled={isPending || !newMinQty || !newPrice}
          className="h-9 shrink-0 rounded-md bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
        >
          + Tingkatan
        </button>
      </div>
    </div>
  );
}
