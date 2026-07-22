import type { ModuleKey } from "@/lib/modules";
import type { VerticalKey } from "@/lib/verticals";

export type BusinessModeKey = "CAFE" | "TOKO" | "LAUNDRY" | "COUNTER" | "COMPANY";

export type BusinessModeDef = {
  key: BusinessModeKey;
  label: string;
  shortLabel: string;
  description: string;
  recommendedModules: ModuleKey[];
  painKillers: string[];
};

export const BUSINESS_MODES: BusinessModeDef[] = [
  {
    key: "CAFE",
    label: "Altora Cafe",
    shortLabel: "Cafe",
    description: "POS cafe, meja, QR order, kitchen display, resep, shift, member.",
    recommendedModules: ["inventory", "pesanan-digital", "member", "hr", "keuangan", "promo", "resep"],
    painKillers: ["Dine-in/takeaway/delivery", "Peta meja", "Kitchen display", "Bahan baku"],
  },
  {
    key: "TOKO",
    label: "Altora Toko",
    shortLabel: "Toko",
    description: "Retail barcode, stok, expired, supplier, barang masuk, member, closing.",
    recommendedModules: ["inventory", "member", "hr", "keuangan", "promo"],
    painKillers: ["Barcode & varian", "Barang masuk", "Expired alert", "Rekonsiliasi kas"],
  },
  {
    key: "LAUNDRY",
    label: "Altora Laundry",
    shortLabel: "Laundry",
    description: "Order kiloan/satuan, pickup, delivery, status proses, customer.",
    recommendedModules: ["laundry", "member", "hr", "keuangan", "promo"],
    painKillers: ["Kiloan/satuan", "Status cucian", "Pickup/delivery", "Layanan custom"],
  },
  {
    key: "COUNTER",
    label: "Altora Counter",
    shortLabel: "Counter",
    description: "Konter HP, aksesoris, service, garansi, serial/IMEI, gesek tunai.",
    recommendedModules: ["inventory", "booking", "member", "hr", "keuangan", "promo"],
    painKillers: ["Aksesoris", "Service/repair", "Garansi", "Gesek tunai"],
  },
  {
    key: "COMPANY",
    label: "Altora Company",
    shortLabel: "Company",
    description: "ERP full untuk multi-cabang: HRIS, finance, inventory, approval, dokumen.",
    recommendedModules: [
      "inventory",
      "pesanan-digital",
      "booking",
      "laundry",
      "member",
      "hr",
      "keuangan",
      "promo",
      "resep",
      "produksi",
    ],
    painKillers: ["Multi-cabang", "Approval", "Dokumen", "Finance lengkap"],
  },
];

export const BUSINESS_MODE_MAP = Object.fromEntries(BUSINESS_MODES.map((mode) => [mode.key, mode])) as Record<
  BusinessModeKey,
  BusinessModeDef
>;

export function normalizeBusinessMode(value: string | null | undefined): BusinessModeKey {
  switch (value) {
    case "FNB":
      return "CAFE";
    case "RETAIL":
      return "TOKO";
    case "SERVICE":
      return "LAUNDRY";
    case "BARBERSHOP":
      return "COUNTER";
    case "CAFE":
    case "TOKO":
    case "LAUNDRY":
    case "COUNTER":
    case "COMPANY":
      return value;
    default:
      return "CAFE";
  }
}

export function businessModeForVerticalKey(key: VerticalKey): BusinessModeKey {
  switch (key) {
    case "cafe":
      return "CAFE";
    case "toko":
    case "ecommerce":
    case "supermarket":
      return "TOKO";
    case "laundry":
      return "LAUNDRY";
    case "counter":
    case "jasa":
      return "COUNTER";
    case "pabrik":
    case "company":
    case "teams":
    case "accounting":
      return "COMPANY";
  }
}

export function recommendedDisabledModules(mode: BusinessModeKey, allModuleKeys: ModuleKey[]): ModuleKey[] {
  const enabled = new Set(BUSINESS_MODE_MAP[mode].recommendedModules);
  return allModuleKeys.filter((key) => !enabled.has(key));
}
