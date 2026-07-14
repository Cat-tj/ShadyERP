# To-Do: Modul Altora Pabrik (Manufaktur)

> Kerja loop: implementasi → build & typecheck hijau → verifikasi manual (kalau ada UI) →
> commit & push → centang di sini → update section "Status saat ini" → lanjut item berikutnya.
>
> **Sumber**: `Altora_Pabrik_Master_Plan_Lengkap.pdf` (61 halaman, diupload user, versi 1.0/Juli 2026).
> File PDF itu sendiri TIDAK ada di repo — kalau butuh detail spesifik yang tidak
> terangkum di bawah, minta user upload ulang. Ringkasan tiap bagian penting sudah
> ditulis ulang di sini supaya agent lain tidak perlu baca 61 halaman dari nol.
>
> **North Star dokumen asli**: "Satu kejadian bisnis dicatat satu kali. Sistem
> menghasilkan seluruh konsekuensi yang sah, dapat ditelusuri, dapat dibalik, dan
> dapat direkonsiliasi." Operator mencatat fakta lapangan (scan, output, reject,
> downtime) — sistem yang mengurus stok, batch, payroll, costing, jurnal, exception.
>
> **PENTING — ikuti AGENTS.md**: setiap perubahan `schema.prisma` wajib migration
> (`npx prisma migrate dev`); setiap query wajib filter `tenantId` dari session;
> simple-by-default (sembunyikan kompleksitas di balik progressive disclosure,
> bukan hilangkan); jangan tambah integrasi API key eksternal (IoT/PLC itu
> eksplisit "Out of Scope Awal" di dokumen asli, lihat bawah).

## 🧭 Roadmap 7 Milestone (dari dokumen asli, section 21)

| # | Milestone | Cakupan | Status |
|---|---|---|---|
| M1 | Core Manufacturing | Plant, warehouse, location, product, UOM, BOM/routing version, WO, reservation, issue, return, operation, output, waste, stock movement | 🟡 **sedang jalan** |
| M2 | Batch dan Quality | Batch, expiry, incoming/in-process/final QC, quarantine, hold/release/reject, rework, genealogy, traceability | ⬜ belum |
| M3 | Planning dan Procurement | Demand, forecast, production plan, MRP, material request, purchase, receipt, supplier QC, putaway | ⬜ belum |
| M4 | Labor dan Payroll Produksi | Labor group, crew, skill, shift, assignment, labor log/output, rate card, hourly/piece/crew pay, approval, labor cost | ⬜ belum |
| M5 | Costing dan Finance | Material/labor/machine/overhead cost, WIP, standard/actual, variance, inventory valuation, journal, COGS, reports | ⬜ belum |
| M6 | Maintenance dan Exception | Machine, preventive maintenance, breakdown, downtime, sparepart, OEE, exception center, approval, escalation, SLA | ⬜ belum |
| M7 | Advanced Manufacturing | Finite scheduling, scenario planning, subcontracting, CAPA, recall, IoT, machine integration, advanced costing/payroll, multi-plant optimization | ⬜ belum |

**Exit criteria tiap milestone** (dari dokumen, section 21, berlaku ke semua M1-M7):
1. Use case utama bisa dijalankan end-to-end pada data pilot.
2. State machine, permission, audit, idempotency, dan reversal tersedia.
3. Unit, integration, concurrency, security, dan E2E test utama lulus.
4. Ledger dan balance dapat direkonsiliasi.
5. Dokumen migrasi, rollback, training, serta support tersedia.
6. Tidak ada bug kritis/blocker terbuka pada scope milestone.

**Guardrail wajib** (section 22, berlaku ke SEMUA milestone — cek ulang tiap PR):
1. Tidak ada material consumption tanpa WO.
2. Tidak ada material consumption tanpa lot yang jelas.
3. Tidak ada output tanpa operation.
4. Tidak ada output tanpa operator atau crew.
5. Tidak ada output dibayar dua kali.
6. Tidak ada payroll earning tanpa labor log/output source.
7. Tidak ada payroll tanpa rate card version.
8. Tidak ada batch Hold/Reject/Expired/Recalled/Blocked dijual sebagai available stock.
9. Tidak ada perubahan BOM/routing version pada WO berjalan (WO snapshot BOM/routing saat release).
10. Tidak ada perubahan tarif historis setelah earning/payroll dihitung.
11. Tidak ada penghapusan transaksi produksi; koreksi wajib reversal/adjustment.
12. Stock adjustment, QC override, cost adjustment, payroll adjustment, disposal, use-as-is wajib alasan serta audit.
13. WO tidak boleh ditutup tanpa output, waste declaration, material balance, final QC, costing, dan resolution exception blocking.
14. Pekerja tidak boleh aktif di dua operation pada waktu sama.
15. Machine rusak/maintenance/blocked tidak boleh dijadwalkan.
16. Material Hold, Reject, Expired, Recalled, atau Reserved untuk sumber lain tidak boleh di-issue.
17. Approval nilai tinggi, disposal, perubahan BOM, QC override, dan payroll mengikuti policy tenant.
18. Semua tindakan kritis wajib idempotent, atomic, tenant-scoped, permission-checked, dan audit-logged.

**Out of scope (jangan dibangun dulu)**: advanced APS/global multi-plant optimizer,
AI demand forecasting/computer vision QC/predictive maintenance, full MES machine
control/PLC write-back/digital twin/RPA, pharmaceutical validation/regulasi
tersertifikasi khusus, advanced treasury/global trade compliance/automated tax
filing penuh. (Konsisten dengan AGENTS.md rule "dilarang integrasi API key
eksternal".)

---

## 🏗️ Arsitektur — keputusan yang sudah diambil (hasil riset codebase, JANGAN ulangi riset ini)

- **"Plant" di dokumen = `Outlet` yang sudah ada.** Jangan bikin model `Plant` baru — extend `Outlet` kalau perlu field tambahan (mis. kapasitas produksi), tapi konsepnya sama.
- **Belum ada "Warehouse" / "StorageLocation" sub-level di bawah Outlet.** `ProductStock` cuma granular sampai `outletId`. Modul Pabrik butuh ini (raw material/WIP/finished goods/quarantine/reject perlu lokasi terpisah dalam satu Outlet) — ini yang pertama harus dibangun.
- **`ProductRecipeItem` adalah "BOM" versi flat**, sudah dipakai `sale-service.ts` (`buildFlattenedRecipeMap`) untuk resep F&B — TAPI tidak punya versioning, yield/waste allowance, UOM per baris, atau status draft/active/obsolete. Untuk Pabrik butuh model BOM baru (`BomVersion`/`BomVersionItem`) — jangan pakai `ProductRecipeItem` apa adanya, tapi boleh reuse pola self-relation Product-nya.
- **Tidak ada routing/work center/operation sama sekali.** Model baru murni.
- **Tidak ada WorkOrder / production order.** Model baru murni, perlu state machine sesuai section 25 dokumen asli:
  `DRAFT → PENDING_APPROVAL → APPROVED → MATERIAL_SHORTAGE/MATERIAL_RESERVED → SCHEDULED → RELEASED → IN_PROGRESS/PAUSED → AWAITING_QC → COMPLETED → CLOSED`; terminal `CANCELLED` dari state manapun sebelum RELEASED.
- **Tidak ada ledger stok generik (immutable movement log).** Semua stok existing (`ProductStock.qty`, `StockAdjustment`, dll) itu MUTASI LANGSUNG field, bukan ledger yang bisa di-replay. Modul Pabrik butuh `StockMovement` baru sebagai ledger append-only (source type + source id + idempotency key), dan `ProductStock`/kolom reserved jadi *projection* dari ledger ini — ini prinsip inti dokumen asli ("Stock balance harus dapat dibangun ulang dari Stock Movement Ledger").
- **Pola tenant-scoping**: setiap service function terima `tenantId` sebagai argumen pertama, tiap query Prisma pakai `{ ...id, tenantId }` di `findFirst`/`update`/`delete`. TIDAK ADA helper `requireTenant()` terpusat — ikuti konvensi manual yang sama persis dengan `purchase-order-service.ts`/`supplier-service.ts`.
- **Pola transaksi**: multi-step stock change selalu dibungkus `prisma.$transaction(async (tx) => {...})`, service function nested terima `tx?: Prisma.TransactionClient` opsional (default ke `prisma` global). Ikuti pola `stock-receipt-service.ts` persis.
- **Idempotency**: satu-satunya mekanisme yang ada sekarang adalah status-guard di dalam transaksi (`if (status === "COMPLETED") throw`). Belum ada idempotency key generik — modul Pabrik yang lebih rawan double-submit (scan barcode, operator tap cepat) sebaiknya mulai pakai idempotency key asli (kolom unique di `StockMovement`/`WorkOrderEvent`), bukan cuma status-guard.
- **Module registration**: `src/lib/modules.ts` (`MODULES` array) belum ada key untuk manufaktur. Perlu tambah `{ key: "produksi", label: "Produksi", core: false, color/colorDark/colorSoft }` dan wire ke `Tenant.disabledModules` + nav gating (`src/lib/nav.ts` atau sejenisnya) — ikuti pola modul lain yang sudah ada persis.
- **UOM**: belum ada tabel UOM global, cuma `ProductUom` per-produk (konversi lokal, mis. "Dus" = 12x "Pcs"). Untuk M1 minimal, BOM/routing bisa reuse `ProductUom` yang sudah ada dulu — tabel UOM canonical bisa nyusul kalau memang dibutuhkan (jangan over-engineer duluan).

---

## 📋 M1 — Core Manufacturing (breakdown kerja, urutan implementasi)

- [ ] **P1** — Migration: `Warehouse` (sub-lokasi dalam Outlet: RAW_MATERIAL/WIP/FINISHED_GOODS/QUARANTINE/REJECT/SCRAP/IN_TRANSIT) + `StorageLocation` (bin/rak opsional di bawah Warehouse)
- [ ] **P2** — Migration: `StockMovement` ledger (append-only: tenantId, productId, lotId?, fromLocation?, toLocation?, qty, uom, sourceType enum, sourceId, actorId, idempotencyKey unique, createdAt) + service `stock-movement-service.ts` (fungsi `recordMovement()` generik dipakai semua modul produksi)
- [ ] **P3** — Migration: `BomVersion` + `BomVersionItem` (header: productId, version int, status DRAFT/ACTIVE/OBSOLETE, outputQty, effectiveDate; item: ingredientId, qty, uom, wasteAllowancePct?, isOptional) + service `bom-service.ts` (create/activate/obsolete version, tidak boleh edit version yang sudah ACTIVE dan dipakai WO — sesuai guardrail #9)
- [ ] **P4** — Migration: `WorkCenter` (nama, outletId, kapasitas/jam, mesin terkait opsional) + `RoutingVersion`/`RoutingOperationStep` (header per productId+version; step: sequence, workCenterId, standardDurationMin, instruction?, qcCheckpoint bool) + service `routing-service.ts`
- [ ] **P5** — Migration: `WorkOrder` + `WorkOrderOperation` (WO: tenantId, outletId, productId, bomVersionId, routingVersionId — snapshot di release bukan live-reference, targetQty, status enum sesuai state machine di atas, dueDate?, PIC?; operation: sequence, workCenterId, status, actualStart/End?) + service `work-order-service.ts` dengan state machine transitions eksplisit (bukan status string bebas)
- [ ] **P6** — Service: material reservation/issue/return/consumption — nulis ke `StockMovement`, update projection `ProductStock`(atau kolom reserved baru), cek guardrail #16 (jangan issue material Hold/Reject/Expired/Reserved-untuk-WO-lain)
- [ ] **P7** — Service: operation execution (start/pause/resume/complete) + output recording (good/reject/rework/scrap/waste) — invariant "Issued = Consumed + Returned + Waste + Remaining WIP" (dokumen section 9) wajib dicek sebelum WO bisa closed
- [ ] **P8** — Module registration: tambah `produksi` ke `MODULES`, gating nav, cek `Tenant.disabledModules`
- [ ] **P9** — UI: Planner — buat WO (pilih produk, BOM version, routing version, qty, outlet) + approval sederhana
- [ ] **P10** — UI: Operator — layar produksi simpel (work list per shift, tombol Mulai/Catat Output/Catat Reject/Lapor Masalah/Selesai) — WAJIB progressive disclosure, bahasa sehari-hari, sesuai AGENTS.md rule "orang awam tanpa pelatihan"
- [ ] **P11** — UI: Owner/Manager — daftar WO + status ringkas (bukan dashboard penuh dulu, itu masuk M6/M7)
- [ ] **P12** — Verifikasi end-to-end: buat WO → reserve → issue → jalankan operation → catat output → tutup WO → cek `StockMovement` balance & `ProductStock` projection benar
- [ ] **P13** — Commit & push per slice (jangan tunggu semua M1 selesai baru commit — commit tiap P-item yang solid)

## Status saat ini

**Terakhir dikerjakan**: riset codebase selesai (lihat "Arsitektur" di atas). Belum ada
kode/migration yang ditulis. Mulai dari **P1** (Warehouse/StorageLocation).

**Belum diputuskan / perlu keputusan sebelum lanjut ke item terkait**:
- Nama modul di `MODULES`: `produksi` vs `manufaktur` vs `pabrik` — pilih salah satu,
  konsisten dipakai di seluruh route/label. (Sementara dipakai: `produksi`.)
- Apakah `WorkCenter` butuh relasi eksplisit ke `Machine` sebagai model terpisah di M1,
  atau cukup field teks dulu dan `Machine` model baru masuk M6 (Maintenance)? Dokumen
  asli taruh "Machine registry" di Fase 0 (fondasi) tapi "Maintenance"-nya sendiri di
  M6 — kemungkinan besar `Machine` sebagai referensi ringan boleh masuk M1, detail
  maintenance-nya nanti di M6. **Rekomendasi**: buat `Machine` model ringan di M1
  (id, name, outletId, workCenterId?, status) tanpa fitur maintenance dulu.

---

*Setiap item yang selesai akan ditandai `[x]` beserta commit hash-nya di sini, sama
seperti `docs/TODO-ERP-100.md`.*
