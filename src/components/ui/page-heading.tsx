/** Judul mewah bertipografi serif — dipakai untuk judul halaman & nama merek/toko. */
export function PageHeading({
  children,
  size = "lg",
  className = "",
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const SIZE_CLASS: Record<string, string> = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl sm:text-4xl",
  };
  return (
    <h1 className={`font-display font-semibold tracking-tight text-[var(--color-text)] ${SIZE_CLASS[size]} ${className}`}>
      {children}
    </h1>
  );
}
