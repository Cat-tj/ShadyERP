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
  - Bottom tabs: Kasir, Uang, Data, Lainnya.
- [x] Auto redirect `/pilih-aplikasi` ke `/kasir` untuk tenant SIMPLE.
- [ ] Onboarding wizard tenant baru.
  - Pilih mode bisnis, modul, outlet, produk pertama, staff, dan QRIS.
- [x] Import data awal.
  - Halaman import produk dari CSV terintegrasi dengan validasi baris client-side, unduh template, dan pemrosesan bulk Server Action.
- [ ] Export backup tenant.
  - Export data penting tenant untuk safety.

## Simple Mode UX

- [x] `/simple/uang`.
  - Ringkasan tunai POS, uang keluar shift, estimasi laci, shift terbuka, catat uang masuk/keluar.
- [x] `/simple/data`.
  - Omzet hari ini vs kemarin, produk terlaris, produk sepi, stok menipis, expiry insight.
- [x] `/simple/menu`.
  - Grid fitur sekunder berdasarkan role dan modul aktif.
- [x] `/simple/hari-ini`.
  - Dashboard owner 10 detik: omzet hari ini vs kemarin, tunai di laci, digital, shift aktif, top product hari ini, dan peringatan operasional (alerts).
- [x] Badge bottom tab yang data-driven.
  - Jumlah alert riil dilewatkan dari layout server component ke SimpleShell client untuk merender badge Data secara dinamis.
- [ ] Simple Mode mobile polish.
  - Tes HP kecil, tablet, desktop sempit, dan no-overlap.

## Alert Center

- [ ] Halaman Alert Center.
  - Satu tempat untuk semua peringatan operasional.
- [ ] Alert stok menipis.
- [ ] Alert batch expired / hampir expired.
- [ ] Alert shift belum tutup.
- [ ] Alert selisih kas.
- [ ] Alert hutang supplier jatuh tempo.
- [ ] Alert produk sepi.
- [ ] Alert pesanan belum selesai.
- [ ] Alert transaksi offline belum sync.

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
- [ ] Payment reconciliation.
  - Koreksi metode bayar dengan audit.
- [ ] Split bill.
- [ ] Hold order / park order.
- [ ] Print receipt polish.
  - Thermal printer, RawBT, layout struk per mode bisnis.

## Offline Mode

- [ ] Offline queue UI.
  - Daftar transaksi pending sync.
- [ ] Badge online/offline.
- [ ] Retry sync manual.
- [ ] Warning jika data lokal belum sync.
- [ ] Conflict handling saat sync.
- [ ] Local-first POS hardening.

## Retail / Altora Toko

- [ ] Receiving mobile.
  - Scan barcode, qty, expired date, supplier, foto nota opsional.
- [ ] Produk tanpa barcode workflow.
  - Alias pencarian, SKU internal, label barcode.
- [ ] Barcode print.
- [ ] Expired product workflow.
  - Buang/rusak, clearance discount, audit stok expired.
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
- [x] Top sale dan worst sale dasar.
- [x] Hutang supplier dasar.
- [ ] Payment reconciliation.
- [ ] Piutang pelanggan.
- [ ] Kas masuk/keluar/transfer antar kas.
- [ ] Laba rugi yang lebih jelas untuk SIMPLE.
- [ ] Advanced accounting untuk COMPANY.
- [ ] Tutup periode / tutup tahun untuk ADVANCED.

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

