"use client";

import { useMemo, useState, useTransition } from "react";
import { formatRupiah } from "@/lib/format";
import { submitOrderAction } from "@/app/pesan/[qrToken]/actions";
import { VariantPickerModal, type VariantGroupOption } from "@/components/kasir/variant-picker-modal";
import { XIcon, CheckCircleIcon } from "@/components/ui/icons";

export type MenuProduct = {
  id: string;
  name: string;
  price: number;
  categoryId: string | null;
  categoryName: string | null;
  trackStock: boolean;
  stockQty: number;
  variantGroups: VariantGroupOption[];
};

export type MenuCategory = { id: string; name: string };

export type CartLine = {
  cartKey: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  trackStock: boolean;
  stockQty: number;
  variantOptionIds: string[];
  variantLabel: string | null;
};

export function OrderMenu({
  qrToken,
  tableName,
  outletName,
  products,
  categories,
}: {
  qrToken: string;
  tableName: string;
  outletName: string;
  products: MenuProduct[];
  categories: MenuCategory[];
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [variantPickerProduct, setVariantPickerProduct] = useState<MenuProduct | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = activeCategory === "ALL" || product.categoryId === activeCategory;
      const matchSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, search]);

  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const cartTotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0);

  function addLineToCart(
    product: MenuProduct,
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
          trackStock: product.trackStock,
          stockQty: product.stockQty,
          variantOptionIds,
          variantLabel,
        },
      ];
    });
  }

  function addToCart(product: MenuProduct) {
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

  if (submitted) {
    return (
      <div className="portal-backdrop flex min-h-screen items-center justify-center px-4 py-10">
        <div className="glass-surface-strong w-full max-w-sm rounded-xl p-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
            <CheckCircleIcon aria-hidden className="h-7 w-7" />
          </div>
          <h1 className="font-display text-lg font-semibold text-[var(--color-text)]">
            Pesanan terkirim!
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Staff akan segera memproses pesananmu di {tableName}. Pembayaran dilakukan di kasir.
          </p>
          <button
            onClick={() => {
              setCart([]);
              setSubmitted(false);
            }}
            className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-on-primary)]"
          >
            Pesan menu lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="glass-nav sticky top-0 z-10 px-4 py-3">
        <p className="text-sm font-semibold text-[var(--color-text)]">{outletName}</p>
        <p className="text-xs text-[var(--color-text-secondary)]">Pesan dari {tableName}</p>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4 pb-28">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari menu..."
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
            <p className="text-sm text-[var(--color-text-secondary)]">Menu tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                  {outOfStock && (
                    <span className="mt-1 text-xs text-[var(--color-text-secondary)]">Stok habis</span>
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

      {cart.length > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed inset-x-4 bottom-4 z-20 flex min-h-[52px] items-center justify-between rounded-lg bg-[var(--color-primary)] px-5 text-[var(--color-on-primary)] shadow-lg"
        >
          <span className="text-sm font-medium">{cartCount} item</span>
          <span className="tabular-nums text-base font-bold">Lihat keranjang — {formatRupiah(cartTotal)}</span>
        </button>
      )}

      {showCart && (
        <CheckoutSheet
          qrToken={qrToken}
          cart={cart}
          total={cartTotal}
          onUpdateQty={updateQty}
          onClose={() => setShowCart(false)}
          onSubmitted={() => {
            setShowCart(false);
            setSubmitted(true);
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

function CheckoutSheet({
  qrToken,
  cart,
  total,
  onUpdateQty,
  onClose,
  onSubmitted,
}: {
  qrToken: string;
  cart: CartLine[];
  total: number;
  onUpdateQty: (cartKey: string, qty: number) => void;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (cart.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }
    startTransition(async () => {
      const result = await submitOrderAction(
        qrToken,
        cart.map((line) => ({
          productId: line.productId,
          qty: line.qty,
          variantOptionIds: line.variantOptionIds,
        })),
        customerName.trim() || undefined,
        note.trim() || undefined
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      onSubmitted();
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-end bg-black/40">
      <div className="max-h-[90vh] overflow-y-auto rounded-t-2xl bg-[var(--color-bg)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--color-text)]">Keranjang</h2>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)]"
            aria-label="Tutup"
          >
            <XIcon aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          {cart.map((line) => (
            <div key={line.cartKey} className="border-b border-[var(--color-border)] pb-3 last:border-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">{line.name}</p>
                  {line.variantLabel && (
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">{line.variantLabel}</p>
                  )}
                </div>
                <span className="tabular-nums text-sm font-bold text-[var(--color-text)]">
                  {formatRupiah(line.price * line.qty)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
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
            </div>
          ))}

          <div className="flex flex-col gap-1.5 pt-1">
            <label className="text-sm font-medium text-[var(--color-text)]">Nama (opsional)</label>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Biar staff gampang manggil"
              className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Catatan (opsional)</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="mis. pedasnya dikurangi"
              className="min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-base font-bold text-[var(--color-text)]">
            <span>Total</span>
            <span className="tabular-nums">{formatRupiah(total)}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending || cart.length === 0}
          className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-base font-semibold text-[var(--color-on-primary)] disabled:opacity-40"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)]/30 border-t-[var(--color-on-primary)]" />
          )}
          {isPending ? "Mengirim..." : "Kirim pesanan"}
        </button>
        <p className="mt-2 text-center text-xs text-[var(--color-text-secondary)]">
          Pembayaran dilakukan di kasir setelah pesanan diproses.
        </p>
      </div>
    </div>
  );
}
