import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-xl font-bold text-white">
            S
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Masuk ke ShadyERP</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Kelola kasir, produk, dan karyawan tokomu.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
