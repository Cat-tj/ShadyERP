# ShadyERP — Kasir & Manajemen Toko untuk UMKM

SaaS untuk UMKM Indonesia (coffee shop, barbershop, toko kecil): kasir/POS, member
kartu QR, absensi karyawan, dan laporan, dalam satu aplikasi web multi-tenant.

## Menjalankan secara lokal

```bash
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts   # opsional: isi data demo
npm run dev
```

Buka http://localhost:3000.

## Akun demo

Setelah menjalankan `prisma/seed.ts`, gunakan akun berikut (tenant "Kopi Nusantara"):

| Peran   | Email            | Kata sandi  |
| ------- | ---------------- | ----------- |
| Owner   | owner@demo.id    | password123 |
| Manager | manager@demo.id  | password123 |
| Staff   | staff1@demo.id   | password123 |
| Staff   | staff2@demo.id   | password123 |

## Teknologi

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma ORM dengan SQLite
(driver adapter `better-sqlite3`), Auth.js (NextAuth v5) untuk login.
