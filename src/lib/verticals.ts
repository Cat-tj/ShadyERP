import type { ModuleKey } from "@/lib/modules";

/**
 * Vertikal = kemasan produk per jenis usaha (lihat docs/MASTER-GUIDELINE.md §2).
 * Tiap vertikal dipetakan ke satu subdomain (mis. cafe.altora.my.id) yang
 * menampilkan landing page dengan copy & sorotan fitur yang relevan buat
 * jenis usaha itu — TIDAK memblokir modul lain, cuma presentasi/branding
 * (gating tetap "soft": tenant tetap bisa nyalain modul apa pun dari
 * Pengaturan > Modul terlepas dari subdomain mana dia daftar/masuk).
 */

export type VerticalKey =
  | "cafe"
  | "toko"
  | "ecommerce"
  | "supermarket"
  | "laundry"
  | "counter"
  | "jasa"
  | "pabrik"
  | "company"
  | "teams"
  | "accounting";

/**
 * Token warna per sub-brand — satu-satunya sumber warna untuk landing page
 * & UI per vertikal (bukan bentuk logo, itu tetap satu geometri untuk semua).
 * Ribbon wajib gradient 3-titik (0%/50%/100%) arah 135deg, bukan warna solid.
 */
export type VerticalTheme = {
  primary: string;
  deep: string;
  accent: string;
  soft: string;
  background: string;
  /** Warna huruf "A" di atas background terang vertikal ini (aturan kontras). */
  letterOnLight: string;
  ribbon: { start: string; middle: string; end: string };
};

export type VerticalDef = {
  key: VerticalKey;
  /** Subdomain persis, mis. "cafe" -> cafe.altora.my.id */
  subdomain: string;
  label: string;
  eyebrow: string;
  headline: string;
  lede: string;
  caseKicker: string;
  caseTitle: string;
  caseDescription: string;
  /** Modul yang relevan buat vertikal ini — sorotan di landing, bukan hard gate. */
  modules: ModuleKey[];
  theme: VerticalTheme;
};

export const VERTICALS: VerticalDef[] = [
  {
    key: "cafe",
    subdomain: "cafe",
    label: "Altora Cafe",
    eyebrow: "POS & Manajemen Cafe untuk UMKM Indonesia",
    headline: "Kasir cafe, dari meja sampai dapur.",
    lede: "Pesanan meja lewat QR, layar dapur biar kitchen gak ribet, sampai resep & bahan baku — semua kecatat otomatis di satu aplikasi.",
    caseKicker: "Coffee shop & F&B",
    caseTitle: "Meja penuh, dapur tetap tenang.",
    caseDescription: "Pelanggan pesan lewat QR di meja, dapur lihat antrian di layar kitchen display, kasir tinggal proses pembayaran.",
    modules: ["kasir", "inventory", "pesanan-digital", "member", "keuangan", "promo", "resep"],
    theme: {
      primary: "#A21CAF",
      deep: "#701A75",
      accent: "#E879F9",
      soft: "#FAE8FF",
      background: "#FFF7FF",
      letterOnLight: "#082145",
      ribbon: { start: "#E879F9", middle: "#C026D3", end: "#A21CAF" },
    },
  },
  {
    key: "toko",
    subdomain: "toko",
    label: "Altora Toko",
    eyebrow: "POS & Manajemen Toko untuk UMKM Indonesia",
    headline: "Kasir toko, stok gak pernah nyasar.",
    lede: "Scan barcode pas jualan, stok otomatis berkurang, laporan produk terlaris langsung ada — tanpa hitung manual di buku.",
    caseKicker: "Retail & toko kelontong",
    caseTitle: "Stok kelihatan, laporan langsung ada.",
    caseDescription: "Varian ukuran/warna, transfer stok antar cabang, dan laporan produk terlaris tanpa hitung manual.",
    modules: ["kasir", "inventory", "member", "keuangan", "promo"],
    theme: {
      primary: "#0F766E",
      deep: "#115E59",
      accent: "#2DD4BF",
      soft: "#CCFBF1",
      background: "#F0FDFA",
      letterOnLight: "#082145",
      ribbon: { start: "#5EEAD4", middle: "#14B8A6", end: "#0F766E" },
    },
  },
  {
    key: "ecommerce",
    subdomain: "ecommerce",
    label: "Altora E-commerce",
    eyebrow: "Operasional Katalog & Pesanan Online untuk UMKM Indonesia",
    headline: "Jualan online, stok tetap satu angka.",
    lede: "Kelola katalog, pesanan, dan stok dari satu fondasi toko supaya penjualan online tidak membuat data barang dan laporan berantakan.",
    caseKicker: "Toko online & omnichannel",
    caseTitle: "Pesanan bertambah, stok tetap terkendali.",
    caseDescription: "Satu katalog, stok yang terjaga, dan alur pesanan yang siap disambungkan ke kanal penjualan tanpa membuat tim mencatat dua kali.",
    modules: ["kasir", "inventory", "member", "keuangan", "promo"],
    theme: {
      primary: "#2563EB",
      deep: "#1D4ED8",
      accent: "#60A5FA",
      soft: "#DBEAFE",
      background: "#F5F9FF",
      letterOnLight: "#082145",
      ribbon: { start: "#93C5FD", middle: "#3B82F6", end: "#2563EB" },
    },
  },
  {
    key: "supermarket",
    subdomain: "supermarket",
    label: "Altora Supermarket",
    eyebrow: "POS & Manajemen Stok untuk Supermarket",
    headline: "Ribuan SKU, tetap gampang dipantau.",
    lede: "Harga grosir bertingkat, banyak supplier, barang masuk sampai stock opname — dibikin buat toko dengan stok besar.",
    caseKicker: "Supermarket & grosir",
    caseTitle: "Stok banyak, tetap gampang dicek.",
    caseDescription: "Harga grosir bertingkat per qty, banyak supplier, barang masuk pakai QC, sampai stock opname rutin.",
    modules: ["kasir", "inventory", "member", "keuangan", "promo"],
    theme: {
      primary: "#3730A3",
      deep: "#312E81",
      accent: "#818CF8",
      soft: "#E0E7FF",
      background: "#F5F7FF",
      letterOnLight: "#082145",
      ribbon: { start: "#A5B4FC", middle: "#6366F1", end: "#3730A3" },
    },
  },
  {
    key: "laundry",
    subdomain: "laundry",
    label: "Altora Laundry",
    eyebrow: "Aplikasi Kasir & Order untuk Usaha Laundry",
    headline: "Cucian masuk, status kelihatan sampai selesai.",
    lede: "Pelanggan bisa cek status cucian sendiri lewat link, bayar bisa dicicil, dan omzet harian otomatis kecatat.",
    caseKicker: "Laundry kiloan & satuan",
    caseTitle: "Cucian masuk, status jelas sampai diambil.",
    caseDescription: "Order kiloan/satuan, status proses sampai siap ambil, pelanggan bisa cek sendiri tanpa telepon.",
    modules: ["laundry", "member", "keuangan"],
    theme: {
      primary: "#0891B2",
      deep: "#0E7490",
      accent: "#22D3EE",
      soft: "#CFFAFE",
      background: "#F0FDFF",
      letterOnLight: "#082145",
      ribbon: { start: "#67E8F9", middle: "#22D3EE", end: "#0891B2" },
    },
  },
  {
    key: "counter",
    subdomain: "counter",
    label: "Altora Counter",
    eyebrow: "Aplikasi Kasir & Servis untuk Konter HP/Elektronik",
    headline: "Jual aksesoris, terima servis, satu kasir.",
    lede: "Garansi servis tercatat rapi, jual produk dan terima perbaikan dari kasir yang sama — tanpa nota kertas kececer.",
    caseKicker: "Konter HP & elektronik",
    caseTitle: "Jual aksesoris, terima servis, satu tempat.",
    caseDescription: "Garansi & status servis tercatat rapi, jualan aksesoris tetap jalan dari kasir yang sama.",
    modules: ["kasir", "inventory", "booking", "member", "keuangan"],
    theme: {
      primary: "#E11D48",
      deep: "#BE123C",
      accent: "#FB7185",
      soft: "#FFE4E6",
      background: "#FFF6F7",
      letterOnLight: "#082145",
      ribbon: { start: "#FDA4AF", middle: "#FB7185", end: "#E11D48" },
    },
  },
  {
    key: "jasa",
    subdomain: "jasa",
    label: "Altora Jasa",
    eyebrow: "Aplikasi Booking & Kasir untuk Usaha Jasa",
    headline: "Jadwal booking, rapi tanpa buku catatan.",
    lede: "Barbershop, spa, atau bengkel reparasi — atur jadwal, staf yang pegang, sampai DP dan pelunasan pembayaran.",
    caseKicker: "Barbershop, spa & reparasi",
    caseTitle: "Jadwal rapi, tanpa buku catatan.",
    caseDescription: "Booking pelanggan yang telepon, tentukan staf yang pegang, dan tetap jualan produk dari kasir yang sama.",
    modules: ["booking", "member", "keuangan"],
    theme: {
      primary: "#D97706",
      deep: "#B45309",
      accent: "#FBBF24",
      soft: "#FEF3C7",
      background: "#FFFBEB",
      letterOnLight: "#082145",
      ribbon: { start: "#FDE68A", middle: "#FBBF24", end: "#D97706" },
    },
  },
  {
    key: "pabrik",
    subdomain: "pabrik",
    label: "Altora Pabrik",
    eyebrow: "Manajemen Bahan Baku & Aset untuk Usaha Produksi",
    headline: "Bahan baku sampai maintenance mesin, satu layar.",
    lede: "Pantau stok bahan baku, jadwal maintenance alat produksi, dan laporan pemakaian — biar produksi gak keteteran.",
    caseKicker: "Produksi & manufaktur kecil",
    caseTitle: "Bahan baku terpantau, mesin terjadwal.",
    caseDescription: "Stok bahan baku, jadwal maintenance mesin/alat, dan laporan pemakaian tercatat rapi.",
    modules: ["inventory", "hr", "keuangan"],
    theme: {
      primary: "#334155",
      deep: "#1E293B",
      accent: "#F97316",
      soft: "#E2E8F0",
      background: "#F8FAFC",
      letterOnLight: "#082145",
      ribbon: { start: "#FDBA74", middle: "#FB923C", end: "#F97316" },
    },
  },
  {
    key: "company",
    subdomain: "company",
    label: "Altora Company",
    eyebrow: "Manajemen Multi-Cabang untuk Perusahaan",
    headline: "Kontrol banyak cabang dari satu tempat.",
    lede: "Laporan gabungan semua outlet, dokumen & tanda tangan digital berurutan, sampai audit log tiap aksi penting.",
    caseKicker: "Bisnis multi-cabang",
    caseTitle: "Banyak cabang, satu pantauan.",
    caseDescription: "Laporan gabungan semua outlet, dokumen & e-sign berurutan, dan audit log tiap aksi sensitif.",
    modules: ["kasir", "inventory", "hr", "keuangan", "member"],
    theme: {
      primary: "#6D28D9",
      deep: "#4C1D95",
      accent: "#A78BFA",
      soft: "#EDE9FE",
      background: "#FAF8FF",
      letterOnLight: "#082145",
      ribbon: { start: "#C4B5FD", middle: "#8B5CF6", end: "#6D28D9" },
    },
  },
  {
    key: "teams",
    subdomain: "teams",
    label: "Altora Teams",
    eyebrow: "Absensi, Jadwal & Target Tim untuk Perusahaan",
    headline: "Absensi, jadwal, sampai target tim, beres.",
    lede: "Karyawan absen dari HP dengan foto+lokasi, jadwal shift diatur manajer, target tim otomatis terisi dari data transaksi — tanpa Excel.",
    caseKicker: "HR & manajemen tim",
    caseTitle: "Absensi & target tim, tanpa Excel.",
    caseDescription: "Absensi foto+lokasi, jadwal shift + approval, dan target tim yang otomatis terisi dari data transaksi.",
    modules: ["hr", "keuangan"],
    theme: {
      primary: "#2563EB",
      deep: "#1D4ED8",
      accent: "#60A5FA",
      soft: "#DBEAFE",
      background: "#F5F9FF",
      letterOnLight: "#082145",
      ribbon: { start: "#93C5FD", middle: "#3B82F6", end: "#2563EB" },
    },
  },
  {
    key: "accounting",
    subdomain: "accounting",
    label: "Altora Accounting",
    eyebrow: "Jurnal & Laporan Keuangan untuk Bisnis Kecil-Menengah",
    headline: "Jurnal, buku besar, laporan keuangan rapi.",
    lede: "Pencatatan double-entry, laba rugi, sampai export buat akuntan — data yang sama dengan transaksi harian, gak perlu input dobel.",
    caseKicker: "Akuntansi & pembukuan",
    caseTitle: "Pembukuan rapi, tanpa input dobel.",
    caseDescription: "Jurnal double-entry otomatis dari tiap transaksi, laba rugi, sampai export buat akuntan.",
    modules: ["keuangan"],
    theme: {
      primary: "#047857",
      deep: "#065F46",
      accent: "#34D399",
      soft: "#D1FAE5",
      background: "#F2FCF7",
      letterOnLight: "#082145",
      ribbon: { start: "#6EE7B7", middle: "#10B981", end: "#047857" },
    },
  },
];

/** Warna default landing utama (altora.my.id, tanpa vertikal spesifik) — dipertahankan sama dengan token lama. */
export const DEFAULT_THEME: VerticalTheme = {
  primary: "#A730A8",
  deep: "#6A3CC0",
  accent: "#D94A86",
  soft: "#F3E8FF",
  background: "#F8F6FF",
  letterOnLight: "#082145",
  ribbon: { start: "#D94A86", middle: "#A730A8", end: "#6A3CC0" },
};

export const VERTICAL_MAP: Record<VerticalKey, VerticalDef> = Object.fromEntries(
  VERTICALS.map((v) => [v.key, v])
) as Record<VerticalKey, VerticalDef>;

/** Cocokkan hostname (mis. "cafe.altora.my.id") ke vertikalnya — null kalau bukan subdomain vertikal yang dikenal. */
export function getVerticalForHostname(hostname: string): VerticalDef | null {
  const sub = hostname.split(".")[0]?.toLowerCase().trim();
  if (!sub) return null;
  return VERTICALS.find((v) => v.subdomain === sub) ?? null;
}
