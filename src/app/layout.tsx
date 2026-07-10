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
  title: "Altora POS & ERP — Kasir & Manajemen Toko UMKM",
  description: "Altora adalah aplikasi POS & ERP toko terlengkap untuk UMKM Indonesia. Kelola kasir, stok, absensi karyawan, dan laporan keuangan secara real-time.",
  metadataBase: new URL("https://www.altora.my.id"),
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Altora POS & ERP",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Altora POS & ERP",
              "url": "https://www.altora.my.id",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "description": "Altora adalah aplikasi POS & ERP toko terlengkap untuk UMKM Indonesia. Kelola kasir, stok, absensi karyawan, dan laporan keuangan secara real-time.",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "IDR",
              },
              "author": {
                "@type": "Organization",
                "name": "Altora",
                "url": "https://www.altora.my.id",
                "logo": "https://www.altora.my.id/icon.svg"
              }
            })
          }}
        />
        <SpeedInsights />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
