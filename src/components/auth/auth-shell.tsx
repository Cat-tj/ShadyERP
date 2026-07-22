import Image from "next/image";
import type { ReactNode } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getAuthThemeStyle, VerticalAuthBrand } from "@/components/auth/vertical-auth-brand";
import type { VerticalDef } from "@/lib/verticals";

type AuthShellProps = {
  vertical?: VerticalDef;
  title: string;
  subtitle: string;
  children: ReactNode;
  size?: "sm" | "lg";
  showVisual?: boolean;
};

export function AuthShell({
  vertical,
  title,
  subtitle,
  children,
  size = "sm",
  showVisual = false,
}: AuthShellProps) {
  const panelWidth = size === "lg" ? "max-w-lg" : "max-w-sm";

  return (
    <div className={showVisual ? "flex min-h-screen flex-1 md:grid md:grid-cols-2" : "flex min-h-screen flex-1"}>
      <div
        className="flex flex-1 items-center justify-center px-4 py-10"
        style={getAuthThemeStyle(vertical)}
      >
        <GlassPanel strong className={`w-full ${panelWidth} rounded-2xl p-6 shadow-xl sm:p-8`}>
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <VerticalAuthBrand vertical={vertical} />
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                {title}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
            </div>
          </div>
          {children}
        </GlassPanel>
      </div>

      {showVisual && (
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
      )}
    </div>
  );
}
