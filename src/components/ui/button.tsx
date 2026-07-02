import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40",
  secondary:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40",
  ghost:
    "text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-on-primary)] hover:opacity-90 disabled:opacity-40",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: {
  variant?: ButtonVariant;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex min-h-[48px] items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors duration-150 ${
        fullWidth ? "w-full" : ""
      } ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
