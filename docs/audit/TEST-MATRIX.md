# Test Matrix

## Database integration environment (required before promotion)

Use a dedicated PostgreSQL database and a separate shadow database. Never point these values at
Supabase production or the VPS production database:

```text
DATABASE_URL=postgresql://.../altora_integration
DIRECT_URL=postgresql://.../altora_integration
SHADOW_DATABASE_URL=postgresql://.../altora_integration_shadow
```

The test database must run `prisma migrate deploy` before every integration suite and be dropped
or truncated after it. The current local runtime has neither PostgreSQL nor Docker, so this suite
is intentionally not claimed as executed. Migration-directory diff also requires a configured
`datasource.shadowDatabaseUrl`; a dummy URL is not valid evidence.

Required integration cases:

1. Tenant A cannot read/update/delete supplier, document, PO, receipt, count, transfer, sale, or member from tenant B.
2. Two concurrent checkout requests using one idempotency key produce one Sale, one stock decrement, and one journal source line per event.
3. Two concurrent requests with different checkout keys cannot push tracked stock below zero.
4. Two concurrent opens for one cashier yield one open shift; two closes yield one closing result.
5. Reposting a completed sale or expense creates no duplicate `JournalEntry.sourceKey`.

| Area | Unit | Integration | Concurrency | E2E |
|---|---|---|---|---|
| Tenant isolation | DTO/guard | tenant A cannot read/write B | mutation race | staff role flow |
| POS | pricing/tax/promo | checkout/void/return/split | double checkout/invoice | cashier close shift |
| Inventory | recipe/FEFO | receipt/transfer/count | stock decrement | receive stock |
| Accounting | balanced lines/reversal | sale/payment/AP | duplicate posting | finance close |
| Billing | plan limits | signed webhook | replay webhook | upgrade/cancel |
| Offline | queue parser | scoped retry | duplicate sync | conflict UI |

Current tooling: Playwright exists (`test:e2e`). The PostgreSQL integrity suite is implemented at `src/server/services/erp-integrity.integration.test.ts` and runs through `npm run test:integration`; it is intentionally opt-in so unit runs never connect to a database.
