import { requireSuperAdmin } from "@/server/require-super-admin";
import { superAdminLogoutAction } from "@/app/superadmin/login/actions";
import Link from "next/link";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-text)] font-display text-xs font-semibold text-[var(--color-on-primary)]">
            A
          </div>
          <p className="font-display text-sm font-semibold text-[var(--color-text)]">
            Altora Super Admin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/superadmin" className="text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            Tenant
          </Link>
          <Link href="/superadmin/admins" className="text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            Admin
          </Link>
          <p className="text-sm text-[var(--color-text-secondary)]">{admin.name}</p>
          <form action={superAdminLogoutAction}>
            <button
              type="submit"
              className="min-h-[36px] rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Keluar
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
