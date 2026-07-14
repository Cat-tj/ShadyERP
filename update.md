# Update Handover - 14 Juli 2026

Commit GitHub: `c9d085c` (`codex/erp-audit-baseline`)

Dokumen ini adalah peta singkat untuk agent berikutnya. Detail audit, roadmap, dan catatan perubahan per sesi berada di folder `docs/`.

## 1. Landing Page: Business Showcase

Showcase jenis usaha lama yang memakai satu mockup generik telah diganti menjadi screen workflow independen untuk 10 bisnis: Cafe, Toko, Supermarket, Laundry, Counter, Jasa, Pabrik, Company, Teams, dan Accounting.

- Entry point: `src/components/landing/business-showcase/business-showcase.tsx`
- Tab aksesibel: `src/components/landing/business-showcase/business-tabs.tsx`
- Data pemetaan bisnis/stage: `src/components/landing/business-showcase/showcase-data.ts`
- Screen tiap bisnis: `src/components/landing/business-showcase/*-phone.tsx`
- Primitive device/mockup: `src/components/landing/business-showcase/shared.tsx`
- Integrasi landing: `src/components/landing/landing-content.tsx`
- Styling: `src/app/landing.css`
- Screenshot validasi: `docs/landing-showcase-screenshots/`

Keputusan UX: tidak ada auto-rotation. Pengunjung mengontrol tab agar konteks bacaan tidak berpindah sendiri. Tab mendukung klik, Arrow Left/Right, Home, dan End; pada mobile tab horizontal scroll dan frame desktop/tablet disembunyikan.

## 2. POS dan Panduan Pengguna

POS telah menerima perapian layout responsif, serta dokumentasi pengguna yang siap dibagikan.

- POS: `src/components/kasir/pos-screen.tsx`
- Payment flow: `src/components/kasir/payment-sheet.tsx`
- Panduan Markdown: `docs/panduan-pengguna/PANDUAN-OPERASIONAL.md`
- Panduan PDF/DOCX: `docs/panduan-pengguna/`
- Generator panduan: `scripts/generate-user-guide.py`
- Screenshot POS: `docs/panduan-pengguna/screenshots/`

## 3. ERP, Data Integrity, dan Keamanan

Perubahan backend berfokus pada pembatasan tenant, validasi input, audit log, idempotensi transaksi, invoice sequence, PIN karyawan, dokumen/e-sign, supplier, billing, dan shift kasir.

- Prisma schema dan migrasi: `prisma/schema.prisma`, `prisma/migrations/`
- Service ERP: `src/server/services/`
- Guard session dan auth: `src/server/require-session.ts`, `src/lib/auth.ts`, `src/lib/auth.config.ts`
- Validasi: `src/server/validation/`
- Runtime config: `src/lib/runtime-config.ts`
- Unit/integration test: `src/**/*.test.ts`
- Konfigurasi test: `vitest.config.ts`

Catatan: `npm run test:unit` sekarang mengecualikan file `*.integration.test.ts` secara default. Integration test hanya dijalankan saat `RUN_INTEGRATION_TESTS=true` dan database test sudah tersedia.

## 4. Audit dan Rencana Lanjutan

- Ringkasan temuan: `docs/audit/EXECUTIVE-SUMMARY.md`
- Temuan lengkap: `docs/audit/FULL-FINDINGS.md`
- Status implementasi: `docs/audit/IMPLEMENTATION-STATUS.md`
- Target architecture: `docs/audit/ARCHITECTURE-TARGET.md`
- Migrasi dan rollout: `docs/audit/MIGRATION-PLAN.md`, `docs/audit/PRODUCTION-ROLLOUT.md`
- Roadmap produk: `Roadmap.md`
- Update per sesi Codex: `docs/codex-updates/`

## 5. Validasi Terakhir

Sudah dijalankan sebelum commit:

- `npx tsc --noEmit`
- `npm run test:unit` - 5 test files, 15 tests lulus
- `npm run build`
- Audit responsive showcase pada 360, 390, 430, 768, 1024, 1280, 1440, dan 1920 px tanpa horizontal overflow
- Validasi 10 tab showcase dan navigasi keyboard

Lint landing tidak memiliki error. Tersisa dua warning lama `@next/next/no-img-element` di `src/components/landing/landing-content.tsx`.

## 6. Status GitHub dan Deployment

- Branch GitHub: `codex/erp-audit-baseline`
- Draft pull request: `https://github.com/Cat-tj/ShadyERP/pull/3`
- Update ini belum di-merge ke branch deployment dan belum di-deploy ke VPS oleh commit ini.
- Folder `tmp/` sengaja tidak di-commit karena hanya artefak render sementara.
