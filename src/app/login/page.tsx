import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";
import { getRequestVertical } from "@/lib/request-vertical";

export async function generateMetadata(): Promise<Metadata> {
  const vertical = await getRequestVertical();
  const label = vertical?.label ?? "Altora";
  const icon = vertical ? `/brand/${vertical.key}-symbol-onlight.svg` : "/brand/altora-purple-symbol.svg";

  return { title: `Masuk - ${label}`, icons: { icon } };
}

export default async function LoginPage() {
  const vertical = await getRequestVertical();
  const label = vertical?.label ?? "Altora";
  const subtitle = vertical
    ? `Masuk untuk mengelola operasional ${label.replace("Altora ", "").toLowerCase()} Anda.`
    : "Kelola kasir, produk, dan karyawan tokomu.";

  return (
    <AuthShell vertical={vertical} title={`Masuk ke ${label}`} subtitle={subtitle} showVisual>
      <LoginForm />
    </AuthShell>
  );
}
