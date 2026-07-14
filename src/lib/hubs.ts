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
import {
  ReceiptIcon,
  UsersIcon,
  BarChartIcon,
  SettingsIcon,
  BriefcaseIcon,
  GridIcon,
  PackageIcon,
  BuildingIcon,
} from "@/components/ui/icons";

export type HubKey =
  | "kasir"
  | "inventory"
  | "laundry"
  | "tim"
  | "hris"
  | "finance"
  | "admin"
  | "command"
  | "dokumen"
  | "produksi";

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
    label: "Kasir",
    description: "Transaksi cepat, riwayat, tutup shift, pesanan meja, booking, dan member.",
    color: "#a730a8",
    colorDark: "#7e2582",
    colorSoft: "rgba(167, 48, 168, 0.12)",
    icon: ReceiptIcon,
    homeHref: "/kasir",
  },
  {
    key: "inventory",
    label: "Inventory",
    description: "Produk, stok, supplier, pembelian, barang masuk, opname, transfer, dan maintenance aset.",
    color: "#0f766e",
    colorDark: "#115e59",
    colorSoft: "rgba(15, 118, 110, 0.12)",
    icon: PackageIcon,
    homeHref: "/inventory",
  },
  {
    key: "laundry",
    label: "Laundry",
    description: "Order kiloan/satuan, pickup, delivery, status cucian, dan pembayaran laundry.",
    color: "#0891b2",
    colorDark: "#0e7490",
    colorSoft: "rgba(8, 145, 178, 0.12)",
    icon: ReceiptIcon,
    homeHref: "/laundry",
  },
  {
    key: "hris",
    label: "Kepegawaian",
    description: "Database karyawan, absensi, jadwal kerja, dan performa tim.",
    color: "#2563eb",
    colorDark: "#1d4ed8",
    colorSoft: "rgba(37, 99, 235, 0.12)",
    icon: UsersIcon,
    homeHref: "/hris",
  },
  {
    key: "finance",
    label: "Finance",
    description: "Ringkasan uang masuk/keluar, kas outlet, pengeluaran, dan laba rugi simple.",
    color: "#16a34a",
    colorDark: "#15803d",
    colorSoft: "rgba(22, 163, 74, 0.12)",
    icon: BarChartIcon,
    homeHref: "/finance",
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
  {
    key: "command",
    label: "Command Center",
    description: "Pusat kendali operasional live: antrean pesanan, peta meja, staf hadir, dan peringatan stok.",
    color: "#ea580c",
    colorDark: "#c2410c",
    colorSoft: "rgba(234, 88, 12, 0.12)",
    icon: GridIcon,
    homeHref: "/command-center",
  },
  {
    key: "dokumen",
    label: "Dokumen & Arsip",
    description: "Manajemen surat, kontrak karyawan, invoice, dan dokumen pembelian.",
    color: "#475569",
    colorDark: "#334155",
    colorSoft: "rgba(71, 85, 105, 0.12)",
    icon: BriefcaseIcon,
    homeHref: "/dokumen",
  },
  {
    key: "produksi",
    label: "Produksi",
    description: "Work order, BOM, routing, gudang bahan baku/WIP/barang jadi, dan proses produksi.",
    color: "#334155",
    colorDark: "#1e293b",
    colorSoft: "rgba(51, 65, 85, 0.12)",
    icon: BuildingIcon,
    homeHref: "/produksi",
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
  { prefix: "/command-center", hub: "command" },
  { prefix: "/booking", hub: "kasir" },
  { prefix: "/laundry", hub: "laundry" },
  { prefix: "/inventory", hub: "inventory" },
  { prefix: "/supplier", hub: "inventory" },
  { prefix: "/purchase-order", hub: "inventory" },
  { prefix: "/stock-receipt", hub: "inventory" },
  { prefix: "/stock-count", hub: "inventory" },
  { prefix: "/maintenance", hub: "inventory" },
  { prefix: "/member", hub: "kasir" },
  { prefix: "/kpi", hub: "kasir" },
  { prefix: "/produk", hub: "inventory" },
  { prefix: "/dashboard", hub: "kasir" },
  // Kepegawaian (HRIS)
  { prefix: "/absensi", hub: "hris" },
  { prefix: "/tim", hub: "hris" },
  { prefix: "/hris", hub: "hris" },
  // Finance
  { prefix: "/finance", hub: "finance" },
  { prefix: "/laporan", hub: "finance" },
  { prefix: "/pengeluaran", hub: "finance" },
  // Admin
  { prefix: "/pengaturan", hub: "admin" },
  // Dokumen & Arsip
  { prefix: "/dokumen", hub: "dokumen" },
  // Produksi
  { prefix: "/produksi", hub: "produksi" },
];

export function getHubForPath(pathname: string): HubDef | null {
  const match = ROUTE_HUB_MAP.filter((r) => pathname.startsWith(r.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length
  )[0];
  return match ? HUB_MAP[match.hub] : null;
}
