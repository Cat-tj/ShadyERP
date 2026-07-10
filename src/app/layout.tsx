import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Altora — Kasir & Manajemen Toko",
  description: "Aplikasi kasir, member, dan absensi untuk UMKM Indonesia.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Altora",
  },
};

export const viewport: Viewport = {
  themeColor: "#a730a8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
        <SpeedInsights />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
