"use client";

export function PrintButton({
  label = "Cetak / bagikan struk",
  fullWidth = true,
}: {
  label?: string;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={() => window.print()}
      className={`flex min-h-[52px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base font-semibold text-[var(--color-text)] ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {label}
    </button>
  );
}
