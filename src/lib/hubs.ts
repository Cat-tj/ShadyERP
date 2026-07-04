/**
 * Hub: pengelompokan Altora jadi "aplikasi" terpisah — Kasir, Tim, Finance,
 * Admin. Setiap hub punya sidebar & warna sendiri; pindah hub HARUS lewat
 * halaman pemilihan (/pilih-aplikasi), tidak ada link silang di sidebar.
 *
 * Ini beda dari "modul" (lihat src/lib/modules.ts) — modul menyalakan/mematikan
 * FITUR per tenant, sedangkan hub mengelompokkan fitur yang sudah aktif ke
 * dalam satu dari 4 "aplikasi" biar terasa terpisah untuk pengguna.
 */

import type { ComponentType, SVGProps } from "react";
import { ReceiptIcon, UsersIcon, BarChartIcon, SettingsIcon } from "@/components/ui/icons";

export type HubKey = "kasir" | "tim" | "finance" | "admin";

export type HubDef = {
  key: HubKey;
  label: string;
  description: string;
  color: string;
  colorDark: string;
  colorSoft: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Halaman yang dibuka saat user memilih hub ini dari /pilih-aplikasi. */
  homeHref: string;
};

export const HUBS: HubDef[] = [
  {
    key: "kasir",
    label: "Kasir & Operasional",
    description: "Transaksi, produk, stok, pembelian, booking, dan member.",
    color: "#a730a8",
    colorDark: "#7e2582",
    colorSoft: "rgba(167, 48, 168, 0.12)",
    icon: ReceiptIcon,
    homeHref: "/kpi",
  },
  {
    key: "tim",
    label: "Tim",
    description: "Absensi, jadwal kerja, dan manajemen kehadiran karyawan.",
    color: "#2563eb",
    colorDark: "#1d4ed8",
    colorSoft: "rgba(37, 99, 235, 0.12)",
    icon: UsersIcon,
    homeHref: "/tim",
  },
  {
    key: "finance",
    label: "Finance",
    description: "Laporan omzet, analitik, dan pencatatan pengeluaran.",
    color: "#16a34a",
    colorDark: "#15803d",
    colorSoft: "rgba(22, 163, 74, 0.12)",
    icon: BarChartIcon,
    homeHref: "/finance/laporan",
  },
  {
    key: "admin",
    label: "Admin",
    description: "Pengaturan bisnis, karyawan, outlet, modul, dan langganan.",
    color: "#57534e",
    colorDark: "#44403c",
    colorSoft: "rgba(87, 83, 78, 0.12)",
    icon: SettingsIcon,
    homeHref: "/pengaturan",
  },
];

export const HUB_MAP: Record<HubKey, HubDef> = Object.fromEntries(
  HUBS.map((h) => [h.key, h])
) as Record<HubKey, HubDef>;

/** Prefix path -> hub, dicek dari yang paling spesifik dulu. */
const ROUTE_HUB_MAP: { prefix: string; hub: HubKey }[] = [
  // Kasir & Operasional
  { prefix: "/kasir", hub: "kasir" },
  { prefix: "/pesanan-meja", hub: "kasir" },
  { prefix: "/dapur", hub: "kasir" },
  { prefix: "/booking", hub: "kasir" },
  { prefix: "/inventory", hub: "kasir" },
  { prefix: "/supplier", hub: "kasir" },
  { prefix: "/purchase-order", hub: "kasir" },
  { prefix: "/stock-receipt", hub: "kasir" },
  { prefix: "/stock-count", hub: "kasir" },
  { prefix: "/member", hub: "kasir" },
  { prefix: "/kpi", hub: "kasir" },
  { prefix: "/produk", hub: "kasir" },
  { prefix: "/dashboard", hub: "kasir" },
  // Tim
  { prefix: "/absensi", hub: "tim" },
  { prefix: "/tim", hub: "tim" },
  // Finance
  { prefix: "/finance", hub: "finance" },
  { prefix: "/laporan", hub: "finance" },
  { prefix: "/pengeluaran", hub: "finance" },
  // Admin
  { prefix: "/pengaturan", hub: "admin" },
];

export function getHubForPath(pathname: string): HubDef | null {
  const match = ROUTE_HUB_MAP.filter((r) => pathname.startsWith(r.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length
  )[0];
  return match ? HUB_MAP[match.hub] : null;
}
