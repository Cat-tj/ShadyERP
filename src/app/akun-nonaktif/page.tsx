import { GlassPanel } from "@/components/ui/glass-panel";
import { AlertTriangleIcon } from "@/components/ui/icons";

export default function AkunNonaktifPage() {
  return (
    <div className="portal-backdrop flex min-h-screen items-center justify-center px-4 py-10">
      <GlassPanel strong className="w-full max-w-sm rounded-xl p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
          <AlertTriangleIcon aria-hidden className="h-6 w-6" />
        </div>
        <h1 className="font-display text-lg font-semibold text-[var(--color-text)]">
          Akun toko sedang nonaktif
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Biasanya karena langganan tertunda. Hubungi admin Altora untuk mengaktifkan kembali.
        </p>
      </GlassPanel>
    </div>
  );
}
