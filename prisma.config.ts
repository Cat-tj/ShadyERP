import path from "node:path";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Migrasi butuh koneksi langsung (bukan lewat pgbouncer/transaction pooler),
    // karena schema engine pakai advisory lock yang tidak didukung mode pooling.
    // DIRECT_URL dipakai kalau ada (mis. Supabase); fallback ke DATABASE_URL untuk dev lokal.
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});
