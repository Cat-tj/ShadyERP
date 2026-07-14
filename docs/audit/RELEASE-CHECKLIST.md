# Release Checklist

## Hardening wave 1

- [ ] Reviewed [production rollout](PRODUCTION-ROLLOUT.md) and migration SQL.
- [ ] Backup/restore point recorded.
- [ ] `npm run verify:release` green on release revision.
- [ ] Migrations applied exactly once.
- [ ] Legacy PIN backfill completed and verified.
- [ ] POS retry, session revocation, document ACL, and shift smoke checks pass.
- [ ] Rollback owner and escalation path confirmed.
- [ ] `/api/health` returns `ok: true` after deployment and does not report missing runtime configuration.

- [ ] `npm run lint` zero error.
- [ ] Typecheck/build lulus dengan production env validation.
- [ ] Migration reviewed, reversible/backfill plan tersedia.
- [ ] Tenant isolation tests lulus.
- [ ] Critical command idempotency/concurrency tests lulus.
- [ ] Stock/payment/journal reconciliation checked.
- [ ] No password hash, PIN, token, or secret in client payload.
- [ ] Security review untuk changed actions/API routes.
- [ ] Backup/restore verified dan deployment rollback documented.
- [ ] Landing claims sesuai fitur aktif.
