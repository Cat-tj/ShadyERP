import type { VerticalKey } from "@/lib/verticals";

/**
 * Konten mockup hero (struk + dashboard) di landing page — per vertikal,
 * cuma buat ilustrasi visual, bukan data asli. Sebelum ini semua subdomain
 * (cafe/toko/laundry/dst.) menampilkan mockup yang sama persis (struk kopi
 * "Kopi Nusantara"), padahal seharusnya relevan sama jenis usahanya.
 */
export type HeroMock = {
  receiptBrandSub: string;
  receiptItems: [string, string][];
  receiptHighlight: [string, string];
  receiptTotal: string;
  dashTabs: [string, string, string];
  dashTiles: [
    { label: string; value: string; delta: string; warn?: boolean },
    { label: string; value: string; delta: string; warn?: boolean },
    { label: string; value: string; delta: string; warn?: boolean },
    { label: string; value: string; delta: string; warn?: boolean },
  ];
  liveTitle: string;
  liveStatus: string;
  liveDetail: string;
  liveValue: string;
  chartLabel: string;
};

export const HERO_MOCKS: Record<VerticalKey, HeroMock> = {
  cafe: {
    receiptBrandSub: "Kopi Nusantara — BSD",
    receiptItems: [["2x Kopi Susu", "36.000"], ["1x Croissant", "28.000"]],
    receiptHighlight: ["Promo -10%", "-6.400"],
    receiptTotal: "57.600",
    dashTabs: ["POS", "Dapur", "Finance"],
    dashTiles: [
      { label: "Omzet hari ini", value: "Rp3,4jt", delta: "+8% vs kemarin" },
      { label: "Transaksi", value: "142", delta: "+12 dari kemarin" },
      { label: "Stok menipis", value: "3 produk", delta: "Perlu restock", warn: true },
      { label: "Pesanan meja", value: "5 aktif", delta: "2 siap disajikan" },
    ],
    liveTitle: "Meja 04",
    liveStatus: "Baru masuk",
    liveDetail: "2× Kopi Susu · 1× Croissant",
    liveValue: "57.600",
    chartLabel: "Omzet · 14 hari",
  },
  toko: {
    receiptBrandSub: "Toko Berkah — Pasar Minggu",
    receiptItems: [["3x Indomie Goreng", "10.500"], ["1x Aqua 600ml", "4.000"]],
    receiptHighlight: ["Diskon member", "-725"],
    receiptTotal: "13.775",
    dashTabs: ["Kasir", "Stok", "Finance"],
    dashTiles: [
      { label: "Omzet hari ini", value: "Rp2,1jt", delta: "+5% vs kemarin" },
      { label: "Transaksi", value: "88", delta: "+9 dari kemarin" },
      { label: "Stok menipis", value: "6 produk", delta: "Perlu restock", warn: true },
      { label: "Barang masuk", value: "2 PO", delta: "1 diproses" },
    ],
    liveTitle: "Transaksi #204",
    liveStatus: "Selesai",
    liveDetail: "3× Indomie Goreng · 1× Aqua",
    liveValue: "13.775",
    chartLabel: "Omzet · 14 hari",
  },
  ecommerce: {
    receiptBrandSub: "Ruang Rapi — Pesanan Online",
    receiptItems: [["1x Rak Serbaguna", "129.000"], ["2x Kotak Penyimpanan", "58.000"]],
    receiptHighlight: ["Voucher pelanggan", "-12.000"],
    receiptTotal: "175.000",
    dashTabs: ["Pesanan", "Katalog", "Stok"],
    dashTiles: [
      { label: "Pesanan hari ini", value: "36", delta: "+9 dari kemarin" },
      { label: "Penjualan", value: "Rp4,8jt", delta: "+12% vs kemarin" },
      { label: "Stok menipis", value: "4 produk", delta: "Perlu restock", warn: true },
      { label: "Pesanan diproses", value: "11", delta: "Siap dikirim" },
    ],
    liveTitle: "Pesanan #ON-318",
    liveStatus: "Siap diproses",
    liveDetail: "Rak Serbaguna · 3 item",
    liveValue: "175.000",
    chartLabel: "Penjualan · 14 hari",
  },
  supermarket: {
    receiptBrandSub: "Supermarket Sentosa — Cabang Barat",
    receiptItems: [["5x Minyak Goreng", "70.000"], ["2x Beras 5kg", "130.000"]],
    receiptHighlight: ["Harga grosir -8%", "-16.000"],
    receiptTotal: "184.000",
    dashTabs: ["Kasir", "Purchase", "Finance"],
    dashTiles: [
      { label: "Omzet hari ini", value: "Rp18,6jt", delta: "+6% vs kemarin" },
      { label: "Transaksi", value: "512", delta: "+40 dari kemarin" },
      { label: "SKU aktif", value: "1.240", delta: "12 kategori" },
      { label: "Barang masuk", value: "18 PO", delta: "4 pending", warn: true },
    ],
    liveTitle: "PO #482",
    liveStatus: "Barang masuk",
    liveDetail: "120 item diterima · QC lolos",
    liveValue: "Rp42jt",
    chartLabel: "Omzet · 14 hari",
  },
  laundry: {
    receiptBrandSub: "Laundry Kilat — Bintaro",
    receiptItems: [["Cuci kering 5kg", "35.000"], ["Setrika express", "15.000"]],
    receiptHighlight: ["DP diterima", "-20.000"],
    receiptTotal: "30.000",
    dashTabs: ["Order", "Status", "Finance"],
    dashTiles: [
      { label: "Omzet hari ini", value: "Rp1,2jt", delta: "+3% vs kemarin" },
      { label: "Order aktif", value: "9 order", delta: "+2 dari kemarin" },
      { label: "Siap diambil", value: "3 order", delta: "Sudah dikonfirmasi" },
      { label: "Cicilan tertunda", value: "2 order", delta: "Perlu ditagih", warn: true },
    ],
    liveTitle: "Order #128",
    liveStatus: "Siap diambil",
    liveDetail: "5kg cuci + setrika express",
    liveValue: "30.000",
    chartLabel: "Omzet · 14 hari",
  },
  counter: {
    receiptBrandSub: "Konter Jaya — ITC",
    receiptItems: [["Tempered Glass", "25.000"], ["Ganti baterai", "150.000"]],
    receiptHighlight: ["Diskon aksesoris", "-2.500"],
    receiptTotal: "172.500",
    dashTabs: ["Kasir", "Servis", "Finance"],
    dashTiles: [
      { label: "Omzet hari ini", value: "Rp1,8jt", delta: "+4% vs kemarin" },
      { label: "Servis masuk", value: "4 unit", delta: "+1 dari kemarin" },
      { label: "Garansi aktif", value: "27 unit", delta: "Terpantau rapi" },
      { label: "Stok aksesoris", value: "3 tipis", delta: "Perlu restock", warn: true },
    ],
    liveTitle: "Servis #45",
    liveStatus: "Selesai",
    liveDetail: "Ganti baterai iPhone 11",
    liveValue: "150.000",
    chartLabel: "Omzet · 14 hari",
  },
  jasa: {
    receiptBrandSub: "Barbershop Utama — Kemang",
    receiptItems: [["Potong rambut", "45.000"], ["Cukur jenggot", "20.000"]],
    receiptHighlight: ["Promo -10%", "-6.500"],
    receiptTotal: "58.500",
    dashTabs: ["Booking", "Kasir", "Finance"],
    dashTiles: [
      { label: "Booking hari ini", value: "6 slot", delta: "+2 dari kemarin" },
      { label: "Omzet hari ini", value: "Rp980rb", delta: "+7% vs kemarin" },
      { label: "Staf aktif", value: "3 org", delta: "Semua terjadwal" },
      { label: "Slot kosong", value: "2 sore", delta: "Masih bisa booking" },
    ],
    liveTitle: "Booking 14:00",
    liveStatus: "Dikonfirmasi",
    liveDetail: "Potong rambut · staf Andi",
    liveValue: "45.000",
    chartLabel: "Booking · 14 hari",
  },
  pabrik: {
    receiptBrandSub: "Pabrik Roti Makmur — Gudang 2",
    receiptItems: [["Tepung terigu", "600.000"], ["Ragi instan 10kg", "180.000"]],
    receiptHighlight: ["Diskon supplier", "-39.000"],
    receiptTotal: "741.000",
    dashTabs: ["Stok", "Maintenance", "Finance"],
    dashTiles: [
      { label: "Bahan baku aman", value: "92%", delta: "Stok terpantau" },
      { label: "Maintenance", value: "1 alat", delta: "Dijadwalkan", warn: true },
      { label: "Produksi hari ini", value: "320 unit", delta: "+5% vs kemarin" },
      { label: "Supplier aktif", value: "8", delta: "Semua on-time" },
    ],
    liveTitle: "Mesin #2",
    liveStatus: "Maintenance",
    liveDetail: "Servis rutin bulanan",
    liveValue: "Dijadwalkan",
    chartLabel: "Pemakaian bahan · 14 hari",
  },
  company: {
    receiptBrandSub: "Cabang Bali — Laporan Harian",
    receiptItems: [["Omzet gabungan", "Rp42jt"], ["Biaya operasi", "Rp6,1jt"]],
    receiptHighlight: ["Approval e-sign", "2 dokumen"],
    receiptTotal: "35,9jt",
    dashTabs: ["Cabang", "Approval", "Finance"],
    dashTiles: [
      { label: "Cabang terpantau", value: "12", delta: "Semua tersinkron" },
      { label: "Approval jalan", value: "3 e-sign", delta: "Menunggu tanda tangan", warn: true },
      { label: "Omzet gabungan", value: "Rp42jt", delta: "+9% vs kemarin" },
      { label: "Audit log", value: "18 aksi", delta: "Tercatat hari ini" },
    ],
    liveTitle: "Dokumen #12",
    liveStatus: "Menunggu",
    liveDetail: "Approval budget cabang",
    liveValue: "Perlu tanda tangan",
    chartLabel: "Omzet gabungan · 14 hari",
  },
  teams: {
    receiptBrandSub: "Absensi Hari Ini — Cabang BSD",
    receiptItems: [["Tepat waktu", "18 org"], ["Telat", "2 org"]],
    receiptHighlight: ["Target tim", "72%"],
    receiptTotal: "20 karyawan",
    dashTabs: ["Absensi", "Jadwal", "Target"],
    dashTiles: [
      { label: "Hadir hari ini", value: "18/20", delta: "90% kehadiran" },
      { label: "Telat", value: "2 org", delta: "Perlu dicek", warn: true },
      { label: "Target tim", value: "72%", delta: "+4% vs kemarin" },
      { label: "Approval izin", value: "1", delta: "Menunggu manajer" },
    ],
    liveTitle: "Dewi K.",
    liveStatus: "Telat 14 mnt",
    liveDetail: "Shift pagi · Cabang BSD",
    liveValue: "Perlu dicek",
    chartLabel: "Kehadiran · 14 hari",
  },
  accounting: {
    receiptBrandSub: "Jurnal Harian — Semua Cabang",
    receiptItems: [["Pendapatan", "Rp8,1jt"], ["Beban operasi", "Rp2,3jt"]],
    receiptHighlight: ["Laba bersih +14%", "Rp5,8jt"],
    receiptTotal: "5,8jt",
    dashTabs: ["Jurnal", "Laba Rugi", "Kas"],
    dashTiles: [
      { label: "Kas hari ini", value: "Rp8,1jt", delta: "+3% vs kemarin" },
      { label: "Laba bulan ini", value: "+14%", delta: "Di atas target" },
      { label: "Jurnal otomatis", value: "214 entri", delta: "Dari transaksi harian" },
      { label: "Rekonsiliasi", value: "1 selisih", delta: "Perlu dicek", warn: true },
    ],
    liveTitle: "Jurnal #9021",
    liveStatus: "Terposting",
    liveDetail: "Penjualan kasir otomatis",
    liveValue: "Rp1,2jt",
    chartLabel: "Laba rugi · 14 hari",
  },
};

export const DEFAULT_HERO_MOCK: HeroMock = HERO_MOCKS.cafe;
