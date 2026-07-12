# Panduan Konten Landing Page per Vertikal Altora

Dokumen ini adalah "ultimate guideline" buat bangun landing page tiap
subdomain vertikal (cafe.altora.my.id, toko.altora.my.id, dst.) sebagai
app **berdiri sendiri** (pola `apps/altora-teams-landing`), bukan template
yang cuma diganti warna/copy.

Prinsipnya: **struktur section boleh sama** (biar tiap app cepat dibangun
dan konsisten kualitasnya), tapi **narasi, contoh, dan mockup di dalamnya
wajib beda** — masing-masing harus terasa dibuat khusus buat jenis usaha
itu, bukan hasil cari-ganti kata dari halaman lain.

Untuk warna, ikuti `docs/MASTER-GUIDELINE.md` §2 dan guideline warna yang
sudah diterapkan di `src/lib/verticals.ts` (field `theme`). Untuk logo,
pakai file yang sudah ada di `public/brand/{vertikal}-symbol*.svg`.

==================================================
KERANGKA SECTION STANDAR
==================================================

Tiap app landing pakai 8 section ini (contoh implementasi lengkap ada di
`apps/altora-teams-landing/src/app/page.tsx`):

1. **Header** — logo + nav (4 anchor link) + tombol Masuk & CTA WhatsApp.
2. **Hero** — eyebrow, headline (1 baris tajam), lede (1-2 kalimat), 2 CTA,
   3 angka ringkas (stat row), visual hero (mockup HP/dashboard konsep
   unik per vertikal — lihat breakdown di bawah).
3. **Marquee band** — 5-6 frasa fitur singkat, auto-scroll, warna gelap.
4. **Masalah** (`#masalah`) — 4 pain point dalam bento grid (kartu
   pertama lebih tinggi & berisi 1 contoh konkret/mini-mockup).
5. **Cara kerja** (`#cara-kerja`) — 3 langkah bergaris penghubung, latar
   gelap, ditutup 3 baris highlight kepercayaan.
6. **Fitur** (`#fitur`) — 4 kartu fitur, tiap kartu punya mini-mockup
   sendiri (bukan cuma teks).
7. **Contoh implementasi** — kondisi awal vs cara Altora bantu (3 poin).
8. **Perbandingan** (`#perbandingan`) — sebelum/sesudah, 4 baris masing².
9. **CTA penutup** — panel gradien warna vertikal + footer ekosistem
   (cross-link ke vertikal lain & altora.my.id).

==================================================
KARAKTER PER VERTIKAL
==================================================

Dari guideline warna — dipakai sebagai kompas nada tulisan, bukan cuma
warna:

| Vertikal | Karakter | Nada tulisan |
|---|---|---|
| Cafe | Hangat, kreatif, sosial, modern | Santai, sedikit playful |
| Toko | Teratur, efisien, stabil | Lugas, praktis |
| Supermarket | Besar, kuat, sistematis, terkontrol | Tegas, angka besar |
| Laundry | Bersih, segar, praktis, transparan | Ringan, cepat baca |
| Counter | Cepat, teknis, aktif, responsif | Singkat, teknis |
| Jasa | Hangat, personal, ramah | Personal, menyebut nama staf |
| Pabrik | Industrial, presisi, kokoh, aman | Formal, fokus keandalan |
| Company | Premium, formal, governance | Korporat, menyebut compliance |
| Teams | Produktif, kolaboratif, aktif, jelas | Sudah dibangun — jadi acuan kualitas |
| Accounting | Akurat, stabil, finansial, terpercaya | Presisi, hindari bahasa santai |

==================================================
1. CAFE — cafe.altora.my.id
==================================================

**Eyebrow/headline/lede** (sudah final, dari verticals.ts):
"POS & Manajemen Cafe untuk UMKM Indonesia" / "Kasir cafe, dari meja
sampai dapur." / "Pesanan meja lewat QR, layar dapur biar kitchen gak
ribet, sampai resep & bahan baku — semua kecatat otomatis di satu
aplikasi."

**Hero visual**: mockup dashboard kasir dengan tab POS/Dapur/Finance,
tile Omzet+Transaksi+Stok menipis+Pesanan meja, live-order "Meja 04"
(sudah ada di `hero-mocks.ts`, tinggal dipindah ke app baru).

**4 Masalah**:
1. Pesanan numpuk pas jam ramai — pelayan bolak-balik catat manual ke dapur.
2. Stok bahan baku (susu, sirup, biji kopi) habis mendadak tanpa peringatan.
3. Resep tiap barista beda takaran — rasa gak konsisten antar shift.
4. Owner gak tahu menu mana yang paling untung sampai tutup buku bulanan.

**3 Cara kerja**: (1) Scan QR di tiap meja, sambungkan ke menu digital.
(2) Atur resep & bahan baku sekali di awal — stok kepotong otomatis tiap
pesanan. (3) Pantau dapur & kasir dari satu layar, kapan saja.

**4 Fitur**: Pesan lewat QR meja (kitchen display real-time) · Resep &
bahan baku (stok kepotong otomatis per resep) · Split bill & buka tab
meja · Laporan menu terlaris + margin per item.

**Case study**: "Cafe 2 lantai, 8 meja, ramai tiap sore." Kondisi awal:
pelayan bolak-balik ke dapur, sering salah catat. Cara Altora bantu:
pelanggan pesan dari HP sendiri, dapur lihat kitchen display, kasir
tinggal proses bayar.

==================================================
2. TOKO — toko.altora.my.id
==================================================

**Eyebrow/headline/lede**: "POS & Manajemen Toko untuk UMKM Indonesia" /
"Kasir toko, stok gak pernah nyasar." / "Scan barcode pas jualan, stok
otomatis berkurang, laporan produk terlaris langsung ada — tanpa hitung
manual di buku."

**Hero visual**: mockup kasir dengan tab Kasir/Stok/Finance, tile Omzet
+Transaksi+Stok menipis+Barang masuk, live-row "Transaksi #204" (sudah
ada di `hero-mocks.ts`).

**4 Masalah**:
1. Stok fisik dan catatan buku sering beda, ketahuan pas udah telanjur jual.
2. Barang varian (ukuran/warna) susah dilacak satu-satu di buku manual.
3. Pindah stok antar cabang gak ada jejaknya — sering "hilang di jalan".
4. Produk terlaris cuma ketebak dari ingatan, bukan dari data asli.

**3 Cara kerja**: (1) Input produk + varian sekali, scan barcode tiap
transaksi. (2) Transfer stok antar cabang tercatat otomatis. (3) Lihat
laporan produk terlaris & margin kapan saja dari HP.

**4 Fitur**: Scan barcode kasir · Varian ukuran/warna dalam satu produk ·
Transfer stok antar cabang dengan jejak · Laporan produk terlaris &
stok menipis.

**Case study**: "Toko kelontong dengan 2 cabang." Kondisi awal: stok
dicatat manual di buku, sering selisih pas dicek fisik. Cara Altora
bantu: tiap transaksi otomatis potong stok, transfer antar cabang
tercatat, laporan terlaris muncul otomatis.

==================================================
3. SUPERMARKET — supermarket.altora.my.id
==================================================

**Eyebrow/headline/lede**: "POS & Manajemen Stok untuk Supermarket" /
"Ribuan SKU, tetap gampang dipantau." / "Harga grosir bertingkat, banyak
supplier, barang masuk sampai stock opname — dibikin buat toko dengan
stok besar."

**Hero visual**: mockup kasir dengan tab Kasir/Purchase/Finance, tile
Omzet+Transaksi+SKU aktif+Barang masuk, live-row "PO #482" (sudah ada
di `hero-mocks.ts`).

**4 Masalah**:
1. Ribuan SKU bikin stock opname manual makan waktu berhari-hari.
2. Harga grosir beda-beda per qty per supplier, gampang salah input di kasir.
3. Barang masuk dari banyak supplier gak ada proses QC yang tercatat.
4. Selisih stok baru ketahuan pas opname akhir bulan, sudah kelewat besar.

**3 Cara kerja**: (1) Import katalog produk + harga grosir bertingkat
sekali. (2) Barang masuk dicatat dengan QC, langsung update stok. (3)
Stock opname rutin, selisih kecil ketahuan lebih cepat.

**4 Fitur**: Harga grosir bertingkat per qty · Multi-supplier dengan
riwayat harga · Barang masuk + QC · Stock opname terjadwal dengan
laporan selisih.

**Case study**: "Supermarket 1.200+ SKU, 15 supplier aktif." Kondisi
awal: opname manual, selisih besar baru ketahuan akhir bulan. Cara
Altora bantu: barang masuk tercatat per PO dengan QC, opname rutin per
kategori, selisih kelihatan mingguan bukan bulanan.

==================================================
4. LAUNDRY — laundry.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Aplikasi Kasir & Order untuk Usaha
Laundry" / "Cucian masuk, status kelihatan sampai selesai." / "Pelanggan
bisa cek status cucian sendiri lewat link, bayar bisa dicicil, dan
omzet harian otomatis kecatat."

**Hero visual**: mockup order dengan tab Order/Status/Finance, tile
Omzet+Order aktif+Siap diambil+Cicilan tertunda, live-row "Order #128"
(sudah ada di `hero-mocks.ts`).

**4 Masalah**:
1. Pelanggan telepon berkali-kali cuma buat nanya "cucian gue udah kelar belum?"
2. Nota kertas gampang hilang/rusak kena air pas di tempat cuci.
3. Bayar dicicil (DP-pelunasan) dicatat di buku, gampang lupa siapa yang belum lunas.
4. Omzet harian cuma keliatan pas hitung kas manual di malam hari.

**3 Cara kerja**: (1) Order masuk, catat kiloan/satuan + estimasi selesai.
(2) Update status (cuci/setrika/siap ambil) — pelanggan cek sendiri lewat
link. (3) Bayar DP di depan, cicil, atau lunas — omzet kecatat otomatis.

**4 Fitur**: Order kiloan & satuan · Status proses real-time via link
publik · Cicilan DP-pelunasan · Omzet harian otomatis.

**Case study**: "Laundry kiloan, 40-50 order/hari." Kondisi awal:
telepon masuk terus nanyain status, nota kertas sering hilang. Cara
Altora bantu: pelanggan cek status sendiri lewat link, cicilan tercatat
rapi, omzet harian gak perlu dihitung manual.

==================================================
5. COUNTER — counter.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Aplikasi Kasir & Servis untuk Konter
HP/Elektronik" / "Jual aksesoris, terima servis, satu kasir." / "Garansi
servis tercatat rapi, jual produk dan terima perbaikan dari kasir yang
sama — tanpa nota kertas kececer."

**Hero visual**: mockup kasir dengan tab Kasir/Servis/Finance, tile
Omzet+Servis masuk+Garansi aktif+Stok aksesoris, live-row "Servis #45"
(sudah ada di `hero-mocks.ts`).

**4 Masalah**:
1. Nota servis kertas gampang hilang, pelanggan komplain garansi gak diakui.
2. Status servis (masuk/proses/selesai) gak jelas, pelanggan telepon berkali-kali.
3. Jualan aksesoris dan terima servis dicatat di sistem/buku terpisah.
4. Garansi yang udah lewat masa berlaku gak ada yang ingetin otomatis.

**3 Cara kerja**: (1) Terima unit servis, catat kerusakan + estimasi
biaya. (2) Update status servis, garansi otomatis tercatat dengan
tanggal berlaku. (3) Jual aksesoris dari kasir yang sama, satu laporan
omzet gabungan.

**4 Fitur**: Tanda terima servis digital · Tracking status servis ·
Garansi dengan pengingat masa berlaku · Kasir aksesoris terintegrasi.

**Case study**: "Konter HP, servis + jual aksesoris." Kondisi awal:
nota servis kertas, garansi sering disangkal karena gak ada bukti. Cara
Altora bantu: tanda terima digital, status servis bisa dicek, garansi
tercatat otomatis dengan tanggal jelas.

==================================================
6. JASA — jasa.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Aplikasi Booking & Kasir untuk Usaha
Jasa" / "Jadwal booking, rapi tanpa buku catatan." / "Barbershop, spa,
atau bengkel reparasi — atur jadwal, staf yang pegang, sampai DP dan
pelunasan pembayaran."

**Hero visual**: mockup booking dengan tab Booking/Kasir/Finance, tile
Booking hari ini+Omzet+Staf aktif+Slot kosong, live-row "Booking 14:00"
(sudah ada di `hero-mocks.ts`).

**4 Masalah**:
1. Booking lewat telepon/chat gampang bentrok jadwalnya sama staf lain.
2. Pelanggan lupa jadwal booking-nya sendiri, gak ada pengingat otomatis.
3. DP yang udah dibayar gampang lupa dicatat, bikin selisih pas pelunasan.
4. Owner gak tahu staf mana yang paling laku dipilih pelanggan.

**3 Cara kerja**: (1) Buka slot jadwal per staf, pelanggan/admin booking
ke slot yang kosong. (2) Sistem cegah bentrok otomatis antar staf. (3)
DP dan pelunasan tercatat, laporan performa staf otomatis muncul.

**4 Fitur**: Jadwal per staf anti-bentrok · Booking manual (telepon) atau
mandiri · DP & pelunasan tercatat · Laporan performa staf.

**Case study**: "Barbershop, 3 staf, booking via WhatsApp." Kondisi
awal: jadwal sering bentrok, DP gak tercatat rapi. Cara Altora bantu:
tiap staf punya jadwal sendiri yang anti-bentrok, DP otomatis tercatat
sampai pelunasan.

==================================================
7. PABRIK — pabrik.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Manajemen Bahan Baku & Aset untuk
Usaha Produksi" / "Bahan baku sampai maintenance mesin, satu layar." /
"Pantau stok bahan baku, jadwal maintenance alat produksi, dan laporan
pemakaian — biar produksi gak keteteran."

**Hero visual**: mockup stok dengan tab Stok/Maintenance/Finance, tile
Bahan baku aman+Maintenance+Produksi hari ini+Supplier aktif, live-row
"Mesin #2" (sudah ada di `hero-mocks.ts`).

**4 Masalah**:
1. Bahan baku habis mendadak di tengah produksi, gak ada peringatan dini.
2. Mesin rusak mendadak karena maintenance rutin gak terjadwal/terlupa.
3. Pemakaian bahan baku per batch produksi gak tercatat rapi.
4. Owner gak tahu mesin mana yang paling sering bermasalah.

**3 Cara kerja**: (1) Catat stok bahan baku + ambang batas minimum. (2)
Jadwalkan maintenance rutin per mesin/alat. (3) Tiap batch produksi
otomatis potong bahan baku, laporan pemakaian muncul otomatis.

**4 Fitur**: Stok bahan baku dengan ambang minimum · Jadwal maintenance
per alat · Pemakaian bahan per batch produksi · Riwayat servis mesin.

**Case study**: "Pabrik roti skala kecil, 3 mesin produksi." Kondisi
awal: bahan baku habis mendadak, maintenance mesin sering telat. Cara
Altora bantu: stok bahan baku dipantau dengan ambang minimum,
maintenance terjadwal otomatis ingatkan sebelum jadwal.

==================================================
8. COMPANY — company.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Manajemen Multi-Cabang untuk
Perusahaan" / "Kontrol banyak cabang dari satu tempat." / "Laporan
gabungan semua outlet, dokumen & tanda tangan digital berurutan, sampai
audit log tiap aksi penting."

**Hero visual**: mockup laporan dengan tab Cabang/Approval/Finance,
tile Cabang terpantau+Approval jalan+Omzet gabungan+Audit log, live-row
"Dokumen #12" (sudah ada di `hero-mocks.ts`).

**4 Masalah**:
1. Laporan tiap cabang dikirim manual (WA/Excel), owner harus rekap sendiri.
2. Dokumen persetujuan (budget, kontrak) bolak-balik dicetak buat tanda tangan.
3. Gak ada jejak siapa yang mengubah data penting — sulit diaudit kalau ada masalah.
4. Owner gak tahu cabang mana yang performanya turun sampai laporan bulanan.

**3 Cara kerja**: (1) Tiap cabang input transaksi harian seperti biasa.
(2) Laporan gabungan otomatis terkumpul di satu dashboard owner. (3)
Dokumen penting di-approve lewat e-sign berurutan, semua aksi tercatat
di audit log.

**4 Fitur**: Laporan gabungan multi-outlet real-time · E-sign dokumen
berurutan · Audit log tiap aksi sensitif · Perbandingan performa antar
cabang.

**Case study**: "Perusahaan retail, 12 cabang tersebar." Kondisi awal:
laporan direkap manual dari WhatsApp tiap cabang, approval dokumen
lambat karena harus ketemu langsung. Cara Altora bantu: laporan
gabungan otomatis, approval lewat e-sign berurutan, semua tercatat di
audit log.

==================================================
9. TEAMS — teams.altora.my.id
==================================================

Sudah dibangun lengkap di `apps/altora-teams-landing/` — jadi acuan
kualitas & struktur buat 9 vertikal lainnya. Ringkasan konten (buat
referensi konsistensi):

**Headline/lede**: "Absensi, jadwal, sampai target tim, beres." /
"Karyawan absen dari HP dengan foto+lokasi, jadwal shift diatur
manajer, target tim otomatis terisi dari data transaksi — tanpa Excel."

**4 Masalah**: Absensi manual rawan tidak akurat · Jadwal shift
bolak-balik di chat · Target tim dihitung ulang manual · Owner tidak
tahu kondisi tim hari ini.

**4 Fitur**: Absensi foto+lokasi · Jadwal shift & approval · Target tim
otomatis (dari data transaksi) · Laporan kehadiran & kinerja.

==================================================
10. ACCOUNTING — accounting.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Jurnal & Laporan Keuangan untuk
Bisnis Kecil-Menengah" / "Jurnal, buku besar, laporan keuangan rapi." /
"Pencatatan double-entry, laba rugi, sampai export buat akuntan — data
yang sama dengan transaksi harian, gak perlu input dobel."

**Hero visual**: mockup jurnal dengan tab Jurnal/Laba Rugi/Kas, tile Kas
hari ini+Laba bulan ini+Jurnal otomatis+Rekonsiliasi, live-row "Jurnal
#9021" (sudah ada di `hero-mocks.ts`).

**4 Masalah**:
1. Transaksi kasir dan catatan akuntansi dicatat dua kali secara manual.
2. Laba rugi baru ketahuan pas tutup buku akhir bulan, telat buat ambil keputusan.
3. Rekonsiliasi kas kecil sering ada selisih yang gak ketahuan sumbernya.
4. Data buat akuntan luar harus diketik ulang dari nol tiap mau lapor pajak.

**3 Cara kerja**: (1) Transaksi dari kasir/pengeluaran otomatis jadi
jurnal double-entry. (2) Laba rugi terupdate real-time, bukan nunggu
tutup buku. (3) Export data siap pakai buat akuntan, tanpa input ulang.

**4 Fitur**: Jurnal double-entry otomatis dari transaksi harian · Laba
rugi real-time · Rekonsiliasi kas kecil · Export siap pakai buat
akuntan/pajak.

**Case study**: "Usaha dengan 2 outlet, laporan buat akuntan tiap
bulan." Kondisi awal: transaksi dicatat dobel di kasir dan Excel
akuntansi, sering selisih. Cara Altora bantu: jurnal otomatis dari
transaksi harian, laba rugi bisa dicek kapan saja, data siap export
buat akuntan.

==================================================
CATATAN IMPLEMENTASI
==================================================

- Tiap app baru: copy struktur dari `apps/altora-teams-landing/`, ganti
  `package.json` name, isi konten dari breakdown di atas, pasang tema
  warna dari `verticals.ts`, pasang logo dari `public/brand/`.
- Ops: tiap app butuh entry Caddy sendiri (port unik, mis. 3004, 3005,
  dst.) + baris di `altora-main.service`-style systemd unit sendiri —
  atau didaftarkan semua dalam satu `ops/Caddyfile.altora-<vertikal>`
  per app, mengikuti pola `ops/Caddyfile.altora-teams`.
- Urutan pembangunan disarankan: Toko → Cafe → Laundry → Counter → Jasa
  → Supermarket → Pabrik → Company → Accounting (dari yang paling umum
  ke paling niche), tapi bisa disesuaikan sama prioritas bisnis.
