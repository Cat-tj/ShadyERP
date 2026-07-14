# Migration Plan

## PIN storage migration (active)

The existing `pin` column remains temporarily mapped as `legacyPin`; new PINs are stored in
`pinHash`. Roll it out in this exact order during a maintenance window:

1. Take a database backup and verify the application revision is the release candidate.
2. Run `npx prisma migrate deploy`.
3. Run `npm run db:backfill-legacy-pins` once, with the production `DATABASE_URL`.
4. Verify no legacy values remain and every migrated value has a hash.
5. Smoke-test employee creation, employee edit without changing PIN, and employee PIN reset.

Do not run the backfill against a development or unknown database. Removing the legacy column is
a separate production-verified migration after the agreed retention period.

1. **Security baseline:** DTO explicit, tenant guards, PIN hash migration, session version/revocation, document ACL, tenant isolation tests.
2. **Transaction foundation:** idempotency key + command envelope + audit/outbox schema, tanpa mengubah behavior lama sekaligus.
3. **POS/shift/inventory:** sale orchestrator, conditional stock decrement, payment ledger, invoice counter atomik.
4. **Accounting:** balanced journal lines, posting service, reversal and period lock.
5. **Procurement:** PO/receipt/count/transfer state machine dan stock movement.
6. **Billing/loyalty:** source plan tunggal, webhook idempotent, ledger poin/gift card.
7. **Service modules:** laundry/booking/catering memakai payment command bersama.
8. **Offline/UI/observability:** queue scoped, conflict workflow, feature registry, logging, release gates.

Setiap langkah: migration review -> backfill -> dual read/write bila diperlukan -> reconciliation -> cutover -> rollback plan.
