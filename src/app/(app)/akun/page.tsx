import { requireSession } from "@/server/require-session";
import { ChangePasswordForm } from "@/components/akun/change-password-form";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  STAFF: "Staf",
};

export default async function AkunPage() {
  const user = await requireSession();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Akun saya</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {user.name} · {user.email} · {ROLE_LABEL[user.role] ?? user.role}
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-base font-bold text-[var(--color-text)]">Ganti password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
