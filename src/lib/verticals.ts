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
  | "supermarket"
  | "laundry"
  | "counter"
  | "jasa"
  | "pabrik"
  | "company"
  | "teams"
  | "accounting";

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
  },
];

export const VERTICAL_MAP: Record<VerticalKey, VerticalDef> = Object.fromEntries(
  VERTICALS.map((v) => [v.key, v])
) as Record<VerticalKey, VerticalDef>;

/** Cocokkan hostname (mis. "cafe.altora.my.id") ke vertikalnya — null kalau bukan subdomain vertikal yang dikenal. */
export function getVerticalForHostname(hostname: string): VerticalDef | null {
  const sub = hostname.split(".")[0]?.toLowerCase().trim();
  if (!sub) return null;
  return VERTICALS.find((v) => v.subdomain === sub) ?? null;
}
