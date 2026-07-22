import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/register-form";
import { businessModeForVerticalKey } from "@/lib/business-modes";
import { getRequestVertical } from "@/lib/request-vertical";

export async function generateMetadata(): Promise<Metadata> {
  const vertical = await getRequestVertical();
  const label = vertical?.label ?? "Altora";
  const icon = vertical ? `/brand/${vertical.key}-symbol-onlight.svg` : "/brand/altora-purple-symbol.svg";

  return { title: `Daftar - ${label}`, icons: { icon } };
}

export default async function RegisterPage() {
  const vertical = await getRequestVertical();
  const label = vertical?.label ?? "Altora";
  const subtitle = vertical
    ? `Mulai dengan alur ${label.replace("Altora ", "")} yang sudah disiapkan.`
    : "Gratis untuk mulai. Bisa tambah outlet & karyawan nanti.";
  const lockedBusinessType = vertical ? businessModeForVerticalKey(vertical.key) : undefined;

  return (
    <AuthShell vertical={vertical} title={`Daftarkan ${vertical ? label : "usahamu"}`} subtitle={subtitle} size="lg">
      <RegisterForm lockedBusinessType={lockedBusinessType} lockedBusinessLabel={vertical?.label} />
    </AuthShell>
  );
}
