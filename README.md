# Altora — Kasir & Manajemen Toko untuk UMKM

SaaS untuk UMKM Indonesia (coffee shop, barbershop, toko kecil): kasir/POS, member
kartu QR, absensi karyawan, dan laporan, dalam satu aplikasi web multi-tenant.

## Menjalankan secara lokal

Butuh database PostgreSQL (lokal atau layanan seperti Supabase). Salin
`.env.example` ke `.env` dan isi `DATABASE_URL` serta `AUTH_SECRET`.

```bash
npm install
npx prisma migrate dev
npm run seed   # opsional: isi data demo
npm run dev
```

Buka http://localhost:3000.

## Deploy ke Vercel + Supabase

1. Buat project baru di [Supabase](https://supabase.com/dashboard), ambil connection
   string dari Settings → Database.
2. Di Vercel, import repo ini lalu isi environment variables: `DATABASE_URL`
   (connection string Supabase) dan `AUTH_SECRET` (string acak panjang).
   `AUTH_URL`/`NEXTAUTH_URL` sengaja TIDAK diisi — Auth.js mendeteksi domain
   otomatis dari request (`trustHost: true`), jadi tetap jalan baik di domain
   produksi maupun preview URL.
3. Build otomatis menjalankan `prisma generate && prisma migrate deploy` sebelum
   `next build`, jadi skema database ikut ter-update tiap deploy.
4. Jalankan `npm run seed` sekali secara manual (misal dari lokal, dengan
   `DATABASE_URL` diarahkan ke Supabase) untuk mengisi data demo.

## Akun demo

Setelah menjalankan `npm run seed`, gunakan akun berikut (tenant "Kopi Nusantara"):

| Peran   | Email            | Kata sandi  |
| ------- | ---------------- | ----------- |
| Owner   | owner@demo.id    | password123 |
| Manager | manager@demo.id  | password123 |
| Staff   | staff1@demo.id   | password123 |
| Staff   | staff2@demo.id   | password123 |

## Teknologi

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma ORM dengan PostgreSQL
(driver adapter `pg`), Auth.js (NextAuth v5) untuk login.
