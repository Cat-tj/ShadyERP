import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AltoraLogomark } from "@/components/ui/altora-logomark";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 md:grid md:grid-cols-2">
      <div
        className="flex flex-1 items-center justify-center px-4 py-10"
        style={{
          "--color-primary": "#a730a8",
          "--color-primary-dark": "#7e2582",
          backgroundImage:
            "linear-gradient(135deg, rgba(47, 59, 163, 0.20) 0%, rgba(167, 48, 168, 0.16) 45%, rgba(242, 138, 78, 0.20) 100%), radial-gradient(1000px 620px at 8% -5%, rgba(47, 59, 163, 0.38) 0%, transparent 60%), radial-gradient(900px 560px at 100% 0%, rgba(242, 138, 78, 0.38) 0%, transparent 55%), radial-gradient(800px 700px at 50% 120%, rgba(167, 48, 168, 0.32) 0%, transparent 60%)",
        } as React.CSSProperties}
      >
        <GlassPanel strong className="w-full max-w-sm rounded-2xl p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <AltoraLogomark className="h-28 w-28 object-contain" />
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                Masuk ke Altora
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Kelola kasir, produk, dan karyawan tokomu.
              </p>
            </div>
          </div>
          <LoginForm />
        </GlassPanel>
      </div>

      {/* Cuma tampil di tablet/desktop — di HP layar terlalu sempit buat split. */}
      <div className="relative hidden md:block">
        <Image
          src="/auth/login-visual.jpg"
          alt="Interior toko bertema flamingo dengan dekorasi warna-warni"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(160deg, rgba(167, 48, 168, 0.10) 0%, rgba(167, 48, 168, 0.32) 100%)",
          }}
        />
        <p className="absolute bottom-8 right-8 max-w-xs text-right font-display text-lg italic text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]">
          &ldquo;Bisnis secantik ini, pantas dikelola sepintar itu.&rdquo;
        </p>
      </div>
    </div>
  );
}
