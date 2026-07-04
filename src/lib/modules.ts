/**
 * Modul fitur: pengelompokan fitur yang bisa dinyala/dimatikan per tenant
 * (mis. Kopi Nusantara cuma butuh Kasir, Member, Keuangan — tidak butuh
 * Booking atau Pemesanan Digital). Setiap modul (kecuali yang `core`) juga
 * punya warna aksen sendiri untuk overhaul tema per fitur.
 *
 * Ini BUKAN microservice — aplikasi & database tetap satu. "Modul" di sini
 * murni penanda: (1) fitur mana yang boleh diakses tenant ini, (2) warna
 * aksen apa yang dipakai saat user sedang di halaman fitur itu.
 */

export type ModuleKey =
  | "kasir"
  | "pesanan-digital"
  | "booking"
  | "member"
  | "hr"
  | "keuangan"
  | "promo";

export type ModuleDef = {
  key: ModuleKey;
  label: string;
  description: string;
  /** Modul core selalu aktif, tidak bisa dimatikan Owner — semua fitur lain bergantung ke sini. */
  core: boolean;
  color: string;
  colorDark: string;
  /** Tint rgba tipis dari `color`, dipakai buat gradient wash di background halaman. */
  colorSoft: string;
};

export const MODULES: ModuleDef[] = [
  {
    key: "kasir",
    label: "Kasir & Produk",
    description: "Transaksi, produk, kategori, stok — inti operasional toko.",
    core: true,
    color: "#a730a8",
    colorDark: "#7e2582",
    colorSoft: "rgba(167, 48, 168, 0.12)",
  },
  {
    key: "pesanan-digital",
    label: "Pemesanan Digital",
    description: "Pesan mandiri lewat QR meja & layar dapur (kitchen display).",
    core: false,
    color: "#ea580c",
    colorDark: "#c2410c",
    colorSoft: "rgba(234, 88, 12, 0.12)",
  },
  {
    key: "booking",
    label: "Booking",
    description: "Janji temu/appointment — cocok untuk barbershop, salon, klinik.",
    core: false,
    color: "#db2777",
    colorDark: "#be185d",
    colorSoft: "rgba(219, 39, 119, 0.12)",
  },
  {
    key: "member",
    label: "Member & Loyalitas",
    description: "Kartu member, UID card, poin loyalitas pelanggan.",
    core: false,
    color: "#0d9488",
    colorDark: "#0f766e",
    colorSoft: "rgba(13, 148, 136, 0.12)",
  },
  {
    key: "hr",
    label: "HR & Kepegawaian",
    description: "Karyawan, jadwal, dan absensi.",
    core: false,
    color: "#2563eb",
    colorDark: "#1d4ed8",
    colorSoft: "rgba(37, 99, 235, 0.12)",
  },
  {
    key: "keuangan",
    label: "Keuangan",
    description: "Laporan omzet/analitik dan pencatatan pengeluaran.",
    core: false,
    color: "#16a34a",
    colorDark: "#15803d",
    colorSoft: "rgba(22, 163, 74, 0.12)",
  },
  {
    key: "promo",
    label: "Promo & Marketing",
    description: "Promo terjadwal dan diskon otomatis.",
    core: false,
    color: "#d97706",
    colorDark: "#b45309",
    colorSoft: "rgba(217, 119, 6, 0.12)",
  },
];

export const MODULE_MAP: Record<ModuleKey, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.key, m])
) as Record<ModuleKey, ModuleDef>;

export const CORE_MODULE_KEYS: ModuleKey[] = MODULES.filter((m) => m.core).map((m) => m.key);
export const TOGGLEABLE_MODULES: ModuleDef[] = MODULES.filter((m) => !m.core);

/**
 * Prefix path -> modul, diperiksa dari yang paling spesifik. Dipakai untuk
 * (1) tema warna per halaman di AppShell, (2) guard akses server-side.
 * Path yang tidak match apa pun (mis. /pengaturan, /akun) dianggap netral —
 * tetap pakai warna brand default, tidak diblokir modul manapun.
 */
const ROUTE_MODULE_MAP: { prefix: string; module: ModuleKey }[] = [
  { prefix: "/pengaturan/karyawan", module: "hr" },
  { prefix: "/pengaturan/promo", module: "promo" },
  { prefix: "/pengaturan/meja", module: "pesanan-digital" },
  { prefix: "/pengaturan/kartu", module: "member" },
  { prefix: "/finance/laporan", module: "keuangan" },
  { prefix: "/finance/pengeluaran", module: "keuangan" },
  { prefix: "/finance", module: "keuangan" },
  { prefix: "/supplier", module: "kasir" },
  { prefix: "/purchase-order", module: "kasir" },
  { prefix: "/stock-receipt", module: "kasir" },
  { prefix: "/stock-count", module: "kasir" },
  { prefix: "/kpi", module: "kasir" },
  { prefix: "/kasir", module: "kasir" },
  { prefix: "/inventory", module: "kasir" },
  { prefix: "/pesanan-meja", module: "pesanan-digital" },
  { prefix: "/dapur", module: "pesanan-digital" },
  { prefix: "/booking", module: "booking" },
  { prefix: "/member", module: "member" },
  { prefix: "/absensi", module: "hr" },
  // Keep old paths for backwards compatibility (redirect via middleware if needed)
  { prefix: "/dashboard", module: "kasir" },
  { prefix: "/produk", module: "kasir" },
  { prefix: "/laporan", module: "keuangan" },
  { prefix: "/pengeluaran", module: "keuangan" },
];

export function getModuleForPath(pathname: string): ModuleDef | null {
  const match = ROUTE_MODULE_MAP.filter((r) => pathname.startsWith(r.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length
  )[0];
  return match ? MODULE_MAP[match.module] : null;
}

/** Modul yang aktif buat tenant = semua modul KECUALI yang ada di disabledModules (core selalu aktif). */
export function resolveEnabledModules(disabledModules: string[]): Set<ModuleKey> {
  const disabled = new Set(disabledModules);
  return new Set(MODULES.filter((m) => m.core || !disabled.has(m.key)).map((m) => m.key));
}
