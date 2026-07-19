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
import { AccountingLaptop, AccountingTablet, CafeLaptop, CafeTablet, CompanyLaptop, CompanyTablet, CounterLaptop, CounterTablet, JasaLaptop, JasaTablet, LaundryLaptop, LaundryTablet, PabrikLaptop, PabrikTablet, SupermarketLaptop, SupermarketTablet, TeamsLaptop, TeamsTablet, TokoLaptop, TokoTablet } from "./business-device-screens";
import type { ShowcaseDefinition } from "./types";

const phones = { cafe: CafePhone, toko: TokoPhone, ecommerce: TokoPhone, supermarket: SupermarketPhone, laundry: LaundryPhone, counter: CounterPhone, jasa: JasaPhone, pabrik: PabrikPhone, company: CompanyPhone, teams: TeamsPhone, accounting: AccountingPhone } satisfies Record<VerticalKey, ShowcaseDefinition["Phone"]>;
const laptops = { cafe: CafeLaptop, toko: TokoLaptop, ecommerce: TokoLaptop, supermarket: SupermarketLaptop, laundry: LaundryLaptop, counter: CounterLaptop, jasa: JasaLaptop, pabrik: PabrikLaptop, company: CompanyLaptop, teams: TeamsLaptop, accounting: AccountingLaptop } satisfies Record<VerticalKey, ShowcaseDefinition["Laptop"]>;
const tablets = { cafe: CafeTablet, toko: TokoTablet, ecommerce: TokoTablet, supermarket: SupermarketTablet, laundry: LaundryTablet, counter: CounterTablet, jasa: JasaTablet, pabrik: PabrikTablet, company: CompanyTablet, teams: TeamsTablet, accounting: AccountingTablet } satisfies Record<VerticalKey, ShowcaseDefinition["Tablet"]>;
const densities: Record<VerticalKey, ShowcaseDefinition["density"]> = { cafe: "compact", toko: "compact", ecommerce: "compact", supermarket: "dense", laundry: "comfortable", counter: "compact", jasa: "comfortable", pabrik: "compact", company: "dense", teams: "compact", accounting: "dense" };
const outcomes: Record<VerticalKey, string[]> = {
  cafe: ["Meja, kasir, dan dapur bergerak dalam satu alur.", "Antrean dan stok bahan terlihat sebelum layanan tersendat.", "Supervisor memantau shift tanpa mengganggu kasir."],
  toko: ["Stok menipis langsung terlihat.", "Barang masuk dan PO dalam kontrol.", "Penjualan harian seluruh cabang.", "Laporan siap dipakai setiap saat."],
  ecommerce: ["Katalog dan stok memakai fondasi data yang sama.", "Pesanan baru terlihat tanpa spreadsheet tambahan.", "Barang siap diproses tidak tercampur dengan stok fisik.", "Laporan penjualan tetap satu sumber data."],
  supermarket: ["Gudang, PO, QC, dan expiry dikendalikan dari satu tempat.", "Exception prioritas muncul lebih dulu daripada laporan panjang.", "Tim lapangan tetap punya tampilan kerja yang ringkas."],
  laundry: ["Setiap order bergerak jelas dari diterima sampai diambil.", "Order terlambat dan tagihan belum lunas tidak tercecer.", "Owner dapat melihat kapasitas tanpa mengatur ulang spreadsheet."],
  counter: ["Tiket servis, teknisi, dan spare part berada dalam satu alur.", "Pelanggan mendapat status perangkat yang transparan.", "Barang siap ambil dan part menunggu mudah diprioritaskan."],
  jasa: ["Jadwal, staf, booking, dan invoice tidak lagi terpisah.", "Slot kosong serta pelanggan yang perlu dihubungi langsung terlihat.", "Supervisor bergerak dari agenda, bukan dari chat."],
  pabrik: ["Work order, material, mesin, dan QC dipantau bersama.", "Downtime serta bahan kurang berubah menjadi tindakan cepat.", "Laporan produksi mengikuti kondisi nyata di lantai produksi."],
  company: ["Cabang, kas, approval, dan risiko dipantau dari pusat.", "Masalah antar cabang terlihat tanpa menunggu rekap bulanan.", "Peran tiap manajer tetap terjaga dengan akses yang tepat."],
  teams: ["Absensi, jadwal, approval, dan target tim menyatu.", "Manajer melihat kondisi tim hari ini, bukan akhir bulan.", "Bukti kehadiran dan perubahan shift lebih mudah ditindak."],
  accounting: ["Kas, piutang, hutang, dan rekonsiliasi bergerak dalam satu buku.", "Invoice jatuh tempo serta selisih bank tidak terlewat.", "Angka siap dibaca owner tanpa mengorbankan kontrol."],
};

export const BUSINESS_SHOWCASES: ShowcaseDefinition[] = VERTICALS.map((vertical) => ({ key: vertical.key, label: vertical.label.replace("Altora ", ""), headline: vertical.caseTitle, description: vertical.caseDescription, density: densities[vertical.key], Phone: phones[vertical.key], Laptop: laptops[vertical.key], Tablet: tablets[vertical.key], outcomes: outcomes[vertical.key] }));
