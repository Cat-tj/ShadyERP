"use client";

import { useState, useTransition, useRef } from "react";
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
  floorOptions = [1],
}: {
  outlets: OutletOption[];
  table: TableRow | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  defaultPos?: { posX: number; posY: number; floor: number } | null;
  maxCols?: number;
  maxRows?: number;
  floorOptions?: number[];
}) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(table?.outletId ?? outlets[0]?.id ?? "");
  const [name, setName] = useState(table?.name ?? "");
  const [posX, setPosX] = useState(table?.posX ?? defaultPos?.posX ?? 10);
  const [posY, setPosY] = useState(table?.posY ?? defaultPos?.posY ?? 10);
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
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl rounded-t-3xl p-6 sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {table ? "Ubah meja" : "Tambah meja"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
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
                {floorOptions.map((f) => (
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

          <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] p-3 rounded-xl border border-[var(--color-border)]">
            ℹ️ Posisi meja dapat diatur secara presisi dengan menyeret (*drag & drop*) meja langsung pada denah visual di sebelah kanan setelah disimpan.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
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

export function TableVisual({
  name,
  shape,
  capacity,
  isActive,
  isHovered,
  status = "EMPTY",
}: {
  name: string;
  shape: string;
  capacity: number;
  isActive: boolean;
  isHovered: boolean;
  status?: "EMPTY" | "ORDERED" | "EATING" | "READY";
}) {
  const chairs: React.ReactNode[] = [];
  
  if (shape === "RECTANGLE") {
    const topBottomCount = Math.max(1, Math.floor((capacity - 2) / 2));
    for (let i = 0; i < topBottomCount; i++) {
      chairs.push(
        <div key={`top-${i}`} className="absolute -top-2.5 w-5 h-2.5 bg-gray-200 border border-gray-300 dark:bg-zinc-700 dark:border-zinc-600 rounded-t-md" style={{ left: topBottomCount === 1 ? "38px" : topBottomCount === 2 ? `${18 + i * 40}px` : `${12 + i * 26}px` }} />
      );
    }
    for (let i = 0; i < topBottomCount; i++) {
      chairs.push(
        <div key={`bottom-${i}`} className="absolute -bottom-2.5 w-5 h-2.5 bg-gray-200 border border-gray-300 dark:bg-zinc-700 dark:border-zinc-600 rounded-b-md" style={{ left: topBottomCount === 1 ? "38px" : topBottomCount === 2 ? `${18 + i * 40}px` : `${12 + i * 26}px` }} />
      );
    }
    chairs.push(
      <div key="left-0" className="absolute -left-2.5 top-[18px] w-2.5 h-5 bg-gray-200 border border-gray-300 dark:bg-zinc-700 dark:border-zinc-600 rounded-l-md" />
    );
    chairs.push(
      <div key="right-0" className="absolute -right-2.5 top-[18px] w-2.5 h-5 bg-gray-200 border border-gray-300 dark:bg-zinc-700 dark:border-zinc-600 rounded-r-md" />
    );
  } else if (shape === "ROUND") {
    const count = Math.min(8, capacity);
    for (let i = 0; i < count; i++) {
      const angleDeg = (360 / count) * i - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      const radius = 35;
      const x = 32 + radius * Math.cos(angleRad) - 8;
      const y = 32 + radius * Math.sin(angleRad) - 8;
      chairs.push(
        <div
          key={`round-chair-${i}`}
          className="absolute w-4 h-4 bg-gray-200 border border-gray-300 dark:bg-zinc-700 dark:border-zinc-600 rounded-full"
          style={{ left: `${x}px`, top: `${y}px` }}
        />
      );
    }
  } else {
    chairs.push(
      <div key="left" className="absolute -left-2.5 top-[22px] w-2.5 h-5 bg-gray-200 border border-gray-300 dark:bg-zinc-700 dark:border-zinc-600 rounded-l-md" />
    );
    chairs.push(
      <div key="right" className="absolute -right-2.5 top-[22px] w-2.5 h-5 bg-gray-200 border border-gray-300 dark:bg-zinc-700 dark:border-zinc-600 rounded-r-md" />
    );
    if (capacity >= 3) {
      chairs.push(
        <div key="top" className="absolute -top-2.5 left-[22px] w-5 h-2.5 bg-gray-200 border border-gray-300 dark:bg-zinc-700 dark:border-zinc-600 rounded-t-md" />
      );
    }
    if (capacity >= 4) {
      chairs.push(
        <div key="bottom" className="absolute -bottom-2.5 left-[22px] w-5 h-2.5 bg-gray-200 border border-gray-300 dark:bg-zinc-700 dark:border-zinc-600 rounded-b-md" />
      );
    }
  }

  let badgeBg = "bg-blue-500 text-white";
  if (status === "ORDERED") badgeBg = "bg-amber-500 text-white";
  if (status === "EATING") badgeBg = "bg-zinc-400 text-white";
  if (status === "READY") badgeBg = "bg-emerald-500 text-white";

  let shapeClass = "w-16 h-16 rounded-2xl";
  if (shape === "ROUND") shapeClass = "w-16 h-16 rounded-full";
  if (shape === "RECTANGLE") shapeClass = "w-24 h-14 rounded-2xl";

  return (
    <div className={`relative ${shape === "RECTANGLE" ? "w-24 h-14" : "w-16 h-16"}`}>
      {isActive && chairs}
      <div
        className={`flex items-center justify-center bg-white dark:bg-zinc-800 border transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] relative z-10 ${shapeClass} ${
          isHovered
            ? "border-[var(--color-primary)] scale-105"
            : isActive
            ? "border-gray-200 dark:border-zinc-700"
            : "border-gray-300 bg-gray-100 opacity-60"
        }`}
      >
        <div className={`flex flex-col items-center justify-center text-center font-display text-xs font-bold rounded-full w-10 h-10 shadow-sm ${isActive ? badgeBg : "bg-gray-300 text-gray-500"}`}>
          <span>{name}</span>
          <span className="text-[8px] opacity-75 font-normal leading-none mt-0.5">{capacity}p</span>
        </div>
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
  const [floorCount, setFloorCount] = useState(() => Math.max(1, ...tables.map((t) => t.floor)));
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const [draggedPos, setDraggedPos] = useState<{ x: number; y: number } | null>(null);
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

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>, tableId: string) {
    e.currentTarget.releasePointerCapture(e.pointerId); // Allows smooth move tracking on canvas parent
    setDraggedTableId(tableId);
    setDragStart({ x: e.clientX, y: e.clientY });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(92, Math.max(5, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.min(92, Math.max(5, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setDraggedPos({ x, y });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggedTableId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(92, Math.max(5, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.min(92, Math.max(5, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setDraggedPos({ x, y });
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!draggedTableId) return;
    const tableId = draggedTableId;
    const pos = draggedPos;
    const start = dragStart;

    setDraggedTableId(null);
    setDraggedPos(null);
    setDragStart(null);

    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    // Check if it was a quick click rather than a drag
    if (start) {
      const distance = Math.sqrt(Math.pow(e.clientX - start.x, 2) + Math.pow(e.clientY - start.y, 2));
      if (distance < 5) {
        setActionMenuTable(table);
        return;
      }
    }

    if (!pos) return;

    startTransition(async () => {
      const result = await updateTableAction(table.id, table.name, pos.x, pos.y, activeFloor, table.shape, table.capacity);
      if (result.error) {
        showToast(result.error);
      } else {
        showToast(`Posisi Meja ${table.name} berhasil disimpan di ${pos.x}%, ${pos.y}%`);
      }
      router.refresh();
    });
  }

  const floors = Array.from({ length: floorCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6">


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

                  return (
                    <div
                      key={table.id}
                      onMouseEnter={() => setHoveredTableId(table.id)}
                      onMouseLeave={() => setHoveredTableId(null)}
                      className={`flex flex-col gap-3 p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                        isHovered
                          ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20"
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
            <div className="flex flex-wrap gap-1">
              {floors.map((f) => (
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
              <button
                type="button"
                onClick={() => {
                  setFloorCount((count) => {
                    const next = count + 1;
                    setActiveFloor(next);
                    return next;
                  });
                }}
                className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                + Lantai
              </button>
            </div>

            {/* Grid Size Controllers */}
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              💡 Seret (*drag*) meja untuk memposisikannya secara bebas. Klik meja untuk membuka opsi ubah nama atau aktif/nonaktif.
            </p>
          </div>

          <div
            ref={canvasRef}
            className="relative w-full h-[500px] bg-slate-50 dark:bg-zinc-900/40 border border-[var(--color-border)] rounded-3xl overflow-hidden select-none"
            style={{
              backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {tables
              .filter((t) => t.floor === activeFloor)
              .map((table) => {
                const isDragging = draggedTableId === table.id;
                const isHovered = hoveredTableId === table.id;

                const leftPercent = table.posX < 15 ? table.posX * 8 : table.posX;
                const topPercent = table.posY < 15 ? table.posY * 8 : table.posY;

                const x = isDragging && draggedPos ? draggedPos.x : leftPercent;
                const y = isDragging && draggedPos ? draggedPos.y : topPercent;

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={isPending}
                    onPointerDown={(e) => handlePointerDown(e, table.id)}
                    onMouseEnter={() => setHoveredTableId(table.id)}
                    onMouseLeave={() => setHoveredTableId(null)}
                    style={{
                      position: "absolute",
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isDragging ? 50 : isHovered ? 30 : 10,
                      touchAction: "none",
                    }}
                    className="cursor-grab active:cursor-grabbing outline-none"
                  >
                    <TableVisual
                      name={table.name}
                      shape={table.shape}
                      capacity={table.capacity}
                      isActive={table.isActive}
                      isHovered={isHovered || isDragging}
                    />
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Action Menu Modal for Table */}
      {actionMenuTable && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="max-h-[90vh] w-full overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl rounded-t-3xl p-6 sm:max-w-xs sm:rounded-3xl text-center animate-[fadeInUp_0.15s_ease-out_forwards]">
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">
              Aksi Meja: {actionMenuTable.name}
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(actionMenuTable);
                  setDefaultPos(null);
                  setModalOpen(true);
                  setActionMenuTable(null);
                }}
                className="min-h-[44px] rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-on-primary)] transition-all cursor-pointer hover:opacity-90"
              >
                Ubah Detail / Bentuk
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleActive(actionMenuTable);
                  setActionMenuTable(null);
                }}
                className="min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all cursor-pointer"
              >
                {actionMenuTable.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button
                type="button"
                onClick={() => setActionMenuTable(null)}
                className="min-h-[44px] rounded-xl border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] mt-2 cursor-pointer hover:bg-[var(--color-bg)] transition-colors"
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
          floorOptions={floors}
          onClose={() => setModalOpen(false)}
          onSaved={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
