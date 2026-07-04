import type { ComponentType, SVGProps } from "react";
import {
  HomeIcon,
  ReceiptIcon,
  PackageIcon,
  UsersIcon,
  MapPinIcon,
  BarChartIcon,
  SettingsIcon,
  TrendingDownIcon,
  BellIcon,
  FlameIcon,
  CalendarIcon,
} from "@/components/ui/icons";
import type { ModuleKey } from "@/lib/modules";

export type Role = "OWNER" | "MANAGER" | "STAFF";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  roles: Role[];
  showOnBottomNav?: boolean;
  /** Modul pemilik item ini (lihat src/lib/modules.ts). Kosong = selalu tampil, tidak pernah di-gate. */
  module?: ModuleKey;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/kpi", label: "Beranda", icon: HomeIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true, module: "kasir" },
  { href: "/kasir", label: "Kasir", icon: ReceiptIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true, module: "kasir" },
  { href: "/pesanan-meja", label: "Pesanan Meja", icon: BellIcon, roles: ["OWNER", "MANAGER", "STAFF"], module: "pesanan-digital" },
  { href: "/dapur", label: "Dapur", icon: FlameIcon, roles: ["OWNER", "MANAGER", "STAFF"], module: "pesanan-digital" },
  { href: "/booking", label: "Booking", icon: CalendarIcon, roles: ["OWNER", "MANAGER", "STAFF"], module: "booking" },
  { href: "/inventory", label: "Inventori", icon: PackageIcon, roles: ["OWNER", "MANAGER"], showOnBottomNav: true, module: "kasir" },
  { href: "/supplier", label: "Supplier", icon: UsersIcon, roles: ["OWNER", "MANAGER"], module: "kasir" },
  { href: "/purchase-order", label: "Pembelian", icon: ReceiptIcon, roles: ["OWNER", "MANAGER"], module: "kasir" },
  { href: "/stock-receipt", label: "Barang Masuk", icon: PackageIcon, roles: ["OWNER", "MANAGER"], module: "kasir" },
  { href: "/stock-count", label: "Opname", icon: SettingsIcon, roles: ["OWNER", "MANAGER"], module: "kasir" },
  { href: "/member", label: "Member", icon: UsersIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true, module: "member" },
  { href: "/absensi", label: "Absensi", icon: MapPinIcon, roles: ["OWNER", "MANAGER", "STAFF"], module: "hr" },
  { href: "/finance/laporan", label: "Laporan", icon: BarChartIcon, roles: ["OWNER", "MANAGER"], module: "keuangan" },
  { href: "/finance/pengeluaran", label: "Pengeluaran", icon: TrendingDownIcon, roles: ["OWNER", "MANAGER"], module: "keuangan" },
  { href: "/pengaturan", label: "Pengaturan", icon: SettingsIcon, roles: ["OWNER"], showOnBottomNav: true },
];

export function navItemsForRole(role: Role, enabledModules?: Set<ModuleKey>): NavItem[] {
  return NAV_ITEMS.filter(
    (item) =>
      item.roles.includes(role) && (!item.module || !enabledModules || enabledModules.has(item.module))
  );
}
