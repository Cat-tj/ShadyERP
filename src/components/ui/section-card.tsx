import { EyebrowBadge } from "@/components/ui/eyebrow-badge";

/** Kartu seksi premium (kicker + judul + deskripsi opsional) — dipakai buat halaman ringkasan tiap hub. */
export function SectionCard({
  eyebrow,
  title,
  description,
  action,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const hasHead = Boolean(eyebrow || title || action);
  return (
    <section
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft-sm)] sm:p-6 ${className}`}
    >
      {hasHead && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {eyebrow && <EyebrowBadge className="mb-1.5">{eyebrow}</EyebrowBadge>}
            {title && <h2 className="font-display text-base font-semibold text-[var(--color-text)]">{title}</h2>}
            {description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
