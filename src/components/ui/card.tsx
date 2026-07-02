import type { HTMLAttributes } from "react";

/** Kartu solid — dipakai di zona yang DILARANG glass (grid kasir, tabel, struk) & area umum lain. */
export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft-sm)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
