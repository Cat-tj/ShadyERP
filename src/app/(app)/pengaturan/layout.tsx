import { requireRole } from "@/server/require-session";
import { SettingsTabs } from "@/components/pengaturan/settings-tabs";

export default async function PengaturanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["OWNER"]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold text-[var(--color-text)]">Pengaturan</h1>
      <SettingsTabs />
      {children}
    </div>
  );
}
