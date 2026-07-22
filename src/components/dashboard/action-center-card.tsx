import Link from "next/link";
import { CheckCircleIcon } from "@/components/ui/icons";

export type ActionCenterItem = {
  label: string;
  tone?: "danger" | "warning" | "info";
  cta: { label: string; href: string };
};

const TONE_DOT: Record<NonNullable<ActionCenterItem["tone"]>, string> = {
  danger: "bg-[var(--color-danger)]",
  warning: "bg-[var(--color-warning)]",
  info: "bg-[var(--color-info)]",
};

/** Kartu "Perlu perhatian" — maksimal 5 item, selalu ada CTA spesifik per item. */
export function ActionCenterCard({ items }: { items: ActionCenterItem[] }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft-sm)]">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">Perlu perhatian</h2>
      {items.length === 0 ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-success-surface)] px-3 py-3">
          <CheckCircleIcon className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
          <p className="text-sm text-[var(--color-text)]">Operasional berjalan normal hari ini.</p>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {items.slice(0, 5).map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[item.tone ?? "info"]}`} />
                {item.label}
              </span>
              <Link
                href={item.cta.href}
                className="shrink-0 text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                {item.cta.label} →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
