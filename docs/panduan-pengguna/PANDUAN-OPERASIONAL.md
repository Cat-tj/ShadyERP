# Panduan Operasional Altora

## Prinsip utama

- Kasir menjual; Owner mengatur dan menyetujui.
- Setiap orang memakai akun sendiri agar shift, absensi, dan audit dapat ditelusuri.
- Gunakan penerimaan, transfer, retur, void, dan opname untuk koreksi. Jangan menghapus jejak.
- Uang laci hanya kas tunai. QRIS, transfer, dan e-wallet adalah penerimaan digital.
- Modul yang tidak dipakai sebaiknya disembunyikan lewat `Pengaturan → Modul`.

## Setup pertama oleh Owner

1. Pada `Pengaturan → Bisnis`, isi nama usaha, pajak, footer struk, aturan poin, dan QRIS statis.
2. Pada `Pengaturan → Outlet`, buat semua cabang dan pilih lebar kertas struk 58 atau 80 mm.
3. Pada `Pengaturan → Karyawan`, buat akun Owner, Manager, dan Staff; hubungkan ke outlet kerja.
4. Buat kategori dan produk: nama, harga, modal, SKU/barcode, jenis barang/jasa, dan stok awal per outlet.
5. Bila barang dibeli per karton dan dijual per biji, atur satuan/konversi. Aktifkan serial untuk elektronik dan batch produksi/kedaluwarsa untuk produk berumur simpan.
6. Buat satu transaksi dan satu tutup shift percobaan sebelum operasional sebenarnya dimulai.

## Peran

| Peran | Tanggung jawab |
| --- | --- |
| Owner | Bisnis, outlet, staf, modul, approval, laporan, dan akses penuh. |
| Manager | Operasional cabang, stok, jadwal, pesanan, dan approval yang diizinkan. |
| Staff | Kasir, pelayanan, absensi, dan tugas yang diberikan. |

## SOP kasir setiap shift

### Buka shift

1. Login dengan akun sendiri dan buka `Kasir`.
2. Tekan **Buka Shift** dan masukkan kas awal yang benar-benar ada di laci.
3. Cek scanner, printer, produk aktif, stok, dan koneksi.

Satu kasir hanya boleh memiliki satu shift terbuka. Tutup shift lama sebelum membuka yang baru.

### Buat transaksi

1. Scan barcode/QR produk, atau cari berdasarkan SKU/nama.
2. Pilih varian, topping, serial/IMEI, dan jumlah bila dibutuhkan.
3. Periksa diskon dan jenis pesanan: Dine-in, Takeaway, atau Delivery.
4. Untuk Delivery, pilih channel yang benar agar laporan channel akurat.
5. Pilih Tunai, QRIS, Transfer, E-Wallet, Saldo Member, Voucher, atau split payment.
6. Untuk tunai, masukkan uang diterima dan pastikan kembalian. Untuk QRIS, tampilkan QR nominal dan ikuti SOP verifikasi pembayaran usaha.
7. Tekan Bayar sekali. Jika respons lambat, tunggu; transaksi memakai retry key agar tidak ganda.
8. Cetak atau kirim struk bila diperlukan.

### Tutup shift

1. Selesaikan semua transaksi dan sinkronkan antrean offline.
2. Buka `Kasir → Tutup Shift`, lalu hitung uang fisik di laci.
3. Bandingkan uang fisik dengan expected cash. QRIS/digital harus tetap diperlakukan terpisah.
4. Periksa kas awal, cashback, retur tunai, dan gesek tunai bila ada selisih.
5. Isi catatan alasan untuk selisih; jangan memanipulasi angka kas.

## Inventory dan pengadaan

| Kejadian | Prosedur |
| --- | --- |
| Pesan barang | Buat `Purchase Order` ke supplier. PO bukan stok masuk. |
| Barang tiba | Catat di `Barang Masuk`, lakukan QC, masukkan batch/expired bila perlu. |
| Barang pindah cabang | Gunakan `Transfer Stok`; cabang tujuan menerima transfer. |
| Stok fisik berbeda | Gunakan `Stock Count`, lalu verifikasi selisih. |
| Rusak/hilang/expired | Catat di `Waste` atau penyesuaian stok dengan alasan. |

Barang datang tidak boleh hanya dicatat di chat. Simpan faktur sebagai dokumen bila perlu, tetapi jumlah, harga modal, QC, satuan, dan tanggal kedaluwarsa harus masuk ke Altora.

Untuk makanan, minuman, obat, dan kosmetik, gunakan **FEFO**: jual batch dengan kedaluwarsa paling dekat lebih dulu. Untuk barang umum, gunakan FIFO. Jangan menjual barang kedaluwarsa.

## Member, promo, tim, dan laporan

- Pilih member sebelum bayar agar poin, deposit, stamp, atau voucher tercatat.
- Gunakan promo terjadwal untuk happy hour atau kategori tertentu; hindari diskon manual tanpa alasan bila usaha perlu audit.
- Manager membuat jadwal per outlet dan shift; Staff clock-in/out dengan foto dan lokasi bila fitur diaktifkan.
- Gunakan `Dokumen` dan e-sign untuk SP, izin, kontrak, atau approval. Beri akses per user/role.
- Catat biaya operasional pada hari kejadian: sewa, listrik, bahan baku, gaji, transport, dan lainnya.
- Mode **Simple** cocok untuk kas masuk/keluar dan insight ringkas. Mode **Advanced** untuk finance yang mengelola jurnal, hutang supplier, laba-rugi, neraca saldo, serta tutup buku.

## Altora Cafe

### Setup cafe

1. Buat kategori Kopi, Non-Kopi, Makanan, dan Add-on.
2. Buat menu, harga modal, varian ukuran, topping, dan resep bahan baku.
3. Buat meja/lantai pada `Pengaturan → Meja`, lalu cetak QR masing-masing meja.
4. Aktifkan Pemesanan Digital, Member, Promo, dan HR sesuai kebutuhan.

### QR meja dan dapur

1. Pelanggan scan QR meja, memilih menu, lalu mengirim pesanan.
2. Pesanan muncul di `Pesanan Meja` atau layar dapur; staff menerima, memasak, lalu menandai siap.
3. Saat bayar, selesaikan melalui pembayaran meja atau kasir.
4. Jika batal, batalkan melalui pesanan agar reservasi stok kembali.

Untuk order counter pilih Takeaway. Untuk Gojek, Grab, Shopee Food, kurir toko, atau channel lain, pilih Delivery dan channel yang benar. Untuk pesanan event gunakan `Pesanan Katering` agar DP, transport, biaya barista, dan pelunasan dapat dilacak.

### Contoh tiga cabang

Cabang A kekurangan susu → buat transfer dari Cabang B → Cabang A menerima transfer → stok tidak perlu diubah manual. Akhir hari setiap kasir menutup shift sendiri; Owner membandingkan cash drawer dengan kas tunai, sementara QRIS/channel delivery dibaca sebagai digital.

## Altora Toko / Retail

### Setup retail

1. Satu barang berbeda SKU, ukuran, atau harga harus punya produk/varian yang jelas.
2. Isi barcode dan cetak label jika barang belum punya barcode dari supplier.
3. Aktifkan expiry untuk makanan/minuman/kosmetik dan serial untuk HP/elektronik bergaransi.
4. Buat titik stok minimum agar produk yang cepat habis terlihat sebelum rak kosong.

### Barang masuk dan jual cepat

Barang datang → pilih supplier/PO → scan atau cari produk → input jumlah, harga modal, batch, expired, dan QC rusak → selesaikan penerimaan → stok bertambah. Saat jual, kasir scan satu per satu; jika label gagal, cari SKU/nama. Jangan membuat produk baru di tengah antrean hanya karena scanner gagal.

### Retur dan selisih

Transaksi salah sebelum selesai diperbaiki di keranjang. Setelah selesai gunakan void atau retur dari riwayat transaksi, bukan menghapus data. Selisih rak dengan sistem harus masuk stock count agar Owner bisa membedakan kehilangan, kerusakan, atau salah penerimaan.

## Altora Laundry

1. Buat layanan di `Pengaturan → Laundry`: Kiloan, Express, Satuan, Dry Clean, Setrika.
2. Pada order baru, pilih pelanggan/member, layanan, berat/jumlah item, harga, biaya tambahan, pickup/delivery, estimasi selesai, catatan noda/kondisi, serta DP bila ada.
3. Gunakan alur **Diterima → Dicuci → Dikeringkan → Disetrika → Siap → Diambil**.
4. Catat pembayaran bertahap bila pelanggan memberi DP dan melunasi saat ambil.
5. Saat serah terima, cocokkan nomor order, nomor HP, total, dan status bayar.

Gunakan catatan order untuk parfum, noda, warna, dan instruksi pelanggan. Jangan membuat jenis layanan baru hanya karena satu order mempunyai catatan khusus.

## Counter, Barbershop, dan Company

### Counter

Pakai mode Simple untuk transaksi cepat. Bedakan barang stok dan jasa; jasa tidak mengurangi stok. Gunakan barcode untuk aksesoris dan serial untuk perangkat unik. Catat gesek tunai sebagai transaksi terpisah, bukan penjualan barang biasa.

### Barbershop

Aktifkan Booking dan Tim. Buat Potong Rambut, Cukur, Creambath, atau paket sebagai **jasa**. Buat booking berisi tanggal, jam, pelanggan, cabang, dan staff. Saat layanan selesai, bayar di Kasir dan catat promo/member bila dipakai.

### Company

Mode Advanced hanya disarankan bila ada finance. Operasional mencatat penjualan, stok, pengeluaran, dan penerimaan; finance meninjau jurnal, kas, hutang, laba-rugi, dan neraca; Owner menutup periode setelah semua transaksi diperiksa. Altora tidak menggantikan kebijakan auditor atau pajak perusahaan.

## Offline dan troubleshooting

### Internet putus

Jangan menekan Bayar berulang. Transaksi POS selain saldo deposit dapat masuk antrean perangkat dan akan disinkronkan ketika koneksi kembali. Jangan hapus data browser atau berpindah perangkat sebelum antrean hijau. Jika gagal karena stok berubah, selesaikan konflik secara manual.

### QRIS atau barcode bermasalah

- QRIS: periksa QR statis di pengaturan. QR nominal tidak sama dengan verifikasi mutasi otomatis; kasir tetap mengikuti SOP usaha untuk memastikan pembayaran masuk.
- Barcode: cek izin kamera/scanner, bersihkan lensa, cari SKU/nama, lalu cocokkan label dengan data produk. Cetak ulang label bila perlu.

### Keamanan

- Jangan berbagi akun Owner atau password.
- Nonaktifkan akun staff yang keluar.
- Periksa `Pengaturan → Log audit` untuk transaksi, harga, dan akses mencurigakan.
- Secret/API key yang pernah muncul di chat atau screenshot harus segera di-rotate di penyedia.
