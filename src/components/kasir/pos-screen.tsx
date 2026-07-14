"use client";

import { useMemo, useState, useEffect, useRef, type KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatRupiah } from "@/lib/format";
import { computeBestPromoDiscount, type PromoForCalc } from "@/lib/promo";
import { PaymentSheet, type StampProgramSettings } from "@/components/kasir/payment-sheet";
import { OfflineSyncBanner } from "@/components/kasir/offline-sync-banner";
import { CashOutModal } from "@/components/kasir/cash-out-modal";
import { VariantPickerModal, type VariantGroupOption } from "@/components/kasir/variant-picker-modal";
import { BarcodeScannerModal } from "@/components/shared/barcode-scanner-modal";
import { CameraIcon, XIcon } from "@/components/ui/icons";
import { useToast, Toast } from "@/components/toast";
import { getAvailableSerialsAction, getMemberFavoriteProductsAction, type MemberFavoriteProduct } from "@/app/(app)/kasir/actions";
import { MemberPicker, type MemberOption } from "@/components/kasir/member-picker";
import type { OrderType } from "@prisma/client";

export type PosProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  sku: string | null;
  price: number;
  categoryId: string | null;
  categoryName: string | null;
  trackStock: boolean;
  trackSerial: boolean;
  stockQty: number;
  variantGroups: VariantGroupOption[];
  /** true kalau produk racikan tapi salah satu bahan resepnya (langsung/turunan) habis di outlet ini. */
  recipeUnavailable?: boolean;
};

export type PosCategory = { id: string; name: string };
export type PosPromo = PromoForCalc;

export type CartLine = {
  cartKey: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  discountAmount: number;
  trackStock: boolean;
  stockQty: number;
  variantOptionIds: string[];
  variantLabel: string | null;
  /** Serial/IMEI unit yang dipilih — kalau ada, baris ini selalu qty 1 dan tidak bisa ditambah. */
  serialNumber: string | null;
  /** true kalau baris ini ditambahkan lewat chip "menu favorit member" (D6). */
  fromFavorite: boolean;
  /** Harga khusus untuk transaksi ini saja; harga master produk tidak ikut berubah. */
  priceOverride: number | null;
};

export function PosScreen({
  outletName,
  products,
  categories,
  taxPercent,
  staticQrisPayload,
  promos,
  stampProgram,
  channelMarkupByOrderType,
}: {
  outletName: string;
  products: PosProduct[];
  categories: PosCategory[];
  taxPercent: number;
  staticQrisPayload: string | null;
  promos: PosPromo[];
  stampProgram: StampProgramSettings;
  channelMarkupByOrderType: Partial<Record<OrderType, number>>;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCashOut, setShowCashOut] = useState(false);
  const [showShiftMenu, setShowShiftMenu] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannerAlwaysOn, setScannerAlwaysOn] = useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  const [variantPickerProduct, setVariantPickerProduct] = useState<PosProduct | null>(null);
  const [serialPickerProduct, setSerialPickerProduct] = useState<PosProduct | null>(null);
  const [posMember, setPosMember] = useState<MemberOption | null>(null);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<MemberFavoriteProduct[]>([]);
  /** productId favorit yang sedang menunggu pilih varian/serial — dipakai buat menandai baris keranjangnya sebagai favorit setelah dikonfirmasi. */
  const [pendingFavoriteProductId, setPendingFavoriteProductId] = useState<string | null>(null);
  const { toastMessage, showToast } = useToast();

  useEffect(() => {
    if (!posMember) {
      return;
    }
    let cancelled = false;
    getMemberFavoriteProductsAction(posMember.id).then((favorites) => {
      if (!cancelled) setFavoriteProducts(favorites);
    });
    return () => {
      cancelled = true;
    };
  }, [posMember]);
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const searchInput = document.getElementById("pos-search-input") as HTMLInputElement | null;
      if (e.key === "F2") {
        e.preventDefault();
        searchInput?.focus();
        return;
      }
      if (e.key === "Escape") {
        if (document.activeElement === searchInput) {
          setSearch("");
          searchInput?.blur();
          return;
        }
        setShowShiftMenu(false);
      }
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1) {
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory = activeCategory === "ALL" || product.categoryId === activeCategory;
      const matchSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.sku?.toLowerCase().includes(query) ?? false);
      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, search]);

  const productCategoryMap = useMemo(() => new Map(products.map((p) => [p.id, p.categoryId])), [products]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const key = product.categoryId ?? "UNCATEGORIZED";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.qty - line.discountAmount, 0);
  const appliedPromo = useMemo(() => {
    const promoCartLines = cart.map((line) => ({
      productId: line.productId,
      categoryId: productCategoryMap.get(line.productId) ?? null,
      lineTotal: line.price * line.qty - line.discountAmount,
    }));
    return computeBestPromoDiscount(promos, promoCartLines, subtotal);
  }, [cart, productCategoryMap, promos, subtotal]);
  const promoDiscount = appliedPromo?.discountAmount ?? 0;
  const afterDiscount = Math.max(0, subtotal - cartDiscount - promoDiscount);
  const taxAmount = Math.round((afterDiscount * taxPercent) / 100);
  const total = afterDiscount + taxAmount;
  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);

  function addLineToCart(
    product: PosProduct,
    variantOptionIds: string[],
    priceDelta: number,
    variantLabel: string | null,
    initialQty: number = 1,
    fromFavorite: boolean = false
  ) {
    setLastAddedProductId(product.id);
    const cartKey = `${product.id}::${[...variantOptionIds].sort().join(",")}`;
    setCart((prev) => {
      const existing = prev.find((line) => line.cartKey === cartKey);
      const targetQty = existing ? existing.qty + initialQty : initialQty;
      const clampedQty = product.trackStock ? Math.min(targetQty, product.stockQty) : targetQty;
      if (existing) {
        return prev.map((line) =>
          line.cartKey === cartKey
            ? { ...line, qty: clampedQty, fromFavorite: line.fromFavorite || fromFavorite }
            : line
        );
      }
      return [
        ...prev,
        {
          cartKey,
          productId: product.id,
          name: product.name,
          price: product.price + priceDelta,
          qty: clampedQty,
          discountAmount: 0,
          trackStock: product.trackStock,
          stockQty: product.stockQty,
          variantOptionIds,
          variantLabel,
          serialNumber: null,
          fromFavorite,
          priceOverride: null,
        },
      ];
    });
  }

  /** Satu baris keranjang = satu unit fisik dengan serial/IMEI tertentu, tidak bisa digabung/qty>1. */
  function addSerialLineToCart(product: PosProduct, serialNumber: string, fromFavorite: boolean = false) {
    setLastAddedProductId(product.id);
    const cartKey = `${product.id}::serial::${serialNumber}`;
    setCart((prev) => {
      if (prev.some((line) => line.cartKey === cartKey)) return prev;
      return [
        ...prev,
        {
          cartKey,
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          discountAmount: 0,
          trackStock: product.trackStock,
          stockQty: product.stockQty,
          variantOptionIds: [],
          variantLabel: null,
          serialNumber,
          fromFavorite,
          priceOverride: null,
        },
      ];
    });
  }

  function addToCart(product: PosProduct, fromFavorite: boolean = false) {
    if (product.trackSerial) {
      setSerialPickerProduct(product);
      setPendingFavoriteProductId(fromFavorite ? product.id : null);
      return;
    }
    if (product.variantGroups.length > 0) {
      setVariantPickerProduct(product);
      setPendingFavoriteProductId(fromFavorite ? product.id : null);
      return;
    }
    addLineToCart(product, [], 0, null, 1, fromFavorite);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    const query = search.trim();
    if (!query) return;
    const exact = findProductByBarcode(query);
    if (!exact) {
      showToast(`Barcode "${search.trim()}" tidak ditemukan`);
      return;
    }
    event.preventDefault();
    addToCart(exact);
    setSearch("");
  }

  function findProductByBarcode(value: string) {
    const query = value.trim().toLowerCase();
    return products.find((product) => product.sku?.trim().toLowerCase() === query) ?? null;
  }

  function handleBarcodeDetected(value: string) {
    const product = findProductByBarcode(value);
    if (product) {
      addToCart(product);
      setSearch("");
      return;
    }
    setSearch(value);
    const searchInput = document.getElementById("pos-search-input") as HTMLInputElement | null;
    searchInput?.focus();
  }

  function decrementProduct(productId: string) {
    const line = [...cart].reverse().find((item) => item.productId === productId);
    if (!line) return;
    updateQty(line.cartKey, line.qty - 1);
  }

  function updateQty(cartKey: string, qty: number) {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((line) => line.cartKey !== cartKey);
      return prev.map((line) => {
        if (line.cartKey !== cartKey) return line;
        if (line.serialNumber) return line; // unit serial selalu qty 1, hapus & pilih ulang kalau mau ganti
        const clamped = line.trackStock ? Math.min(qty, line.stockQty) : qty;
        return { ...line, qty: clamped };
      });
    });
  }

  function updateLineDiscount(cartKey: string, discountAmount: number) {
    setCart((prev) =>
      prev.map((line) =>
        line.cartKey === cartKey ? { ...line, discountAmount: Math.max(0, discountAmount) } : line
      )
    );
  }

  function updateLinePrice(cartKey: string, price: number) {
    setCart((prev) =>
      prev.map((line) =>
        line.cartKey === cartKey
          ? { ...line, price: Math.max(0, price), priceOverride: Math.max(0, price) }
          : line
      )
    );
  }

  function removeLine(cartKey: string) {
    setCart((prev) => prev.filter((line) => line.cartKey !== cartKey));
  }

  function resetCart() {
    setCart([]);
    setCartDiscount(0);
  }

  const saleItems = cart.map((line) => ({
    productId: line.productId,
    qty: line.qty,
    discountAmount: line.discountAmount,
    unitPriceOverride: line.priceOverride ?? undefined,
    variantLabel: line.variantLabel,
    variantOptionIds: line.variantOptionIds,
    serialNumber: line.serialNumber ?? undefined,
    isFavoritePick: line.fromFavorite,
  }));

  const cartPanel = (
    <CartPanel
      cart={cart}
      cartDiscount={cartDiscount}
      onCartDiscountChange={setCartDiscount}
      subtotal={subtotal}
      appliedPromo={appliedPromo}
      taxAmount={taxAmount}
      total={total}
      taxPercent={taxPercent}
      onUpdateQty={updateQty}
      onUpdateLinePrice={updateLinePrice}
      onUpdateLineDiscount={updateLineDiscount}
      onRemoveLine={removeLine}
      onCheckout={() => setShowPayment(true)}
    />
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden lg:h-[calc(100dvh-var(--topbar-height)-24px)] lg:pb-3">
      <OfflineSyncBanner />

      <header className="mb-3 flex shrink-0 items-center justify-between gap-3 lg:h-12">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold leading-tight text-[var(--color-text)]">Kasir</h1>
          <p className="truncate text-xs text-[var(--color-text-secondary)]">{outletName} <span className="hidden sm:inline">· Shift aktif</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/kasir/riwayat"
            className="hidden min-h-10 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)] sm:flex"
          >
            Transaksi
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowShiftMenu((visible) => !visible)}
              aria-expanded={showShiftMenu}
              className="flex min-h-10 items-center gap-1.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Shift <span aria-hidden className="text-[10px]">▾</span>
            </button>
            {showShiftMenu && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-[0_12px_28px_rgba(8,33,69,0.12)]">
                <button type="button" onClick={() => { setShowCashOut(true); setShowShiftMenu(false); }} className="flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]">
                  Gesek tunai
                </button>
                <Link href="/kasir/tutup" onClick={() => setShowShiftMenu(false)} className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-surface)]">
                  Tutup shift
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 overflow-y-auto pb-24 lg:pb-0">
          <div className="sticky top-0 z-10 -mx-4 mb-3 bg-[var(--color-bg)]/95 px-4 pb-2 pt-0 backdrop-blur sm:mx-0 sm:px-0">
            <div className="relative">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-secondary)]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              id="pos-search-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Cari nama produk, SKU, atau scan barcode"
              className="h-12 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-14 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <button
              type="button"
              onClick={() => {
                setScannerAlwaysOn(false);
                setShowBarcodeScanner(true);
              }}
              aria-label="Scan barcode produk dengan kamera"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
            >
              <CameraIcon aria-hidden className="h-5 w-5" />
            </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={scannerAlwaysOn}
                onClick={() => { setShowBarcodeScanner(false); setScannerAlwaysOn((current) => !current); }}
                className={`inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold ${scannerAlwaysOn ? "text-[var(--color-success)]" : "text-[var(--color-text-secondary)]"}`}
              >
                <span aria-hidden className={`h-2 w-2 rounded-full ${scannerAlwaysOn ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"}`} />
                Scanner {scannerAlwaysOn ? "aktif" : "siap"}
              </button>
              <span className="hidden text-xs text-[var(--color-text-muted)] lg:inline">F2 cari · Esc bersihkan</span>
            </div>
          </div>

          <div className="mb-2 shrink-0">
            {posMember ? (
              <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                <span className="text-sm font-medium text-[var(--color-text)]">Pelanggan: {posMember.name}</span>
                <button
                  type="button"
                  onClick={() => setPosMember(null)}
                  className="text-xs font-semibold text-[var(--color-primary)]"
                >
                  Ganti
                </button>
              </div>
            ) : showMemberPicker ? (
              <MemberPicker
                value={posMember}
                onChange={(selected) => {
                  setPosMember(selected);
                  setShowMemberPicker(false);
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowMemberPicker(true)}
                className="text-xs font-semibold text-[var(--color-primary)]"
              >
                + Tambahkan pelanggan
              </button>
            )}

            {posMember && favoriteProducts.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {favoriteProducts.map((favorite) => {
                  const product = products.find((p) => p.id === favorite.id);
                  if (!product) return null;
                  return (
                    <button
                      key={favorite.id}
                      type="button"
                      onClick={() => addToCart(product, true)}
                      className="flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 px-3 text-xs font-semibold text-[var(--color-primary)] active:scale-[0.98]"
                    >
                      ⭐ {favorite.name} · {formatRupiah(favorite.price)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors active:scale-[0.98] ${
                activeCategory === "ALL"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm font-semibold"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-white/70"
              }`}
            >
              Semua
              <span className={`text-xs ${activeCategory === "ALL" ? "text-white/80" : "text-[var(--color-text-secondary)]"}`}>
                {products.length}
              </span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors active:scale-[0.98] ${
                  activeCategory === category.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm font-semibold"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-white/70"
                }`}
              >
                {category.name}
                <span className={`text-xs ${activeCategory === category.id ? "text-white/80" : "text-[var(--color-text-secondary)]"}`}>
                  {categoryCounts.get(category.id) ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div>
            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Produk tidak ditemukan. Coba kata kunci lain atau tambahkan produk baru di menu
                  Produk.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
                {filteredProducts.map((product) => {
                  const linesForProduct = cart.filter((line) => line.productId === product.id);
                  const qtyInCart = linesForProduct.reduce((sum, line) => sum + line.qty, 0);
                  const outOfStock = (product.trackStock && product.stockQty <= 0) || Boolean(product.recipeUnavailable);
                  const atStockLimit = product.trackStock && qtyInCart >= product.stockQty;
                  const cardDisabled = outOfStock || atStockLimit;
                  return (
                    <div
                      key={product.id}
                      role="button"
                      tabIndex={cardDisabled ? -1 : 0}
                      aria-label={`Tambah 1 ${product.name}`}
                      onClick={() => {
                        if (!cardDisabled) addToCart(product);
                      }}
                      onKeyDown={(event) => {
                        if (cardDisabled) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          addToCart(product);
                        }
                      }}
                      className={`flex min-h-[126px] flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[0_2px_6px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_5px_12px_rgba(16,24,40,0.08)] md:p-3.5 ${
                        cardDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"
                      } ${
                        lastAddedProductId === product.id ? "ring-2 ring-[var(--color-primary)]/30" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <ProductVisual product={product} />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-5 text-[var(--color-text)]">{product.name}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <p className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                              {formatRupiah(product.price)}
                            </p>
                            {product.recipeUnavailable ? <p className="text-[11px] font-semibold text-[var(--color-danger)]">Bahan habis</p> : outOfStock ? <p className="text-[11px] font-semibold text-[var(--color-danger)]">Habis</p> : product.trackStock && product.stockQty <= 5 ? <p className="text-[11px] font-semibold text-[var(--color-warning-text)]">Sisa {product.stockQty}</p> : null}
                          </div>
                        </div>
                      </div>

                      {qtyInCart > 0 ? (
                        <div onClick={(event) => event.stopPropagation()} className="flex items-center justify-between rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-1 py-1">
                            <button
                              type="button"
                              onClick={() => decrementProduct(product.id)}
                              disabled={qtyInCart <= 0}
                              aria-label={`Kurangi ${product.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface)] text-base font-bold text-[var(--color-text)] hover:bg-white transition-colors disabled:opacity-30"
                            >
                              −
                            </button>
                            <span className="min-w-8 text-center tabular-nums text-sm font-bold text-[var(--color-text)]">{qtyInCart}</span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              disabled={outOfStock || atStockLimit}
                              aria-label={`Tambah ${product.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-bold text-[var(--color-on-primary)] hover:opacity-90 transition-opacity disabled:opacity-35"
                            >
                              +
                            </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="hidden min-h-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:flex lg:flex-col">
          <div className="mb-3 flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text)]">Keranjang</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">{cartCount} item</p>
            </div>
            <button type="button" onClick={() => setShowMemberPicker(true)} className="text-xs font-semibold text-[var(--color-primary)]">Pelanggan</button>
          </div>
          {cartPanel}
        </aside>
      </div>

      {cart.length > 0 && !showCartSheet && (
        <button
          onClick={() => setShowCartSheet(true)}
          className="fixed inset-x-4 bottom-[calc(var(--bottom-nav-height)+12px)] z-20 flex min-h-[52px] items-center justify-between gap-3 rounded-xl bg-[var(--color-primary)] px-4 text-[var(--color-on-primary)] shadow-[0_10px_24px_rgba(135,35,136,0.22)] md:bottom-6 md:left-auto md:right-6 md:min-w-[300px] lg:hidden"
        >
          <span className="shrink-0 text-sm font-medium">{cartCount} item</span>
          <span className="min-w-0 truncate text-right tabular-nums text-base font-bold">
            Bayar · {formatRupiah(total)}
          </span>
        </button>
      )}

      {showCartSheet && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 md:justify-end">
          <div className="max-h-[85dvh] w-full overflow-y-auto rounded-t-2xl bg-[var(--color-surface)] p-4 md:h-full md:max-h-none md:w-[380px] md:rounded-none md:border-l md:border-[var(--color-border)] md:p-5">
            <div className="mb-3 flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text)]">Keranjang</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">{cartCount} item</p>
              </div>
              <button
                onClick={() => setShowCartSheet(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)]"
                aria-label="Tutup"
              >
                <XIcon aria-hidden className="h-5 w-5" />
              </button>
            </div>
            {cartPanel}
          </div>
        </div>
      )}

      {showPayment && (
        <PaymentSheet
          total={total}
          subtotal={subtotal}
          discountAmount={cartDiscount + promoDiscount}
          taxAmount={taxAmount}
          items={saleItems}
          staticQrisPayload={staticQrisPayload}
          stampProgram={stampProgram}
          channelMarkupByOrderType={channelMarkupByOrderType}
          initialMember={posMember}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            resetCart();
            setPosMember(null);
            setShowPayment(false);
            setShowCartSheet(false);
          }}
        />
      )}

      {showCashOut && <CashOutModal onClose={() => setShowCashOut(false)} />}

      {showBarcodeScanner && (
        <BarcodeScannerModal
          title="Scan barcode produk"
          description="Barcode/QR yang cocok dengan SKU akan langsung masuk invoice."
          onDetected={handleBarcodeDetected}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {scannerAlwaysOn && (
        <BarcodeScannerModal
          title="Scanner aktif"
          description="Setiap barcode atau QR yang terbaca langsung ditambahkan ke invoice."
          persistent
          onDetected={handleBarcodeDetected}
          onClose={() => setScannerAlwaysOn(false)}
        />
      )}

      {variantPickerProduct && (
        <VariantPickerModal
          productName={variantPickerProduct.name}
          basePrice={variantPickerProduct.price}
          groups={variantPickerProduct.variantGroups}
          onClose={() => {
            setVariantPickerProduct(null);
            setPendingFavoriteProductId(null);
          }}
          onConfirm={({ optionIds, priceDelta, label }) => {
            addLineToCart(
              variantPickerProduct,
              optionIds,
              priceDelta,
              label,
              1,
              pendingFavoriteProductId === variantPickerProduct.id
            );
            setVariantPickerProduct(null);
            setPendingFavoriteProductId(null);
          }}
        />
      )}

      {serialPickerProduct && (
        <SerialPickerModal
          product={serialPickerProduct}
          excludeSerials={cart
            .filter((line) => line.productId === serialPickerProduct.id && line.serialNumber)
            .map((line) => line.serialNumber as string)}
          onClose={() => {
            setSerialPickerProduct(null);
            setPendingFavoriteProductId(null);
          }}
          onSelect={(serialNumber) => {
            addSerialLineToCart(
              serialPickerProduct,
              serialNumber,
              pendingFavoriteProductId === serialPickerProduct.id
            );
            setSerialPickerProduct(null);
            setPendingFavoriteProductId(null);
          }}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}

function SerialPickerModal({
  product,
  excludeSerials,
  onClose,
  onSelect,
}: {
  product: PosProduct;
  excludeSerials: string[];
  onClose: () => void;
  onSelect: (serialNumber: string) => void;
}) {
  const [serials, setSerials] = useState<string[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAvailableSerialsAction(product.id).then((result) => {
      if (!cancelled) setSerials(result.map((r) => r.serialNumber));
    });
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const available = (serials ?? []).filter(
    (s) => !excludeSerials.includes(s) && s.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
      <div className="max-h-[80vh] w-full overflow-y-auto glass-surface-strong rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Pilih unit — {product.name}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari serial/IMEI..."
          className="mb-3 min-h-[42px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        {serials === null ? (
          <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">Memuat...</p>
        ) : available.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
            Tidak ada unit tersedia. Cek stok/terima barang dulu.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {available.map((serialNumber) => (
              <button
                key={serialNumber}
                type="button"
                onClick={() => onSelect(serialNumber)}
                className="min-h-[44px] rounded-lg border border-[var(--color-border)] px-3 text-left text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              >
                {serialNumber}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductVisual({ product }: { product: PosProduct }) {
  const seed = product.name
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const palettes = [
    ["#fef3c7", "#f97316"],
    ["#dcfce7", "#16a34a"],
    ["#e0f2fe", "#0284c7"],
    ["#fce7f3", "#db2777"],
    ["#ede9fe", "#7c3aed"],
  ];
  const [bg, accent] = palettes[seed % palettes.length];
  const initials = product.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] md:h-12 md:w-12"
      style={{ backgroundColor: bg }}
    >
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="48px"
          className="object-cover"
        />
      ) : (
        <>
          <div
            className="absolute -right-5 -top-5 h-16 w-16 rounded-full opacity-20"
            style={{ backgroundColor: accent }}
          />
          <div
            className="absolute -bottom-7 -left-5 h-20 w-20 rounded-full opacity-20"
            style={{ backgroundColor: accent }}
          />
          <span className="relative text-sm font-black tracking-normal md:text-base" style={{ color: accent }}>
            {initials || "M"}
          </span>
        </>
      )}
    </div>
  );
}

function CartPanel({
  cart,
  cartDiscount,
  onCartDiscountChange,
  subtotal,
  appliedPromo,
  taxAmount,
  total,
  taxPercent,
  onUpdateQty,
  onUpdateLinePrice,
  onUpdateLineDiscount,
  onRemoveLine,
  onCheckout,
}: {
  cart: CartLine[];
  cartDiscount: number;
  onCartDiscountChange: (value: number) => void;
  subtotal: number;
  appliedPromo: { promoId: string; promoName: string; discountAmount: number } | null;
  taxAmount: number;
  total: number;
  taxPercent: number;
  onUpdateQty: (cartKey: string, qty: number) => void;
  onUpdateLinePrice: (cartKey: string, price: number) => void;
  onUpdateLineDiscount: (cartKey: string, discount: number) => void;
  onRemoveLine: (cartKey: string) => void;
  onCheckout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center shrink-0">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Belum ada produk. Ketuk produk di sebelah kiri untuk menambahkan →
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable Items list */}
          <div className="flex-1 overflow-y-auto scrollbar-none pr-0.5 mb-3 min-h-[180px] space-y-3">
            {cart.map((line) => (
              <div key={line.cartKey} className="border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">{line.name}</p>
                    {line.variantLabel && (
                      <p className="truncate text-xs text-[var(--color-text-secondary)]">{line.variantLabel}</p>
                    )}
                    {line.serialNumber && (
                      <p className="truncate text-xs text-[var(--color-text-secondary)]">
                        Serial/IMEI: {line.serialNumber}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">Harga</span>
                      <CartPriceInput
                        price={line.price}
                        onChange={(value) => onUpdateLinePrice(line.cartKey, value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveLine(line.cartKey)}
                    aria-label={`Hapus ${line.name}`}
                    className="flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-surface)]"
                  >
                    <XIcon aria-hidden className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {line.serialNumber ? (
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">1 unit</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateQty(line.cartKey, line.qty - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                        aria-label="Kurangi jumlah"
                      >
                        −
                      </button>
                       <CartQtyInput
                        qty={line.qty}
                        stockQty={line.stockQty}
                        trackStock={line.trackStock}
                        onChange={(val) => onUpdateQty(line.cartKey, val)}
                      />
                      <button
                        onClick={() => onUpdateQty(line.cartKey, line.qty + 1)}
                        disabled={line.trackStock && line.qty >= line.stockQty}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] disabled:opacity-40 hover:bg-[var(--color-bg)]"
                        aria-label="Tambah jumlah"
                      >
                        +
                      </button>
                    </div>
                  )}
                  <span className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                    {formatRupiah(line.price * line.qty - line.discountAmount)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <label className="text-xs text-[var(--color-text-secondary)] font-medium" htmlFor={`disc-${line.cartKey}`}>
                    Diskon item
                  </label>
                  <input
                    id={`disc-${line.cartKey}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={line.discountAmount || ""}
                    onChange={(event) => onUpdateLineDiscount(line.cartKey, Number(event.target.value) || 0)}
                    placeholder="0"
                    className="h-7 w-24 rounded border border-[var(--color-border)] px-2 text-xs tabular-nums outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Summary — scrolls internally so payment form + submit button are always reachable */}
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-[var(--color-border)] pt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs text-[var(--color-text-secondary)] font-medium" htmlFor="cart-discount">
                Diskon transaksi
              </label>
              <input
                id="cart-discount"
                type="number"
                min={0}
                inputMode="numeric"
                value={cartDiscount || ""}
                onChange={(event) => onCartDiscountChange(Number(event.target.value) || 0)}
                placeholder="0"
                className="h-8 w-24 rounded border border-[var(--color-border)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            {appliedPromo && (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-xs text-[var(--color-warning-text)]">
                <span>🎉 Promo {appliedPromo.promoName}</span>
                <span className="tabular-nums font-semibold">-{formatRupiah(appliedPromo.discountAmount)}</span>
              </div>
            )}

            {/* Total belanja — kartu menonjol */}
            <div className="rounded-xl bg-[var(--color-bg)] p-3">
              <div className="flex flex-col gap-1 text-xs text-[var(--color-text-secondary)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatRupiah(subtotal)}</span>
                </div>
                {taxPercent > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak ({taxPercent}%)</span>
                    <span className="tabular-nums">{formatRupiah(taxAmount)}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-2">
                <span className="shrink-0 text-xs font-semibold text-[var(--color-text)]">Total belanja</span>
                <span className="truncate tabular-nums text-xl font-bold leading-tight text-[var(--color-text)]">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              disabled={cart.length === 0}
              className="flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-3 text-sm font-bold text-[var(--color-on-primary)] disabled:opacity-40 hover:opacity-95 transition-opacity"
            >
              <span>Bayar</span>
              <span className="truncate tabular-nums">• {formatRupiah(total)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CartQtyInput({ qty, ...props }: {
  qty: number;
  stockQty: number;
  trackStock: boolean;
  onChange: (val: number) => void;
}) {
  return <CartQtyInputDraft qty={qty} {...props} />;
}

function CartQtyInputDraft({
  qty,
  stockQty,
  trackStock,
  onChange,
}: {
  qty: number;
  stockQty: number;
  trackStock: boolean;
  onChange: (val: number) => void;
}) {
  const [val, setVal] = useState(String(qty));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setVal(String(qty));
    }
  }, [qty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setVal(raw);
    if (raw !== "") {
      const num = Number(raw);
      const clamped = trackStock ? Math.min(num, stockQty) : num;
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    if (val === "" || Number(val) <= 0) {
      onChange(0);
      return;
    }
    const clamped = trackStock ? Math.min(Number(val), stockQty) : Number(val);
    setVal(String(clamped));
    onChange(clamped);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={val}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-11 h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-center tabular-nums text-sm font-semibold outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20"
    />
  );
}

function CartPriceInput({ price, onChange }: { price: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(price));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDraft(String(price));
    }
  }, [price]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value.replace(/\D/g, "");
    setDraft(raw);
    if (raw !== "") onChange(Number(raw));
  }

  function handleBlur() {
    const next = Math.max(0, Number(draft) || 0);
    setDraft(String(next));
    onChange(next);
  }

  return (
    <div className="relative min-w-0 flex-1">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[var(--color-text-muted)]">Rp</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        aria-label="Harga per item"
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        className="h-7 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] pl-7 pr-2 text-xs font-semibold tabular-nums text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20"
      />
    </div>
  );
}
