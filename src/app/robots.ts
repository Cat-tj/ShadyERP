import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register", "/kasir/"],
      disallow: [
        "/api/", 
        "/dashboard/", 
        "/kasir/riwayat",
        "/kasir/tutup",
        "/kasir/struk/",
        "/hris/", 
        "/inventory/", 
        "/kpi/", 
        "/finance/",
        "/pengaturan/",
        "/pilih-aplikasi/",
        "/simple/",
        "/absensi/",
        "/akun",
        "/onboarding",
        "/produk/",
        "/member/",
        "/laporan/",
        "/tim/",
        "/superadmin/",
      ],
    },
    sitemap: "https://www.altora.my.id/sitemap.xml",
  };
}
