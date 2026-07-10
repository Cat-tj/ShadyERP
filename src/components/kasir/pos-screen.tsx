"use client";

import { useMemo, useState, useEffect, type KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatRupiah } from "@/lib/format";
import { computeBestPromoDiscount, type PromoForCalc } from "@/lib/promo";
import { PaymentSheet } from "@/components/kasir/payment-sheet";
import { OfflineSyncBanner } from "@/components/kasir/offline-sync-banner";
import { CashOutModal } from "@/components/kasir/cash-out-modal";
import { VariantPickerModal, type VariantGroupOption } from "@/components/kasir/variant-picker-modal";
import { XIcon } from "@/components/ui/icons";
import { useToast, Toast } from "@/components/toast";

export type PosProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  sku: string | null;
  price: number;
  categoryId: string | null;
  categoryName: string | null;
  trackStock: boolean;
  stockQty: number;
  variantGroups: VariantGroupOption[];
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
};

export function PosScreen({
  outletName,
  products,
  categories,
  taxPercent,
  staticQrisPayload,
  promos,
}: {
  outletName: string;
  products: PosProduct[];
  categories: PosCategory[];
  taxPercent: number;
  staticQrisPayload: string | null;
  promos: PosPromo[];
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCashOut, setShowCashOut] = useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  const [variantPickerProduct, setVariantPickerProduct] = useState<PosProduct | null>(null);
  const { toastMessage, showToast } = useToast();
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement;
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
        const searchInput = document.getElementById("pos-search-input") as HTMLInputElement;
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
    initialQty: number = 1
  ) {
    setLastAddedProductId(product.id);
    const cartKey = `${product.id}::${[...variantOptionIds].sort().join(",")}`;
    setCart((prev) => {
      const existing = prev.find((line) => line.cartKey === cartKey);
      const targetQty = existing ? existing.qty + initialQty : initialQty;
      const clampedQty = product.trackStock ? Math.min(targetQty, product.stockQty) : targetQty;
      if (existing) {
        return prev.map((line) => (line.cartKey === cartKey ? { ...line, qty: clampedQty } : line));
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
        },
      ];
    });
  }

  function addToCart(product: PosProduct) {
    if (product.variantGroups.length > 0) {
      setVariantPickerProduct(product);
      return;
    }
    addLineToCart(product, [], 0, null);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    const query = search.trim().toLowerCase();
    if (!query) return;
    const exact = products.find((product) => product.sku?.toLowerCase() === query);
    if (!exact) {
      showToast(`Barcode "${search.trim()}" tidak ditemukan`);
      return;
    }
    event.preventDefault();
    addToCart(exact);
    setSearch("");
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
    variantOptionIds: line.variantOptionIds,
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
      onUpdateLineDiscount={updateLineDiscount}
      onRemoveLine={removeLine}
      onCheckout={() => setShowPayment(true)}
    />
  );

  return (
    <div className="flex flex-col h-full md:h-[calc(100dvh-160px)] lg:h-[calc(100dvh-var(--topbar-height)-32px)] overflow-hidden pb-4">
      <OfflineSyncBanner />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Kasir</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{outletName}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setShowCashOut(true)}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)] hover:opacity-90 sm:flex-none"
          >
            Gesek tunai
          </button>
          <Link
            href="/kasir/riwayat"
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] sm:flex-none"
          >
            Riwayat
          </Link>
          <Link
            href="/kasir/tutup"
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] sm:flex-none"
          >
            Tutup shift
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Katalog produk — full width, invoice cuma bar ringkas (lihat di bawah) */}
        <div className="min-w-0 flex flex-col h-full overflow-hidden">
          <div className="relative mb-3.5 shrink-0">
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
              className="min-h-[48px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`flex min-h-[42px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-all active:scale-[0.98] ${
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
                className={`flex min-h-[42px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-all active:scale-[0.98] ${
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

          <div className="flex-1 overflow-y-auto scrollbar-none pb-24 md:pb-0">
            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Produk tidak ditemukan. Coba kata kunci lain atau tambahkan produk baru di menu
                  Produk.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
                {filteredProducts.map((product) => {
                  const linesForProduct = cart.filter((line) => line.productId === product.id);
                  const qtyInCart = linesForProduct.reduce((sum, line) => sum + line.qty, 0);
                  const outOfStock = product.trackStock && product.stockQty <= 0;
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
                      className={`flex min-h-[112px] flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-all hover:shadow-md ${
                        cardDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"
                      } ${
                        lastAddedProductId === product.id ? "ring-2 ring-[var(--color-primary)]/30" : ""
                      }`}
                    >
                      {/* Baris atas: avatar + nama + harga/stok (harga & nama nggak pernah berebut ruang dengan stepper) */}
                      <div className="flex items-start gap-3">
                        <ProductVisual product={product} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-[var(--color-text)]">{product.name}</p>
                          {product.sku && (
                            <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--color-text-secondary)]">
                              {product.sku}
                            </p>
                          )}
                          <div className="mt-1.5 flex items-center gap-2">
                            <p className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                              {formatRupiah(product.price)}
                            </p>
                            {product.trackStock && (
                              <p className="text-xs text-[var(--color-text-secondary)]">
                                {outOfStock ? "Stok habis" : `Stok ${product.stockQty}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Baris bawah: stepper — stopPropagation supaya klik di sini nggak dobel nambah lewat card */}
                      <div
                        onClick={(event) => event.stopPropagation()}
                        className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-bg)] p-1 border border-[var(--color-border)]/50">
                            <button
                              type="button"
                              onClick={() => decrementProduct(product.id)}
                              disabled={qtyInCart <= 0}
                              aria-label={`Kurangi ${product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[var(--color-border)] text-base font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors disabled:opacity-30"
                            >
                              −
                            </button>
                            {product.variantGroups.length === 0 ? (
                              <CartQtyInput
                                qty={qtyInCart}
                                stockQty={product.stockQty}
                                trackStock={product.trackStock}
                                onChange={(val) => {
                                  const line = cart.find((item) => item.productId === product.id);
                                  if (line) {
                                    updateQty(line.cartKey, val);
                                  } else if (val > 0) {
                                    addLineToCart(product, [], 0, null, val);
                                  }
                                }}
                              />
                            ) : (
                              <span className="w-6 text-center tabular-nums text-sm font-bold text-[var(--color-text)]">
                                {qtyInCart}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              disabled={outOfStock || atStockLimit}
                              aria-label={`Tambah ${product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-base font-bold text-[var(--color-on-primary)] hover:opacity-90 transition-opacity disabled:opacity-35"
                            >
                              +
                            </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Invoice — bar ringkas mengambang di semua ukuran layar, klik buat buka panel lengkap */}
      {cart.length > 0 && !showCartSheet && (
        <button
          onClick={() => setShowCartSheet(true)}
          className="fixed inset-x-4 bottom-20 z-20 flex min-h-[52px] items-center justify-between gap-3 rounded-xl bg-[var(--color-primary)] px-5 text-[var(--color-on-primary)] shadow-lg transition-transform hover:scale-[1.01] md:bottom-6 md:inset-x-auto md:right-6 md:min-w-[300px] md:max-w-sm lg:right-8"
        >
          <span className="shrink-0 text-sm font-medium">{cartCount} item</span>
          <span className="min-w-0 truncate text-right tabular-nums text-base font-bold">
            Lihat Invoice • {formatRupiah(total)}
          </span>
        </button>
      )}

      {showCartSheet && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--color-bg)] p-4 sm:max-w-md sm:rounded-2xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--color-text)]">Invoice</h2>
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
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            resetCart();
            setShowPayment(false);
            setShowCartSheet(false);
          }}
        />
      )}

      {showCashOut && <CashOutModal onClose={() => setShowCashOut(false)} />}

      {variantPickerProduct && (
        <VariantPickerModal
          productName={variantPickerProduct.name}
          basePrice={variantPickerProduct.price}
          groups={variantPickerProduct.variantGroups}
          onClose={() => setVariantPickerProduct(null)}
          onConfirm={({ optionIds, priceDelta, label }) => {
            addLineToCart(variantPickerProduct, optionIds, priceDelta, label);
            setVariantPickerProduct(null);
          }}
        />
      )}

      <Toast message={toastMessage} />
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
      className="relative flex h-16 w-16 md:h-18 md:w-18 shrink-0 items-center justify-center overflow-hidden rounded-xl"
      style={{ backgroundColor: bg }}
    >
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="72px"
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
          <span className="relative text-lg md:text-xl font-black tracking-normal" style={{ color: accent }}>
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
                    <p className="tabular-nums text-xs text-[var(--color-text-muted)]">
                      {formatRupiah(line.price)} / item
                    </p>
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

function CartQtyInput({
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

  useEffect(() => {
    setVal(String(qty));
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
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={val}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-11 h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-center tabular-nums text-sm font-semibold outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20"
    />
  );
}
