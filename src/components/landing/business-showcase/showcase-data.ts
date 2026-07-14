import { VERTICALS, type VerticalKey } from "@/lib/verticals";
import { AccountingPhone } from "./accounting-phone";
import { CafePhone } from "./cafe-phone";
import { CompanyPhone } from "./company-phone";
import { CounterPhone } from "./counter-phone";
import { JasaPhone } from "./jasa-phone";
import { LaundryPhone } from "./laundry-phone";
import { PabrikPhone } from "./pabrik-phone";
import { SupermarketPhone } from "./supermarket-phone";
import { TeamsPhone } from "./teams-phone";
import { TokoPhone } from "./toko-phone";
import type { ShowcaseDefinition, ShowcaseMetric } from "./types";

const components = { cafe: CafePhone, toko: TokoPhone, supermarket: SupermarketPhone, laundry: LaundryPhone, counter: CounterPhone, jasa: JasaPhone, pabrik: PabrikPhone, company: CompanyPhone, teams: TeamsPhone, accounting: AccountingPhone } satisfies Record<VerticalKey, ShowcaseDefinition["Screen"]>;
const densities: Record<VerticalKey, ShowcaseDefinition["density"]> = { cafe: "compact", toko: "compact", supermarket: "dense", laundry: "comfortable", counter: "compact", jasa: "comfortable", pabrik: "compact", company: "dense", teams: "compact", accounting: "dense" };

export const BUSINESS_SHOWCASES: ShowcaseDefinition[] = VERTICALS.map((vertical) => ({ key: vertical.key, label: vertical.label.replace("Altora ", ""), headline: vertical.caseTitle, description: vertical.caseDescription, density: densities[vertical.key], Screen: components[vertical.key] }));

export const STAGE_METRICS: Record<VerticalKey, ShowcaseMetric[]> = {
  cafe: [{ label: "Pesanan aktif", value: "8" }, { label: "Siap disajikan", value: "3", tone: "success" }],
  toko: [{ label: "Omzet hari ini", value: "Rp2,1jt" }, { label: "Restock", value: "6", tone: "warning" }],
  supermarket: [{ label: "SKU aktif", value: "1.240" }, { label: "QC perlu cek", value: "2", tone: "danger" }],
  laundry: [{ label: "Order proses", value: "9" }, { label: "Siap diambil", value: "3", tone: "success" }],
  counter: [{ label: "Servis aktif", value: "7" }, { label: "Siap ambil", value: "3", tone: "success" }],
  jasa: [{ label: "Booking", value: "12" }, { label: "Slot 14:00", value: "1" }],
  pabrik: [{ label: "WO aktif", value: "3" }, { label: "Target", value: "75%" }],
  company: [{ label: "Approval", value: "6", tone: "warning" }, { label: "Cabang", value: "12" }],
  teams: [{ label: "Hadir", value: "18" }, { label: "Terlambat", value: "2", tone: "warning" }],
  accounting: [{ label: "Saldo kas", value: "Rp8,1jt" }, { label: "Belum cocok", value: "3", tone: "danger" }],
};
