"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, CurrencyIcon } from "./icons";

export default function MobileCartBar() {
  const pathname = usePathname();
  // Show only on pesanan (public order) and pesanan-meja (table order) screens on mobile.
  // The kasir page manages its own mobile cart UI and should not show the global bar to avoid duplicate controls.
  const show = pathname?.startsWith("/pesan") || pathname?.startsWith("/pesanan-meja");
  if (!show) return null;

  // TODO: wire to real cart state. For now show placeholder zero state which
  // keeps space and prevents bottom nav overlap. The cashier page will replace
  // this with real data via its own client component when available.
  const itemCount = 0;
  const total = 0;

  return (
    <div
      aria-hidden={!show}
      className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] z-30 flex items-center justify-between gap-3 border-t border-[var(--color-border)] bg-white/98 px-4 py-3 lg:hidden"
      style={{ height: "var(--mobile-cart-height)" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-soft)]">
          <ShoppingCart className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{itemCount} item</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Rp{total.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/kasir/checkout"
          className="flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm"
        >
          Bayar
          <CurrencyIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
