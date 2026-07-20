import type { CSSProperties } from "react";
import { PhoneFrame, PhoneHeader, MetricGrid, ActivityList, StatusFooter } from "./business-showcase/shared";
import { VERTICALS } from "@/lib/verticals";

// Nggak terikat ke satu vertikal (section ini generik, bukan tab per-industri),
// jadi ambil satu palet tetap (teal Toko) buat --showcase-* yang dipakai shared
// phone components — biar konsisten sama BusinessShowcase di bawahnya tanpa
// duplikasi warna hardcoded.
const theme = VERTICALS.find((v) => v.key === "toko")!.theme;
const phoneThemeStyle = {
  "--showcase-primary": theme.primary,
  "--showcase-deep": theme.deep,
  "--showcase-soft": theme.soft,
  "--showcase-bg": theme.background,
} as CSSProperties;

const POINTS = [
  {
    title: "Live dashboard",
    detail: "Omzet, transaksi, dan stok update real-time, bisa dicek kapan saja tanpa buka laptop.",
  },
  {
    title: "Kasir cadangan",
    detail: "Perlu bantu kasir mendadak? HP kamu bisa langsung transaksi, datanya tetap satu sistem.",
  },
  {
    title: "Notifikasi penting",
    detail: "Stok menipis, shift ditutup, approval karyawan — semua masuk notifikasi ke HP.",
  },
];

export function MobileHighlight() {
  return (
    <section id="mobile" className="mobile-highlight">
      <div className="wrap mobile-highlight-grid">
        <div className="mobile-highlight-copy reveal">
          <span className="eyebrow">Kerja dari HP</span>
          <h2>Pantau usaha & terima transaksi langsung dari HP kamu.</h2>
          <p className="lede">
            Nggak perlu selalu di depan komputer. Cek omzet, approve stok, sampai bantu kasir bisa langsung dari
            HP — datanya otomatis sama dengan yang di laptop.
          </p>
          <ul className="mobile-highlight-points">
            {POINTS.map((point) => (
              <li key={point.title}>
                <b>{point.title}</b>
                <span>{point.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mobile-highlight-visual reveal">
          <div className="mobile-highlight-glow" aria-hidden="true" />
          <div className="mobile-highlight-phone-wrap" style={phoneThemeStyle}>
            <PhoneFrame label="Altora di HP">
              <PhoneHeader title="Toko Kamu" subtitle="Live dari HP" />
              <MetricGrid
                metrics={[
                  { label: "Omzet hari ini", value: "Rp2,4jt" },
                  { label: "Transaksi", value: "47" },
                  { label: "Stok menipis", value: "3", tone: "warning" },
                  { label: "Karyawan aktif", value: "4" },
                ]}
              />
              <ActivityList
                title="Transaksi masuk"
                activities={[
                  { title: "Kopi Susu x2", detail: "Bayar QRIS", status: "Baru saja", tone: "info" },
                  { title: "Meja 04", detail: "QRIS · Rp52.000", status: "Lunas", tone: "success" },
                  { title: "Cuti Dewi", detail: "Menunggu approve", status: "Cek", tone: "warning" },
                  { title: "Beras Premium 5kg", detail: "Sisa 4 · minimum 10", status: "Restock", tone: "warning" },
                  { title: "Shift sore ditutup", detail: "Kas cocok, tanpa selisih", status: "10 menit lalu", tone: "success" },
                ]}
              />
              <StatusFooter />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
