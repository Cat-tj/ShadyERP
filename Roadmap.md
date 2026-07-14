# Altora Roadmap

Dokumen ini adalah checklist kerja Altora. Setiap agent yang menyelesaikan item wajib mengubah `[ ]` menjadi `[x]`, menambahkan catatan singkat, dan membuat dokumen update di `docs/codex-updates/<YYYY-MM-DD-HHMM>-codex.md`.

## Status Legend

- `[x]` Selesai dan sudah diverifikasi minimal build/TypeScript.
- `[ ]` Belum selesai.
- Catatan singkat ditulis di bawah item jika perlu.

## Foundation SaaS

- [x] Mode bisnis utama: Altora Cafe, Altora Toko, Altora Laundry, Altora Counter, Altora Company.
  - Sudah ada business mode dan hub/module split dasar.
- [x] Mode akuntansi tenant: `SIMPLE` dan `ADVANCED`.
  - `SIMPLE` memakai UX ringkas, `ADVANCED` memakai AppShell/sidebar.
- [x] SimpleShell untuk tenant SIMPLE.
  - Bottom tabs dibuat tetap 4 item: Kasir, Uang, Data, Lainnya. Akses Hari Ini lewat logo/topbar dan menu agar mobile tetap lega.
- [x] Auto redirect `/pilih-aplikasi` ke `/simple/hari-ini` untuk tenant SIMPLE.
- [ ] Onboarding wizard tenant baru.
  - Pilih mode bisnis, modul, outlet, produk pertama, staff, dan QRIS.
  - Progress: halaman `/onboarding` sudah ada sebagai checklist setup berbasis data tenant.
- [x] Import data awal.
  - Halaman import produk dari CSV terintegrasi dengan validasi baris client-side, unduh template, dan pemrosesan bulk Server Action.
  - Import sekarang mendukung outlet/cabang, supplier, batch/lot, expired date, track expiry, dan validasi duplikat SKU/barcode.
- [x] Export backup tenant.
  - Kartu cadangan data ditambahkan ke halaman Pengaturan Bisnis yang mengekspor seluruh tabel penting (Profil, Outlet, Produk, Transaksi, Member, Supplier) menjadi berkas unduhan JSON secara aman.

## Simple Mode UX

- [x] `/simple/uang`.
  - Ringkasan tunai POS, uang keluar shift, estimasi laci, shift terbuka, catat uang masuk/keluar.
- [x] `/simple/data`.
  - Omzet hari ini vs kemarin, produk terlaris, produk sepi, stok menipis, expiry insight.
- [x] `/simple/menu`.
  - Grid fitur sekunder berdasarkan role dan modul aktif.
- [x] `/simple/hari-ini`.
  - Dashboard owner 10 detik: omzet hari ini vs kemarin, tunai di laci, digital, shift aktif, top product hari ini, dan peringatan operasional (alerts).
- [x] Simple layout low-spec pass.
  - Query alert berat dilepas dari layout global agar halaman Kasir tidak ikut menarik stok/expiry/hutang/order setiap render.
- [ ] Simple Mode mobile polish.
  - Tes HP kecil, tablet, desktop sempit, dan no-overlap.

## Alert Center

- [x] Halaman Alert Center.
  - Halaman terpusat (/alerts) yang mengelompokkan dan memvisualisasikan seluruh isu operasional aktif sesuai tingkat keparahannya.
- [x] Alert stok menipis.
- [x] Alert batch expired / hampir expired.
- [x] Alert shift belum tutup.
- [x] Alert selisih kas.
- [x] Alert hutang supplier jatuh tempo.
- [x] Alert produk sepi.
- [x] Alert pesanan belum selesai.
- [x] Alert transaksi offline belum sync.
  - Dibuat halaman `/simple/offline` untuk melihat status online/offline, pending sync, retry manual, dan transaksi gagal di device kasir.

## Superadmin Platform

- [x] Login superadmin terpisah dari tenant user.
- [x] Dashboard `/superadmin` menampilkan tenant dan statistik dasar.
- [x] Superadmin bisa suspend/aktifkan tenant.
- [x] Superadmin bisa enable/disable modul tenant.
- [x] Superadmin bisa ganti paket tenant Free/Basic/Pro.
- [x] Superadmin bisa ganti accounting mode SIMPLE/ADVANCED.
- [x] Detail tenant `/superadmin/tenant/[id]`.
- [x] Manajemen akun superadmin `/superadmin/admins`.
  - Tambah/reset akun superadmin.
- [x] Superadmin audit log.
  - Halaman audit log terintegrasi dengan filter pencarian dan detail payload JSON (sebelum & sesudah) untuk melacak aktivitas seluruh superadmin.
- [ ] 2FA superadmin.
- [ ] Session management superadmin.
  - Lihat sesi aktif dan revoke.
- [ ] Billing SaaS lengkap.
  - Trial, invoice langganan, limit plan, payment confirmation.

## Role & Permission

- [ ] Role matrix granular.
  - Owner, Manager Cabang, Kasir, Inventory, Finance, HR, Staff Dapur/Laundry/Barber.
  - Catatan: jangan dipecah setengah matang. Ini perlu migrasi enum role + update auth/nav/server actions secara menyeluruh.
  - Progress: form karyawan punya preset pekerjaan Kasir, Inventory, Finance, HR, Manager Cabang, Dapur, Laundry, Runner lewat `jobTitle`.
- [ ] Pembatasan per outlet.
  - User hanya lihat cabang yang ditugaskan.
- [ ] Permission per aksi.
  - Void, refund, ubah harga, tutup shift, export laporan, reset stok.
- [ ] Approval manager untuk aksi sensitif.
  - Void, retur besar, diskon besar, koreksi metode bayar.

## POS & Kasir

- [x] POS product card dengan tombol `- qty +`.
- [x] Invoice kanan untuk desktop lebar.
- [x] Invoice mobile/tablet sebagai sheet/sticky cart.
- [x] Jenis pesanan: dine-in, takeaway, delivery.
- [x] Channel delivery dengan logo/brand color.
- [x] Gesek tunai di kasir.
- [x] Close shift membedakan cash laci dan digital/non-tunai.
- [x] Fix UI POS agar card produk tidak overlap dengan invoice.
- [ ] Retur & void proper.
  - Void transaksi, retur item sebagian, alasan, approval, audit log.
- [x] Payment reconciliation dasar.
  - Riwayat transaksi punya aksi koreksi metode bayar non-deposit dengan alasan wajib dan audit log.
- [x] Ringkasan rekonsiliasi metode bayar.
  - Buku Kas menampilkan total/count/percentage per metode bayar untuk dicocokkan owner saat tutup hari.
- [ ] Split bill.
- [ ] Hold order / park order.
- [ ] Print receipt polish.
  - Thermal printer, RawBT, layout struk per mode bisnis.

## Offline Mode

- [x] Offline queue UI.
  - Daftar transaksi pending sync tersedia di `/simple/offline`.
- [x] Badge online/offline.
  - Status online/offline tampil di panel Offline Sync.
- [x] Retry sync manual.
- [x] Warning jika data lokal belum sync.
- [ ] Conflict handling saat sync.
- [ ] Local-first POS hardening.

## Retail / Altora Toko

- [x] Receiving barang langsung.
  - Barang datang bisa diinput dari halaman Barang Masuk tanpa membuat PO manual; sistem membuat PO cepat di belakang layar.
- [x] Expiry/batch capture saat receiving.
  - Form Barang Masuk mendukung batch/lot dan tanggal expired; saat selesai QC, batch masuk ke `StockBatch`.
- [ ] Receiving mobile polish.
  - Scan barcode, foto nota opsional, dan mode layar HP khusus gudang.
  - Progress: form Barang Masuk mendukung scan/ketik SKU via input cepat; kamera dan foto nota belum.
- [ ] Produk tanpa barcode workflow.
  - Alias pencarian, SKU internal, label barcode.
- [ ] Barcode print.
- [ ] Expired product workflow.
  - Buang/rusak, clearance discount, audit stok expired.
  - Progress: batch mendekati expired bisa ditandai buang/rusak dari Inventory, stok outlet berkurang, dan stock adjustment tercatat.
- [ ] Rak/lokasi barang.
- [ ] Stock opname cepat.
- [ ] Marketplace manual tracker.
  - Shopee, Grab, Gojek, Maxim, order number, fee, settlement manual.
- [ ] Payment method visibility di daftar transaksi.

## Inventory

- [x] Stok produk dan reorder point dasar.
- [x] Transfer antar cabang dasar.
- [x] Batch/expiry model dasar.
- [ ] Transfer antar cabang lifecycle lengkap.
  - Request, approve, kirim, terima, selisih.
- [ ] Stok rusak/hilang/expired.
- [ ] Multi satuan konversi.
- [ ] Harga beli terakhir dan history harga beli.
- [ ] Supplier preferred per produk.
- [ ] Auto restock recommendation.

## Finance

- [x] Finance simple untuk cashflow dan laporan dasar.
- [x] Fondasi accounting mode ADVANCED.
  - COA dasar, jurnal auto-posting POS/pengeluaran, dan audit jurnal sudah ada,
    tetapi belum merupakan accounting formal yang lengkap.
- [x] Top sale dan worst sale dasar.
- [x] Hutang supplier dasar.
- [ ] Payment reconciliation.
  - Progress: filter riwayat transaksi berdasarkan metode bayar dan status tersedia di `/kasir/riwayat`.
- [ ] Piutang pelanggan dan pembayaran.
  - Invoice B2B, pembayaran parsial, aging, credit note, dan posting otomatis.
- [ ] Kas masuk/keluar/transfer antar kas.
- [ ] Laba rugi yang lebih jelas untuk SIMPLE.
  - Harus memakai posting finance dan nilai HPP Inventory Ledger, bukan modal
    produk estimasi.
- [ ] Accounting Core untuk ADVANCED/Company.
  - Lihat `docs/ACCOUNTING-PLAN.md`: COA tree, journal header/lines immutable,
    auto-posting idempotent, mapping kas-bank-QRIS, dan outlet dimension.
  - Progress: schema jurnal multi-baris, engine posting POS/pengeluaran/hutang,
    serta layar jurnal baru sudah tersedia. Reversal, bank, dan period close masih pending.
- [ ] Rekonsiliasi bank dan settlement digital.
  - CSV mutasi bank, QRIS/e-wallet/marketplace clearing, matching, dan fee.
- [ ] Buku besar formal dan laporan keuangan.
  - Trial balance, neraca, arus kas, laporan per outlet/cost center.
- [ ] Tutup periode / tutup tahun untuk ADVANCED.
  - Lock period, reversal adjustment, retained earnings, dan audit trail.

## HRIS

- [x] Absensi dasar.
- [x] Jadwal kerja dasar.
- [ ] HRIS app khusus.
  - Profil karyawan, kontrak, dokumen, jabatan, outlet assignment.
- [ ] Shift 24 jam dan lembur.
- [ ] Casual worker per shift.
- [ ] Bonus tanggal merah/lebaran.
- [ ] SP karyawan.
- [ ] Payroll simple.
- [ ] Approval cuti/izin.

## Cafe

- [x] Table layout visual dasar.
- [x] Generate meja/kursi lebih rapi.
- [x] QR order dasar.
- [x] Kitchen display dasar.
- [ ] Floor plan premium.
  - Drag/drop, shape meja, kapasitas, status warna pastel.
- [ ] Menu modifier/topping matang.
- [ ] Catering/event order.
- [ ] Runner/barista workflow.
- [ ] Pesanan banyak dengan rate khusus.
- [ ] Biaya transport/barista untuk event.

## Laundry

- [x] Laundry sebagai section sendiri.
- [x] Layanan laundry bisa disiapkan dari setting dasar.
- [ ] Kelola layanan laundry lengkap.
  - Tambah/edit/nonaktif, harga kiloan/satuan/express/dry clean/setrika.
- [ ] Status laundry lifecycle.
  - Masuk, dicuci, dikeringkan, disetrika, siap, diambil/dikirim.
- [ ] Pickup/delivery laundry.
- [ ] Komplain hilang/rusak.
- [ ] Label/nota laundry.

## Counter

- [ ] Service ticket.
- [ ] Garansi service/sparepart.
- [ ] Serial/IMEI tracking.
- [ ] Trade-in/tukar tambah.
- [ ] Sparepart inventory.
- [ ] Gesek tunai reporting khusus counter.

## Company / ERP

- [ ] Approval dokumen multi-level.
- [ ] Kasbon.
- [ ] SP dan dokumen karyawan.
- [ ] Multi-gudang advanced.
- [ ] Konsinyasi masuk/keluar.
- [ ] Perakitan/assembling advanced.
- [ ] Procurement approval.

## Reports & Analytics

- [x] Dashboard KPI dasar.
- [x] Top sale / worst sale dasar.
- [ ] Simple owner report harian.
- [ ] Export Excel/PDF/CSV.
- [ ] Report per outlet/per periode.
- [ ] Report metode bayar.
- [ ] Report delivery channel.
- [ ] Report stok expired.
- [ ] Report shift/cash discrepancy.

## Security & Legal

- [ ] Terms & Privacy.
- [ ] Data deletion request.
- [ ] Rate limit tenant login.
- [ ] Audit delete data.
- [ ] Soft delete data penting.
- [ ] Secret/env deployment checklist.
- [ ] Vercel env validation guide.

## Quality

- [x] Build berhasil untuk update Simple Mode dan Superadmin.
- [x] Lint debt cleanup.
  - Berhasil dibersihkan sepenuhnya di seluruh folder src/, build linting sekarang hijau sempurna.
- [ ] E2E smoke test login/kasir/simple/superadmin.
- [ ] Responsive screenshot checklist.
  - Mobile, tablet, desktop, wide desktop.
- [ ] Seed/demo data per mode bisnis.
