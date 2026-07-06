import Link from "next/link";
import { requireSessionWithTenant } from "@/server/require-session";
import { resolveEnabledModules, type ModuleKey } from "@/lib/modules";
import { BarChartIcon, PackageIcon, SettingsIcon, UsersIcon, MapPinIcon, ReceiptIcon } from "@/components/ui/icons";

const menuItems: {
  href: string;
  label: string;
  description: string;
  module?: ModuleKey;
  roles: Array<"OWNER" | "MANAGER" | "STAFF">;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  { href: "/produk", label: "Produk", description: "Harga, kategori, barcode, dan stok awal.", module: "inventory", roles: ["OWNER", "MANAGER"], icon: PackageIcon },
  { href: "/inventory", label: "Inventory", description: "Pantau stok, transfer, dan stok menipis.", module: "inventory", roles: ["OWNER", "MANAGER"], icon: PackageIcon },
  { href: "/member", label: "Member", description: "Pelanggan, poin, dan loyalitas.", module: "member", roles: ["OWNER", "MANAGER", "STAFF"], icon: UsersIcon },
  { href: "/absensi", label: "Absensi", description: "Clock-in dan kehadiran tim.", module: "hr", roles: ["OWNER", "MANAGER", "STAFF"], icon: MapPinIcon },
  { href: "/laundry", label: "Laundry", description: "Order cucian dan status proses.", module: "laundry", roles: ["OWNER", "MANAGER", "STAFF"], icon: ReceiptIcon },
  { href: "/finance", label: "Finance", description: "Ringkasan uang yang lebih lengkap.", module: "keuangan", roles: ["OWNER", "MANAGER"], icon: BarChartIcon },
  { href: "/pengaturan", label: "Pengaturan", description: "Outlet, bisnis, meja, promo, dan langganan.", roles: ["OWNER"], icon: SettingsIcon },
];

export default async function SimpleMenuPage() {
  const { user, tenant } = await requireSessionWithTenant();
  const enabled = resolveEnabledModules(tenant?.disabledModules ?? []);
  const visibleItems = menuItems.filter((item) => item.roles.includes(user.role) && (!item.module || enabled.has(item.module)));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Lainnya</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Fitur tambahan yang aktif untuk toko ini.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[104px] gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:bg-white/70"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg)] text-[var(--color-primary)]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base font-bold text-[var(--color-text)]">{item.label}</span>
                <span className="mt-1 block text-sm leading-snug text-[var(--color-text-secondary)]">{item.description}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
