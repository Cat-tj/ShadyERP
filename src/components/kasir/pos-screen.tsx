"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { computeBestPromoDiscount, type PromoForCalc } from "@/lib/promo";
import { PaymentSheet } from "@/components/kasir/payment-sheet";
import { OfflineSyncBanner } from "@/components/kasir/offline-sync-banner";
import { VariantPickerModal, type VariantGroupOption } from "@/components/kasir/variant-picker-modal";
import { XIcon } from "@/components/ui/icons";

export type PosProduct = {
  id: string;
  name: string;
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
  promos,
}: {
  outletName: string;
  products: PosProduct[];
  categories: PosCategory[];
  taxPercent: number;
  promos: PosPromo[];
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [variantPickerProduct, setVariantPickerProduct] = useState<PosProduct | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = activeCategory === "ALL" || product.categoryId === activeCategory;
      const matchSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, search]);

  const productCategoryMap = useMemo(() => new Map(products.map((p) => [p.id, p.categoryId])), [products]);

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
    variantLabel: string | null
  ) {
    const cartKey = `${product.id}::${[...variantOptionIds].sort().join(",")}`;
    setCart((prev) => {
      const existing = prev.find((line) => line.cartKey === cartKey);
      const currentQty = existing?.qty ?? 0;
      if (product.trackStock && currentQty + 1 > product.stockQty) {
        return prev;
      }
      if (existing) {
        return prev.map((line) => (line.cartKey === cartKey ? { ...line, qty: line.qty + 1 } : line));
      }
      return [
        ...prev,
        {
          cartKey,
          productId: product.id,
          name: product.name,
          price: product.price + priceDelta,
          qty: 1,
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
    <div className="flex h-full flex-col">
      <OfflineSyncBanner />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Kasir</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{outletName}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            href="/kasir/riwayat"
            className="flex min-h-[40px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] sm:flex-none"
          >
            Riwayat
          </Link>
          <Link
            href="/kasir/tutup"
            className="flex min-h-[40px] flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] sm:flex-none"
          >
            Tutup shift
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:gap-6">
        {/* Grid produk */}
        <div className="flex-1 min-w-0">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari produk..."
            className="mb-3 min-h-[48px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-medium ${
                activeCategory === "ALL"
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
              }`}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-medium ${
                  activeCategory === category.id
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Produk tidak ditemukan. Coba kata kunci lain atau tambahkan produk baru di menu
                Produk.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3 pb-28 xl:pb-0">
              {filteredProducts.map((product) => {
                const linesForProduct = cart.filter((line) => line.productId === product.id);
                const qtyInCart = linesForProduct.reduce((sum, line) => sum + line.qty, 0);
                const outOfStock = product.trackStock && product.stockQty <= 0;
                const atStockLimit = product.trackStock && qtyInCart >= product.stockQty;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock || atStockLimit}
                    className="flex flex-col items-start rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition-transform active:scale-[0.97] disabled:opacity-40"
                  >
                    <span className="text-sm font-semibold text-[var(--color-text)] line-clamp-2">
                      {product.name}
                    </span>
                    <span className="mt-1 tabular-nums text-sm font-bold text-[var(--color-primary)]">
                      {formatRupiah(product.price)}
                    </span>
                    {product.trackStock && (
                      <span className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        {outOfStock ? "Stok habis" : `Stok ${product.stockQty}`}
                      </span>
                    )}
                    {qtyInCart > 0 && (
                      <span className="mt-2 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-bold text-[var(--color-on-primary)]">
                        {qtyInCart} di keranjang
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart desktop */}
        <div className="hidden w-80 shrink-0 xl:block">{cartPanel}</div>
      </div>

      {/* Cart mobile: sticky bar + sheet */}
      {cart.length > 0 && !showCartMobile && (
        <button
          onClick={() => setShowCartMobile(true)}
          className="fixed inset-x-4 bottom-20 z-20 flex min-h-[52px] items-center justify-between gap-3 rounded-lg bg-[var(--color-primary)] px-5 text-[var(--color-on-primary)] shadow-lg lg:bottom-6 xl:hidden"
        >
          <span className="shrink-0 text-sm font-medium">{cartCount} item</span>
          <span className="min-w-0 truncate text-right tabular-nums text-base font-bold">
            Lihat keranjang — {formatRupiah(total)}
          </span>
        </button>
      )}

      {showCartMobile && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end bg-black/40 xl:hidden">
          <div className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--color-bg)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--color-text)]">Keranjang</h2>
              <button
                onClick={() => setShowCartMobile(false)}
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
          items={cart.map((line) => ({
            productId: line.productId,
            qty: line.qty,
            discountAmount: line.discountAmount,
            variantOptionIds: line.variantOptionIds,
          }))}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            resetCart();
            setShowPayment(false);
            setShowCartMobile(false);
          }}
        />
      )}

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
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 xl:sticky xl:top-4">
      <h2 className="hidden text-base font-bold text-[var(--color-text)] md:block">Keranjang</h2>

      {cart.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
          Belum ada produk. Ketuk produk di sebelah kiri untuk menambahkan →
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {cart.map((line) => (
            <div key={line.cartKey} className="border-b border-[var(--color-border)] pb-3 last:border-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">{line.name}</p>
                  {line.variantLabel && (
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">{line.variantLabel}</p>
                  )}
                  <p className="tabular-nums text-xs text-[var(--color-text-secondary)]">
                    {formatRupiah(line.price)} / item
                  </p>
                </div>
                <button
                  onClick={() => onRemoveLine(line.cartKey)}
                  aria-label={`Hapus ${line.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                >
                  <XIcon aria-hidden className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(line.cartKey, line.qty - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)]"
                    aria-label="Kurangi jumlah"
                  >
                    −
                  </button>
                  <span className="w-6 text-center tabular-nums text-sm font-semibold">{line.qty}</span>
                  <button
                    onClick={() => onUpdateQty(line.cartKey, line.qty + 1)}
                    disabled={line.trackStock && line.qty >= line.stockQty}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)] disabled:opacity-40"
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
                <label className="text-xs text-[var(--color-text-secondary)]" htmlFor={`disc-${line.cartKey}`}>
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
                  className="h-8 w-24 rounded-md border border-[var(--color-border)] px-2 text-xs tabular-nums outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-3">
        <label className="text-sm text-[var(--color-text-secondary)]" htmlFor="cart-discount">
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
          className="h-9 w-28 rounded-md border border-[var(--color-border)] px-2 text-sm tabular-nums outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      {appliedPromo && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
          <span>🎉 Promo {appliedPromo.promoName}</span>
          <span className="tabular-nums font-semibold">-{formatRupiah(appliedPromo.discountAmount)}</span>
        </div>
      )}

      <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-3 text-sm">
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatRupiah(subtotal)}</span>
        </div>
        {taxPercent > 0 && (
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>Pajak ({taxPercent}%)</span>
            <span className="tabular-nums">{formatRupiah(taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-[var(--color-text)]">
          <span>Total</span>
          <span className="tabular-nums">{formatRupiah(total)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={cart.length === 0}
        className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
      >
        Bayar — {formatRupiah(total)}
      </button>
    </div>
  );
}
