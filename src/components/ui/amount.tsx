import { formatRupiah } from "@/lib/format";

/** Angka uang besar bergaya serif untuk kartu ringkasan/dashboard. Tetap tabular-nums & formatRupiah(). */
export function Amount({
  value,
  size = "md",
  className = "",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const SIZE_CLASS: Record<string, string> = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl sm:text-4xl",
  };
  return (
    <span className={`font-display tabular-nums font-semibold text-[var(--color-text)] ${SIZE_CLASS[size]} ${className}`}>
      {formatRupiah(value)}
    </span>
  );
}
