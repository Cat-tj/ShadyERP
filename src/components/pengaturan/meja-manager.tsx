"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createTableAction,
  updateTableAction,
  toggleTableActiveAction,
} from "@/app/(app)/pengaturan/meja/actions";
import { useToast, Toast } from "@/components/toast";
import { XIcon } from "@/components/ui/icons";

export type OutletOption = { id: string; name: string };

export type TableRow = {
  id: string;
  name: string;
  outletId: string;
  outletName: string;
  isActive: boolean;
  posX: number;
  posY: number;
  floor: number;
  shape: string;
  capacity: number;
};

function TableFormModal({
  outlets,
  table,
  onClose,
  onSaved,
  defaultPos = null,
  maxCols = 6,
  maxRows = 6,
}: {
  outlets: OutletOption[];
  table: TableRow | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  defaultPos?: { posX: number; posY: number; floor: number } | null;
  maxCols?: number;
  maxRows?: number;
}) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(table?.outletId ?? outlets[0]?.id ?? "");
  const [name, setName] = useState(table?.name ?? "");
  const [posX, setPosX] = useState(table?.posX ?? defaultPos?.posX ?? 1);
  const [posY, setPosY] = useState(table?.posY ?? defaultPos?.posY ?? 1);
  const [floor, setFloor] = useState(table?.floor ?? defaultPos?.floor ?? 1);
  const [shape, setShape] = useState(table?.shape ?? "SQUARE");
  const [capacity, setCapacity] = useState(table?.capacity ?? 2);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama meja wajib diisi.");
    if (!outletId) return setError("Pilih outlet terlebih dahulu.");
    if (capacity <= 0) return setError("Kapasitas meja harus lebih dari 0.");

    startTransition(async () => {
      const result = table
        ? await updateTableAction(table.id, name.trim(), posX, posY, floor, shape, capacity)
        : await createTableAction(outletId, name.trim(), posX, posY, floor, shape, capacity);

      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(table ? "Meja disimpan" : "Meja ditambahkan");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {table ? "Ubah meja" : "Tambah meja"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!table && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Outlet</label>
              <select
                value={outletId}
                onChange={(event) => setOutletId(event.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Nama meja</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Meja 1"
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Kapasitas (Orang)</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(event) => setCapacity(Number(event.target.value) || 1)}
                placeholder="4"
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Lantai</label>
              <select
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {[1, 2, 3].map((f) => (
                  <option key={f} value={f}>Lantai {f}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Bentuk Meja</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="SQUARE">Kotak (Kecil)</option>
                <option value="ROUND">Bulat (Bundar)</option>
                <option value="RECTANGLE">Panjang (Grup)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Kolom Layout (X)</label>
              <select
                value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {Array.from({ length: maxCols }, (_, i) => i + 1).map((x) => (
                  <option key={x} value={x}>Kolom {x}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Baris Layout (Y)</label>
              <select
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {Array.from({ length: maxRows }, (_, i) => i + 1).map((y) => (
                  <option key={y} value={y}>Baris {y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Menyimpan..." : "Simpan meja"}
        </button>
      </div>
    </div>
  );
}

export function MejaManager({ outlets, tables }: { outlets: OutletOption[]; tables: TableRow[] }) {
  const router = useRouter();
  const { toastMessage, showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TableRow | null>(null);
  const [defaultPos, setDefaultPos] = useState<{ posX: number; posY: number; floor: number } | null>(null);
  const [activeFloor, setActiveFloor] = useState(1);
  const [gridCols, setGridCols] = useState(() => Math.max(6, ...tables.map((t) => t.posX)));
  const [gridRows, setGridRows] = useState(() => Math.max(6, ...tables.map((t) => t.posY)));
  const [movingTable, setMovingTable] = useState<TableRow | null>(null);
  const [actionMenuTable, setActionMenuTable] = useState<TableRow | null>(null);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleActive(table: TableRow) {
    startTransition(async () => {
      const result = await toggleTableActiveAction(table.id, !table.isActive);
      if (result.error) {
        showToast(result.error);
        return;
      }
      showToast(table.isActive ? "Meja dinonaktifkan" : "Meja diaktifkan");
      router.refresh();
    });
  }

  function handleMoveTable(table: TableRow, x: number, y: number) {
    startTransition(async () => {
      const result = await updateTableAction(table.id, table.name, x, y, activeFloor, table.shape, table.capacity);
      if (result.error) {
        showToast(result.error);
      } else {
        showToast(`Meja ${table.name} berhasil dipindahkan ke Lantai ${activeFloor}, Kolom ${x}, Baris ${y}`);
      }
      setMovingTable(null);
      router.refresh();
    });
  }

  const rows = Array.from({ length: gridRows }, (_, i) => i + 1);
  const cols = Array.from({ length: gridCols }, (_, i) => i + 1);

  function getTableAt(x: number, y: number) {
    return tables.find((t) => t.posX === x && t.posY === y && t.floor === activeFloor);
  }

  return (
    <div className="flex flex-col gap-6">
      {movingTable && (
        <div className="flex justify-between items-center p-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl animate-pulse">
          <span>
            Sedang memindahkan <strong>{movingTable.name}</strong> (Lantai {movingTable.floor}). Pilih sel kosong tujuan pada Lantai {activeFloor} di bagian kanan.
          </span>
          <button
            type="button"
            onClick={() => setMovingTable(null)}
            className="font-bold underline cursor-pointer"
          >
            Batal
          </button>
        </div>
      )}

      {/* Connected Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Table List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-[var(--color-text)]">Daftar Meja</h2>
            <button
              onClick={() => {
                setEditing(null);
                setDefaultPos(null);
                setModalOpen(true);
              }}
              disabled={outlets.length === 0}
              className="min-h-[38px] rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-on-primary)] disabled:opacity-40 cursor-pointer"
            >
              + Tambah Meja
            </button>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] max-h-[75vh] overflow-y-auto">
            {tables.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Belum ada meja. Tambahkan meja pertamamu →
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {tables.map((table) => {
                  const isHovered = hoveredTableId === table.id;
                  const isMovingThis = movingTable?.id === table.id;

                  return (
                    <div
                      key={table.id}
                      onMouseEnter={() => setHoveredTableId(table.id)}
                      onMouseLeave={() => setHoveredTableId(null)}
                      className={`flex flex-col gap-3 p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                        isHovered
                          ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20"
                          : isMovingThis
                          ? "bg-amber-500/5 border-amber-500/20"
                          : "bg-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                          {table.name}
                          {!table.isActive && (
                            <span className="ml-2 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-warning-text)]">
                              Nonaktif
                            </span>
                          )}
                          {isMovingThis && (
                            <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                              Memindahkan...
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {table.outletName} · Lantai {table.floor} · {table.shape === "ROUND" ? "Bulat" : table.shape === "RECTANGLE" ? "Panjang" : "Kotak"} ({table.capacity}p) · Pos: {table.posX},{table.posY}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                        <Link
                          href={`/pengaturan/meja/${table.id}`}
                          className="min-h-[32px] rounded-md border border-[var(--color-border)] px-2.5 text-[10px] font-bold text-[var(--color-text)] flex items-center hover:bg-[var(--color-bg)]"
                        >
                          QR
                        </Link>
                        <button
                          onClick={() => {
                            setEditing(table);
                            setDefaultPos(null);
                            setModalOpen(true);
                          }}
                          className="min-h-[32px] rounded-md border border-[var(--color-border)] px-2.5 text-[10px] font-bold text-[var(--color-text)] hover:bg-[var(--color-bg)] cursor-pointer"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => toggleActive(table)}
                          disabled={isPending}
                          className="min-h-[32px] rounded-md border border-[var(--color-border)] px-2.5 text-[10px] font-bold text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 cursor-pointer"
                        >
                          {table.isActive ? "Nonaktif" : "Aktif"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Visual Editor Grid */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <h2 className="text-base font-bold text-[var(--color-text)]">Desain Layout Visual</h2>
          
          <div className="flex justify-between items-center gap-4 flex-wrap border-b border-[var(--color-border)] pb-2">
            {/* Floor selector */}
            <div className="flex gap-1">
              {[1, 2, 3].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFloor(f)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    activeFloor === f
                      ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  Lantai {f}
                </button>
              ))}
            </div>

            {/* Grid Size Controllers */}
            <div className="flex gap-3 items-center flex-wrap text-[10px] bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
              <span className="font-bold text-[var(--color-text-secondary)]">Grid:</span>
              <div className="flex items-center gap-1">
                <span>X:</span>
                <button
                  type="button"
                  disabled={gridCols <= 4}
                  onClick={() => setGridCols((c) => Math.max(4, c - 1))}
                  className="w-5.5 h-5.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold w-4 text-center text-xs">{gridCols}</span>
                <button
                  type="button"
                  disabled={gridCols >= 12}
                  onClick={() => setGridCols((c) => Math.min(12, c + 1))}
                  className="w-5.5 h-5.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span>Y:</span>
                <button
                  type="button"
                  disabled={gridRows <= 4}
                  onClick={() => setGridRows((r) => Math.max(4, r - 1))}
                  className="w-5.5 h-5.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold w-4 text-center text-xs">{gridRows}</span>
                <button
                  type="button"
                  disabled={gridRows >= 12}
                  onClick={() => setGridRows((r) => Math.min(12, r + 1))}
                  className="w-5.5 h-5.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div
            className="grid gap-2 bg-[var(--color-surface)]/20 p-4 rounded-2xl border border-[var(--color-border)] select-none"
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
          >
            {rows.flatMap((y) =>
              cols.map((x) => {
                const table = getTableAt(x, y);

                if (!table) {
                  return (
                    <button
                      key={`empty-${x}-${y}`}
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (movingTable) {
                          handleMoveTable(movingTable, x, y);
                        } else {
                          setDefaultPos({ posX: x, posY: y, floor: activeFloor });
                          setEditing(null);
                          setModalOpen(true);
                        }
                      }}
                      className={`aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center p-1 transition-all text-center text-[var(--color-text-secondary)]/30 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 ${
                        movingTable
                          ? "border-amber-500/60 bg-amber-500/5 cursor-pointer text-amber-500"
                          : "border-[var(--color-border)] cursor-pointer"
                      }`}
                    >
                      <span className="text-base font-medium">+</span>
                      <span className="text-[8px] mt-0.5 opacity-55">{x},{y}</span>
                    </button>
                  );
                }

                const isMovingThis = movingTable?.id === table.id;
                const isHovered = hoveredTableId === table.id;

                let shapeClass = "rounded-xl aspect-square";
                if (table.shape === "ROUND") {
                  shapeClass = "rounded-full aspect-square";
                } else if (table.shape === "RECTANGLE") {
                  shapeClass = "rounded-lg w-[95%] h-[75%] aspect-[1.6/1] self-center";
                }

                return (
                  <div key={table.id} className="aspect-square flex items-center justify-center">
                    <button
                      type="button"
                      disabled={isPending || isMovingThis}
                      onMouseEnter={() => setHoveredTableId(table.id)}
                      onMouseLeave={() => setHoveredTableId(null)}
                      onClick={() => {
                        if (!movingTable) {
                          setActionMenuTable(table);
                        }
                      }}
                      className={`border-2 flex flex-col items-center justify-center p-1.5 transition-all text-center ${shapeClass} ${
                        isMovingThis
                          ? "border-amber-500 bg-amber-500/10 text-amber-500 animate-pulse"
                          : isHovered
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] scale-[1.05] z-10 shadow-lg"
                          : table.isActive
                          ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                      } ${!movingTable ? "cursor-pointer" : "cursor-not-allowed"}`}
                    >
                      <span className="text-[10px] font-bold truncate max-w-full">{table.name}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Action Menu Modal for Table */}
      {actionMenuTable && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
          <div className="max-h-[90vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-xs sm:rounded-2xl text-center">
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">
              Aksi Meja: {actionMenuTable.name}
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMovingTable(actionMenuTable);
                  setActionMenuTable(null);
                }}
                className="min-h-[44px] rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] transition-all cursor-pointer"
              >
                Pindahkan Posisi
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(actionMenuTable);
                  setDefaultPos(null);
                  setModalOpen(true);
                  setActionMenuTable(null);
                }}
                className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-white/50 text-sm font-semibold text-[var(--color-text)] hover:bg-white transition-all cursor-pointer"
              >
                Ubah Detail Nama
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleActive(actionMenuTable);
                  setActionMenuTable(null);
                }}
                className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-white/50 text-sm font-semibold text-[var(--color-text)] hover:bg-white transition-all cursor-pointer"
              >
                {actionMenuTable.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button
                type="button"
                onClick={() => setActionMenuTable(null)}
                className="min-h-[44px] rounded-lg border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] mt-2 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <TableFormModal
          outlets={outlets}
          table={editing}
          defaultPos={defaultPos}
          maxCols={gridCols}
          maxRows={gridRows}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
