"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addRecipeItemAction,
  updateRecipeItemQtyAction,
  removeRecipeItemAction,
} from "@/app/(app)/produk/actions";
import { XIcon } from "@/components/ui/icons";

export type RecipeItemRow = { id: string; ingredientId: string; ingredientName: string; qty: number };
export type IngredientOption = { id: string; name: string };

function RecipeItemLine({
  item,
  onNotify,
}: {
  item: RecipeItemRow;
  onNotify: (message: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(String(item.qty));
  const [isPending, startTransition] = useTransition();

  function save() {
    const value = Number(qty);
    if (!Number.isFinite(value) || value <= 0) {
      onNotify("Jumlah harus lebih dari 0.");
      return;
    }
    startTransition(async () => {
      const result = await updateRecipeItemQtyAction(item.id, value);
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
      const result = await removeRecipeItemAction(item.id);
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
        <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text)]">{item.ingredientName}</span>
        <input
          type="number"
          inputMode="numeric"
          value={qty}
          onChange={(event) => setQty(event.target.value)}
          className="h-9 w-20 shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
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
      <button
        onClick={() => setEditing(true)}
        className="min-w-0 flex-1 truncate text-left text-sm text-[var(--color-text)]"
      >
        {item.ingredientName}
        <span className="ml-2 tabular-nums text-xs text-[var(--color-text-secondary)]">x{item.qty}</span>
      </button>
      <button
        onClick={remove}
        disabled={isPending}
        aria-label={`Hapus bahan ${item.ingredientName}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] disabled:opacity-40"
      >
        <XIcon aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

export function RecipeEditor({
  productId,
  items,
  ingredientOptions,
  onNotify,
}: {
  productId: string;
  items: RecipeItemRow[];
  ingredientOptions: IngredientOption[];
  onNotify: (message: string) => void;
}) {
  const router = useRouter();
  const [newIngredientId, setNewIngredientId] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [isPending, startTransition] = useTransition();

  const usedIds = new Set(items.map((item) => item.ingredientId));
  const availableOptions = ingredientOptions.filter((option) => !usedIds.has(option.id));

  function addItem() {
    if (!newIngredientId) {
      onNotify("Pilih bahan/komponen dulu.");
      return;
    }
    const value = Number(newQty);
    if (!Number.isFinite(value) || value <= 0) {
      onNotify("Jumlah harus lebih dari 0.");
      return;
    }
    startTransition(async () => {
      const result = await addRecipeItemAction(productId, newIngredientId, value);
      if (result.error) {
        onNotify(result.error);
        return;
      }
      setNewIngredientId("");
      setNewQty("1");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">Resep / komponen (opsional)</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Kalau produk ini dibuat dari bahan lain (mis. Cappuccino = susu+kopi+gula) atau paket/kombo dari menu
          jadi lain (mis. Paket Hemat = Burger+Kentang+Es Teh), stok yang dipotong saat transaksi otomatis ikut
          bahan/komponen di sini — bukan stok produk ini sendiri.
        </p>
      </div>

      {items.map((item) => (
        <RecipeItemLine key={item.id} item={item} onNotify={onNotify} />
      ))}

      {availableOptions.length > 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-[var(--color-bg)] p-3">
          <select
            value={newIngredientId}
            onChange={(event) => setNewIngredientId(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Pilih bahan/komponen...</option>
            {availableOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="numeric"
            value={newQty}
            onChange={(event) => setNewQty(event.target.value)}
            className="h-9 w-20 shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
          />
          <button
            onClick={addItem}
            disabled={isPending || !newIngredientId}
            className="h-9 shrink-0 rounded-md bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
          >
            + Bahan
          </button>
        </div>
      ) : (
        <p className="text-xs text-[var(--color-text-secondary)]">
          Semua produk lain sudah dipakai, atau belum ada produk lain untuk dijadikan bahan/komponen.
        </p>
      )}
    </div>
  );
}
