# Production Rollout - Hardening Wave 1

This release changes authentication, POS retry behavior, and accounting persistence. It must be
promoted as one reviewed release, never by copying individual files to the VPS.

## Current production history reconciliation

Production has schema changes from the 2026-07-10 through 2026-07-12 migration batch without
the matching Prisma history rows. A VPS-local PostgreSQL 17 clone restored from the verified
production backup rehearsed the recovery successfully:

1. Restore the historical `20260706102200_add_laundry_orders` migration file whose checksum
   matches the row already present in production.
2. Mark the pre-existing 2026-07-10 through 2026-07-12 schema migrations as applied with
   `prisma migrate resolve --applied` only after verifying the database-to-schema diff is empty.
3. Run `prisma migrate deploy` to apply the six new hardening migrations.
4. Deploy the matching application code, then run `npm run db:backfill-legacy-pins`.

The rehearsal completed with 65 migrations, an empty database-to-schema diff, the integrity
suite passing, and the PIN-backfill rehearsal succeeding. Use the audited commit containing the
restored historical migration; do not run this sequence from an arbitrary checkout.

## Included migrations

1. `20260713221000_add_user_pin_hash`
2. `20260713222000_add_user_session_version`
3. `20260713223000_add_sale_idempotency_key`
4. `20260713224000_add_journal_source_key`
5. `20260713225000_enforce_one_open_shift`
6. `20260713226000_add_invoice_sequence`

## Preflight

1. Confirm the exact release commit and working tree are clean.
2. Take a tested PostgreSQL/Supabase backup and record its restore point.
3. Confirm `DATABASE_URL`, `AUTH_SECRET`, and production base URL are set on the target.
4. Run `npm ci`, `npm run verify:release`, and `npx prisma migrate status` against a non-production
   clone first. Do not use a production database as the test database.
5. Schedule a short cashier maintenance window. Existing open browser sessions will be invalidated
   after affected users are changed or after the session version migration is used by the new app.

## Release order

1. Put the application in maintenance/read-only mode if available; stop new checkout at the cashier.
2. Deploy the reviewed application revision without starting traffic yet.
3. Run `npx prisma migrate deploy` once against production.
4. Run `npm run db:backfill-legacy-pins` once.
5. Start the application and run the smoke checks below.

## Smoke checks

1. Sign in as owner and cashier; create a user with a six-digit PIN, then edit the user without a
   PIN. Confirm no stored PIN is shown in UI or network payload.
2. Change a test user's password or deactivate it; confirm its existing session redirects to login.
3. Submit a test POS sale with a captured idempotency key, resend the exact request, and confirm
   one Sale, one stock decrement, one set of JournalEntry source keys, and one receipt only.
4. Verify a document URL as an unrelated same-tenant staff user; it must return the not-found view.
5. Confirm a normal sale, a split payment sale, and an offline queued sale can complete.

## Database verification queries

Run read-only queries adapted to the production database console:

```sql
SELECT COUNT(*) AS plaintext_pins FROM "User" WHERE "pin" IS NOT NULL;
SELECT COUNT(*) AS missing_pin_hash FROM "User" WHERE "pin" IS NULL AND "pinHash" IS NULL;
SELECT "tenantId", "idempotencyKey", COUNT(*)
FROM "Sale"
WHERE "idempotencyKey" IS NOT NULL
GROUP BY "tenantId", "idempotencyKey"
HAVING COUNT(*) > 1;
SELECT "tenantId", "sourceKey", COUNT(*)
FROM "JournalEntry"
WHERE "sourceKey" IS NOT NULL
GROUP BY "tenantId", "sourceKey"
HAVING COUNT(*) > 1;
```

The last two queries must return zero rows. Investigate invalid legacy PINs before clearing the old
column; do not alter or delete them silently.

## Rollback

1. If migration/backfill fails, stop application traffic and restore the database from the recorded
   backup or use the provider point-in-time restore procedure.
2. Do not roll back only the application after successful schema migration: the older Prisma client
   does not know the new model mapping. Restore both application revision and database together.
3. Preserve application logs, failed migration output, and affected idempotency keys for review.

## Explicit non-goals for this rollout

- No destructive removal of the legacy PIN column.
- No automatic repair of financial or stock discrepancies.
- No VPS deployment until a human reviews the migration plan and backup evidence.
