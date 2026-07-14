# Architecture Current

## Stack
- Next.js 16 App Router + React 19 + TypeScript.
- Prisma 7 + PostgreSQL/Supabase.
- NextAuth Credentials dengan JWT untuk tenant user; sesi superadmin terpisah.
- Tailwind 4; Playwright tersedia, namun belum ada script unit/integration test.
- Aplikasi Teams adalah Next.js package di `apps/altora-teams-landing` dan kini dideploy dari monorepo.

## Domain
Tenant/Outlet/User, POS/Sale/SalePayment/Shift, Product/ProductStock/Recipe/Batch/Serial, Supplier/PO/Receipt/Count/Transfer, Accounting, Member/Promo/GiftCard, Laundry/Booking/Catering, HR/Attendance, Document, Billing/Subscription.

## Boundary Saat Ini
Server Actions memanggil service Prisma. `requireSession` memuat tenant aktif per request, tetapi sebagian service menerima `tenantId` sebagai parameter dan masih membutuhkan guard konsisten pada setiap foreign ID.

## Sumber Kebenaran Saat Ini
- Stok: `ProductStock.qty` dengan proses tambahan batch/serial; belum ledger tunggal.
- Pendapatan/pembayaran: `Sale` dan `SalePayment`; perlu rekonsiliasi resmi terhadap shift/journal.
- Kas: shift/cash-out/cash-flow; perlu aturan drawer vs digital.
- Akuntansi: journal service; perlu invariant debit=credit dan reversal formal.
- Subscription: Tenant dan Subscription keduanya ada; sinkronisasi harus diaudit.
