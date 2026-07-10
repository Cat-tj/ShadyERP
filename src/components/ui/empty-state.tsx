import type { ComponentType, SVGProps } from "react";
import Link from "next/link";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  secondaryAction?: { label: string; href?: string; onClick?: () => void };
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-10 px-4" : "py-16 px-6"
      }`}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-bg-secondary)]">
          <Icon className="h-7 w-7 text-[var(--color-text-muted)]" />
        </div>
      )}
      <p className={`font-semibold text-[var(--color-text)] ${compact ? "text-sm" : "text-base"}`}>
        {title}
      </p>
      {description && (
        <p
          className={`mt-1.5 max-w-xs text-[var(--color-text-secondary)] ${
            compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed"
          }`}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="flex min-h-[40px] items-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)]"
              >
                {action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="flex min-h-[40px] items-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)]"
              >
                {action.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="flex min-h-[40px] items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="flex min-h-[40px] items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
