import type { ModuleKey } from "@/lib/modules";

export type SettingsNavigationItem = {
  href: string;
  label: string;
  description: string;
  module?: ModuleKey;
};

// Settings navigation is shared by the desktop sidebar and the small-screen
// menu. Keeping the policy here prevents a hidden module from reappearing in a
// second navigation surface.
export const SETTINGS_NAVIGATION: SettingsNavigationItem[] = [
  { href: "/pengaturan/karyawan", label: "Karyawan", description: "Kelola izin akses dan data staf", module: "hr" },
  { href: "/pengaturan/outlet", label: "Outlet", description: "Cabang toko dan inventaris terpisah" },
  { href: "/pengaturan/bisnis", label: "Bisnis", description: "Informasi pajak, poin, dan struk" },
  { href: "/pengaturan/kartu", label: "Kartu Member", description: "Pengaturan loyalty poin member", module: "member" },
  { href: "/pengaturan/meja", label: "Nomor Meja", description: "Atur kode QR pesanan meja", module: "pesanan-digital" },
  { href: "/pengaturan/laundry", label: "Laundry", description: "Kategori layanan laundry", module: "laundry" },
  { href: "/pengaturan/modifier", label: "Modifier Menu", description: "Atur tambahan menu dan pilihan produk", module: "kasir" },
  { href: "/pengaturan/promo", label: "Promo", description: "Diskon otomatis dan voucher", module: "promo" },
  { href: "/pengaturan/langganan", label: "Langganan", description: "Detail paket aktif Altora" },
  { href: "/pengaturan/audit-log", label: "Log Audit", description: "Riwayat aktivitas staf penting" },
];

export function getVisibleSettingsNavigation(disabledModules: readonly string[]) {
  const disabledSet = new Set(disabledModules);
  return SETTINGS_NAVIGATION.filter((item) => !item.module || !disabledSet.has(item.module));
}
