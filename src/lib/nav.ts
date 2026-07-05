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
  TrendingUpIcon,
  BellIcon,
  FlameIcon,
  CalendarIcon,
  BriefcaseIcon,
  WalletIcon,
  BuildingIcon,
  GridIcon,
} from "@/components/ui/icons";
import type { ModuleKey } from "@/lib/modules";
import type { HubKey } from "@/lib/hubs";

export type Role = "OWNER" | "MANAGER" | "STAFF";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  roles: Role[];
  showOnBottomNav?: boolean;
  /** Modul pemilik item ini (lihat src/lib/modules.ts). Kosong = tidak pernah di-gate modul. */
  module?: ModuleKey;
  /** Hub/"aplikasi" pemilik item ini (lihat src/lib/hubs.ts). "all" = tampil di sidebar hub manapun. */
  hub: HubKey | "all";
};

export const NAV_ITEMS: NavItem[] = [
  // ===== Kasir & Operasional =====
  { href: "/kpi", label: "Beranda", icon: HomeIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true, module: "kasir", hub: "kasir" },
  { href: "/kasir", label: "Kasir", icon: ReceiptIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true, module: "kasir", hub: "kasir" },
  { href: "/pesanan-meja", label: "Pesanan Meja", icon: BellIcon, roles: ["OWNER", "MANAGER", "STAFF"], module: "pesanan-digital", hub: "kasir" },
  { href: "/command-center", label: "Command Center", icon: GridIcon, roles: ["OWNER", "MANAGER", "STAFF"], module: "pesanan-digital", hub: "command" },
  { href: "/booking", label: "Booking", icon: CalendarIcon, roles: ["OWNER", "MANAGER", "STAFF"], module: "booking", hub: "kasir" },
  { href: "/inventory", label: "Inventori", icon: PackageIcon, roles: ["OWNER", "MANAGER"], showOnBottomNav: true, module: "kasir", hub: "kasir" },
  { href: "/supplier", label: "Supplier", icon: UsersIcon, roles: ["OWNER", "MANAGER"], module: "kasir", hub: "kasir" },
  { href: "/purchase-order", label: "Pembelian", icon: ReceiptIcon, roles: ["OWNER", "MANAGER"], module: "kasir", hub: "kasir" },
  { href: "/stock-receipt", label: "Barang Masuk", icon: PackageIcon, roles: ["OWNER", "MANAGER"], module: "kasir", hub: "kasir" },
  { href: "/stock-count", label: "Opname", icon: SettingsIcon, roles: ["OWNER", "MANAGER"], module: "kasir", hub: "kasir" },
  { href: "/maintenance", label: "Maintenance", icon: SettingsIcon, roles: ["OWNER", "MANAGER", "STAFF"], module: "kasir", hub: "kasir" },
  { href: "/member", label: "Member", icon: UsersIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true, module: "member", hub: "kasir" },
  { href: "/kpi/analitik", label: "Analitik", icon: BarChartIcon, roles: ["OWNER", "MANAGER"], module: "kasir", hub: "kasir" },

  // ===== Tim =====
  { href: "/tim", label: "Beranda", icon: HomeIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true, module: "hr", hub: "tim" },
  { href: "/absensi", label: "Absensi", icon: MapPinIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true, module: "hr", hub: "tim" },
  { href: "/tim/analitik", label: "Analitik Tim", icon: BarChartIcon, roles: ["OWNER", "MANAGER"], module: "hr", hub: "tim" },

  // ===== Finance =====
  { href: "/finance", label: "Ringkasan", icon: HomeIcon, roles: ["OWNER", "MANAGER"], showOnBottomNav: true, module: "keuangan", hub: "finance" },
  { href: "/finance/laporan", label: "Penjualan", icon: BarChartIcon, roles: ["OWNER", "MANAGER"], showOnBottomNav: true, module: "keuangan", hub: "finance" },
  { href: "/finance/pengeluaran", label: "Pengeluaran", icon: TrendingDownIcon, roles: ["OWNER", "MANAGER"], showOnBottomNav: true, module: "keuangan", hub: "finance" },
  { href: "/finance/kas", label: "Kas Outlet", icon: WalletIcon, roles: ["OWNER", "MANAGER"], showOnBottomNav: true, module: "keuangan", hub: "finance" },
  { href: "/finance/hutang-supplier", label: "Hutang Supplier", icon: ReceiptIcon, roles: ["OWNER", "MANAGER"], module: "keuangan", hub: "finance" },
  { href: "/finance/laba-rugi", label: "Laba Rugi", icon: TrendingUpIcon, roles: ["OWNER", "MANAGER"], module: "keuangan", hub: "finance" },
  { href: "/finance/metode-bayar", label: "Metode Bayar", icon: BuildingIcon, roles: ["OWNER", "MANAGER"], module: "keuangan", hub: "finance" },

  // ===== Admin =====
  { href: "/pengaturan", label: "Pengaturan", icon: SettingsIcon, roles: ["OWNER"], showOnBottomNav: true, hub: "admin" },

  // ===== Dokumen =====
  { href: "/dokumen", label: "Dokumen & Arsip", icon: BriefcaseIcon, roles: ["OWNER", "MANAGER", "STAFF"], hub: "dokumen" },
];

export function navItemsForRole(role: Role, enabledModules?: Set<ModuleKey>): NavItem[] {
  return NAV_ITEMS.filter(
    (item) =>
      item.roles.includes(role) && (!item.module || !enabledModules || enabledModules.has(item.module))
  );
}

export function navItemsForHub(role: Role, hub: HubKey, enabledModules?: Set<ModuleKey>): NavItem[] {
  return navItemsForRole(role, enabledModules).filter((item) => item.hub === hub || item.hub === "all");
}

/** Hub mana saja yang punya minimal 1 item nav untuk role ini — dipakai halaman pemilihan hub. */
export function hubsAvailableForRole(role: Role, enabledModules?: Set<ModuleKey>): Set<HubKey> {
  const items = navItemsForRole(role, enabledModules);
  const hubs = new Set<HubKey>();
  for (const item of items) {
    if (item.hub !== "all") hubs.add(item.hub);
  }
  return hubs;
}
