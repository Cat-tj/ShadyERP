# Altora Supermarket — Dashboard UI Guidelines

## 1. Tujuan desain

Buat dashboard operasional supermarket yang terasa:

- modern, tenang, premium, dan terpercaya
- cepat dipindai oleh owner, supervisor, dan manager cabang
- data-first, tetapi tidak seperti software akuntansi yang kaku
- usable di laptop, tablet kasir/backoffice, dan Android

Dashboard bukan halaman "semua data". Ia harus menjawab dalam 5–10 detik:

1. Apakah penjualan hari ini sehat?
2. Apa yang butuh tindakan sekarang?
3. Cabang/outlet mana yang bermasalah atau unggul?
4. Apa next action paling penting?

## 2. Visual direction

Gunakan gaya "Retail Command Center":

- Base background: abu sangat muda, bukan putih murni.
- Surface/card: putih bersih dengan border halus.
- Aksen utama Supermarket: Indigo.
- Status operasional menggunakan warna semantik yang konsisten.
- Banyak whitespace; jangan membuat layar seperti tabel ERP lama.
- Hindari gradient besar, glassmorphism, shadow gelap, dan warna berlebihan.

### Color tokens

```css
--bg-page: #F8FAFC;
--bg-surface: #FFFFFF;
--bg-subtle: #F1F5F9;

--text-primary: #0F172A;
--text-secondary: #475569;
--text-muted: #94A3B8;

--border-default: #E2E8F0;
--border-strong: #CBD5E1;

--primary: #4338CA;
--primary-hover: #3730A3;
--primary-soft: #EEF2FF;

--success: #16A34A;
--success-soft: #F0FDF4;

--warning: #D97706;
--warning-soft: #FFFBEB;

--danger: #DC2626;
--danger-soft: #FEF2F2;

--info: #0284C7;
--info-soft: #F0F9FF;
```

Aturan:

- Indigo hanya untuk aksi utama, state aktif, dan insight penting.
- Merah hanya untuk kondisi yang perlu tindakan segera: stok habis, transaksi gagal, PO overdue.
- Jangan jadikan semua badge berwarna terang; banyak status cukup `neutral`.

## 3. Typography

Gunakan font sans modern seperti Geist, Inter, atau Plus Jakarta Sans.

```txt
Page title:       24–28px / 700
Section title:    16–18px / 600–700
KPI value:        24–32px / 700
Card title:       14px / 600
Body:             14px / 400–500
Caption/meta:     12px / 400–500
```

Aturan:

- Jangan gunakan body text di bawah 12px.
- Angka finansial harus memakai `tabular-nums`.
- Format uang Indonesia konsisten: `Rp 24,8 jt`, bukan `Rp24.800.000` di KPI.
- Tampilkan angka penuh hanya di detail/table/export.

## 4. Layout desktop

Gunakan sidebar permanen dan content area yang tidak terlalu melebar.

```txt
App shell:
┌──────── Sidebar 248px ────────┬──────── Main content ────────┐
│ Logo + business switcher      │ Header + period/outlet filter │
│ Navigation grouped by job     │ KPI cards                     │
│                               │ Sales trend + action center   │
│                               │ Operational tables/cards      │
└───────────────────────────────┴───────────────────────────────┘
```

- Sidebar: `240–256px`
- Main content max-width: `1440px`
- Content padding desktop: `28–32px`
- Gap antar section: `24px`
- Gap dalam grid: `16px`
- Card radius: `12–16px`
- Card padding: `18–24px`
- Border 1px; shadow sangat lembut atau tanpa shadow.

Jangan membuat semua panel sama tinggi secara paksa jika isi berbeda.

## 5. Sidebar navigation

Sidebar harus berbasis pekerjaan, bukan daftar fitur teknis.

```txt
Overview
- Dashboard

Operasional
- Kasir & Transaksi
- Pesanan
- Produk & Harga
- Stok & Gudang
- Purchase Order

Analitik
- Laporan Penjualan
- Laporan Stok
- Pelanggan & Member

Pengaturan
- Outlet & Cabang
- Pengguna & Akses
- Pengaturan Supermarket
```

Aturan:

- Satu menu aktif yang jelas: background indigo soft + teks indigo.
- Icon selalu konsisten, stroke sederhana, ukuran 18–20px.
- Jangan tampilkan submenu panjang di topbar.
- Sidebar desktop dapat collapse menjadi rail icon; tablet/mobile menjadi drawer.

## 6. Header dashboard

Header cukup ringkas:

```txt
Dashboard
Pantau penjualan, stok, dan aktivitas outlet Anda.

[Outlet: Semua Outlet ▼] [Periode: Hari ini ▼] [Download laporan] [Avatar]
```

- Judul harus menjelaskan lokasi pengguna.
- Filter outlet dan periode berada di kanan.
- Default periode: Hari ini.
- Jangan menaruh banyak tombol primer di header.
- Aksi utama yang relevan: `Lihat laporan` atau `Buat PO`, bukan dua-duanya sekaligus tanpa alasan.

## 7. Urutan konten dashboard

Urutan wajib mengikuti prioritas tindakan:

### A. KPI ringkas

Empat kartu pada desktop:

1. Penjualan hari ini
2. Jumlah transaksi
3. Rata-rata transaksi
4. Margin estimasi

Setiap KPI harus memiliki:

- label singkat
- nilai utama
- perbandingan terhadap periode sebelumnya
- indikator arah naik/turun
- konteks, mis. "vs kemarin"

Contoh:

```txt
Penjualan hari ini
Rp 24,8 jt
↑ 12,4% vs kemarin
```

Jangan menggunakan grafik dekoratif kecil jika tidak membantu keputusan.

### B. Action center / perhatian hari ini

Letakkan dekat bagian atas, setelah KPI atau berdampingan dengan grafik tren.

Prioritas:

1. Stok habis / kritis
2. Purchase order terlambat
3. Kasir atau outlet offline
4. Produk dengan penjualan tidak normal
5. Approval yang menunggu

Contoh card:

```txt
Perlu perhatian
● 8 SKU berada di bawah stok minimum        [Lihat stok]
● 2 purchase order melewati jadwal tiba     [Tinjau PO]
● Outlet Sepinggan turun 18% hari ini       [Lihat analisis]
```

Aturan:

- Maksimal 3–5 item.
- Selalu beri CTA spesifik.
- Jangan gunakan alert merah untuk informasi biasa.
- Jika tidak ada masalah: tampilkan empty state positif, mis. "Operasional berjalan normal hari ini."

### C. Tren penjualan

- Grafik line/area 7 hari atau per jam untuk "Hari ini".
- Jangan gunakan lebih dari dua seri pada satu grafik.
- Tooltip wajib jelas.
- Sumbu Y harus format rupiah yang ringkas.
- Tampilkan insight satu kalimat, misalnya: "Puncak transaksi terjadi pukul 18.00–20.00."

### D. Operasional bawah

Grid yang disarankan:

| Panel           | Isi                                 | Tujuan                  |
| --------------- | ----------------------------------- | ------------------------ |
| Produk terlaris | 5 SKU, qty, omzet                   | Keputusan restock/promo |
| Stok prioritas  | SKU, stok saat ini, minimum, status | Tindakan stok           |
| Purchase order  | Supplier, ETA, nilai/status         | Kontrol inbound         |
| Performa cabang | Penjualan, transaksi, perubahan     | Membandingkan outlet    |

Setiap panel:

- Maksimal 5 baris di dashboard.
- Punya link `Lihat semua`.
- Jangan tampilkan tabel penuh di halaman dashboard.

## 8. Cards dan data density

Card harus memiliki struktur yang konsisten:

```txt
[Icon optional] Label / Judul              [Menu ⋯ optional]
Nilai atau konten utama
Konteks / perubahan / CTA
```

Aturan:

- Jangan letakkan lebih dari satu hierarki utama dalam satu card.
- Satu card = satu pertanyaan bisnis.
- Jangan memakai border, shadow, icon, badge, dan background warna sekaligus pada semua elemen.
- Data penting harus terbaca tanpa hover.

## 9. Tables

Untuk tabel stok, PO, atau produk:

- Header sticky bila tabel panjang.
- Tinggi row desktop: `52–60px`.
- Kolom angka rata kanan.
- Status selalu memakai badge kecil dan teks, jangan warna saja.
- Nama produk dapat 2 baris maksimal; SKU adalah metadata.
- Aksi row memakai menu `⋯`, bukan banyak button.

Status minimum:

```txt
Aman       → neutral/success
Menipis    → warning
Kritis     → danger
Dipesan    → info
Terlambat  → danger
```

## 10. Responsive behavior

### Desktop ≥ 1280px

- Sidebar terbuka.
- KPI 4 kolom.
- Grafik dan action center berdampingan.
- Panel bawah 2 kolom.

### Tablet 768–1279px

- Sidebar menjadi icon rail atau drawer.
- KPI 2 kolom.
- Grafik full-width; action center di bawahnya.
- Filter boleh wrap ke baris baru.

### Mobile < 768px

- Sidebar menjadi bottom navigation atau drawer.
- Header tetap ringkas: title + outlet switcher.
- KPI menjadi horizontal scroll atau grid 2 kolom.
- Semua tabel berubah menjadi card/list.
- CTA penting harus tetap terlihat tanpa scroll horizontal.
- Jangan memaksa tabel desktop ke layar HP.

Bottom navigation mobile:

```txt
Dashboard | Transaksi | Stok | Lainnya
```

## 11. Empty, loading, error, dan success states

Jangan pernah membiarkan area kosong tanpa konteks.

- Loading: skeleton yang mengikuti struktur final, bukan spinner di tengah layar.
- Empty data: jelaskan kenapa kosong dan action berikutnya.
- Error: jelaskan dampaknya dan beri `Coba lagi`.
- Success: gunakan feedback kecil, tenang, dan tidak mengganggu.

Contoh empty state:

```txt
Belum ada transaksi hari ini
Penjualan akan muncul setelah kasir menyelesaikan transaksi pertama.
[Ke halaman kasir]
```

## 12. Accessibility dan quality bar

- Kontras teks minimal WCAG AA.
- Semua status tidak boleh bergantung pada warna saja.
- Fokus keyboard harus terlihat.
- Area klik minimum 44×44px pada mobile.
- Tooltip diperlukan untuk icon-only button.
- Format tanggal, jam, Rupiah, dan timezone harus konsisten.
- Jangan gunakan data palsu di production. Jika API belum siap, tampilkan state "Belum tersedia", bukan angka demo.

## 13. Non-goals

Jangan:

- membuat dashboard seperti halaman laporan penuh
- menampilkan 12+ KPI sekaligus
- memakai chart untuk setiap angka
- membuat semua alert terasa darurat
- menampilkan fitur dari vertikal Altora lain
- menggunakan UI "desktop diperkecil" pada mobile

## 14. Acceptance criteria

Dashboard dianggap selesai bila:

- Owner dapat mengetahui kondisi bisnis hari ini dalam <10 detik.
- Supervisor dapat menemukan stok/PO bermasalah dalam ≤2 klik.
- Semua data tenant dan outlet scoped.
- Tidak ada angka demo pada production.
- Desktop, tablet, dan mobile diuji.
- State loading, empty, error, dan no-access tersedia.
- Semua CTA memiliki tujuan operasional yang nyata.
