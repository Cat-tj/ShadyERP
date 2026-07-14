# Security Threat Model

## Assets
Data tenant, credentials/PIN, transaksi/kas, dokumen, member PII, billing webhook, dan superadmin access.

## Threat Actors
Staff tenant biasa, user tenant lain yang mengetahui ID, perangkat POS hilang, attacker replay request/webhook, dan superadmin session hijack.

## Control yang Dibutuhkan
- `tenantId` predicate pada setiap read/write, validasi foreign ID, integration test cross-tenant.
- Minimal DTO client; never serialize hash/PIN/token.
- Hash PIN, rate limit login/PIN, sessionVersion dan revoke sessions pada mutation sensitif.
- Permission granular dan audit log dengan actor/request ID.
- Signed/idempotent webhook, verified trusted proxy, CSP/cookie secure config review.

## Residual Risk
RLS belum dievaluasi/dihidupkan. ID-only mutation search belum ditutup seluruhnya. Jangan mengklaim data isolation selesai.
