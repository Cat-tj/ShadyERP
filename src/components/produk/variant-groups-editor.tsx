"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { VariantGroupType } from "@prisma/client";
import { formatRupiah } from "@/lib/format";
import {
  createVariantGroupAction,
  updateVariantGroupAction,
  deleteVariantGroupAction,
  createVariantOptionAction,
  updateVariantOptionAction,
  deleteVariantOptionAction,
} from "@/app/(app)/produk/actions";
import { XIcon } from "@/components/ui/icons";

export type VariantOptionRow = { id: string; name: string; priceDelta: number };
export type VariantGroupRow = {
  id: string;
  name: string;
  type: VariantGroupType;
  required: boolean;
  options: VariantOptionRow[];
};

function AddOptionRow({
  groupId,
  onNotify,
}: {
  groupId: string;
  onNotify: (message: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [priceDelta, setPriceDelta] = useState("0");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) return;
    const delta = Number(priceDelta);
    if (!Number.isFinite(delta)) {
      onNotify("Tambahan harga tidak valid.");
      return;
    }
    startTransition(async () => {
      const result = await createVariantOptionAction(groupId, { name: name.trim(), priceDelta: delta });
      if (result.error) {
        onNotify(result.error);
        return;
      }
      setName("");
      setPriceDelta("0");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nama opsi, mis. Large"
        className="h-9 min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
      />
      <input
        type="number"
        inputMode="numeric"
        value={priceDelta}
        onChange={(event) => setPriceDelta(event.target.value)}
        placeholder="+0"
        className="h-9 w-24 shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
      />
      <button
        onClick={submit}
        disabled={isPending || !name.trim()}
        className="h-9 shrink-0 rounded-md bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
      >
        + Opsi
      </button>
    </div>
  );
}

function OptionItem({
  groupId,
  option,
  onNotify,
}: {
  groupId: string;
  option: VariantOptionRow;
  onNotify: (message: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(option.name);
  const [priceDelta, setPriceDelta] = useState(String(option.priceDelta));
  const [isPending, startTransition] = useTransition();

  function save() {
    if (!name.trim()) return;
    const delta = Number(priceDelta);
    if (!Number.isFinite(delta)) {
      onNotify("Tambahan harga tidak valid.");
      return;
    }
    startTransition(async () => {
      const result = await updateVariantOptionAction(option.id, { name: name.trim(), priceDelta: delta });
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
      const result = await deleteVariantOptionAction(option.id);
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
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-9 min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <input
          type="number"
          inputMode="numeric"
          value={priceDelta}
          onChange={(event) => setPriceDelta(event.target.value)}
          className="h-9 w-24 shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
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
        {option.name}
        <span className="ml-2 tabular-nums text-xs text-[var(--color-text-secondary)]">
          {option.priceDelta > 0 ? `+${formatRupiah(option.priceDelta)}` : "Rp0"}
        </span>
      </button>
      <button
        onClick={remove}
        disabled={isPending}
        aria-label={`Hapus opsi ${option.name}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] disabled:opacity-40"
      >
        <XIcon aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

function GroupCard({
  productId,
  group,
  onNotify,
}: {
  productId: string;
  group: VariantGroupRow;
  onNotify: (message: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [type, setType] = useState<VariantGroupType>(group.type);
  const [required, setRequired] = useState(group.required);
  const [isPending, startTransition] = useTransition();

  function save() {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await updateVariantGroupAction(group.id, { name: name.trim(), type, required });
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
      const result = await deleteVariantGroupAction(group.id);
      if (result.error) {
        onNotify(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] p-3">
      {editing ? (
        <div className="flex flex-col gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <div className="flex items-center gap-3">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as VariantGroupType)}
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              <option value="SINGLE">Pilih 1</option>
              <option value="MULTIPLE">Pilih banyak</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={required}
                onChange={(event) => setRequired(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-border)]"
              />
              Wajib dipilih
            </label>
            <button
              onClick={save}
              disabled={isPending}
              className="ml-auto h-9 shrink-0 rounded-md bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
            >
              Simpan
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-2 flex items-center justify-between gap-2">
          <button onClick={() => setEditing(true)} className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {group.name}
              {group.required && (
                <span className="ml-2 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-warning-text)]">
                  Wajib
                </span>
              )}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {group.type === "SINGLE" ? "Pilih 1 opsi" : "Boleh pilih banyak"}
            </p>
          </button>
          <button
            onClick={remove}
            disabled={isPending}
            aria-label={`Hapus grup ${group.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] disabled:opacity-40"
          >
            <XIcon aria-hidden className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {group.options.map((option) => (
          <OptionItem key={option.id} groupId={group.id} option={option} onNotify={onNotify} />
        ))}
        <AddOptionRow groupId={group.id} onNotify={onNotify} />
      </div>
    </div>
  );
}

export function VariantGroupsEditor({
  productId,
  groups,
  onNotify,
}: {
  productId: string;
  groups: VariantGroupRow[];
  onNotify: (message: string) => void;
}) {
  const router = useRouter();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState<VariantGroupType>("SINGLE");
  const [newGroupRequired, setNewGroupRequired] = useState(false);
  const [isPending, startTransition] = useTransition();

  function addGroup() {
    if (!newGroupName.trim()) return;
    startTransition(async () => {
      const result = await createVariantGroupAction(productId, {
        name: newGroupName.trim(),
        type: newGroupType,
        required: newGroupRequired,
      });
      if (result.error) {
        onNotify(result.error);
        return;
      }
      setNewGroupName("");
      setNewGroupType("SINGLE");
      setNewGroupRequired(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
      <p className="text-sm font-medium text-[var(--color-text)]">Varian & topping</p>

      {groups.map((group) => (
        <GroupCard key={group.id} productId={productId} group={group} onNotify={onNotify} />
      ))}

      <div className="flex flex-col gap-2 rounded-lg bg-[var(--color-bg)] p-3">
        <input
          value={newGroupName}
          onChange={(event) => setNewGroupName(event.target.value)}
          placeholder="Nama grup baru, mis. Ukuran"
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <div className="flex items-center gap-3">
          <select
            value={newGroupType}
            onChange={(event) => setNewGroupType(event.target.value as VariantGroupType)}
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="SINGLE">Pilih 1</option>
            <option value="MULTIPLE">Pilih banyak</option>
          </select>
          <label className="flex items-center gap-1.5 text-xs text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={newGroupRequired}
              onChange={(event) => setNewGroupRequired(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border)]"
            />
            Wajib dipilih
          </label>
          <button
            onClick={addGroup}
            disabled={isPending || !newGroupName.trim()}
            className="ml-auto h-9 shrink-0 rounded-md bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
          >
            + Grup varian
          </button>
        </div>
      </div>
    </div>
  );
}
