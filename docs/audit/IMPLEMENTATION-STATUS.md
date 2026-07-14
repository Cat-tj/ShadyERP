# Hardening Implementation Status

Updated: 2026-07-13

## Implemented locally and validated

- Supplier update is tenant-scoped and does not accept `tenantId` mutations.
- User lists do not expose password/PIN fields; new PINs use bcrypt `pinHash`.
- User session versions invalidate stale sessions after credential, role/outlet, or active-state changes.
- Document detail is access-controlled by uploader, signer, explicit user, or role; document actions use `requireSession`.
- Supplier, PO, stock receipt, and stock count actions use revocation-aware session guards.
- POS stock decrement is conditional on current quantity and transaction rollback prevents negative balance.
- POS client payload cannot provide internal unit-price overrides.
- POS retry idempotency key is stored tenant-scoped and retained by both online payment attempts and the offline queue.
- Automatic journal posting has stable source keys for sale revenue/discount/COGS and expenses.
- One open shift per tenant/user is enforced by database partial unique index; close is conditional.
- POS invoice numbers use atomic tenant/outlet/day sequences.
- Health endpoint identifies missing runtime configuration without leaking secret values.

## Validation evidence

- `npm run lint`: 0 errors, warnings remain.
- `npm run test:unit`: 15 tests pass.
- `npm run build`: production Next build passes with non-production configuration values.
- Prisma client generation passes against the current schema.
- A VPS-local PostgreSQL 16 database, bound to localhost only, applied all 64 migrations successfully and passed the four-case tenant/concurrency integrity suite.
- A PostgreSQL 17 clone restored from the production backup reconciled the historical migration drift, applied all 65 migrations, produced an empty schema diff, and passed the integrity suite plus PIN-backfill rehearsal.
- `git diff --check` passes with no whitespace errors.

## Required before promotion

1. Apply the rehearsed migration-history reconciliation and six hardening migrations to production from the audited commit.
2. Deploy the matching application code, then run the legacy PIN backfill and verify its results.
3. Run manual production smoke tests for POS retry, shift reconciliation, document ACL, and session revocation.
4. Review remaining architecture work: balanced journal/reversal model, stock movement ledger, PO counter/state-machine coverage, billing webhook validation, and offline conflict workflow.

## Do not claim yet

- This is not a production security certification.
- Financial ledger balance/reversal, comprehensive cross-tenant coverage for every module, and E2E smoke coverage are incomplete.
- No migration, commit, push, or VPS deployment has been performed from this audit worktree.
