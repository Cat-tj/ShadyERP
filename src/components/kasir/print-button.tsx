"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex min-h-[52px] w-full items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-base font-semibold text-[var(--color-text)]"
    >
      Cetak / bagikan struk
    </button>
  );
}
