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

Tiap app landing pakai 9 section ini (contoh implementasi lengkap ada di
`apps/altora-teams-landing/src/app/page.tsx`):

1. **Header** — logo + nav (4 anchor link) + tombol Masuk & CTA WhatsApp.
2. **Hero** — eyebrow, headline (1 baris tajam), lede (1-2 kalimat), 2 CTA,
   3 angka ringkas (stat row), visual hero (mockup HP/dashboard).
3. **Marquee band** — 5-6 frasa fitur singkat, auto-scroll, warna gelap.
4. **Masalah / Pain** (`#masalah`) — 4 pain point dalam bento grid. Kartu
   pertama lebih tinggi, isinya: 2-3 badge ringkasan masalah + 1 kartu
   detail konkret (nama/order/unit + status + 2 data poin) + caption +
   link "Lihat detail" — pola persis kartu "Dewi Kurnia" di Teams.
5. **Cara kerja** (`#cara-kerja`) — 3 langkah bergaris penghubung, latar
   gelap, ditutup 3 baris highlight kepercayaan.
6. **Fitur** (`#fitur`) — 4 kartu fitur, **tiap kartu WAJIB punya
   mini-mockup sendiri** (checklist, mini kalender, progress bar, mini
   tabel, dsb — bukan cuma teks). Lihat breakdown per vertikal di bawah.
7. **Solusi / Contoh implementasi** — kartu "Kondisi awal" (soft bg) +
   kartu "Cara Altora membantu" (dark bg, 3 baris dengan ikon panah).
8. **Perbandingan / Before-After** (`#perbandingan`) — split panel dua
   kolom, "Sebelum Altora ...” vs "Dengan Altora ...”, 4 baris masing²
   (sisi "sesudah" pakai ikon centang).
9. **CTA penutup** — panel gradien warna vertikal + footer ekosistem
   (cross-link ke vertikal lain & altora.my.id).

Section 4, 6, 7, 8 adalah 4 tempat yang WAJIB py mockup/visual konkret,
bukan cuma paragraf — itu yang bikin tiap landing terasa dibangun khusus,
bukan template isi ulang.

==================================================
KARAKTER PER VERTIKAL
==================================================

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

**Eyebrow/headline/lede** (final): "POS & Manajemen Cafe untuk UMKM
Indonesia" / "Kasir cafe, dari meja sampai dapur." / "Pesanan meja lewat
QR, layar dapur biar kitchen gak ribet, sampai resep & bahan baku —
semua kecatat otomatis di satu aplikasi."

**Hero visual**: mockup dashboard kasir, tab POS/Dapur/Finance, tile
Omzet+Transaksi+Stok menipis+Pesanan meja, live-order "Meja 04" (sudah
ada di `hero-mocks.ts`).

**4 Masalah**: (1) Pesanan numpuk pas jam ramai, pelayan bolak-balik
catat manual ke dapur. (2) Stok bahan baku (susu, sirup, biji kopi)
habis mendadak tanpa peringatan. (3) Resep tiap barista beda takaran,
rasa gak konsisten. (4) Owner gak tahu menu paling untung sampai tutup
buku bulanan.

**Mockup Pain (kartu #1)**: badge "3 meja antre" / "0 notifikasi dapur"
/ "Rawan salah catat". Kartu detail: **Meja 07** · "5 menit lalu" ·
"2× Cappuccino, 1× Kentang Goreng" · badge **"Belum masuk dapur"**.

**3 Cara kerja**: (1) Scan QR di tiap meja, sambungkan ke menu digital.
(2) Atur resep & bahan baku sekali — stok kepotong otomatis tiap
pesanan. (3) Pantau dapur & kasir dari satu layar.

**4 Fitur + mini-mockup**:
1. Pesan QR meja — mini kitchen-ticket: 2 baris pesanan masuk berstatus
   "Baru" / "Diproses".
2. Resep & bahan baku — 2 progress bar bahan (Susu 40%, Biji kopi 15%
   warn).
3. Split bill & buka tab meja — mini kartu "Meja 04 — 3 item, belum
   bayar" + tombol split.
4. Laporan menu terlaris — mini ranking: 1. Kopi Susu 82×, 2. Croissant
   54×.

**Solusi (kondisi awal → cara Altora bantu)**: Kondisi awal — "Pelayan
bolak-balik ke dapur, sering salah catat pesanan ramai." Cara Altora
bantu (3 baris): Pelanggan pesan sendiri dari HP di meja → Dapur lihat
antrian real-time di kitchen display → Kasir tinggal proses pembayaran.

**Perbandingan**: Sebelum — pelayan catat manual ke dapur · stok bahan
baku habis mendadak · resep beda tiap barista · menu favorit cuma
ketebak. Sesudah — pesanan masuk kitchen display otomatis · stok bahan
baku ada peringatan dini · resep standar, stok kepotong otomatis · menu
terlaris dari data asli.

==================================================
2. TOKO — toko.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "POS & Manajemen Toko untuk UMKM
Indonesia" / "Kasir toko, stok gak pernah nyasar." / "Scan barcode pas
jualan, stok otomatis berkurang, laporan produk terlaris langsung ada —
tanpa hitung manual di buku."

**Hero visual**: mockup kasir, tab Kasir/Stok/Finance, tile Omzet+
Transaksi+Stok menipis+Barang masuk, live-row "Transaksi #204" (sudah
ada di `hero-mocks.ts`).

**4 Masalah**: (1) Stok fisik dan catatan buku sering beda. (2) Barang
varian (ukuran/warna) susah dilacak satu-satu. (3) Pindah stok antar
cabang gak ada jejaknya. (4) Produk terlaris cuma ketebak dari ingatan.

**Mockup Pain (kartu #1)**: badge "Selisih 12 item" / "0 riwayat
perubahan" / "Ketahuan telat". Kartu detail: **Indomie Goreng** ·
"Sistem: 48 · Fisik: 36" · badge **"Selisih -12"**.

**3 Cara kerja**: (1) Input produk + varian sekali, scan barcode tiap
transaksi. (2) Transfer stok antar cabang tercatat otomatis. (3) Lihat
laporan produk terlaris kapan saja.

**4 Fitur + mini-mockup**:
1. Scan barcode kasir — mini baris scan: "Beep — Aqua 600ml
   ditambahkan".
2. Varian ukuran/warna — mini grid chip S/M/L + stok masing-masing.
3. Transfer stok antar cabang — mini flow "Cabang 1 → Cabang 2 · 24
   item · Dalam perjalanan".
4. Laporan produk terlaris — ranking mini: 1. Indomie Goreng, 2. Aqua
   600ml.

**Solusi**: Kondisi awal — "Stok dicatat manual di buku, sering selisih
pas dicek fisik." Cara Altora bantu: Tiap transaksi otomatis potong
stok sistem → Transfer antar cabang punya jejak jelas → Laporan
terlaris muncul otomatis.

**Perbandingan**: Sebelum — stok dicek manual, sering selisih · varian
dicatat di buku terpisah · transfer stok gak ada jejak · produk
terlaris cuma ketebak. Sesudah — stok terupdate otomatis tiap transaksi
· semua varian dalam satu produk · transfer stok tercatat jelas ·
laporan terlaris dari data asli.

==================================================
3. SUPERMARKET — supermarket.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "POS & Manajemen Stok untuk
Supermarket" / "Ribuan SKU, tetap gampang dipantau." / "Harga grosir
bertingkat, banyak supplier, barang masuk sampai stock opname —
dibikin buat toko dengan stok besar."

**Hero visual**: mockup kasir, tab Kasir/Purchase/Finance, tile Omzet+
Transaksi+SKU aktif+Barang masuk, live-row "PO #482" (sudah ada di
`hero-mocks.ts`).

**4 Masalah**: (1) Ribuan SKU bikin stock opname manual makan waktu
berhari-hari. (2) Harga grosir beda per qty per supplier, gampang salah
input. (3) Barang masuk dari banyak supplier gak ada QC tercatat. (4)
Selisih stok baru ketahuan pas opname akhir bulan.

**Mockup Pain (kartu #1)**: badge "1.240 SKU" / "3 hari opname" /
"Selisih besar". Kartu detail: **Stock Opname — Gudang A** ·
"820/1.240 dicek" · badge **"Berjalan"**.

**3 Cara kerja**: (1) Import katalog produk + harga grosir bertingkat
sekali. (2) Barang masuk dicatat dengan QC, langsung update stok. (3)
Stock opname rutin, selisih kecil ketahuan lebih cepat.

**4 Fitur + mini-mockup**:
1. Harga grosir bertingkat — mini tabel tier: 1-10 pcs Rp15rb, 11-50
   Rp13rb, 50+ Rp11rb.
2. Multi-supplier — mini list 2 supplier + harga terakhir masing².
3. Barang masuk + QC — checklist "120 item diterima ✓ QC lolos".
4. Stock opname — progress bar per kategori (Sembako 92%, Minuman 78%).

**Solusi**: Kondisi awal — "Opname manual, selisih besar baru ketahuan
akhir bulan." Cara Altora bantu: Barang masuk tercatat per PO dengan QC
→ Opname rutin per kategori → Selisih kelihatan mingguan, bukan
bulanan.

**Perbandingan**: Sebelum — opname manual berhari-hari · harga grosir
sering salah input · barang masuk gak ada QC tercatat · selisih
ketahuan telat. Sesudah — opname per kategori lebih ringan · harga
grosir otomatis sesuai qty · QC tercatat tiap barang masuk · selisih
kelihatan tiap minggu.

==================================================
4. LAUNDRY — laundry.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Aplikasi Kasir & Order untuk Usaha
Laundry" / "Cucian masuk, status kelihatan sampai selesai." / "Pelanggan
bisa cek status cucian sendiri lewat link, bayar bisa dicicil, dan
omzet harian otomatis kecatat."

**Hero visual**: mockup order, tab Order/Status/Finance, tile Omzet+
Order aktif+Siap diambil+Cicilan tertunda, live-row "Order #128" (sudah
ada di `hero-mocks.ts`).

**4 Masalah**: (1) Pelanggan telepon berkali-kali nanya status. (2)
Nota kertas gampang hilang/rusak kena air. (3) Cicilan DP-pelunasan
dicatat di buku, gampang lupa. (4) Omzet harian cuma keliatan pas
hitung kas malam.

**Mockup Pain (kartu #1)**: badge "8 telepon/hari" / "0 update status"
/ "Bikin pelanggan kesal". Kartu detail: **Order #124 — Bu Sari** ·
"Ditanya 3× hari ini" · badge **"Belum ada update"**.

**3 Cara kerja**: (1) Order masuk, catat kiloan/satuan + estimasi
selesai. (2) Update status — pelanggan cek sendiri lewat link. (3)
Bayar DP, cicil, atau lunas — omzet kecatat otomatis.

**4 Fitur + mini-mockup**:
1. Order kiloan & satuan — mini form "5kg cuci+setrika — Rp35.000".
2. Status real-time via link — mini stepper: Diterima → Dicuci →
   Disetrika → Siap (highlight "Disetrika").
3. Cicilan DP-pelunasan — mini baris "DP Rp20.000 ✓" / "Sisa
   Rp15.000".
4. Omzet harian otomatis — mini stat "Rp1,2jt · 18 order selesai".

**Solusi**: Kondisi awal — "Telepon masuk terus nanyain status, nota
kertas sering hilang." Cara Altora bantu: Pelanggan cek status sendiri
lewat link → Cicilan tercatat rapi → Omzet harian gak perlu dihitung
manual.

**Perbandingan**: Sebelum — telepon terus nanya status · nota kertas
gampang hilang · cicilan dicatat di buku, gampang lupa · omzet dihitung
manual tiap malam. Sesudah — pelanggan cek status sendiri lewat link ·
semua tercatat digital · cicilan tercatat otomatis sampai lunas · omzet
harian langsung kelihatan.

==================================================
5. COUNTER — counter.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Aplikasi Kasir & Servis untuk
Konter HP/Elektronik" / "Jual aksesoris, terima servis, satu kasir." /
"Garansi servis tercatat rapi, jual produk dan terima perbaikan dari
kasir yang sama — tanpa nota kertas kececer."

**Hero visual**: mockup kasir, tab Kasir/Servis/Finance, tile Omzet+
Servis masuk+Garansi aktif+Stok aksesoris, live-row "Servis #45" (sudah
ada di `hero-mocks.ts`).

**4 Masalah**: (1) Nota servis kertas gampang hilang, garansi
disangkal. (2) Status servis gak jelas, pelanggan telepon berkali-kali.
(3) Jualan aksesoris dan servis dicatat terpisah. (4) Garansi lewat
masa berlaku gak ada yang ingetin.

**Mockup Pain (kartu #1)**: badge "0 bukti servis" / "Garansi
disangkal" / "Pelanggan komplain". Kartu detail: **Servis #38 —
iPhone 11** · "Ganti baterai, 2 bulan lalu" · badge **"Nota hilang"**.

**3 Cara kerja**: (1) Terima unit servis, catat kerusakan + estimasi
biaya. (2) Update status, garansi otomatis tercatat. (3) Jual aksesoris
dari kasir yang sama.

**4 Fitur + mini-mockup**:
1. Tanda terima servis digital — mini receipt "Servis #45 — Ganti
   baterai — diterima".
2. Tracking status servis — mini stepper: Diterima → Diperiksa →
   Diperbaiki → Selesai.
3. Garansi + pengingat — mini badge "Garansi aktif — 18 hari lagi".
4. Kasir aksesoris terintegrasi — mini baris keranjang "1× Tempered
   Glass — Rp25.000".

**Solusi**: Kondisi awal — "Nota servis kertas, garansi sering
disangkal karena gak ada bukti." Cara Altora bantu: Tanda terima
digital → Status servis bisa dicek pelanggan → Garansi tercatat
otomatis dengan tanggal jelas.

**Perbandingan**: Sebelum — nota servis kertas gampang hilang · status
servis gak jelas · aksesoris & servis dicatat terpisah · garansi lewat
gak ada yang ingetin. Sesudah — tanda terima digital tersimpan rapi ·
status servis bisa dicek kapan saja · satu kasir buat aksesoris &
servis · pengingat otomatis sebelum garansi habis.

==================================================
6. JASA — jasa.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Aplikasi Booking & Kasir untuk
Usaha Jasa" / "Jadwal booking, rapi tanpa buku catatan." / "Barbershop,
spa, atau bengkel reparasi — atur jadwal, staf yang pegang, sampai DP
dan pelunasan pembayaran."

**Hero visual**: mockup booking, tab Booking/Kasir/Finance, tile
Booking hari ini+Omzet+Staf aktif+Slot kosong, live-row "Booking 14:00"
(sudah ada di `hero-mocks.ts`).

**4 Masalah**: (1) Booking telepon/chat gampang bentrok jadwal. (2)
Pelanggan lupa jadwal booking sendiri. (3) DP gampang lupa dicatat. (4)
Owner gak tahu staf mana paling laku.

**Mockup Pain (kartu #1)**: badge "2 booking bentrok" / "0 pengingat" /
"Staf bingung". Kartu detail: **14:00 — Potong rambut** · "Andi & Budi
sama-sama dijadwalkan" · badge **"Bentrok"**.

**3 Cara kerja**: (1) Buka slot jadwal per staf, booking ke slot
kosong. (2) Sistem cegah bentrok otomatis. (3) DP dan pelunasan
tercatat, laporan performa staf otomatis muncul.

**4 Fitur + mini-mockup**:
1. Jadwal per staf anti-bentrok — mini kalender per staf (Andi: 3
   slot, Budi: 2 slot).
2. Booking manual/mandiri — mini toggle "Via telepon" / "Booking
   sendiri".
3. DP & pelunasan — mini baris "DP Rp20.000 ✓ · Sisa Rp25.000".
4. Laporan performa staf — ranking mini (Andi 18 booking, Budi 12
   booking).

**Solusi**: Kondisi awal — "Jadwal sering bentrok, DP gak tercatat
rapi." Cara Altora bantu: Tiap staf punya jadwal sendiri anti-bentrok →
DP otomatis tercatat sampai pelunasan → Laporan performa staf otomatis.

**Perbandingan**: Sebelum — booking sering bentrok jadwal · pelanggan
lupa jadwal sendiri · DP gampang lupa dicatat · gak tahu staf mana
paling laku. Sesudah — jadwal per staf anti-bentrok otomatis ·
pengingat booking ke pelanggan · DP & pelunasan tercatat rapi ·
laporan performa staf jelas.

==================================================
7. PABRIK — pabrik.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Manajemen Bahan Baku & Aset untuk
Usaha Produksi" / "Bahan baku sampai maintenance mesin, satu layar." /
"Pantau stok bahan baku, jadwal maintenance alat produksi, dan laporan
pemakaian — biar produksi gak keteteran."

**Hero visual**: mockup stok, tab Stok/Maintenance/Finance, tile Bahan
baku aman+Maintenance+Produksi hari ini+Supplier aktif, live-row
"Mesin #2" (sudah ada di `hero-mocks.ts`).

**4 Masalah**: (1) Bahan baku habis mendadak, gak ada peringatan dini.
(2) Mesin rusak mendadak karena maintenance terlupa. (3) Pemakaian
bahan per batch gak tercatat rapi. (4) Owner gak tahu mesin mana paling
sering bermasalah.

**Mockup Pain (kartu #1)**: badge "0 peringatan dini" / "Produksi
berhenti" / "Rugi waktu". Kartu detail: **Tepung terigu** · "Sisa 8kg,
butuh 25kg" · badge **"Kurang"**.

**3 Cara kerja**: (1) Catat stok bahan baku + ambang batas minimum. (2)
Jadwalkan maintenance rutin per mesin. (3) Tiap batch produksi otomatis
potong bahan baku.

**4 Fitur + mini-mockup**:
1. Stok bahan baku + ambang minimum — mini bar "Tepung 32% — di bawah
   minimum" (warn).
2. Jadwal maintenance — mini chip kalender "Mesin #2 — servis 15 Jul".
3. Pemakaian per batch — mini baris "Batch #204 — 50kg tepung
   terpakai".
4. Riwayat servis mesin — mini list (Mesin #1: 3× servis, Mesin #2:
   1× servis).

**Solusi**: Kondisi awal — "Bahan baku habis mendadak, maintenance
mesin sering telat." Cara Altora bantu: Stok bahan baku dipantau dengan
ambang minimum → Maintenance terjadwal, diingatkan sebelum jadwal →
Pemakaian bahan tercatat otomatis per batch.

**Perbandingan**: Sebelum — bahan baku habis mendadak · maintenance
sering telat/lupa · pemakaian bahan gak tercatat rapi · gak tahu mesin
mana sering rusak. Sesudah — peringatan dini sebelum bahan habis ·
maintenance terjadwal otomatis · pemakaian per batch tercatat rapi ·
riwayat servis per mesin kelihatan.

==================================================
8. COMPANY — company.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Manajemen Multi-Cabang untuk
Perusahaan" / "Kontrol banyak cabang dari satu tempat." / "Laporan
gabungan semua outlet, dokumen & tanda tangan digital berurutan, sampai
audit log tiap aksi penting."

**Hero visual**: mockup laporan, tab Cabang/Approval/Finance, tile
Cabang terpantau+Approval jalan+Omzet gabungan+Audit log, live-row
"Dokumen #12" (sudah ada di `hero-mocks.ts`).

**4 Masalah**: (1) Laporan tiap cabang direkap manual. (2) Dokumen
persetujuan bolak-balik dicetak buat tanda tangan. (3) Gak ada jejak
siapa ubah data penting. (4) Owner gak tahu cabang mana turun performa
sampai laporan bulanan.

**Mockup Pain (kartu #1)**: badge "12 cabang" / "0 rekap otomatis" /
"Telat 3 hari". Kartu detail: **Cabang Bali — laporan harian** ·
"Belum dikirim hari ini" · badge **"Menunggu"**.

**3 Cara kerja**: (1) Tiap cabang input transaksi harian seperti biasa.
(2) Laporan gabungan otomatis terkumpul. (3) Dokumen di-approve lewat
e-sign berurutan, semua tercatat di audit log.

**4 Fitur + mini-mockup**:
1. Laporan gabungan real-time — mini bar chart 3 cabang (Bali 92%,
   Jakarta 78%, Surabaya 85%).
2. E-sign dokumen berurutan — mini stepper "Manager → Finance → Owner"
   (highlight Finance).
3. Audit log — mini baris "Login baru — Cabang Bali, 09:14".
4. Perbandingan performa cabang — ranking mini (Cabang Jakarta #1,
   Bali #2).

**Solusi**: Kondisi awal — "Laporan direkap manual dari WhatsApp tiap
cabang." Cara Altora bantu: Laporan gabungan otomatis dari semua
cabang → Approval lewat e-sign berurutan → Semua aksi tercatat di audit
log.

**Perbandingan**: Sebelum — laporan direkap manual dari WhatsApp ·
approval dokumen lambat, harus ketemu langsung · gak ada jejak siapa
ubah data · performa cabang ketahuan pas laporan bulanan. Sesudah —
laporan gabungan otomatis real-time · e-sign berurutan, approval dari
mana saja · audit log catat tiap aksi penting · performa cabang bisa
dibandingkan kapan saja.

==================================================
9. TEAMS — teams.altora.my.id (SUDAH DIBANGUN — acuan kualitas)
==================================================

Lengkap di `apps/altora-teams-landing/src/app/page.tsx`. Ringkasan buat
referensi konsistensi:

**Headline/lede**: "Absensi, jadwal, sampai target tim, beres." /
"Karyawan absen dari HP dengan foto+lokasi, jadwal shift diatur
manajer, target tim otomatis terisi dari data transaksi — tanpa Excel."

**Mockup Pain**: badge "2 cara absen beda-beda" / "0 bukti kehadiran" /
"Sulit diaudit". Kartu detail: **Dewi Kurnia** · "Shift pagi · Cabang
BSD" · "08:14 · telat 14 mnt" · "Lokasi belum valid" · badge **"Perlu
dicek"**.

**4 Fitur + mini-mockup**: Absensi foto+lokasi (checklist 2 baris) ·
Jadwal shift & approval (mini kalender mingguan + chip "Tukar shift
disetujui") · Target tim otomatis (2 progress bar per cabang) ·
Laporan kehadiran & kinerja (mini tabel 3 kolom).

**Solusi**: Absensi difoto & lokasi otomatis tercatat → Jadwal shift
diatur manajer, karyawan cek dari HP → Target tim otomatis terisi dari
data transaksi.

**Perbandingan**: Sebelum — absensi manual, rawan tidak akurat · jadwal
shift bolak-balik di chat · target dihitung ulang manual · owner tidak
tahu kondisi tim. Sesudah — absensi foto+lokasi otomatis · jadwal &
approval dalam satu kalender · target otomatis dari transaksi · owner
pantau kapan saja.

==================================================
10. ACCOUNTING — accounting.altora.my.id
==================================================

**Eyebrow/headline/lede** (final): "Jurnal & Laporan Keuangan untuk
Bisnis Kecil-Menengah" / "Jurnal, buku besar, laporan keuangan rapi." /
"Pencatatan double-entry, laba rugi, sampai export buat akuntan — data
yang sama dengan transaksi harian, gak perlu input dobel."

**Hero visual**: mockup jurnal, tab Jurnal/Laba Rugi/Kas, tile Kas hari
ini+Laba bulan ini+Jurnal otomatis+Rekonsiliasi, live-row "Jurnal #9021"
(sudah ada di `hero-mocks.ts`).

**4 Masalah**: (1) Transaksi kasir & akuntansi dicatat dua kali. (2)
Laba rugi baru ketahuan tutup buku akhir bulan. (3) Rekonsiliasi kas
kecil sering ada selisih. (4) Data buat akuntan diketik ulang tiap
bulan.

**Mockup Pain (kartu #1)**: badge "2× input manual" / "Rawan selisih" /
"Buang waktu". Kartu detail: **Transaksi #9018** · "Dicatat di kasir &
Excel terpisah" · badge **"Berpotensi selisih"**.

**3 Cara kerja**: (1) Transaksi dari kasir/pengeluaran otomatis jadi
jurnal double-entry. (2) Laba rugi terupdate real-time. (3) Export data
siap pakai buat akuntan.

**4 Fitur + mini-mockup**:
1. Jurnal double-entry otomatis — mini baris "Penjualan #9021 → Jurnal
   terposting otomatis".
2. Laba rugi real-time — mini stat "Laba bulan ini: +14% · update
   live".
3. Rekonsiliasi kas kecil — mini baris "Kas kecil — selisih Rp15.000,
   perlu dicek" (warn).
4. Export siap pakai — mini tombol "Export ke akuntan — .xlsx".

**Solusi**: Kondisi awal — "Transaksi dicatat dobel di kasir dan Excel
akuntansi, sering selisih." Cara Altora bantu: Jurnal otomatis dari
transaksi harian → Laba rugi bisa dicek kapan saja → Data siap export
buat akuntan.

**Perbandingan**: Sebelum — transaksi dicatat dobel manual · laba rugi
baru ketahuan akhir bulan · rekonsiliasi kas sering selisih · data buat
akuntan diketik ulang tiap bulan. Sesudah — jurnal otomatis dari
transaksi harian · laba rugi bisa dicek kapan saja · rekonsiliasi kas
kecil lebih rapi · export data siap pakai buat akuntan.

==================================================
CATATAN IMPLEMENTASI
==================================================

- Tiap app baru: copy struktur dari `apps/altora-teams-landing/`, ganti
  `package.json` name, isi konten + mockup dari breakdown di atas,
  pasang tema warna dari `verticals.ts`, pasang logo dari
  `public/brand/`.
- Mockup di section Masalah, Fitur, Solusi, Perbandingan itu WAJIB ada
  visual (badge, kartu detail, progress bar, mini tabel, stepper) —
  bukan paragraf teks polos. Lihat pola persis di
  `apps/altora-teams-landing/src/app/page.tsx` (painPoints index 0,
  4 fitur, case-study, comparison).
- Ops: tiap app butuh entry Caddy sendiri (port unik, mis. 3004, 3005,
  dst.), mengikuti pola `apps/altora-teams-landing/ops/Caddyfile.altora-teams`.
- Urutan pembangunan disarankan: Toko → Cafe → Laundry → Counter → Jasa
  → Supermarket → Pabrik → Company → Accounting, tapi bisa disesuaikan
  sama prioritas bisnis.
