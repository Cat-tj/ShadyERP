import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://altora.my.id";
  
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register"],
      disallow: [
        "/api/", 
        "/dashboard/", 
        "/kasir/", 
        "/hris/", 
        "/inventory/", 
        "/kpi/", 
        "/finance/",
        "/pengaturan/",
        "/pilih-aplikasi/"
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
