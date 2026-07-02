import { LoginForm } from "@/components/login-form";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4 py-10">
      <GlassPanel strong className="w-full max-w-sm rounded-xl p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] font-display text-xl font-semibold text-[var(--color-on-primary)]">
            A
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            Masuk ke Altora
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Kelola kasir, produk, dan karyawan tokomu.
          </p>
        </div>
        <LoginForm />
      </GlassPanel>
    </div>
  );
}
