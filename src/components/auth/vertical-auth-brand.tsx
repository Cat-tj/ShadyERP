import Image from "next/image";
import type { CSSProperties } from "react";
import { DEFAULT_THEME, type VerticalDef } from "@/lib/verticals";

export function getAuthThemeStyle(vertical?: VerticalDef): CSSProperties {
  const theme = vertical?.theme ?? DEFAULT_THEME;

  return {
    "--color-primary": theme.primary,
    "--color-primary-dark": theme.deep,
    backgroundColor: theme.background,
    backgroundImage: `
      radial-gradient(1000px 620px at 8% -5%, color-mix(in srgb, ${theme.primary} 22%, transparent) 0%, transparent 60%),
      radial-gradient(900px 560px at 100% 0%, color-mix(in srgb, ${theme.accent} 20%, transparent) 0%, transparent 55%),
      radial-gradient(800px 700px at 50% 120%, color-mix(in srgb, ${theme.soft} 82%, transparent) 0%, transparent 60%)
    `,
  } as CSSProperties;
}

export function VerticalAuthBrand({ vertical }: { vertical?: VerticalDef }) {
  const source = vertical ? `/brand/${vertical.key}-symbol-onlight.svg` : "/brand/altora-purple-symbol.svg";
  const label = vertical?.label ?? "Altora";

  return (
    <div className="flex flex-col items-center gap-2">
      <Image src={source} alt={label} width={112} height={112} priority className="h-28 w-28 object-contain" />
      {vertical && <span className="text-xs font-semibold text-[var(--color-primary)]">{vertical.label}</span>}
    </div>
  );
}
