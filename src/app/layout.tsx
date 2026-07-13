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

const metaTitle = "Altora — ERP Ringan untuk Kasir, Stok, Keuangan, dan Laporan Bisnis";
const metaDescription =
  "Kelola kasir, stok, pelanggan, hutang-piutang, dan laporan dalam satu aplikasi. Satu transaksi memperbarui seluruh operasional bisnis secara otomatis.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  metadataBase: new URL("https://www.altora.my.id"),
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Altora POS & ERP",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.altora.my.id",
    siteName: "Altora",
    title: metaTitle,
    description: metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: metaTitle,
    description: metaDescription,
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
              "description": metaDescription,
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
