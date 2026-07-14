# Architecture Target

## Command Boundary
`request -> authenticated actor -> permission -> tenant/foreign-id guard -> state validation -> idempotency -> serializable transaction -> fact + outbox -> consequences`.

## Source of Truth
- `StockMovement` append-only menjadi ledger; `ProductStock` adalah projection/reconciliation target.
- `Payment` append-only menjadi ledger; Sale menyimpan total/snapshot, bukan satu-satunya bukti pembayaran.
- `JournalEntry` + `JournalLine` balanced menjadi ledger accounting; reversal, bukan delete.
- Point/gift-card menggunakan ledger dan saldo sebagai projection.

## Authorization
Tenant-scoped repositories, permission granular, DTO explicit, session version, audit action, dan foreign-ID guards. RLS PostgreSQL dievaluasi setelah service guards + test telah stabil.

## UX
Navigasi pekerjaan: Operasional, Keuangan, Tim, Pengaturan. Exception inbox dan next valid action menggantikan tombol status arbitrer.
