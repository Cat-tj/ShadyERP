import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Altora — Kasir & Manajemen Toko",
    short_name: "Altora",
    description: "Aplikasi kasir, member, dan absensi untuk UMKM Indonesia.",
    start_url: "/pilih-aplikasi",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#082145",
    icons: [
      { src: "/brand/altora-symbol.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
