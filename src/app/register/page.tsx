import { RegisterForm } from "@/components/register-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AltoraLogomark } from "@/components/ui/altora-logomark";

export default function RegisterPage() {
  return (
    <div
      className="flex min-h-screen flex-1 items-center justify-center px-4 py-10"
      style={{
        "--color-primary": "#a730a8",
        "--color-primary-dark": "#7e2582",
        backgroundImage:
          "radial-gradient(1000px 620px at 8% -5%, rgba(47, 59, 163, 0.16) 0%, transparent 60%), radial-gradient(900px 560px at 100% 0%, rgba(242, 138, 78, 0.16) 0%, transparent 55%), radial-gradient(800px 700px at 50% 120%, rgba(167, 48, 168, 0.12) 0%, transparent 60%)",
      } as React.CSSProperties}
    >
      <GlassPanel strong className="w-full max-w-sm rounded-2xl p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <AltoraLogomark className="h-14 w-14 drop-shadow-sm" />
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              Daftarkan usahamu
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Gratis untuk mulai. Bisa tambah outlet &amp; karyawan nanti.
            </p>
          </div>
        </div>
        <RegisterForm />
      </GlassPanel>
    </div>
  );
}
