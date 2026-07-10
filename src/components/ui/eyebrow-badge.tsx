/** Label kecil huruf besar bergaya mono + titik — dipakai buat kicker di atas judul seksi, samain sama .eyebrow di landing page. */
export function EyebrowBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono-data text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)] ${className}`}
    >
      <span
        aria-hidden
        className="h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--color-primary)]"
        style={{ boxShadow: "0 0 0 3px var(--color-primary-soft-strong)" }}
      />
      {children}
    </span>
  );
}
