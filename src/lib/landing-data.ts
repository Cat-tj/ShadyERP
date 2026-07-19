/**
 * Data terstruktur untuk section-section landing page utama (root domain).
 * Dipisah dari landing-content.tsx supaya JSX-nya nggak ketimbunan array
 * literal panjang berulang-ulang.
 */

export type AutomationOutput = {
  key: string;
  label: string;
  detail: string;
};

/** "Satu transaksi, banyak output" — dampak otomatis satu penjualan masuk. */
export const AUTOMATION_OUTPUTS: AutomationOutput[] = [
  { key: "stok", label: "Stok", detail: "Berkurang otomatis sesuai resep/varian" },
  { key: "kas", label: "Kas", detail: "Saldo kas & metode bayar ter-update" },
  { key: "laba", label: "Laba", detail: "Untung bersih dihitung ulang real-time" },
  { key: "pelanggan", label: "Pelanggan", detail: "Riwayat & poin member tersimpan" },
  { key: "komisi", label: "Komisi", detail: "Bagian staf/booking tercatat otomatis" },
  { key: "laporan", label: "Laporan", detail: "Grafik omzet & tren harian ikut jalan" },
];

export type BenefitBlock = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  anchor: string;
};

/** 3 kelompok manfaat besar — pengganti tabel fitur datar 10 baris. */
export const BENEFIT_BLOCKS: BenefitBlock[] = [
  {
    key: "operasional",
    eyebrow: "01",
    title: "Operasional lebih ringan",
    description:
      "Dari kasir sampai dapur, semua yang tim kamu pakai tiap hari ada di satu aplikasi — nggak perlu app terpisah-pisah.",
    features: [
      "Kasir & struk digital multi metode bayar",
      "Meja QR & pesanan mandiri pelanggan",
      "Produk, stok & varian antar outlet",
      "Booking & reservasi jadwal",
      "Kitchen display untuk dapur",
    ],
    anchor: "#fitur",
  },
  {
    key: "keuangan",
    eyebrow: "02",
    title: "Keuangan lebih jelas",
    description:
      "Nggak perlu tunggu tutup buku akhir bulan buat tahu usaha untung atau bocor — semua keliatan dari hari pertama.",
    features: [
      "Omzet & laba rugi real-time",
      "Tutup kas shift + deteksi selisih",
      "Hutang supplier & purchase order",
      "Pengeluaran & kas kecil",
      "Ekspor laporan ke Excel/CSV",
    ],
    anchor: "#harga",
  },
  {
    key: "berkembang",
    eyebrow: "03",
    title: "Bisnis lebih mudah berkembang",
    description:
      "Data pelanggan dan tim kekumpul otomatis, jadi keputusan buka cabang atau bikin promo nggak berdasar tebakan.",
    features: [
      "Member & poin loyalitas",
      "Promo terjadwal (happy hour)",
      "Karyawan & absensi (HR)",
      "Multi-outlet & multi-tim",
      "Mode offline saat internet mati",
    ],
    anchor: "#usecase",
  },
];

export type ComparisonRow = {
  label: string;
  free: string | boolean;
  basic: string | boolean;
  pro: string | boolean;
};

export type ComparisonGroup = {
  category: string;
  rows: ComparisonRow[];
};

/**
 * Semua fitur modul tersedia di semua paket — pembeda paket cuma batas
 * jumlah outlet/karyawan/produk (lihat src/lib/plan-limits.ts). Tabel ini
 * dibuat jujur mengikuti itu, bukan direkayasa seolah-olah ada fitur yang
 * dikunci di paket bawah.
 */
export const COMPARISON_GROUPS: ComparisonGroup[] = [
  {
    category: "Kapasitas",
    rows: [
      { label: "Outlet/cabang", free: "1", basic: "3", pro: "Tanpa batas" },
      { label: "Karyawan", free: "3", basic: "10", pro: "Tanpa batas" },
      { label: "Produk", free: "50", basic: "500", pro: "Tanpa batas" },
    ],
  },
  {
    category: "Kasir & operasional",
    rows: [
      { label: "Kasir & struk digital", free: true, basic: true, pro: true },
      { label: "Meja QR & pesan mandiri", free: true, basic: true, pro: true },
      { label: "Kitchen display", free: true, basic: true, pro: true },
      { label: "Booking & reservasi", free: true, basic: true, pro: true },
      { label: "Mode offline", free: true, basic: true, pro: true },
    ],
  },
  {
    category: "Stok & keuangan",
    rows: [
      { label: "Stok, varian & transfer outlet", free: true, basic: true, pro: true },
      { label: "Hutang supplier & purchase order", free: true, basic: true, pro: true },
      { label: "Laporan laba rugi & ekspor", free: true, basic: true, pro: true },
    ],
  },
  {
    category: "Tim & pelanggan",
    rows: [
      { label: "Absensi & jadwal karyawan", free: true, basic: true, pro: true },
      { label: "Member, poin & promo terjadwal", free: true, basic: true, pro: true },
      { label: "Multi-outlet dalam satu dashboard", free: true, basic: true, pro: true },
    ],
  },
];

export type FaqItem = { question: string; answer: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apakah data produk bisa diimpor dari Excel?",
    answer:
      "Bisa. Produk bisa ditambah manual satu-satu, atau diimpor sekaligus dari file supaya nggak perlu ketik ulang semua barang dari awal.",
  },
  {
    question: "Apakah Altora bisa digunakan dari HP?",
    answer:
      "Bisa. Altora jalan di browser HP maupun desktop tanpa install aplikasi tambahan — cukup buka lewat Chrome/Safari, dan bisa dipasang sebagai app di layar utama HP.",
  },
  {
    question: "Apakah Altora mendukung multi-cabang?",
    answer:
      "Mendukung. Satu akun owner bisa pantau banyak outlet sekaligus dalam satu dashboard, termasuk transfer stok antar cabang.",
  },
  {
    question: "Bagaimana jika koneksi internet terputus?",
    answer:
      "Kasir tetap bisa jualan dalam mode offline. Transaksi disimpan di perangkat dulu, lalu otomatis sinkron ke server begitu internet nyambung lagi.",
  },
  {
    question: "Apakah data bisnis aman?",
    answer:
      "Setiap toko punya data yang terpisah dan hanya bisa diakses oleh akun toko itu sendiri. Aksi sensitif seperti void transaksi atau reset password juga tercatat di audit log.",
  },
  {
    question: "Apakah tersedia bantuan setup?",
    answer:
      "Tersedia. Chat langsung ke tim Altora lewat WhatsApp untuk dibantu setup produk, outlet, dan karyawan pertama kali.",
  },
  {
    question: "Apakah fitur dapat disesuaikan?",
    answer:
      "Bisa. Modul yang nggak dipakai (misalnya Booking atau Laundry) bisa dimatikan lewat Pengaturan, supaya tampilan tetap sesuai jenis usahamu.",
  },
  {
    question: "Apakah saya bisa berpindah paket?",
    answer:
      "Bisa naik paket kapan saja saat kebutuhan outlet, karyawan, atau produk bertambah. Chat tim Altora untuk dibantu prosesnya.",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  isPlaceholder?: boolean;
};

/**
 * Testimoni pelanggan asli — dikonfirmasi lisan dari pemilik usaha yang
 * sudah pakai Altora, redaksi kalimat ditulis ulang oleh tim Altora
 * (bukan kutipan verbatim). Kalau ada pemilik yang minta ubah/hapus,
 * update di sini.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Dulu kasir dipegang karyawan, tiap bulan sering ada selisih sampai Rp4 juta tapi nggak pernah ketahuan dari mana. Sejak pakai Altora, tutup kas jadi jelas tiap shift, selisih langsung ketahuan saat itu juga.",
    name: "Pak Fongsono",
    role: "Pemilik Toko Listrik",
  },
  {
    quote:
      "Stok bahan baku sekarang update sendiri tiap transaksi masuk, jadi nggak perlu hitung ulang manual tiap tutup toko. Laporan omzet juga tinggal buka, nggak perlu rekap dari nota lagi.",
    name: "Pak Kenny",
    role: "Pemilik Cafe",
  },
  {
    quote:
      "Karyawan saya dulu sering ‘main-main’ di kasir, selisihnya bisa puluhan juta dalam seminggu. Semenjak semua transaksi tercatat otomatis lewat Altora, hal kayak gitu udah nggak bisa terjadi lagi.",
    name: "Pak Rizky",
    role: "Pemilik Minimarket",
  },
  {
    quote:
      "Usaha saya gabungan cafe dan sewa board game, awalnya susah cari sistem yang bisa nyatuin dua-duanya dalam satu kasir. Di Altora ternyata bisa, laporannya juga rapi tanpa saya harus pisah-pisah catatan.",
    name: "Bu Neni",
    role: "Pemilik Cafe Boardgame",
  },
  {
    quote:
      "Saya bukan orang yang paham teknologi, tapi Altora gampang dipakai dari hari pertama tanpa perlu training lama. Laporan penjualan bulanan sekarang tinggal buka aplikasi, nggak perlu rekap manual lagi.",
    name: "Bu Marfuah",
    role: "Pemilik Mini Market",
  },
];

export type AddonService = {
  key: string;
  icon: "hardware" | "cctv" | "training" | "consulting";
  title: string;
  description: string;
};

/**
 * Layanan tambahan di luar software — dikerjakan tim Altora langsung,
 * dipesan lewat WhatsApp (bukan self-serve/checkout otomatis kayak paket
 * software di atas).
 */
export const ADDON_SERVICES: AddonService[] = [
  {
    key: "hardware",
    icon: "hardware",
    title: "Instalasi Hardware",
    description: "Pasang printer struk, laci kas, scanner barcode, sampai tablet kasir — tim kami setup langsung di tempat usahamu.",
  },
  {
    key: "cctv",
    icon: "cctv",
    title: "CCTV Keamanan",
    description: "Kamera pengawas terpasang rapi, bisa dipantau dari HP kapan saja — bantu jaga toko dan transaksi tetap aman.",
  },
  {
    key: "training",
    icon: "training",
    title: "Pelatihan",
    description: "Karyawan dilatih langsung pakai Altora sampai lancar di hari pertama — nggak perlu belajar sendiri dari nol.",
  },
  {
    key: "consulting",
    icon: "consulting",
    title: "Konsultasi Bisnis",
    description: "Butuh masukan soal harga, promo, atau strategi berkembang? Tim kami bantu baca data yang sudah ada di Altora.",
  },
];

export type ProductTourTab = {
  key: string;
  label: string;
  heading: string;
  description: string;
  benefits: string[];
  galleryIndex: number;
};

/** Tab kiri di section product tour — screenshot kanan diambil dari gallery-track yang sudah ada lewat galleryIndex. */
export const PRODUCT_TOUR_TABS: ProductTourTab[] = [
  {
    key: "penjualan",
    label: "Penjualan",
    heading: "Kasir yang nggak bikin antre.",
    description: "Layar kasir simpel — pilih produk, keranjang otomatis hitung diskon, bayar dengan metode apapun.",
    benefits: ["Multi metode bayar", "Diskon & promo otomatis", "Struk digital & cetak thermal"],
    galleryIndex: 0,
  },
  {
    key: "stok",
    label: "Stok",
    heading: "Stok selalu mengikuti transaksi.",
    description: "Setiap penjualan langsung memotong stok, jadi angka di layar sama dengan barang di rak.",
    benefits: ["Pengurangan stok otomatis", "Notifikasi stok minimum", "Transfer & riwayat pergerakan barang"],
    galleryIndex: 2,
  },
  {
    key: "keuangan",
    label: "Keuangan",
    heading: "Laba-rugi tanpa buka spreadsheet.",
    description: "Omzet, produk terlaris, dan untung bersih terangkum otomatis dari transaksi harian.",
    benefits: ["Omzet & rata-rata transaksi", "Tren dibanding bulan lalu", "Ekspor ke Excel/CSV"],
    galleryIndex: 1,
  },
  {
    key: "pelanggan",
    label: "Pelanggan",
    heading: "Riwayat pelanggan tersimpan sendiri.",
    description: "Kartu member, poin, dan riwayat kunjungan kekumpul otomatis dari transaksi kasir.",
    benefits: ["Kartu member digital", "Poin otomatis tiap transaksi", "Riwayat kunjungan & belanja"],
    galleryIndex: 5,
  },
  {
    key: "laporan",
    label: "Laporan",
    heading: "Tim & absensi kebaca satu layar.",
    description: "Siapa hadir, siapa telat, siapa belum absen — kelihatan tanpa harus tanya manual.",
    benefits: ["Absen dari HP", "Ringkasan telat & izin", "Cocok untuk multi-outlet"],
    galleryIndex: 3,
  },
];
