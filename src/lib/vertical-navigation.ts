import type { Role } from "@/lib/nav";
import type { VerticalKey } from "@/lib/verticals";

export type VerticalAction = {
  href: string;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function getDefaultAppHrefForVertical(verticalKey: VerticalKey | undefined, role: Role): string {
  switch (verticalKey) {
    case "teams":
      return role === "STAFF" ? "/absensi" : "/hris";
    case "pabrik":
      return "/produksi";
    case "accounting":
      return "/finance";
    case "laundry":
      return "/laundry";
    case "jasa":
      return "/booking";
    case "company":
      return "/simple/hari-ini";
    case "cafe":
    case "counter":
    case "ecommerce":
    case "supermarket":
    case "toko":
    case undefined:
      return role === "STAFF" ? "/kasir" : "/simple/hari-ini";
  }
}

export function getPrimaryActionForVertical(verticalKey: VerticalKey | undefined, role: Role): VerticalAction {
  switch (verticalKey) {
    case "teams":
      return {
        href: role === "STAFF" ? "/absensi" : "/hris",
        label: role === "STAFF" ? "Buka Absensi" : "Buka HRIS",
        emptyTitle: "Belum ada aktivitas tim hari ini",
        emptyDescription: "Absensi, jadwal, dan perubahan shift akan tampil di halaman tim.",
      };
    case "pabrik":
      return {
        href: "/produksi",
        label: "Buka Produksi",
        emptyTitle: "Belum ada aktivitas produksi hari ini",
        emptyDescription: "Work order, bahan baku, dan status produksi akan tampil di modul produksi.",
      };
    case "accounting":
      return {
        href: "/finance",
        label: "Buka Finance",
        emptyTitle: "Belum ada catatan keuangan hari ini",
        emptyDescription: "Kas, jurnal, dan laporan akan tampil di modul finance.",
      };
    case "laundry":
      return {
        href: "/laundry",
        label: "Buka Laundry",
        emptyTitle: "Belum ada order laundry hari ini",
        emptyDescription: "Order kiloan/satuan dan status cucian akan tampil di modul laundry.",
      };
    case "jasa":
      return {
        href: "/booking",
        label: "Buka Booking",
        emptyTitle: "Belum ada booking hari ini",
        emptyDescription: "Jadwal layanan, staf, dan pelanggan akan tampil di modul booking.",
      };
    case "company":
      return {
        href: "/simple/hari-ini",
        label: "Buka Ringkasan",
        emptyTitle: "Belum ada aktivitas perusahaan hari ini",
        emptyDescription: "Pilih modul operasional untuk melihat data multi-cabang yang relevan.",
      };
    case "cafe":
    case "counter":
    case "ecommerce":
    case "supermarket":
    case "toko":
    case undefined:
      return {
        href: "/kasir",
        label: "Buka Kasir POS",
        emptyTitle: "Belum ada penjualan hari ini",
        emptyDescription: "Transaksi penjualan di Kasir akan tercatat secara langsung di sini.",
      };
  }
}
