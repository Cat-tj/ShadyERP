"use client";

import Image from "next/image";
import { formatRupiah } from "@/lib/format";
import { ProductVisual } from "./pos-screen";
import type { PosProduct } from "./pos-screen";

export default function ProductCardCompact({
  product,
  qtyInCart,
  lastAdded,
  onDecrement,
  onAdd,
}: {
  product: PosProduct;
  qtyInCart: number;
  lastAdded?: boolean;
  onDecrement: (productId: string) => void;
  onAdd: (product: PosProduct) => void;
}) {
  const outOfStock = product.trackStock && product.stockQty <= 0;
  const atStockLimit = product.trackStock && qtyInCart >= product.stockQty;

  return (
    <div
      key={product.id}
      className={`flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)] ${
        outOfStock ? "opacity-50" : ""
      } ${lastAdded ? "ring-2 ring-[var(--color-primary)]/30" : ""}`}
    >
      <ProductVisual product={product} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[var(--color-text)]">{product.name}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="tabular-nums text-sm font-black text-[var(--color-text)]">{formatRupiah(product.price)}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDecrement(product.id)}
              disabled={qtyInCart <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-base font-bold text-[var(--color-text)] shadow-sm transition-colors hover:border-[var(--color-border-strong)] disabled:opacity-30"
            >
              -
            </button>
            <div className="w-10 text-center tabular-nums font-bold">{qtyInCart}</div>
            <button
              type="button"
              onClick={() => onAdd(product)}
              disabled={outOfStock || atStockLimit}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-base font-bold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
