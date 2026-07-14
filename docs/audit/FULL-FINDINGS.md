# Full Findings

| ID | Severity | Domain | Lokasi | Status | Ringkasan |
|---|---|---|---|---|---|
| P0-SEC-001 | P0 | Tenant isolation | `src/server/services/supplier-service.ts:38` | Fixed locally, test pending | `update` berdasarkan ID global dapat mengubah supplier lintas tenant. |
| P1-SEC-002 | P1 | Credential | `prisma/schema.prisma:227`, `user-service.ts` | Open | PIN kasir plain text dan ikut masuk DTO UI. |
| P1-SEC-003 | P1 | Authentication | `src/lib/auth.config.ts:10` | Open | JWT tidak dapat dicabut ketika role/password/status berubah. |
| P1-TXN-001 | P1 | POS/Stock | `src/server/services/sale-service.ts:194-221` | Open | Read-check stock tanpa conditional decrement memungkinkan race/oversell. |
| P1-TXN-002 | P1 | Pricing | `src/server/services/sale-service.ts:233-238` | Open | `unitPriceOverride` perlu capability internal dan reason/audit. |
| P1-DATA-001 | P1 | Inventory | `ProductStock` dan service inventory | Open | Belum ada stock movement ledger tunggal sebagai source of truth. |
| P1-FIN-001 | P1 | Financial | `sale-service`, `accounting-service` | Open | Sale/payment/accounting belum dibuktikan memiliki satu orchestrator dan idempotency boundary. |
| P2-OPS-001 | P2 | Deployment | VPS deploy script | Fixed on VPS | Teams sekarang dibangun dari monorepo yang sama dengan aplikasi utama. |
| P2-QA-001 | P2 | Quality | `npm run lint` | Open | 18 lint error menghalangi release gate. |
| P2-SEC-004 | P2 | Authorization | multiple services | Open | Pencarian ID-only mutasi harus diaudit satu per satu; jangan disamaratakan sebagai aman. |

## P0-SEC-001 Detail
Skenario: actor tenant A mengirim ID supplier tenant B ke action update. Implementasi lama menggunakan `prisma.supplier.update({ where: { id }})`, lalu menulis `tenantId` milik A. Ini memungkinkan perubahan/relasi lintas tenant.

Perbaikan: `updateMany({ where: { id, tenantId }})`, menolak `count !== 1`, dan DTO allowlist tidak menerima `tenantId`, `id`, atau field sistem.

Validasi: build TypeScript/Next lulus. Test isolasi dua tenant masih wajib dibuat sebelum rilis.
