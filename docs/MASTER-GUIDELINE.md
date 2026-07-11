# Master Guideline Altora

> Dokumen acuan tertinggi produk. Semua keputusan fitur, UI, dan copy landing page
> harus konsisten dengan dokumen ini. Berlaku untuk semua kontributor tim.
> Kalau ragu, kembali ke sini.

---

## 1. Prinsip Inti

1. **Gampang dipakai orang awam.** Lengkap boleh, ribet tidak. Setiap fitur harus
   lolos tes: *"Bisa dipakai pemilik warung tanpa dilatih?"*
2. **Satu layar = satu keputusan.** Kalau satu layar memaksa user mikir lebih dari
   satu hal, pecah layarnya.
3. **Bahasa sehari-hari, bukan istilah kantor.** "Untung hari ini", bukan "Net
   Profit". "Stok mau habis", bukan "Reorder Point Alert". Istilah teknis hanya
   boleh muncul di mode Advanced.
4. **Simple by default, Advanced kalau perlu.** Fitur canggih tidak dihapus —
   disembunyikan di balik toggle. Data di baliknya SATU, jadi upgrade tanpa
   migrasi.
5. **Sistem yang isi sendiri.** Kalau Altora sudah tahu datanya (penjualan,
   absensi), jangan suruh user ketik ulang. Contoh: progress target karyawan
   terisi otomatis dari transaksi POS.
6. **Tanpa API/token eksternal.** Semua fitur harus jalan mandiri (lib lokal,
   data sendiri). Tidak ada integrasi pihak ketiga yang butuh kredensial.

---

## 2. Peta Produk

Dua sumbu yang tidak boleh dicampuradukkan:

- **Vertikal** (= kemasan per jenis usaha, via preset & nanti subdomain):
  Altora Cafe, Toko, Supermarket, Laundry, Counter, Pabrik, Company, HRIS,
  Accounting.
- **Versi** (= kedalaman fitur, via toggle per tenant per bagian):
  **Simpel** dan **Advanced**.

Kombinasi keduanya menentukan apa yang user lihat. Contoh: Altora Cafe versi
Simpel = kasir + menu + buku kas; Altora Cafe versi Advanced = + resep, QR meja,
kitchen display, laba rugi penuh.

---

## 3. Persona Target

| # | Persona | Profil | Produk & versi |
|---|---------|--------|----------------|
| P1 | **Bu Sari** — warung/kios | 0–2 karyawan, semua dari HP, gaptek, tidak mau ribet | Simpel (vertikal apa pun) |
| P2 | **Mas Andi** — owner cafe 1 outlet | 5–8 karyawan, mau kelihatan modern, sibuk | Cafe Simpel → naik Advanced bertahap |
| P3 | **Pak Hendra** — minimarket/retail | Ribuan SKU, supplier banyak, barcode wajib | Toko/Supermarket Advanced (inventory) |
| P4 | **Mbak Rina** — laundry | Order harian, pelanggan nanya "cucianku udah?" | Laundry Simpel |
| P5 | **Ko Alex** — konter HP & servis | Jual aksesoris + terima servis + garansi | Counter Simpel/Advanced |
| P6 | **Bu Maya** — owner 5 cabang | Tidak di lokasi, butuh kontrol & laporan gabungan | Company Advanced penuh |
| P7 | **PT (HRD & Direksi)** | Departemen, KPI, approval formal (kasus PT SVT) | HRIS Advanced |
| P8 | **Dedi** — kasir/staf | Pengguna harian terbanyak: layar kasir & absen | Layar kasir & absensi (dua versi) |
| P9 | **Pelanggan akhir** | Bukan user terdaftar: scan QR meja, cek poin | QR order, portal member, status laundry |
| P10 | **Tim Altora** | Internal: kelola tenant & langganan | Panel super-admin |

---

## 4. Matriks Fitur → Target → Versi

Status: ✅ sudah ada · 🔨 sebagian · ❌ belum dibangun

### Kasir & Penjualan
| Fitur | Target utama | Simpel | Advanced | Status |
|---|---|---|---|---|
| POS tap-untuk-jual + struk | P8, P1 | ✅ inti | ✅ | ✅ |
| Mode offline otomatis | P8 di daerah sinyal jelek | ✅ | ✅ | ✅ |
| Scan barcode di kasir | P8 di retail (P3) | — | ✅ | ✅ |
| Varian/topping, diskon per item | P2, P8 | — | ✅ | ✅ |
| Split bill / open bill meja | P2 (cafe) | — | ✅ | ✅ |
| Shift + rekonsiliasi kas | P8 buka/tutup; P6 review selisih | buka/tutup 1 tombol | penuh | ✅ |
| Retur/refund sebagian | P8, P3 | — | ✅ | ✅ |
| QRIS statis | P1–P5 | ✅ | ✅ | ✅ |
| Promo terjadwal otomatis | P2, P3 | — | ✅ | ✅ |
| Harga grosir & multi-satuan | P3 (Supermarket) | — | ✅ | ✅ schema, 🔨 UI |

### Produk & Stok
| Fitur | Target utama | Simpel | Advanced | Status |
|---|---|---|---|---|
| Daftar produk (nama+harga+foto) | P1, P2 | ✅ inti | ✅ | ✅ |
| Peringatan stok menipis | P1–P3 | ✅ | ✅ | ✅ |
| Supplier, PO, barang masuk + QC | P3, P6 (purchasing) | — | ✅ | ✅ |
| Stock opname | P3, P6 (gudang) | — | ✅ | ✅ |
| Transfer stok antar cabang | P6 | — | ✅ | ✅ |
| Batch & expired alert | P3 (FMCG/makanan) | — | ✅ | ✅ |
| Resep & bahan baku | P2 (cafe) | — | ✅ | ✅ |
| Cetak label barcode | P3 | — | ✅ | ✅ |
| Import CSV & scan-untuk-tambah | P3 | — | ✅ | ✅ |
| Maintenance aset/mesin | P6, Pabrik | — | ✅ | ✅ |
| Work order produksi (BOM) | Pabrik | — | ✅ | ❌ (gabung proyek FMS) |

### Uang & Keuangan
| Fitur | Target utama | Simpel | Advanced | Status |
|---|---|---|---|---|
| "Untung hari ini" 1 angka | P1, P2 | ✅ inti | ✅ | ✅ |
| Buku kas masuk/keluar 3 kolom | P1 | ✅ | ✅ | ✅ |
| Laba rugi (omzet−HPP−biaya) | P2+, akuntan | — | ✅ | ✅ |
| Hutang supplier + invoice | P3, P6 (finance) | — | ✅ | ✅ |
| COA + jurnal double-entry | Akuntan (Accounting) | — | ✅ | ✅ |
| Neraca, buku besar, tutup buku | Akuntan | — | ✅ | ❌ roadmap |
| Export CSV | Akuntan, analis | — | ✅ | ✅ |

### Tim & Karyawan
| Fitur | Target utama | Simpel | Advanced | Status |
|---|---|---|---|---|
| Absensi foto+lokasi 1 tombol | P8 | ✅ | ✅ | ✅ |
| Jadwal shift + approval | P2+, manajer | — | ✅ | ✅ |
| **Target Tim otomatis** (terisi dari data POS/absensi) | P1–P5 owner | ✅ ⭐ unik | ✅ | ❌ prioritas |
| KPI berbobot + sub-KPI + skor | P7 (HRIS) | — | ✅ | ❌ migrasi svt-kpi-monitor |
| Approval realisasi KPI + komentar | P7 | — | ✅ | ❌ migrasi |
| Departemen & ranking | P7 | — | ✅ | ❌ migrasi |
| Pengumuman internal | Semua owner → staf | ✅ | ✅ | ❌ |
| Notifikasi in-app | Semua user | ✅ | ✅ | ❌ |
| Estimasi gaji / slip | P6, P7 | — | ✅ | 🔨 estimasi kasar |

### Pelanggan
| Fitur | Target utama | Simpel | Advanced | Status |
|---|---|---|---|---|
| Member nama+HP, poin otomatis | P1–P5 | ✅ | ✅ | ✅ |
| Kartu member QR/UID + cetak massal | P2, P3 | — | ✅ | ✅ |
| Portal pelanggan (scan → cek poin) | P9 | — | ✅ | ✅ |
| CRM leads & follow-up | Jasa/B2B | — | ✅ | ✅ |

### Vertikal spesifik
| Fitur | Target utama | Simpel | Advanced | Status |
|---|---|---|---|---|
| QR order meja + kitchen display | P9 pesan, dapur masak (Cafe) | — | ✅ | ✅ |
| Command center cafe | P2, P6 | — | ✅ | ✅ |
| Order laundry + status proses | P4, P9 cek status | terima→selesai→diambil | tahap penuh + antar-jemput | ✅ |
| Booking/appointment | Barbershop/salon/klinik | catat manual | jadwal+durasi | ✅ |
| Garansi & servis (counter) | P5 | — | ✅ | ✅ |

### Perusahaan & Platform
| Fitur | Target utama | Simpel | Advanced | Status |
|---|---|---|---|---|
| Multi-outlet + laporan gabungan | P6 | — | ✅ | ✅ |
| Dokumen & e-sign berurutan | P6, P7 (direksi) | — | ✅ | ✅ |
| Audit log | P6, auditor | — | ✅ | ✅ |
| Toggle modul per tenant | Owner | ✅ | ✅ | ✅ |
| Langganan & billing | Owner | ✅ | ✅ | ✅ |
| Panel super-admin | P10 | n/a | n/a | ✅ |

---

## 5. Aturan Desain (checklist wajib fitur baru)

Sebelum merge, setiap fitur baru harus dijawab YA semua:

- [ ] Bisa dipakai tanpa pelatihan? (kalau tidak → masuk Advanced saja)
- [ ] Label memakai bahasa sehari-hari? (cek Kamus Istilah di bawah)
- [ ] Satu layar satu keputusan?
- [ ] Jalan di HP (layar kecil, jempol)?
- [ ] Tidak butuh API/token eksternal?
- [ ] Kalau datanya sudah ada di sistem, terisi otomatis (bukan input manual)?
- [ ] Multi-tenant aman (`tenantId` di semua query)?

### Kamus Istilah (Simpel → yang DILARANG di mode Simpel)
| Pakai ini | Jangan ini |
|---|---|
| Untung / Rugi | Net Profit / Loss, Laba Bersih |
| Uang masuk / keluar | Debit / Kredit, Cash In/Out |
| Stok mau habis | Reorder Point |
| Modal | HPP / COGS |
| Target | KPI / OKR |
| Catat pengeluaran | Jurnal / Posting |
| Barang masuk | Goods Receipt / GRN |

---

## 6. Backlog Update (yang bisa dikerjakan, urut prioritas)

| # | Update | Kenapa | Ukuran |
|---|---|---|---|
| 1 | **Refactor feature folders** (`src/features/*` + `src/core/*`) | Fondasi semua rencana; pilot: laundry/booking | Besar, bertahap |
| 2 | **Landing page: seksi Simpel vs Advanced** + seksi per vertikal + hook "target terisi otomatis" | Bahan jualan; materi sudah ada di dokumen ini | Sedang |
| 3 | **Perluas toggle Simpel/Advanced per bagian** (sekarang baru `accountingMode`; tambah untuk Tim, Stok, Kasir) | Mekanisme inti dua versi | Sedang |
| 4 | **Audit bahasa UI** — ganti semua istilah teknis di mode Simpel sesuai Kamus | Prinsip #3 | Kecil-sedang |
| 5 | **Target Tim otomatis** (fitur ⭐ unik) | Pembeda utama vs kompetitor | Sedang |
| 6 | **Notifikasi in-app + Pengumuman** | Dibutuhkan semua vertikal, prasyarat KPI approval | Sedang |
| 7 | **Subdomain routing** (`cafe.altora.id` dst. via proxy.ts + cookie `.altora.id`) | Branding produk terpisah | Kecil (butuh domain) |
| 8 | **Onboarding**: pilih jenis usaha → preset + pilih versi | Janji "5 menit langsung jualan" | Sedang |
| 9 | **Migrasi KPI advanced** dari svt-kpi-monitor ke hub HRIS | Produk Altora HRIS | Besar |
| 10 | **Preset Supermarket** (UI harga grosir + multi-satuan) | Vertikal baru termurah | Kecil |
| 11 | **Longgarkan modul `kasir` sebagai core** | HRIS/Accounting standalone tanpa kasir | Kecil |
| 12 | **Neraca + buku besar + tutup buku** | Melengkapi Altora Accounting | Sedang |
| 13 | **Work order produksi (BOM)** — gabung proyek FMS | Vertikal Altora Pabrik | Besar |

---

*Terakhir diperbarui: 2026-07-10. Ubah dokumen ini lewat PR/commit biasa —
tapi prinsip di bagian 1 hanya boleh berubah atas keputusan owner produk.*
