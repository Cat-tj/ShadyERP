export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-[var(--color-primary)]/20 opacity-75" />
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]" />
      </div>
      <p className="text-xs font-medium text-[var(--color-text-secondary)] animate-pulse">
        Memuat halaman...
      </p>
    </div>
  );
}
