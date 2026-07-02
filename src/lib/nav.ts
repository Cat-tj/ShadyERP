export type Role = "OWNER" | "MANAGER" | "STAFF";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles: Role[];
  showOnBottomNav?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: "🏠", roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true },
  { href: "/kasir", label: "Kasir", icon: "🧾", roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true },
  { href: "/produk", label: "Produk", icon: "📦", roles: ["OWNER", "MANAGER"], showOnBottomNav: true },
  { href: "/member", label: "Member", icon: "👥", roles: ["OWNER", "MANAGER", "STAFF"], showOnBottomNav: true },
  { href: "/absensi", label: "Absensi", icon: "📍", roles: ["OWNER", "MANAGER", "STAFF"] },
  { href: "/laporan", label: "Laporan", icon: "📊", roles: ["OWNER", "MANAGER"] },
  { href: "/pengaturan", label: "Pengaturan", icon: "⚙️", roles: ["OWNER"], showOnBottomNav: true },
];

export function navItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
