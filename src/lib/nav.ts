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
} from "@/components/ui/icons";

export type Role = "OWNER" | "MANAGER" | "STAFF";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  roles: Role[];
  showOnBottomNav?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: HomeIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true },
  { href: "/kasir", label: "Kasir", icon: ReceiptIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true },
  { href: "/pesanan-meja", label: "Pesanan Meja", icon: BellIcon, roles: ["OWNER", "MANAGER", "STAFF"] },
  { href: "/dapur", label: "Dapur", icon: FlameIcon, roles: ["OWNER", "MANAGER", "STAFF"] },
  { href: "/produk", label: "Produk", icon: PackageIcon, roles: ["OWNER", "MANAGER"], showOnBottomNav: true },
  { href: "/member", label: "Member", icon: UsersIcon, roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true },
  { href: "/absensi", label: "Absensi", icon: MapPinIcon, roles: ["OWNER", "MANAGER", "STAFF"] },
  { href: "/laporan", label: "Laporan", icon: BarChartIcon, roles: ["OWNER", "MANAGER"] },
  { href: "/pengeluaran", label: "Pengeluaran", icon: TrendingDownIcon, roles: ["OWNER", "MANAGER"] },
  { href: "/pengaturan", label: "Pengaturan", icon: SettingsIcon, roles: ["OWNER"], showOnBottomNav: true },
];

export function navItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
