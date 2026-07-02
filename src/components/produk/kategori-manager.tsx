"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/(app)/produk/actions";

export type CategoryOption = { id: string; name: string };

export function KategoriManager({
  categories,
  onNotify,
}: {
  categories: CategoryOption[];
  onNotify: (message: string) => void;
}) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!newName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createCategoryAction(newName.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      setNewName("");
      onNotify("Kategori disimpan");
      router.refresh();
    });
  }

  function handleRename(id: string) {
    if (!editingName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await updateCategoryAction(id, editingName.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      setEditingId(null);
      onNotify("Kategori disimpan");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      onNotify("Kategori dihapus");
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="text-base font-bold text-[var(--color-text)]">Kategori</h2>

      {error && (
        <div className="mt-2 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
          {error}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((category) =>
          editingId === category.id ? (
            <div key={category.id} className="flex items-center gap-1">
              <input
                autoFocus
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                className="h-9 w-32 rounded-md border border-[var(--color-border)] px-2 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <button
                onClick={() => handleRename(category.id)}
                disabled={isPending}
                className="h-9 rounded-md bg-[var(--color-primary)] px-2 text-xs font-semibold text-[var(--color-on-primary)]"
              >
                Simpan
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="h-9 rounded-md px-2 text-xs text-[var(--color-text-secondary)]"
              >
                Batal
              </button>
            </div>
          ) : (
            <div
              key={category.id}
              className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] py-1 pl-3 pr-1.5"
            >
              <span className="text-sm text-[var(--color-text)]">{category.name}</span>
              <button
                onClick={() => {
                  setEditingId(category.id);
                  setEditingName(category.name);
                }}
                aria-label={`Ubah kategori ${category.name}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
              >
                ✎
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                aria-label={`Hapus kategori ${category.name}`}
                disabled={isPending}
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
              >
                ✕
              </button>
            </div>
          )
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleAdd()}
          placeholder="Nama kategori baru"
          className="h-10 flex-1 rounded-lg border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !newName.trim()}
          className="h-10 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
        >
          Tambah
        </button>
      </div>
    </div>
  );
}
