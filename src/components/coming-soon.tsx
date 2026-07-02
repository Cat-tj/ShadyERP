export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-xl">
        🛠️
      </div>
      <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
      <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
        {description ?? "Segera hadir. Fitur ini sedang kami siapkan."}
      </p>
    </div>
  );
}
