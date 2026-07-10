type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: "bg-[var(--color-success-surface)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-surface)] text-[var(--color-warning)]",
  danger:  "bg-[var(--color-danger-surface)] text-[var(--color-danger)]",
  info:    "bg-[var(--color-info-surface)] text-[var(--color-info)]",
  neutral: "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]",
  primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
};

export function StatusBadge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
