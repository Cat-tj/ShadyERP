import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getAuthThemeStyle, VerticalAuthBrand } from "@/components/auth/vertical-auth-brand";
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

  return (
    <div
      className="flex min-h-screen flex-1 items-center justify-center px-4 py-10"
      style={getAuthThemeStyle(vertical)}
    >
      <GlassPanel strong className="w-full max-w-lg rounded-2xl p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <VerticalAuthBrand vertical={vertical} />
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              Daftarkan {vertical ? label : "usahamu"}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {vertical ? `Mulai dengan alur ${label.replace("Altora ", "")} yang sudah disiapkan.` : "Gratis untuk mulai. Bisa tambah outlet & karyawan nanti."}
            </p>
          </div>
        </div>
        <RegisterForm />
      </GlassPanel>
    </div>
  );
}
