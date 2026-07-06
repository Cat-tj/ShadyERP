import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      // Default 1mb terlalu kecil untuk upload dokumen (PDF/Word/Excel).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
