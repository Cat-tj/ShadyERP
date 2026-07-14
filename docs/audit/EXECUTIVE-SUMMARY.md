# Altora ERP Audit - Executive Summary

Status: baseline audit, 13 Juli 2026. Audit belum selesai dan tidak boleh dianggap sebagai sertifikasi keamanan.

## Kesimpulan
Altora sudah memiliki pondasi yang baik untuk aplikasi modular: Next.js App Router, Prisma/PostgreSQL, NextAuth credentials, service layer, tenantId pada domain utama, serta aplikasi Teams berada di monorepo. Namun fondasi transaksi dan tenant isolation belum cukup seragam untuk menerima penambahan fitur besar dengan aman.

## Risiko Prioritas
- **P0-SEC-001 - fixed locally:** mutasi supplier memakai ID global tanpa predicate tenant. Sudah diubah menjadi update atomik dengan `id + tenantId` dan allowlist field.
- **P1-SEC-002:** PIN kasir disimpan dan dikirim sebagai plain text. Lihat `prisma/schema.prisma:227` dan UI pengaturan karyawan.
- **P1-SEC-003:** sesi JWT membawa role/tenant statis; perubahan role, password, atau status user belum memiliki mekanisme session version/revocation.
- **P1-TXN-001:** checkout memeriksa stok lalu mengubahnya dalam transaksi biasa; perlu conditional atomic decrement/locking serta idempotency key.
- **P1-TXN-002:** harga override tersedia pada input sale dan harus dibatasi ke command internal yang tervalidasi server-side.
- **P1-QA-001:** `npm run lint` gagal dengan 18 error. `npm run build` lulus dengan URL database dummy dan tidak melakukan koneksi database.

## Keputusan
1. Tahan fitur besar baru sampai Milestone 1-3 selesai.
2. Buat tenant-scoped repository/guard dan idempotency foundation sebelum refactor semua alur sale.
3. Jadikan ledger stok, payment ledger, dan journal posting sebagai sumber kebenaran yang dapat direkonsiliasi.
