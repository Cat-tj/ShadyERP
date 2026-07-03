import { SuperAdminLoginForm } from "@/components/superadmin/super-admin-login-form";

export default function SuperAdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-text)] font-display text-xl font-semibold text-[var(--color-on-primary)]">
            A
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            Super Admin
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Panel internal Altora — bukan untuk pengguna tenant.
          </p>
        </div>
        <SuperAdminLoginForm />
      </div>
    </div>
  );
}
