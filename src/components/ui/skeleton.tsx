/** Placeholder loading yang mengikuti bentuk konten final, bukan spinner di tengah layar. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[var(--color-surface-muted)] ${className}`} />;
}
