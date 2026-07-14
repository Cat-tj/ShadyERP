# Altora Audit Work Queue

Dokumen ini adalah loop eksekusi. Agent tidak boleh melompat ke wave berikutnya sebelum gate wave saat ini hijau. Status hanya boleh menjadi `[x]` bila bukti command/test ditulis di bawah item.

## Aturan Loop

1. Ambil satu ticket paling atas yang belum selesai.
2. Tulis invariant dan skenario gagal sebelum menyentuh kode.
3. Tambah/ubah test yang dapat gagal pada implementasi lama.
4. Implementasikan perubahan paling kecil yang menutup invariant.
5. Jalankan gate wave: lint, build, test target, dan migration review jika schema berubah.
6. Catat hasil, file, migration, dan rollback di `docs/codex-updates/`.
7. Baru tandai `[x]`, commit, lalu lanjut ticket berikutnya.
8. Tidak deploy ke VPS bila release gate merah atau migration belum ditinjau.

## Wave 0 - Release Baseline

- [x] W0.1 Buat test runner unit/integration dengan database test terisolasi.
  - Evidence: `npm run test:integration` ran against VPS-local PostgreSQL 16 bound to localhost; all 64 migrations and 4 integrity tests passed.
- [x] W0.2 Bersihkan 18 lint error yang terbukti oleh baseline.
  - Evidence: `npm run lint` now exits 0 (23 non-blocking warnings remain).
- [ ] W0.3 Tambah `verify:release` yang menjalankan lint, build, test unit/integration, dan E2E smoke.
  - Progress: `verify:release` now includes lint, unit, database integration, and build. E2E smoke is still required.

## Wave 1 - Security and Tenant Isolation

- [x] W1.1 P0 supplier update guard.
  - Evidence: `src/server/services/supplier-service.ts` uses `updateMany({ id, tenantId })`.
- [ ] W1.2 Tenant guard helper untuk foreign IDs: outlet, product, category, supplier, member, staff, receipt, transfer.
- [ ] W1.3 Integration matrix tenant A vs tenant B untuk read, update, delete, completion.
  - Progress: real PostgreSQL coverage proves cross-tenant supplier read/update and sale read denial. Broaden to every listed entity before promotion.
- [ ] W1.4 PIN hash migration, no PIN in DTO/client, PIN verify endpoint rate limited.
  - Progress: `pinHash` migration and controlled bcrypt backfill exist. Production migration verification and the future PIN verification endpoint's rate limit remain.
- [x] W1.5 Session version + invalidation on password/role/isActive change.
  - Evidence: `User.sessionVersion` is embedded at sign-in and checked by `require-session`; user mutations increment it.
- [ ] W1.6 Document ACL hardening dan object-storage migration plan.
  - Progress: document detail now enforces uploader/signer/explicit user-or-role access and document actions use revocation-aware `requireSession`. Object storage migration and ACL integration tests remain.
- [ ] W1.7 Superadmin sensitive-action re-auth + session revocation architecture.

## Wave 2 - Commands and Idempotency

- [ ] W2.1 Command envelope: actor, tenant, request ID, idempotency key, audit metadata.
- [x] W2.2 Unique idempotency storage and conflict response semantics.
  - Evidence: tenant-scoped database key, online payment-attempt key, offline queue retention, and a real concurrent checkout test converge to one Sale and one stock decrement.
- [ ] W2.3 Apply to checkout, offline sync, receipt completion, stock count, supplier payment, point/gift-card redemption, billing webhook.
- [x] W2.4 Add concurrency tests for double submit/retry.
  - Evidence: `erp-integrity.integration.test.ts` passes same-key checkout, distinct-key stock race, and open-shift race against PostgreSQL.

## Wave 3 - POS, Shift, Stock

- [ ] W3.1 Single sale orchestrator; server derives price, promo, tax, channel markup, totals.
- [x] W3.2 Conditional atomic stock decrement and no-negative-stock policy.
  - Evidence: tenant-scoped `qty >= needed` decrement is proven by a real two-request PostgreSQL race that leaves stock at zero and only one completed sale.
- [ ] W3.3 Payment ledger + split payment invariant.
- [ ] W3.4 Invoice/PO/database counters atomically allocated.
  - Progress: POS invoice allocation uses a tenant/outlet/day sequence upsert instead of counting sales. PO and other document counters remain.
- [ ] W3.5 Shift outlet assignment, one-open-shift constraint, atomically close drawer cash vs digital.
  - Progress: outlet is tenant-validated, PostgreSQL allows only one concurrent OPEN shift, and close uses conditional state transition. Full transactional cash/digital reconciliation test remains.
- [ ] W3.6 Append-only stock movement ledger plus reconciliation against ProductStock.

## Wave 4 - Accounting and Procurement

- [ ] W4.1 JournalEntry/JournalLine balance invariant and reversal service.
- [ ] W4.2 Accounting posting only via source-event/idempotency service.
  - Progress: automatic sale and expense postings use tenant-scoped unique `sourceKey`, preventing retry duplicates. Balanced multi-line journal and reversal workflow remain.
- [ ] W4.3 PO, receipt QC, transfer, and count state machines.
- [ ] W4.4 Batch FEFO, recipe snapshot, count variance cost policy.

## Wave 5 - Billing, Loyalty, Service Modules

- [ ] W5.1 Single subscription plan source and enforced limits.
- [ ] W5.2 Signed, fresh, amount-validated billing webhook.
  - Progress: webhook HMAC now has a five-minute freshness window and timing-safe compare; paid invoice payment-link, amount, and currency must match; payment history is retry-safe by payment-link upsert. Integration/provider fixture tests remain.
- [ ] W5.3 Point/gift-card ledger with atomic redemption.
- [ ] W5.4 Laundry, booking, catering use shared payment command.

## Wave 6 - Offline, UX, Observability

- [ ] W6.1 Offline queue scoped to tenant/user/device with idempotency key and conflict state.
- [ ] W6.2 Feature registry unifies route/module/permission/navigation.
- [ ] W6.3 Exception inbox and role-based home.
- [ ] W6.4 Structured logs: request, tenant, actor, command, source ID.
- [ ] W6.5 Health, backup/restore, deployment, and environment validation docs.

## Release Gate Evidence

| Gate | Current | Required |
|---|---:|---|
| Lint | Green (23 warnings) | Green |
| Build | Green | Green |
| Unit tests | Green (15 tests) | Green + broader coverage |
| Integration tenant tests | Green (supplier/sale boundary) | Broaden to every entity |
| Concurrency tests | Green (checkout/stock/shift) | Broaden to close/journal |
| E2E smoke | Missing | Green |
| Migration review | Manual | Required per migration |
