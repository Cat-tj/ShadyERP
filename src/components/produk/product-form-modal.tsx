"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createProductAction,
  updateProductAction,
  updateStockAction,
  updateReorderPointAction,
  setProductModifierExclusionsAction,
  getReorderSuggestionAction,
  getSuggestedPriceAction,
} from "@/app/(app)/produk/actions";
import { BarcodeScannerModal } from "@/components/shared/barcode-scanner-modal";
import type { CategoryOption } from "@/components/produk/kategori-manager";
import { VariantGroupsEditor, type VariantGroupRow } from "@/components/produk/variant-groups-editor";
import { RecipeEditor, type RecipeItemRow, type IngredientOption } from "@/components/produk/recipe-editor";
import { WholesaleTierEditor, type WholesaleTierRow } from "@/components/produk/wholesale-tier-editor";
import { computeSuggestedPrice } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format";
import { CameraIcon, XIcon } from "@/components/ui/icons";

export type { VariantGroupRow, RecipeItemRow, IngredientOption, WholesaleTierRow };

export type OutletOption = { id: string; name: string };
type ProductKindOption = "GOODS" | "SERVICE" | "ASSEMBLY" | "NON_INVENTORY" | "COST";
const STOCKABLE_KINDS = new Set<ProductKindOption>(["GOODS", "ASSEMBLY"]);

export type EditingProduct = {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string | null;
  price: number;
  cost: number | null;
  kind: ProductKindOption;
  trackStock: boolean;
  trackExpiry: boolean;
  trackSerial: boolean;
  shelfLifeDays: number | null;
  warrantyDays: number | null;
  serviceDurationMin: number | null;
  stockByOutlet: Record<string, number>;
  reorderPointByOutlet: Record<string, number>;
  variantGroups: VariantGroupRow[];
  excludedModifierGroupIds: string[];
  recipeItems: RecipeItemRow[];
  wholesaleTiers: WholesaleTierRow[];
};

export function ProductFormModal({
  categories,
  outlets,
  product,
  ingredientOptions,
  initialSku,
  onClose,
  onSaved,
}: {
  categories: CategoryOption[];
  outlets: OutletOption[];
  product: EditingProduct | null;
  /** Semua produk lain di tenant (buat dipilih jadi bahan/komponen resep). */
  ingredientOptions: IngredientOption[];
  /** Prefill SKU pas buka form "Tambah produk" dari hasil scan barcode yang belum kenal. */
  initialSku?: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? initialSku ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [cost, setCost] = useState(product?.cost ? String(product.cost) : "");
  const [kind, setKind] = useState<ProductKindOption>(product?.kind ?? "GOODS");
  const [trackStock, setTrackStock] = useState(product?.trackStock ?? true);
  const [trackExpiry, setTrackExpiry] = useState(product?.trackExpiry ?? false);
  const [trackSerial, setTrackSerial] = useState(product?.trackSerial ?? false);
  const [shelfLifeDays, setShelfLifeDays] = useState(product?.shelfLifeDays ? String(product.shelfLifeDays) : "");
  const [warrantyDays, setWarrantyDays] = useState(product?.warrantyDays ? String(product.warrantyDays) : "");
  const [serviceDurationMin, setServiceDurationMin] = useState(
    product?.serviceDurationMin ? String(product.serviceDurationMin) : "45"
  );
  const [stockByOutlet, setStockByOutlet] = useState<Record<string, string>>(
    Object.fromEntries(outlets.map((outlet) => [outlet.id, String(product?.stockByOutlet[outlet.id] ?? 0)]))
  );
  const [reorderPointByOutlet, setReorderPointByOutlet] = useState<Record<string, string>>(
    Object.fromEntries(outlets.map((outlet) => [outlet.id, String(product?.reorderPointByOutlet[outlet.id] ?? 5)]))
  );
  const [excludedModifierGroupIds, setExcludedModifierGroupIds] = useState<string[]>(
    product?.excludedModifierGroupIds ?? []
  );
  const [stockNote, setStockNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reorderSuggestionByOutlet, setReorderSuggestionByOutlet] = useState<
    Record<string, { avgDailyQty: number; suggestedMinQty: number | null } | undefined>
  >({});
  const [loadingSuggestionOutletId, setLoadingSuggestionOutletId] = useState<string | null>(null);
  const [, startSuggestionTransition] = useTransition();

  function fetchReorderSuggestion(outletId: string) {
    if (!product) return;
    setLoadingSuggestionOutletId(outletId);
    startSuggestionTransition(async () => {
      const result = await getReorderSuggestionAction(product.id, outletId);
      setLoadingSuggestionOutletId(null);
      if (result.error) {
        setInfo(result.error);
        return;
      }
      setReorderSuggestionByOutlet((prev) => ({ ...prev, [outletId]: result }));
    });
  }

  function applyReorderSuggestion(outletId: string) {
    const suggestion = reorderSuggestionByOutlet[outletId];
    if (!suggestion?.suggestedMinQty) return;
    setReorderPointByOutlet((prev) => ({ ...prev, [outletId]: String(suggestion.suggestedMinQty) }));
  }

  const [targetMargin, setTargetMargin] = useState("30");
  const [priceSuggestion, setPriceSuggestion] = useState<{ hpp: number; suggestedPrice: number | null } | null>(null);
  const [loadingPriceSuggestion, setLoadingPriceSuggestion] = useState(false);

  function fetchPriceSuggestion() {
    const marginNumber = Number(targetMargin);
    if (!Number.isFinite(marginNumber) || marginNumber <= 0 || marginNumber >= 100) {
      setInfo("Target margin harus antara 1-99%.");
      return;
    }
    if (product) {
      setLoadingPriceSuggestion(true);
      startSuggestionTransition(async () => {
        const result = await getSuggestedPriceAction(product.id, marginNumber);
        setLoadingPriceSuggestion(false);
        if (result.error) {
          setInfo(result.error);
          return;
        }
        setPriceSuggestion(result);
      });
    } else {
      // Produk baru: belum bisa dapat HPP dari resep (resep cuma bisa diisi setelah
      // produk tersimpan), jadi pakai field Modal yang lagi diisi di form ini.
      const hpp = Number(cost) || 0;
      setPriceSuggestion({ hpp, suggestedPrice: computeSuggestedPrice(hpp, marginNumber) });
    }
  }

  function applyPriceSuggestion() {
    if (!priceSuggestion?.suggestedPrice) return;
    setPrice(String(priceSuggestion.suggestedPrice));
  }

  const categoryModifierGroups = categories.find((c) => c.id === categoryId)?.modifierGroups ?? [];

  function toggleModifierExclusion(modifierGroupId: string) {
    setExcludedModifierGroupIds((prev) =>
      prev.includes(modifierGroupId) ? prev.filter((id) => id !== modifierGroupId) : [...prev, modifierGroupId]
    );
  }

  function generateInternalSku() {
    const prefix = kind === "SERVICE" ? "ALT-SVC" : "ALT-PRD";
    setSku(`${prefix}-${Date.now().toString().slice(-10)}`);
  }

  function handleSubmit() {
    setError(null);
    const priceNumber = Number(price);
    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("Harga tidak valid.");
      return;
    }

    startTransition(async () => {
      const input = {
        name: name.trim(),
        sku: sku.trim() || null,
        categoryId: categoryId || null,
        price: priceNumber,
        cost: cost ? Number(cost) : null,
        kind,
        trackStock: STOCKABLE_KINDS.has(kind) ? trackStock : false,
        trackExpiry: STOCKABLE_KINDS.has(kind) && trackStock ? trackExpiry : false,
        trackSerial: STOCKABLE_KINDS.has(kind) && trackStock ? trackSerial : false,
        shelfLifeDays: shelfLifeDays ? Number(shelfLifeDays) : null,
        warrantyDays: warrantyDays ? Number(warrantyDays) : null,
        serviceDurationMin: kind === "SERVICE" ? Number(serviceDurationMin) || null : null,
      };

      const result = product
        ? await updateProductAction(product.id, input)
        : await createProductAction(input);

      if (result.error) {
        setError(result.error);
        return;
      }

      const productId = product?.id ?? ("id" in result ? result.id : undefined);

      if (input.trackStock && typeof productId === "string") {
        for (const outlet of outlets) {
          const qty = Number(stockByOutlet[outlet.id] ?? 0);
          if (Number.isFinite(qty) && qty >= 0) {
            await updateStockAction(productId, outlet.id, qty, stockNote.trim() || undefined);
          }
          const minQty = Number(reorderPointByOutlet[outlet.id] ?? 5);
          if (Number.isFinite(minQty) && minQty >= 0) {
            await updateReorderPointAction(productId, outlet.id, minQty);
          }
        }
      }

      if (typeof productId === "string" && categoryModifierGroups.length > 0) {
        await setProductModifierExclusionsAction(productId, excludedModifierGroupIds);
      }

      onSaved(product ? "Produk disimpan" : "Produk ditambahkan");
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[90vh] w-full modal-scrollbar bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-modal)] rounded-t-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-b border-[var(--color-border)]/50">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {product ? "Ubah Produk" : "Tambah Produk Baru"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-5">
          {/* Dasar Produk */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Dasar Produk</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Nama Produk</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Masukkan nama produk"
                className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Kategori Produk</label>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-[var(--color-text)]">SKU / Barcode</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setScannerOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
                    >
                      <CameraIcon aria-hidden className="h-3.5 w-3.5" />
                      Scan
                    </button>
                    <button
                      type="button"
                      onClick={generateInternalSku}
                      className="text-xs font-bold text-[var(--color-primary)] hover:underline"
                    >
                      Buat SKU
                    </button>
                  </div>
                </div>
                <input
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder="8991234567890"
                  className="min-h-[48px] min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
          </div>

          {/* Tipe Produk */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Tipe Produk</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { value: "GOODS", label: "Barang", desc: "Retail, F&B, Listrik", icon: "📦" },
                { value: "SERVICE", label: "Jasa", desc: "Layanan & Perbaikan", icon: "🛠️" },
                { value: "ASSEMBLY", label: "Rakitan", desc: "Bundling Produk", icon: "📦⚙️" },
                { value: "NON_INVENTORY", label: "Non-Stok", desc: "Biaya Jual s/d HPP", icon: "🚫" },
                { value: "COST", label: "Biaya Internal", desc: "Biaya HPP & Inventarisir", icon: "📊" },
              ].map((option) => {
                const isSelected = kind === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const nextKind = option.value as ProductKindOption;
                      setKind(nextKind);
                      if (!STOCKABLE_KINDS.has(nextKind)) {
                        setTrackStock(false);
                        setTrackExpiry(false);
                      } else {
                        setTrackStock(true);
                      }
                    }}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-bold shadow-sm"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{option.icon}</span>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[var(--color-text)]">{option.label}</span>
                      <span className="block text-[10px] text-[var(--color-text-secondary)] mt-0.5 leading-none">{option.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Harga */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Harga</h3>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Harga Jual</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm text-[var(--color-text-secondary)] font-medium">Rp</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="0"
                    className="min-h-[48px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Modal (opsional)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm text-[var(--color-text-secondary)] font-medium">Rp</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={cost}
                    onChange={(event) => setCost(event.target.value)}
                    placeholder="0"
                    className="min-h-[48px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-4 text-base tabular-nums outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[var(--color-bg)] p-3">
              <span className="text-xs text-[var(--color-text-secondary)]">Target margin</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                value={targetMargin}
                onChange={(event) => setTargetMargin(event.target.value)}
                className="h-9 w-16 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-center text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
              />
              <span className="text-xs text-[var(--color-text-secondary)]">%</span>
              <button
                type="button"
                onClick={fetchPriceSuggestion}
                disabled={loadingPriceSuggestion}
                className="h-9 shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-text)] disabled:opacity-40"
              >
                {loadingPriceSuggestion ? "Menghitung..." : "Saran harga dari HPP"}
              </button>
              {priceSuggestion && (
                <span className="ml-auto text-xs text-[var(--color-text-secondary)]">
                  {priceSuggestion.hpp <= 0 ? (
                    "HPP belum ada."
                  ) : priceSuggestion.suggestedPrice ? (
                    <>
                      HPP {formatRupiah(priceSuggestion.hpp)} &rarr;{" "}
                      <span className="font-semibold text-[var(--color-text)]">
                        {formatRupiah(priceSuggestion.suggestedPrice)}
                      </span>{" "}
                      <button type="button" onClick={applyPriceSuggestion} className="font-semibold text-[var(--color-primary)]">
                        Pakai
                      </button>
                    </>
                  ) : (
                    "Margin tidak valid."
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Pengaturan Lanjutan */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Pengaturan Lanjutan</h3>

            {STOCKABLE_KINDS.has(kind) ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-3">
                <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-text)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={trackStock}
                    onChange={(event) => {
                      setTrackStock(event.target.checked);
                      if (!event.target.checked) {
                        setTrackExpiry(false);
                        setTrackSerial(false);
                      }
                    }}
                    className="h-5 w-5 rounded border-[var(--color-border)] accent-[var(--color-primary)] shrink-0"
                  />
                  Aktifkan pencatatan stok
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-text)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={trackExpiry}
                    disabled={!trackStock}
                    onChange={(event) => setTrackExpiry(event.target.checked)}
                    className="h-5 w-5 rounded border-[var(--color-border)] accent-[var(--color-primary)] shrink-0 disabled:opacity-40"
                  />
                  Lacak masa expired atau batch
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-text)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={trackSerial}
                    disabled={!trackStock}
                    onChange={(event) => setTrackSerial(event.target.checked)}
                    className="h-5 w-5 rounded border-[var(--color-border)] accent-[var(--color-primary)] shrink-0 disabled:opacity-40"
                  />
                  Lacak nomor seri/IMEI per unit (HP, elektronik, dll)
                </label>

                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      Masa Simpan (Hari)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={shelfLifeDays}
                      onChange={(event) => setShelfLifeDays(event.target.value)}
                      placeholder="30"
                      className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      Garansi (Hari)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={warrantyDays}
                      onChange={(event) => setWarrantyDays(event.target.value)}
                      placeholder="365"
                      className="min-h-[42px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>
                <p className="text-[10px] leading-relaxed text-[var(--color-text-secondary)] mt-1">
                  Tip: Atur expired untuk produk FMCG/Makanan. Garansi cocok untuk elektronik.
                </p>
              </div>
            ) : kind === "SERVICE" ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-3">
                <label className="text-sm font-medium text-[var(--color-text)]">Durasi layanan</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={serviceDurationMin}
                    onChange={(event) => setServiceDurationMin(event.target.value)}
                    className="min-h-[42px] w-28 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">menit</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  Dipakai untuk barbershop/salon supaya layanan punya durasi standar.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <p className="text-xs font-bold text-[var(--color-text)]">
                  {kind === "COST" ? "Biaya Internal" : "Item Tanpa Stok"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {kind === "COST"
                    ? "Dipakai untuk biaya rakitan, tenaga kerja, atau pencatatan HPP. Item biaya tidak tampil di POS."
                    : "Cocok untuk ongkir, biaya layanan, atau item yang dijual tanpa mengurangi stok."}
                </p>
              </div>
            )}

            {categoryModifierGroups.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <p className="text-sm font-medium text-[var(--color-text)]">Modifier dari kategori</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Modifier ini otomatis aktif untuk semua produk di kategori ini. Uncek kalau produk ini tidak
                  perlu modifier tertentu.
                </p>
                <div className="mt-1 flex flex-col gap-2">
                  {categoryModifierGroups.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center gap-3 text-sm font-medium text-[var(--color-text)] cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={!excludedModifierGroupIds.includes(group.id)}
                        onChange={() => toggleModifierExclusion(group.id)}
                        className="h-5 w-5 rounded border-[var(--color-border)] accent-[var(--color-primary)] shrink-0"
                      />
                      {group.name}
                    </label>
                  ))}
                </div>
                <Link
                  href="/pengaturan/modifier"
                  className="mt-1 text-xs font-semibold text-[var(--color-primary)]"
                >
                  Kelola grup modifier →
                </Link>
              </div>
            )}

            {STOCKABLE_KINDS.has(kind) && trackStock && product && (
              <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-text)] mb-1">
                  <span>Outlet</span>
                  <div className="flex gap-8">
                    <span className="w-20 text-center">Stok</span>
                    <span className="w-20 text-center">Batas Min</span>
                  </div>
                </div>
                {outlets.map((outlet) => {
                  const suggestion = reorderSuggestionByOutlet[outlet.id];
                  return (
                    <div key={outlet.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-[var(--color-text-secondary)] truncate max-w-[140px]">{outlet.name}</span>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={stockByOutlet[outlet.id] ?? "0"}
                            onChange={(event) =>
                              setStockByOutlet((prev) => ({ ...prev, [outlet.id]: event.target.value }))
                            }
                            placeholder="Stok"
                            className="h-9 w-20 rounded-md border border-[var(--color-border)] px-2 text-center text-xs tabular-nums outline-none focus:border-[var(--color-primary)] bg-[var(--color-bg)]"
                          />
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={reorderPointByOutlet[outlet.id] ?? "5"}
                            onChange={(event) =>
                              setReorderPointByOutlet((prev) => ({ ...prev, [outlet.id]: event.target.value }))
                            }
                            placeholder="Min"
                            className="h-9 w-20 rounded-md border border-[var(--color-border)] px-2 text-center text-xs tabular-nums outline-none focus:border-[var(--color-primary)] bg-[var(--color-bg)]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 text-[11px]">
                        {suggestion ? (
                          suggestion.suggestedMinQty ? (
                            <>
                              <span className="text-[var(--color-text-secondary)]">
                                Saran: {suggestion.suggestedMinQty} (rata-rata {suggestion.avgDailyQty}/hari)
                              </span>
                              <button
                                type="button"
                                onClick={() => applyReorderSuggestion(outlet.id)}
                                className="font-semibold text-[var(--color-primary)]"
                              >
                                Pakai saran
                              </button>
                            </>
                          ) : (
                            <span className="text-[var(--color-text-secondary)]">
                              Belum ada histori penjualan 30 hari terakhir.
                            </span>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => fetchReorderSuggestion(outlet.id)}
                            disabled={loadingSuggestionOutletId === outlet.id}
                            className="font-semibold text-[var(--color-primary)] disabled:opacity-40"
                          >
                            {loadingSuggestionOutletId === outlet.id ? "Menghitung..." : "Hitung saran batas min"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <input
                  value={stockNote}
                  onChange={(event) => setStockNote(event.target.value)}
                  placeholder="Catatan perubahan stok (opsional), mis. restock supplier"
                  className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <Link
                  href="/produk/riwayat-stok"
                  className="text-xs font-medium text-[var(--color-primary)]"
                >
                  Lihat riwayat perubahan stok →
                </Link>
              </div>
            )}
            {STOCKABLE_KINDS.has(kind) && trackStock && !product && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Simpan produk dulu, lalu atur stok awal lewat tombol &quot;Ubah&quot; pada produk ini.
              </p>
            )}

            {product ? (
              <VariantGroupsEditor productId={product.id} groups={product.variantGroups} onNotify={setInfo} />
            ) : (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Simpan produk dulu untuk menambahkan varian & topping (mis. Ukuran, Level Gula, Topping).
              </p>
            )}

            {product ? (
              <RecipeEditor
                productId={product.id}
                items={product.recipeItems}
                ingredientOptions={ingredientOptions.filter((option) => option.id !== product.id)}
                onNotify={setInfo}
              />
            ) : (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Simpan produk dulu untuk menambahkan resep/komponen (buat menu racikan atau paket/kombo).
              </p>
            )}

            {product ? (
              <WholesaleTierEditor productId={product.id} tiers={product.wholesaleTiers} onNotify={setInfo} />
            ) : (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Simpan produk dulu untuk menambahkan harga grosir bertingkat.
              </p>
            )}
          </div>
        </div>

        {info && (
          <div className="mt-3 rounded-lg bg-[var(--color-bg)] px-4 py-2 text-xs text-[var(--color-text-secondary)]">
            {info}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 flex gap-3 bg-[var(--color-surface)]/80 backdrop-blur-md px-6 py-4 border-t border-[var(--color-border)]/50">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[48px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] text-base font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex min-h-[48px] flex-[2] items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          ) : (
            <span className="text-lg">✓</span>
          )}
          {isPending ? "Menyimpan..." : "Simpan Produk"}
        </button>
      </div>
      </div>
      {scannerOpen && (
        <BarcodeScannerModal
          title="Scan SKU / barcode"
          description="Kode yang terbaca akan disimpan sebagai SKU produk ini."
          onDetected={(value) => setSku(value)}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}
